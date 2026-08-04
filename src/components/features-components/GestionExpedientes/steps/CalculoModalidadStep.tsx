"use client";

import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Calculator, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { UniversitasAPI } from "@universitas/sdk-global";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BusinessDayCalendar } from "@/components/shared/BusinessDayCalendar";
import { MoneyInput } from "@/components/ui/money-input";
import { CurrencyMoneyInput } from "@/components/features-components/GestionExpedientes/currency/CurrencyMoneyInput";
import { FormDropdownSelect } from "@/components/features-components/GestionExpedientes/FormDropdownSelect";
import { useDiasNoLaborables } from "@/hooks/useDiasNoLaborables";
import { TIPOS_CONTRATACION_OPTIONS } from "@/lib/schemas/expedienteSchema";
import {
  calculoModalidadInputSchema,
  MODALIDAD_SELECCION_OPTIONS,
  type CalculoModalidadInputValues,
  type DictamenModalidadResult,
  type ModalidadSeleccionGestion,
  type MonedaEntrada,
} from "@/lib/schemas/gestionExpedienteSchema";
import { resolveModalidadSugerida } from "@/lib/modalidades/resolveModalidadSugerida";
import { cn } from "@/lib/utils";

let _universitasClient: UniversitasAPI | null = null;
function getClient(): UniversitasAPI {
  if (!_universitasClient) {
    _universitasClient = new UniversitasAPI(process.env.NEXT_PUBLIC_UNIVERSITAS_SDK_URL ?? "");
  }
  return _universitasClient;
}

function formatMoney(amount: number, style: "bs" | "usd" | "ucau" = "bs"): string {
  if (style === "ucau") {
    return amount.toLocaleString("es-VE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
  }
  return amount.toLocaleString("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function parseCleanToNumber(clean: string): number | null {
  if (!clean) return null;
  const n = Number.parseFloat(clean.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export interface CalculoModalidadStepProps {
  initialDictamen?: DictamenModalidadResult | null;
  onComplete: (dictamen: DictamenModalidadResult) => void;
  readOnly?: boolean;
}

export function CalculoModalidadStep({
  initialDictamen = null,
  onComplete,
  readOnly = false,
}: CalculoModalidadStepProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [isLoadingTasa, setIsLoadingTasa] = useState(false);
  const [tasaSdkDelDia, setTasaSdkDelDia] = useState<number | null>(
    initialDictamen?.tasa_referencial_bcv ?? null
  );
  const [dictamen, setDictamen] = useState<DictamenModalidadResult | null>(initialDictamen);

  const feriadosRange = useMemo(() => {
    const year = new Date().getFullYear();
    return {
      desde: `${year - 1}-01-01`,
      hasta: `${year + 5}-12-31`,
      fromYear: year - 1,
      toYear: year + 5,
    };
  }, []);

  const { nonWorkingDays, feriadoDescriptions } = useDiasNoLaborables(
    feriadosRange.desde,
    feriadosRange.hasta
  );

  const form = useForm<CalculoModalidadInputValues>({
    resolver: zodResolver(calculoModalidadInputSchema),
    defaultValues: {
      fechaActaInicio: initialDictamen?.fechaActaInicio ?? "",
      tasa_referencial_bcv: initialDictamen?.tasa_referencial_bcv,
      tipoContratacion: initialDictamen?.tipoContratacion,
      monedaEntrada: initialDictamen?.monedaEntrada ?? "USD",
      montoEntrada: initialDictamen?.montoEntrada,
    },
    mode: "onSubmit",
  });

  const aceptaSugerida = dictamen?.aceptaSugerida ?? null;

  const loadTasaPorFecha = async (fecha: string) => {
    if (!fecha || readOnly) return;

    setIsLoadingTasa(true);
    setDictamen(null);

    const hoy = format(new Date(), "yyyy-MM-dd");
    const esFechaFutura = fecha > hoy;

    try {
      let tasa: number;

      if (esFechaFutura) {
        const bcvRes = await getClient().economia.getBCV();
        tasa = bcvRes.data.usd;
        if (!tasa || !Number.isFinite(tasa)) {
          throw new Error("La tasa BCV del día actual no es válida.");
        }
        setTasaSdkDelDia(tasa);
        form.setValue("tasa_referencial_bcv", tasa, { shouldValidate: true, shouldDirty: true });
        toast.info(
          "Aún no hay tasa BCV para la fecha seleccionada. Se muestra la tasa del día de hoy.",
          { duration: 6000 }
        );
        return;
      }

      const bcvRes = await getClient().economia.getBCVHistorico(fecha);
      tasa = bcvRes.data.usd;
      if (!tasa || !Number.isFinite(tasa)) {
        throw new Error("La tasa BCV obtenida no es válida.");
      }
      setTasaSdkDelDia(tasa);
      form.setValue("tasa_referencial_bcv", tasa, { shouldValidate: true, shouldDirty: true });
    } catch (error) {
      setTasaSdkDelDia(null);
      form.setValue("tasa_referencial_bcv", undefined as unknown as number, {
        shouldValidate: true,
      });
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo obtener la tasa BCV para la fecha seleccionada."
      );
    } finally {
      setIsLoadingTasa(false);
    }
  };

  const handleValidar = async () => {
    if (readOnly) return;

    const valid = await form.trigger();
    if (!valid) return;

    const values = form.getValues();
    if (!values.fechaActaInicio || !values.tasa_referencial_bcv) {
      toast.error("Indique la fecha del acta de inicio y la tasa referencial BCV.");
      return;
    }

    setIsValidating(true);
    setDictamen(null);

    const minSpinnerMs = 1500;
    const tasaBcvUsd = values.tasa_referencial_bcv;

    try {
      const [ucauRes] = await Promise.all([
        getClient().economia.getUCAUU(),
        new Promise<void>((resolve) => setTimeout(resolve, minSpinnerMs)),
      ]);
      const valorUcau: number = ucauRes.valor;

      if (!tasaBcvUsd || !valorUcau) {
        throw new Error("Las tasas obtenidas no son válidas.");
      }

      let montoEstimadoBs: number;
      let montoEstimadoDolar: number;

      if (values.monedaEntrada === "BS") {
        montoEstimadoBs = values.montoEntrada;
        montoEstimadoDolar = values.montoEntrada / tasaBcvUsd;
      } else {
        montoEstimadoDolar = values.montoEntrada;
        montoEstimadoBs = values.montoEntrada * tasaBcvUsd;
      }

      const valorUcauBase = montoEstimadoBs / valorUcau;
      const sugerida = resolveModalidadSugerida(values.tipoContratacion, valorUcauBase);

      setDictamen({
        fechaActaInicio: values.fechaActaInicio,
        tasa_referencial_bcv: tasaBcvUsd,
        tipoContratacion: values.tipoContratacion,
        monedaEntrada: values.monedaEntrada,
        montoEntrada: values.montoEntrada,
        montoEstimadoBs,
        montoEstimadoDolar,
        valorUcauBase,
        tasaBcvUsd,
        valorUcau,
        modalidadSugeridaLabel: sugerida.label,
        baseLegalSugerida: sugerida.baseLegal,
        modalidadSugeridaSeleccion: sugerida.modalidadSeleccion,
        aceptaSugerida: null,
        modalidadSeleccion: sugerida.modalidadSeleccion,
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudieron obtener las tasas. Intente de nuevo."
      );
    } finally {
      setIsValidating(false);
    }
  };

  const updateDictamen = (patch: Partial<DictamenModalidadResult>) => {
    setDictamen((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const handleAceptaSugerida = (acepta: boolean) => {
    if (!dictamen || readOnly) return;

    if (acepta) {
      onComplete({
        ...dictamen,
        aceptaSugerida: true,
        modalidadSeleccion: dictamen.modalidadSugeridaSeleccion,
      });
      return;
    }

    updateDictamen({
      aceptaSugerida: false,
      modalidadSeleccion: dictamen.modalidadSugeridaSeleccion,
    });
  };

  const handleModalidadManual = (value: ModalidadSeleccionGestion) => {
    updateDictamen({ modalidadSeleccion: value });
  };

  const handleSiguienteManual = () => {
    if (readOnly || !dictamen || dictamen.aceptaSugerida !== false) return;
    if (!dictamen.modalidadSeleccion) return;

    onComplete({
      ...dictamen,
      aceptaSugerida: false,
      modalidadSeleccion: dictamen.modalidadSeleccion,
    });
  };

  return (
    <Form {...form}>
      <form
        onKeyDown={(e) => {
          if (e.key === "Enter") e.preventDefault();
        }}
        className="space-y-6"
      >
        <div>
          <h3 className="text-heading-dark font-bold text-lg">Cálculo de modalidad</h3>
          <p className="text-slate-500 italic text-sm mt-1">
            Ingrese los montos para que el sistema determine la modalidad legal aplicable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-200 items-stretch">
          <FormField
            control={form.control}
            name="fechaActaInicio"
            render={({ field }) => (
              <FormItem className="flex h-full min-h-0 flex-col gap-0">
                <FormLabel className="text-heading-dark font-bold text-sm">
                  Indique la fecha de elaboración del acta de inicio
                </FormLabel>
                <p className="mt-0.5 mb-2 min-h-10 text-slate-500 italic text-xs leading-relaxed">
                  Artículos 18.3 LOPA; 23 NORMAS DE CONTROL INTERNO SUNAI.
                </p>
                <div className="mt-auto space-y-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={readOnly || isValidating || isLoadingTasa}
                          className={cn(
                            "w-full h-11 justify-between text-left font-normal border-slate-300 rounded-md px-3",
                            !field.value ? "text-slate-400" : "text-heading-dark"
                          )}
                        >
                          {field.value
                            ? format(new Date(field.value + "T00:00:00"), "dd/MM/yyyy")
                            : "Seleccione una fecha"}
                          <CalendarIcon className="h-4 w-4 text-slate-400 shrink-0" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <BusinessDayCalendar
                        mode="single"
                        captionLayout="dropdown"
                        fromYear={feriadosRange.fromYear}
                        toYear={feriadosRange.toYear}
                        selected={field.value ? new Date(field.value + "T00:00:00") : undefined}
                        onSelect={(date) => {
                          if (!date) return;
                          const value = format(date, "yyyy-MM-dd");
                          field.onChange(value);
                          setDictamen(null);
                          void loadTasaPorFecha(value);
                        }}
                        nonWorkingDays={nonWorkingDays}
                        feriadoDescriptions={feriadoDescriptions}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tasa_referencial_bcv"
            render={({ field, fieldState }) => (
              <FormItem className="flex h-full min-h-0 flex-col gap-0">
                <FormLabel className="text-heading-dark font-bold text-sm">
                  Tasa referencial (BCV)
                </FormLabel>
                <p className="mt-0.5 mb-2 min-h-10 text-slate-500 italic text-xs leading-relaxed">
                  Se carga según la fecha del acta. Puede ajustarla; los cálculos usarán este valor.
                </p>
                <div className="mt-auto space-y-1">
                  <div className="flex items-stretch gap-2">
                    <FormControl>
                      <MoneyInput
                        disabled={readOnly || isValidating || isLoadingTasa}
                        aria-invalid={!!fieldState.error}
                        value={typeof field.value === "number" ? field.value.toFixed(2) : ""}
                        onValueChange={(clean) => {
                          const num = parseCleanToNumber(clean);
                          field.onChange(num ?? undefined);
                          setDictamen(null);
                        }}
                        className="h-11 min-w-0 flex-1 rounded-md border-slate-300"
                        placeholder={isLoadingTasa ? "Consultando tasa..." : "0,00"}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      title="Restaurar tasa obtenida del BCV"
                      aria-label="Restaurar tasa obtenida del BCV"
                      disabled={
                        readOnly ||
                        isValidating ||
                        isLoadingTasa ||
                        !form.getValues("fechaActaInicio")
                      }
                      onClick={() => {
                        const fecha = form.getValues("fechaActaInicio");
                        if (!fecha) {
                          toast.error("Seleccione primero la fecha del acta de inicio.");
                          return;
                        }
                        void loadTasaPorFecha(fecha);
                      }}
                      className="h-11 w-11 shrink-0 border-slate-300"
                    >
                      {isLoadingTasa ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          <FormField
            control={form.control}
            name="tipoContratacion"
            render={({ field }) => (
              <FormItem className="flex h-full flex-col gap-0">
                <FormLabel className="text-heading-dark font-bold text-sm">
                  Seleccione el tipo de contratación:
                </FormLabel>
                <p className="text-slate-500 italic text-xs mt-0.5 mb-2">
                  Artículos 118.1 LCP; 34 NORMAS DE CONTROL INTERNO SUNAI.
                </p>
                <div className="mt-auto space-y-1">
                  <FormControl>
                    <FormDropdownSelect
                      value={field.value ?? ""}
                      onValueChange={(v) => {
                        field.onChange(v);
                        setDictamen(null);
                      }}
                      disabled={readOnly || isValidating}
                      placeholder="seleccione una opción"
                      options={TIPOS_CONTRATACION_OPTIONS.map((opt) => ({
                        value: opt.value,
                        label: opt.label,
                      }))}
                    />
                  </FormControl>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="montoEntrada"
            render={({ field, fieldState }) => (
              <FormItem className="flex h-full flex-col gap-0">
                <FormLabel className="text-heading-dark font-bold text-sm">
                  Ingrese el monto estimado de la contratación, incluyendo el Impuesto al Valor
                  Agregado (IVA).
                </FormLabel>
                <p className="text-slate-500 italic text-xs mt-0.5 mb-2">
                  Artículo 107.2 RLCP; 6 LCC; 38 (1 al 5 primer párrafo), 91.1.9.17.23.29 LOCGR; 15
                  Y 24 NORMAS DE CONTROL INTERNO SUNAI.
                </p>
                <div className="mt-auto space-y-1">
                  <FormControl>
                    <CurrencyMoneyInput
                      moneda={form.watch("monedaEntrada")}
                      onMonedaChange={(moneda: MonedaEntrada) => {
                        form.setValue("monedaEntrada", moneda);
                        setDictamen(null);
                      }}
                      value={typeof field.value === "number" ? field.value : null}
                      onValueChange={(num) => {
                        field.onChange(num ?? undefined);
                        setDictamen(null);
                      }}
                      disabled={readOnly || isValidating}
                      aria-invalid={!!fieldState.error}
                    />
                  </FormControl>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            onClick={handleValidar}
            disabled={readOnly || isValidating || isLoadingTasa}
            className="bg-navy hover:bg-navy-hover text-white font-semibold px-8 h-11 rounded-md cursor-pointer"
          >
            {isValidating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validando...
              </>
            ) : (
              <>
                <Calculator className="mr-2 h-4 w-4" />
                Validar montos
              </>
            )}
          </Button>
        </div>

        {isValidating && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-slate-200 bg-slate-50/80 py-10 px-6 animate-in fade-in duration-200">
            <div className="w-10 h-10 border-4 border-navy border-t-transparent rounded-full animate-spin" />
            <div className="text-center space-y-1">
              <p className="text-heading-dark font-semibold text-sm font-inter">
                Procesando cálculo de modalidad
              </p>
              <p className="text-slate-500 italic text-sm font-inter">
                Consultando tasas oficiales y cruzando montos UCAU, Bs. y $...
              </p>
            </div>
          </div>
        )}

        {dictamen && !isValidating && (
          <div className="space-y-5 pt-2 animate-in fade-in duration-300">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                <h4 className="text-color-boton-2 font-bold text-base">
                  Dictamen de modalidad sugerida
                </h4>
              </div>
              <p className="text-slate-500 italic text-sm mt-1">
                Verifique los montos calculados de su procedimiento. El sistema ha determinado la
                modalidad de contratación correspondiente según los umbrales legales vigentes.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-800 px-4 py-1.5 text-sm font-semibold">
                UCAU: {formatMoney(dictamen.valorUcauBase, "ucau")}
              </span>
              <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 px-4 py-1.5 text-sm font-semibold">
                $: {formatMoney(dictamen.montoEstimadoDolar, "usd")}
              </span>
              <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 px-4 py-1.5 text-sm font-semibold">
                Bs: {formatMoney(dictamen.montoEstimadoBs, "bs")}
              </span>
            </div>

            <div className="rounded-lg border border-slate-200 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-heading-dark font-inter">Modalidad Sugerida</p>
                <p className="text-slate-500 italic text-sm mt-1 font-inter">
                  {dictamen.modalidadSugeridaLabel}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-heading-dark font-inter">Base legal</p>
                <p className="text-slate-500 italic text-sm mt-1 font-inter">
                  {dictamen.baseLegalSugerida}
                </p>
              </div>
            </div>

            {aceptaSugerida !== false && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-slate-500 italic text-sm">
                  ¿Desea continuar con la modalidad sugerida?
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={readOnly}
                    onClick={() => handleAceptaSugerida(false)}
                    className="h-10 px-6 bg-white border-slate-300 text-heading-dark hover:bg-slate-50 hover:text-heading-dark"
                  >
                    NO
                  </Button>
                  <Button
                    type="button"
                    disabled={readOnly}
                    onClick={() => handleAceptaSugerida(true)}
                    className="h-10 px-6 bg-success hover:bg-success/90 text-white"
                  >
                    Sí, continuar
                  </Button>
                </div>
              </div>
            )}

            {aceptaSugerida === false && (
              <div className="space-y-4 pt-2 animate-in fade-in duration-300">
                <div className="space-y-2">
                  <FormLabel className="text-heading-dark font-bold text-sm">
                    Seleccione la Modalidad de Contratación
                  </FormLabel>
                  <p className="text-slate-500 italic text-xs">Artículos 55, 85, 96 y 101 LCP.</p>
                  <FormDropdownSelect
                    value={dictamen.modalidadSeleccion}
                    onValueChange={(v) => handleModalidadManual(v as ModalidadSeleccionGestion)}
                    disabled={readOnly}
                    placeholder="Seleccione la Modalidad de Contratación"
                    options={MODALIDAD_SELECCION_OPTIONS.map((opt) => ({
                      value: opt.value,
                      label: opt.label,
                    }))}
                  />
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-200">
                  <Button
                    type="button"
                    onClick={handleSiguienteManual}
                    disabled={readOnly || !dictamen.modalidadSeleccion}
                    className="bg-navy hover:bg-navy-hover text-white font-semibold px-8 h-11 rounded-md cursor-pointer disabled:opacity-50"
                  >
                    Siguiente &gt;
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </form>
    </Form>
  );
}

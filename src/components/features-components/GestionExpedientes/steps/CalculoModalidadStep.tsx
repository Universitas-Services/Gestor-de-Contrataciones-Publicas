"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calculator, CheckCircle2, Loader2 } from "lucide-react";
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
import { CurrencyMoneyInput } from "@/components/features-components/GestionExpedientes/currency/CurrencyMoneyInput";
import { FormDropdownSelect } from "@/components/features-components/GestionExpedientes/FormDropdownSelect";
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
  const [dictamen, setDictamen] = useState<DictamenModalidadResult | null>(initialDictamen);

  const form = useForm<CalculoModalidadInputValues>({
    resolver: zodResolver(calculoModalidadInputSchema),
    defaultValues: {
      tipoContratacion: initialDictamen?.tipoContratacion,
      monedaEntrada: initialDictamen?.monedaEntrada ?? "USD",
      montoEntrada: initialDictamen?.montoEntrada,
    },
    mode: "onSubmit",
  });

  const aceptaSugerida = dictamen?.aceptaSugerida ?? null;

  const handleValidar = async () => {
    if (readOnly) return;

    const valid = await form.trigger();
    if (!valid) return;

    const values = form.getValues();
    setIsValidating(true);
    setDictamen(null);

    const minSpinnerMs = 1500;

    try {
      const [[bcvRes, ucauRes]] = await Promise.all([
        Promise.all([getClient().economia.getBCV(), getClient().economia.getUCAUU()]),
        new Promise<void>((resolve) => setTimeout(resolve, minSpinnerMs)),
      ]);
      const tasaBcvUsd: number = bcvRes.data.usd;
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
            disabled={readOnly || isValidating}
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

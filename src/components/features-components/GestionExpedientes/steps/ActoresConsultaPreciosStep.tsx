"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CalendarIcon, Info, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BusinessDayCalendar } from "@/components/shared/BusinessDayCalendar";
import { useDiasNoLaborables } from "@/hooks/useDiasNoLaborables";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FormDropdownSelect } from "@/components/features-components/GestionExpedientes/FormDropdownSelect";
import {
  createActoresConsultaPreciosSchema,
  type ActoresConsultaPreciosFormValues,
} from "@/lib/schemas/gestionExpedienteSchema";
import type { TipoContratacionBackend } from "@/lib/schemas/expedienteSchema";
import {
  getUmbralComisionCp,
  requiereComisionConsultaPrecios,
} from "@/lib/modalidades/requiereComisionConsultaPrecios";
import { listarMaximasAutoridades } from "@/services/maximaAutoridadService";
import { listarComisionesContrataciones } from "@/services/comisionContratacionesService";
import { listarUnidadesUsuarias } from "@/services/unidadUsuariaService";
import { listarUnidadesContratantes } from "@/services/unidadContratanteService";
import { cn } from "@/lib/utils";

interface AutoridadOption {
  value: string;
  label: string;
  esDelegado: boolean;
}

function formatUmbralBadge(ucau: number): string {
  if (ucau >= 1000) {
    const k = ucau / 1000;
    return `> ${Number.isInteger(k) ? k : k.toFixed(1)}K UCAU`;
  }
  return `> ${ucau.toLocaleString("es-VE")} UCAU`;
}

export interface ActoresConsultaPreciosStepProps {
  tipoContratacion: TipoContratacionBackend;
  valorUcauBase: number;
  initialValues?: ActoresConsultaPreciosFormValues | null;
  onBack: () => void;
  onNext: (data: ActoresConsultaPreciosFormValues) => void;
  readOnly?: boolean;
}

export function ActoresConsultaPreciosStep({
  tipoContratacion,
  valorUcauBase,
  initialValues = null,
  onBack,
  onNext,
  readOnly = false,
}: ActoresConsultaPreciosStepProps) {
  const requiereComision = requiereComisionConsultaPrecios(tipoContratacion, valorUcauBase);
  const umbralUcau = getUmbralComisionCp(tipoContratacion);

  const schema = useMemo(
    () => createActoresConsultaPreciosSchema(requiereComision),
    [requiereComision]
  );

  const [autoridades, setAutoridades] = useState<AutoridadOption[]>([]);
  const [comisiones, setComisiones] = useState<{ value: string; label: string }[]>([]);
  const [unidadesUsuarias, setUnidadesUsuarias] = useState<{ value: string; label: string }[]>([]);
  const [unidadesContratantes, setUnidadesContratantes] = useState<
    { value: string; label: string }[]
  >([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

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

  const form = useForm<ActoresConsultaPreciosFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      autoridadId: initialValues?.autoridadId ?? "",
      autoridadFirmaComoDelegado: initialValues?.autoridadFirmaComoDelegado ?? false,
      unidadUsuariaId: initialValues?.unidadUsuariaId ?? "",
      unidadContratanteId: initialValues?.unidadContratanteId ?? "",
      comisionId: initialValues?.comisionId ?? "",
      fecEnvioInvitacionCp: initialValues?.fecEnvioInvitacionCp ?? "",
    },
  });

  useEffect(() => {
    if (!requiereComision) {
      form.setValue("comisionId", "");
    }
  }, [requiereComision, form]);

  useEffect(() => {
    const load = async () => {
      setLoadingOptions(true);
      try {
        const [autoridadesData, comisionesData, unidadesUsuariasData, unidadesContratantesData] =
          await Promise.all([
            listarMaximasAutoridades(),
            listarComisionesContrataciones(),
            listarUnidadesUsuarias(),
            listarUnidadesContratantes(),
          ]);

        const autoridadOpts: AutoridadOption[] = [];
        for (const a of Array.isArray(autoridadesData)
          ? (autoridadesData as Array<{
              id: string;
              nombreCompletoAutoridad: string;
              cargoOficialAutoridad: string;
              esDelegado: boolean;
              nombreCompletoDelegado?: string;
              cargoOficialDelegado?: string;
            }>)
          : []) {
          autoridadOpts.push({
            value: a.id,
            label: `${a.nombreCompletoAutoridad} — ${a.cargoOficialAutoridad}`,
            esDelegado: false,
          });

          if (a.esDelegado && a.nombreCompletoDelegado) {
            autoridadOpts.push({
              value: `${a.id}__delegado`,
              label: `${a.nombreCompletoDelegado} — ${a.cargoOficialDelegado ?? "Delegado"} (Delegado)`,
              esDelegado: true,
            });
          }
        }
        setAutoridades(autoridadOpts);

        setComisiones(
          (Array.isArray(comisionesData)
            ? (comisionesData as Array<{ id: string | number; denominacionComision?: string }>)
            : []
          ).map((c) => ({
            value: String(c.id),
            label: c.denominacionComision ?? `Comisión ${c.id}`,
          }))
        );

        setUnidadesUsuarias(
          (Array.isArray(unidadesUsuariasData)
            ? (unidadesUsuariasData as Array<{ id: string | number; nombreUnidadUsuaria?: string }>)
            : []
          ).map((u) => ({
            value: String(u.id),
            label: u.nombreUnidadUsuaria ?? `Unidad ${u.id}`,
          }))
        );

        setUnidadesContratantes(
          (Array.isArray(unidadesContratantesData) ? unidadesContratantesData : []).map((u) => ({
            value: String(u.id),
            label: u.nombreUnidadContratante || `Unidad contratante ${u.id}`,
          }))
        );
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Error al cargar actores");
      } finally {
        setLoadingOptions(false);
      }
    };
    load();
  }, []);

  const handleAutoridadChange = (rawValue: string) => {
    const esDelegado = rawValue.endsWith("__delegado");
    const realId = esDelegado ? rawValue.replace("__delegado", "") : rawValue;
    form.setValue("autoridadId", realId, { shouldValidate: true });
    form.setValue("autoridadFirmaComoDelegado", esDelegado);
  };

  const autoridadRawValue = form.watch("autoridadFirmaComoDelegado")
    ? `${form.watch("autoridadId")}__delegado`
    : form.watch("autoridadId");

  const handleSubmit = async () => {
    if (readOnly) return;
    const isValid = await form.trigger();
    if (isValid) onNext(form.getValues());
  };

  if (loadingOptions) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-navy" />
        <p className="text-slate-500 text-sm">Cargando actores disponibles...</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-x-8 gap-y-6 min-w-0 items-stretch">
          <FormField
            control={form.control}
            name="autoridadId"
            render={() => (
              <FormItem className="min-w-0 flex h-full flex-col gap-0">
                <FormLabel className="text-heading-dark font-semibold font-inter text-sm">
                  Máxima Autoridad
                </FormLabel>
                <div className="mt-auto space-y-1 pt-1.5">
                  <FormControl>
                    <FormDropdownSelect
                      value={autoridadRawValue || ""}
                      onValueChange={handleAutoridadChange}
                      disabled={readOnly}
                      triggerClassName="h-10"
                      options={autoridades.map((opt) => ({
                        value: opt.value,
                        label: opt.label,
                        className: opt.esDelegado ? "pl-6 text-slate-500 italic" : undefined,
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
            name="unidadUsuariaId"
            render={({ field }) => (
              <FormItem className="min-w-0 flex h-full flex-col gap-0">
                <FormLabel className="text-heading-dark font-semibold font-inter text-sm">
                  Unidad Usuaria
                </FormLabel>
                <div className="mt-auto space-y-1 pt-1.5">
                  <FormControl>
                    <FormDropdownSelect
                      value={field.value || ""}
                      onValueChange={field.onChange}
                      disabled={readOnly}
                      triggerClassName="h-10"
                      options={unidadesUsuarias.map((opt) => ({
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
            name="unidadContratanteId"
            render={({ field }) => (
              <FormItem className="min-w-0 flex h-full flex-col gap-0">
                <FormLabel className="text-heading-dark font-semibold font-inter text-sm">
                  Unidad Contratante
                </FormLabel>
                <p className="text-slate-500 italic text-xs mt-0.5 font-inter">
                  En Consulta de Precios, esta unidad invita, recibe y evalúa inicialmente.
                </p>
                <div className="mt-auto space-y-1 pt-1.5">
                  <FormControl>
                    <FormDropdownSelect
                      value={field.value || ""}
                      onValueChange={field.onChange}
                      disabled={readOnly}
                      triggerClassName="h-10"
                      options={unidadesContratantes.map((opt) => ({
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
            name="comisionId"
            render={({ field }) => (
              <FormItem className="min-w-0 flex h-full flex-col gap-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <FormLabel className="text-heading-dark font-semibold font-inter text-sm">
                    Comisión de Contrataciones
                  </FormLabel>
                  {requiereComision ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-navy/10 text-navy px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide shrink-0">
                      <Info className="h-3 w-3" />
                      Requerido ({formatUmbralBadge(umbralUcau)})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide shrink-0">
                      No requerido por umbral
                    </span>
                  )}
                </div>
                <p className="text-slate-500 italic text-xs mt-0.5 font-inter">
                  Artículos 16, numeral 10 y 111 del Reglamento de la LCP.
                </p>
                <div className="mt-auto space-y-1 pt-1.5">
                  {requiereComision ? (
                    <FormControl>
                      <FormDropdownSelect
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        disabled={readOnly}
                        triggerClassName="h-10 border-navy/50"
                        options={comisiones.map((opt) => ({
                          value: opt.value,
                          label: opt.label,
                        }))}
                      />
                    </FormControl>
                  ) : (
                    <div className="w-full min-w-0 rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 h-10 flex items-center">
                      <p className="text-sm text-slate-400 font-inter truncate">
                        Campo no aplicable para este monto
                      </p>
                    </div>
                  )}
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fecEnvioInvitacionCp"
            render={({ field }) => (
              <FormItem className="min-w-0 md:col-span-2 md:max-w-[calc(50%-1rem)] flex h-full flex-col gap-0">
                <FormLabel className="text-heading-dark font-semibold font-inter text-sm">
                  Fecha prevista para el envío de las Invitaciones a presentar oferta
                </FormLabel>
                <p className="text-slate-500 italic text-xs mt-0.5 font-inter">
                  Artículo 113 del Reglamento de la Ley de Contrataciones Públicas.
                </p>
                <div className="mt-auto space-y-1 pt-1.5">
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={readOnly}
                          className={cn(
                            "w-full h-10 justify-between text-left font-normal border-slate-300 rounded-md px-3",
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
                          if (date) field.onChange(format(date, "yyyy-MM-dd"));
                        }}
                        nonWorkingDays={nonWorkingDays}
                        feriadoDescriptions={feriadoDescriptions}
                        locale={es}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-between pt-6 border-t border-slate-200">
          <Button type="button" variant="outline" onClick={onBack} className="h-11 px-6">
            Anterior
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={readOnly}
            className="bg-navy hover:bg-navy-hover text-white font-semibold px-8 h-11 rounded-md cursor-pointer"
          >
            Siguiente &gt;
          </Button>
        </div>
      </div>
    </Form>
  );
}

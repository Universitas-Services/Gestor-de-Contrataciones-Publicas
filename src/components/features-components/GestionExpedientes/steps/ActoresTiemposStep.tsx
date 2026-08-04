"use client";

import React, { useState, useEffect, useMemo } from "react";
import { CalendarIcon, Loader2 } from "lucide-react";
import { addDays, format } from "date-fns";
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
  createConfiguracionActoresSchema,
  type ConfiguracionActoresFormValues,
} from "@/lib/schemas/expedienteSchema";
import { listarMaximasAutoridades } from "@/services/maximaAutoridadService";
import { listarComisionesContrataciones } from "@/services/comisionContratacionesService";
import { listarUnidadesUsuarias } from "@/services/unidadUsuariaService";
import { cn } from "@/lib/utils";

interface AutoridadOption {
  value: string;
  label: string;
  esDelegado: boolean;
}

export interface ActoresTiemposStepProps {
  initialValues?: ConfiguracionActoresFormValues | null;
  /** Fecha de elaboración del acta (yyyy-MM-dd). El llamado debe ser al menos un día después. */
  fechaActaInicio?: string | null;
  onBack: () => void;
  onNext: (data: ConfiguracionActoresFormValues) => void;
  readOnly?: boolean;
}

function minFechaLlamadoFromActa(fechaActaInicio: string): string {
  return format(addDays(new Date(`${fechaActaInicio}T00:00:00`), 1), "yyyy-MM-dd");
}

export function ActoresTiemposStep({
  initialValues = null,
  fechaActaInicio = null,
  onBack,
  onNext,
  readOnly = false,
}: ActoresTiemposStepProps) {
  const [autoridades, setAutoridades] = useState<AutoridadOption[]>([]);
  const [comisiones, setComisiones] = useState<{ value: string; label: string }[]>([]);
  const [unidades, setUnidades] = useState<{ value: string; label: string }[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const minFechaLlamado = useMemo(
    () => (fechaActaInicio ? minFechaLlamadoFromActa(fechaActaInicio) : null),
    [fechaActaInicio]
  );

  const actoresSchema = useMemo(
    () => createConfiguracionActoresSchema(minFechaLlamado ?? undefined),
    [minFechaLlamado]
  );

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

  const initialFechaLlamado = (() => {
    const prev = initialValues?.fechaLlamadoParticipar ?? "";
    if (prev && minFechaLlamado && prev < minFechaLlamado) return "";
    return prev;
  })();

  const form = useForm<ConfiguracionActoresFormValues>({
    resolver: zodResolver(actoresSchema),
    defaultValues: {
      autoridadId: initialValues?.autoridadId ?? "",
      autoridadFirmaComoDelegado: initialValues?.autoridadFirmaComoDelegado ?? false,
      comisionId: initialValues?.comisionId ?? "",
      unidadUsuariaId: initialValues?.unidadUsuariaId ?? "",
      fechaLlamadoParticipar: initialFechaLlamado,
    },
  });

  useEffect(() => {
    form.clearErrors("fechaLlamadoParticipar");
    const current = form.getValues("fechaLlamadoParticipar");
    if (current && minFechaLlamado && current < minFechaLlamado) {
      form.setValue("fechaLlamadoParticipar", "");
    }
  }, [form, minFechaLlamado]);

  useEffect(() => {
    const load = async () => {
      setLoadingOptions(true);
      try {
        const [autoridadesData, comisionesData, unidadesData] = await Promise.all([
          listarMaximasAutoridades(),
          listarComisionesContrataciones(),
          listarUnidadesUsuarias(),
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

        setUnidades(
          (Array.isArray(unidadesData)
            ? (unidadesData as Array<{ id: string | number; nombreUnidadUsuaria?: string }>)
            : []
          ).map((u) => ({
            value: String(u.id),
            label: u.nombreUnidadUsuaria ?? `Unidad ${u.id}`,
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
                      options={unidades.map((opt) => ({
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
                <FormLabel className="text-heading-dark font-semibold font-inter text-sm">
                  Comisión de Contrataciones
                </FormLabel>
                <div className="mt-auto space-y-1 pt-1.5">
                  <FormControl>
                    <FormDropdownSelect
                      value={field.value || ""}
                      onValueChange={field.onChange}
                      disabled={readOnly}
                      triggerClassName="h-10"
                      options={comisiones.map((opt) => ({
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
            name="fechaLlamadoParticipar"
            render={({ field }) => (
              <FormItem className="min-w-0 flex h-full flex-col gap-0">
                <FormLabel className="text-heading-dark font-semibold font-inter text-sm">
                  Fecha del Llamado a Participar
                </FormLabel>
                {minFechaLlamado ? (
                  <p className="text-slate-500 italic text-xs mt-0.5">
                    Debe ser a partir del{" "}
                    {format(new Date(`${minFechaLlamado}T00:00:00`), "dd/MM/yyyy")} (un día después
                    del acta de inicio).
                  </p>
                ) : null}
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
                        isDateDisabled={
                          minFechaLlamado
                            ? (date) => format(date, "yyyy-MM-dd") < minFechaLlamado
                            : undefined
                        }
                        getExtraDisabledTooltip={() =>
                          "No se pueden elegir fechas anteriores o iguales al acta de inicio"
                        }
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

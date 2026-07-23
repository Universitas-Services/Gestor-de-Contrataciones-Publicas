"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CalendarIcon, Loader2 } from "lucide-react";
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
  actoresModalidadesExcluidasSchema,
  type ActoresModalidadesExcluidasFormValues,
} from "@/lib/schemas/gestionExpedienteSchema";
import { listarMaximasAutoridades } from "@/services/maximaAutoridadService";
import { listarUnidadesUsuarias } from "@/services/unidadUsuariaService";
import { cn } from "@/lib/utils";

interface AutoridadOption {
  value: string;
  label: string;
  esDelegado: boolean;
}

export interface ActoresModalidadesExcluidasStepProps {
  initialValues?: ActoresModalidadesExcluidasFormValues | null;
  onBack: () => void;
  onNext: (data: ActoresModalidadesExcluidasFormValues) => void;
  readOnly?: boolean;
}

export function ActoresModalidadesExcluidasStep({
  initialValues = null,
  onBack,
  onNext,
  readOnly = false,
}: ActoresModalidadesExcluidasStepProps) {
  const [autoridades, setAutoridades] = useState<AutoridadOption[]>([]);
  const [unidadesUsuarias, setUnidadesUsuarias] = useState<{ value: string; label: string }[]>([]);
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

  const form = useForm<ActoresModalidadesExcluidasFormValues>({
    resolver: zodResolver(actoresModalidadesExcluidasSchema),
    defaultValues: {
      autoridadId: initialValues?.autoridadId ?? "",
      autoridadFirmaComoDelegado: initialValues?.autoridadFirmaComoDelegado ?? false,
      unidadUsuariaId: initialValues?.unidadUsuariaId ?? "",
      fecInicioProcedimientoMe: initialValues?.fecInicioProcedimientoMe ?? "",
    },
  });

  useEffect(() => {
    const load = async () => {
      setLoadingOptions(true);
      try {
        const [autoridadesData, unidadesUsuariasData] = await Promise.all([
          listarMaximasAutoridades(),
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

        setUnidadesUsuarias(
          (Array.isArray(unidadesUsuariasData)
            ? (unidadesUsuariasData as Array<{ id: string | number; nombreUnidadUsuaria?: string }>)
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
        <p className="text-sm text-slate-600 font-inter leading-relaxed rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-3">
          Por mandato legal, la adjudicación es directa por la Máxima Autoridad. La Comisión de
          Contrataciones no interviene en esta modalidad.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-x-8 gap-y-6 min-w-0 items-stretch">
          <FormField
            control={form.control}
            name="autoridadId"
            render={() => (
              <FormItem className="min-w-0 flex h-full flex-col gap-0">
                <FormLabel className="text-heading-dark font-semibold font-inter text-sm">
                  Máxima Autoridad (o Delegado)
                </FormLabel>
                <p className="text-slate-500 italic text-xs mt-0.5 font-inter">
                  Suscribe y adjudica directamente el contrato.
                </p>
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
                <p className="text-slate-500 italic text-xs mt-0.5 font-inter">
                  Unidad solicitante del requerimiento.
                </p>
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
            name="fecInicioProcedimientoMe"
            render={({ field }) => (
              <FormItem className="min-w-0 md:col-span-2 md:max-w-[calc(50%-1rem)] flex h-full flex-col gap-0">
                <FormLabel className="text-heading-dark font-semibold font-inter text-sm">
                  Fecha de inicio del procedimiento
                </FormLabel>
                <p className="text-slate-500 italic text-xs mt-0.5 font-inter">
                  Recepción de requerimiento o cotización. Constituye el Hito Cero para la
                  formalización.
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

"use client";

import React, { useMemo, useState } from "react";
import { ArrowRight, CalendarIcon, CheckCircle2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BusinessDayCalendar } from "@/components/shared/BusinessDayCalendar";
import { useDiasNoLaborables } from "@/hooks/useDiasNoLaborables";
import type { CronogramaModalidadesExcluidasFormValues } from "@/lib/schemas/gestionExpedienteSchema";
import {
  actualizarFechaCronogramaMe,
  type FechaEditableMe,
} from "@/lib/modalidades/cronogramaModalidadesExcluidas";
import { cn } from "@/lib/utils";

const HITOS: {
  key: keyof CronogramaModalidadesExcluidasFormValues;
  label: string;
  hint: string;
  editable: boolean;
}[] = [
  {
    key: "fecInicioProcedimientoMe",
    label: "Recepción de requerimiento / cotización",
    hint: "Hito Cero (no editable)",
    editable: false,
  },
  {
    key: "fecVerificacionRecaudosMe",
    label: "Verificación de recaudos y presupuesto",
    hint: "1–2 días hábiles desde el inicio",
    editable: true,
  },
  {
    key: "fecLimiteAdjudicacionMe",
    label: "Adjudicación directa (Máxima Autoridad)",
    hint: "1 día hábil posterior a la verificación",
    editable: true,
  },
  {
    key: "fecLimiteGarantiasMe",
    label: "Consignar garantías (si aplica)",
    hint: "Máximo 5 días hábiles desde la adjudicación",
    editable: true,
  },
  {
    key: "fecLimiteFirmaContratoMe",
    label: "Firma del contrato / orden de servicio",
    hint: "Máximo 8 días hábiles desde la adjudicación",
    editable: true,
  },
];

export interface PlanificacionModalidadesExcluidasStepProps {
  cronograma: CronogramaModalidadesExcluidasFormValues;
  onCronogramaChange: (next: CronogramaModalidadesExcluidasFormValues) => void;
  onBack: () => void;
  onFinish: () => void;
  isLoading?: boolean;
  readOnly?: boolean;
  /** Oculta botones Anterior / Validar (vista de detalle). */
  hideButtons?: boolean;
}

export function PlanificacionModalidadesExcluidasStep({
  cronograma,
  onCronogramaChange,
  onBack,
  onFinish,
  isLoading = false,
  readOnly = false,
  hideButtons = false,
}: PlanificacionModalidadesExcluidasStepProps) {
  const [openKey, setOpenKey] = useState<string | null>(null);

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

  const handleDateChange = (key: FechaEditableMe, date: Date | undefined) => {
    if (!date || readOnly) return;
    const iso = format(date, "yyyy-MM-dd");
    const result = actualizarFechaCronogramaMe(cronograma, key, iso, nonWorkingDays);
    if (!result.success) {
      if (result.errorMsg) toast.error(result.errorMsg);
      return;
    }
    if (result.newCronograma) {
      onCronogramaChange(result.newCronograma);
      setOpenKey(null);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600 font-inter leading-relaxed">
        Al estar excluido de las modalidades estándar, los lapsos de publicidad y evaluación
        colegiada se omiten. Flujo administrativo directo a la revisión de requisitos y firma.
      </p>

      <div className="flex flex-col gap-0">
        {HITOS.map((hito, index) => {
          const value = cronograma[hito.key];
          const isLast = index === HITOS.length - 1;

          return (
            <div key={hito.key} className="flex gap-4 min-w-0">
              <div className="flex flex-col items-center shrink-0 w-8">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2",
                    index === 0
                      ? "border-navy bg-navy text-white"
                      : "border-navy/40 bg-white text-navy"
                  )}
                >
                  {isLast ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-bold font-inter">{index + 1}</span>
                  )}
                </div>
                {!isLast && <div className="w-0.5 flex-1 min-h-6 bg-navy/20 my-1" />}
              </div>

              <div className={cn("flex-1 min-w-0 pb-6", isLast && "pb-0")}>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-heading-dark font-inter text-sm leading-snug">
                      {hito.label}
                    </p>
                    <p className="text-xs text-slate-500 italic mt-1 font-inter">{hito.hint}</p>
                  </div>

                  {hito.editable && !readOnly ? (
                    <Popover
                      open={openKey === hito.key}
                      onOpenChange={(open) => setOpenKey(open ? hito.key : null)}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10 shrink-0 justify-between gap-2 text-left font-normal border-slate-300 rounded-md px-3 sm:min-w-[160px]"
                        >
                          {value ? format(new Date(value + "T00:00:00"), "dd/MM/yyyy") : "Fecha"}
                          <CalendarIcon className="h-4 w-4 text-slate-400 shrink-0" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <BusinessDayCalendar
                          mode="single"
                          captionLayout="dropdown"
                          fromYear={feriadosRange.fromYear}
                          toYear={feriadosRange.toYear}
                          selected={value ? new Date(value + "T00:00:00") : undefined}
                          onSelect={(date) => handleDateChange(hito.key as FechaEditableMe, date)}
                          nonWorkingDays={nonWorkingDays}
                          feriadoDescriptions={feriadoDescriptions}
                          locale={es}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <div className="inline-flex items-center gap-2 h-10 px-3 rounded-md border border-slate-200 bg-slate-50 text-sm text-heading-dark font-inter shrink-0">
                      {value ? format(new Date(value + "T00:00:00"), "dd/MM/yyyy") : "—"}
                    </div>
                  )}
                </div>

                {!isLast && (
                  <div className="hidden sm:flex items-center gap-1 text-navy/40 pl-2 pt-1">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!hideButtons && (
        <div className="flex justify-between pt-4 border-t border-slate-200">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
            className="h-11 px-6"
          >
            Anterior
          </Button>
          <Button
            type="button"
            onClick={onFinish}
            disabled={readOnly || isLoading}
            className="bg-navy hover:bg-navy-hover text-white font-semibold px-8 h-11 rounded-md cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando...
              </>
            ) : (
              "Validar y crear expediente"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

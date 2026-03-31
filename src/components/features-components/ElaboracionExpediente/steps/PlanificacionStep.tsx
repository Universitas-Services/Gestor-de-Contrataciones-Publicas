"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProcedureCalendar } from "../calendar/ProcedureCalendar";
import type { IEvent } from "../calendar/types";

interface PlanificacionStepProps {
  events: IEvent[];
  initialMonth: Date;
  onBack: () => void;
  onFinish: () => void;
  onEventDrop?: (eventId: string, diffInDays: number) => void;
  isLoading?: boolean;
}

// ─── 10 items = exactamente 5 por fila × 2 filas ─────────────────────
// El orden define la disposición visual de izquierda a derecha, fila 1 → fila 2
const LEGEND_ITEMS: { label: string; colorVar: string }[] = [
  { label: "Disponibilidad del Pliego", colorVar: "cal-disponibilidad" },
  { label: "Límite para Solicitud de Aclaratorias", colorVar: "cal-solicitud-aclaratorias" },
  { label: "Límite para Modificaciones al Pliego", colorVar: "cal-modificaciones" },
  { label: "Límite para Adjudicación", colorVar: "cal-adjudicacion" },
  { label: "Límite para Consignar Garantías", colorVar: "cal-garantias" },
  { label: "Límite para Respuesta de Aclaratorias", colorVar: "cal-respuesta-aclaratorias" },
  { label: "Acto de Recepción de Ofertas", colorVar: "cal-recepcion" },
  { label: "Límite para Notificación", colorVar: "cal-notificacion" },
  { label: "Límite para Evaluación", colorVar: "cal-evaluacion" },
  { label: "Límite para la Firma del Contrato", colorVar: "cal-firma" },
];

function ProcedureLegend() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-5 py-4">
      <div className="grid grid-cols-5 gap-x-6 gap-y-3">
        {LEGEND_ITEMS.map((item) => (
          <div key={item.colorVar} className="flex items-start gap-2 min-w-0">
            {/* Círculo sólido con el color del CSS var */}
            <span
              className="mt-0.5 flex-shrink-0 w-3 h-3 rounded-full"
              style={{ backgroundColor: `var(--${item.colorVar})` }}
            />
            <span className="text-[11px] font-inter font-medium text-slate-600 leading-tight">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PlanificacionStep({
  events,
  initialMonth,
  onBack,
  onFinish,
  onEventDrop,
  isLoading = false,
}: PlanificacionStepProps) {
  return (
    <div className="space-y-6">
      {/* Calendar */}
      {events.length > 0 ? (
        <>
          <ProcedureCalendar
            events={events}
            initialMonth={initialMonth}
            onEventDrop={onEventDrop}
          />
          <ProcedureLegend />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
          <p className="text-sm italic">No hay eventos generados. Complete el paso anterior.</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-slate-200">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
          className="border-slate-300 text-slate-600 hover:bg-slate-50 font-semibold px-8 h-11 rounded-md cursor-pointer"
        >
          Atrás
        </Button>
        <Button
          type="button"
          onClick={onFinish}
          disabled={isLoading}
          className="bg-navy hover:bg-navy-hover text-white font-semibold px-8 h-11 rounded-md cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creando expediente...
            </>
          ) : (
            "Crear Expediente"
          )}
        </Button>
      </div>
    </div>
  );
}

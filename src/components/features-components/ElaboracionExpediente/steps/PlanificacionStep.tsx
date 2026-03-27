"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ProcedureCalendar } from "../calendar/ProcedureCalendar";
import { CRONOGRAMA_MOCK } from "@/lib/mocks/expedientesMock";

interface PlanificacionStepProps {
  onBack: () => void;
  onFinish: () => void;
}

// The mock procedure starts in March 2026
const PROCEDURE_START_MONTH = new Date(2026, 2, 1); // March 2026

export function PlanificacionStep({ onBack, onFinish }: PlanificacionStepProps) {
  return (
    <div className="space-y-6">
      {/* Step description */}
      <p className="text-slate-500 text-sm italic">
        Visualice y ajuste los lapsos del procedimiento. Arrastre los eventos para modificar las
        fechas respetando las validaciones legales.
      </p>

      {/* Calendar */}
      <ProcedureCalendar events={CRONOGRAMA_MOCK} initialMonth={PROCEDURE_START_MONTH} />

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-slate-200">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="border-slate-300 text-slate-600 hover:bg-slate-50 font-semibold px-8 h-11 rounded-md cursor-pointer"
        >
          Atrás
        </Button>
        <Button
          type="button"
          onClick={onFinish}
          className="bg-navy hover:bg-navy-hover text-white font-semibold px-8 h-11 rounded-md cursor-pointer"
        >
          Crear Expediente
        </Button>
      </div>
    </div>
  );
}

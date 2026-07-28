"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { ChecklistSiNo } from "@/types/evaluacionFase3.types";

interface CumpleNoCumpleToggleProps {
  value: ChecklistSiNo | undefined;
  readOnly?: boolean;
  onChange: (value: ChecklistSiNo) => void;
  siLabel?: string;
  noLabel?: string;
}

export function CumpleNoCumpleToggle({
  value,
  readOnly = false,
  onChange,
  siLabel = "SÍ CUMPLE",
  noLabel = "NO CUMPLE",
}: CumpleNoCumpleToggleProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button
        type="button"
        variant="outline"
        disabled={readOnly}
        onClick={() => onChange("SI")}
        className={`h-12 flex-1 rounded-md text-[13px] font-bold tracking-wide ${
          value === "SI"
            ? "border-navy bg-navy text-white hover:bg-navy-hover hover:text-white"
            : "border-slate-200 bg-white text-color-titulos hover:bg-slate-50"
        }`}
      >
        {siLabel}
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={readOnly}
        onClick={() => onChange("NO")}
        className={`h-12 flex-1 rounded-md text-[13px] font-bold tracking-wide ${
          value === "NO"
            ? "border-red-600 bg-red-600 text-white hover:bg-red-700 hover:text-white"
            : "border-slate-200 bg-white text-color-titulos hover:bg-slate-50"
        }`}
      >
        {noLabel}
      </Button>
    </div>
  );
}

interface JustificacionCondicionalProps {
  value: ChecklistSiNo | undefined;
  justificacion: string;
  readOnly?: boolean;
  onChange: (value: string) => void;
  siPrompt: string;
  noPrompt: string;
  articulos?: string;
}

export function JustificacionCondicional({
  value,
  justificacion,
  readOnly = false,
  onChange,
  siPrompt,
  noPrompt,
  articulos = "Artículos 95 LCP; 18.4 LOPA; 16 Normas SUNAI",
}: JustificacionCondicionalProps) {
  if (!value) return null;

  return (
    <div className="mt-4 space-y-2">
      <label className="block text-[13px] font-bold text-color-titulos">
        {value === "SI" ? siPrompt : noPrompt}
      </label>
      <p className="text-[11px] italic text-muted-foreground">{articulos}</p>
      <Textarea
        value={justificacion}
        disabled={readOnly}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder="Escriba la justificación..."
        className="resize-y text-[13px]"
      />
    </div>
  );
}

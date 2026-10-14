"use client";

import { LocalizedDecimalInput } from "@/components/localized-decimal-input";
import { Label } from "@/components/ui/label";

function parseOptionalPuntaje(raw: string): number | null {
  if (!raw.trim()) return null;
  const normalized = raw.replace(/\./g, "").replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

interface CriterioDescapitalizacionPanelProps {
  puntajeNoDescapitalizado: number | null;
  readOnly?: boolean;
  onPuntajeChange: (value: number | null) => void;
}

export function CriterioDescapitalizacionPanel({
  puntajeNoDescapitalizado,
  readOnly = false,
  onPuntajeChange,
}: CriterioDescapitalizacionPanelProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-sm font-bold text-color-titulos">
          Indique el puntaje a asignar al oferente si NO se encuentra en proceso de
          descapitalización (La empresa descapitalizada obtendrá automáticamente cero &apos;0&apos;
          puntos).
        </Label>
        <p className="text-[11px] italic leading-relaxed text-muted-foreground">
          Artículo 67 RLCP.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <LocalizedDecimalInput
          value={puntajeNoDescapitalizado}
          fractionDigits={2}
          max={100}
          allowEmpty
          outputMode="raw"
          disabled={readOnly}
          aria-label="Puntaje máximo si no está descapitalizada"
          className="h-10 w-28"
          onValueChange={(raw) => onPuntajeChange(parseOptionalPuntaje(raw))}
        />
        <span className="text-sm font-medium text-muted-foreground">Puntos</span>
      </div>
    </div>
  );
}

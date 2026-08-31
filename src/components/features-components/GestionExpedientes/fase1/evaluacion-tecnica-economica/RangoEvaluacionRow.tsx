"use client";

import { CircleX } from "lucide-react";

import type { EvaluacionLado } from "@/lib/constants/evaluacionTecnicaEconomica";
import {
  RANGO_ECONOMICA_TEXTO_MAX,
  RANGO_TECNICA_TEXTO_MAX,
} from "@/lib/constants/evaluacionTecnicaEconomica";
import { LocalizedDecimalInput } from "@/components/localized-decimal-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function parseLocalized(raw: string): number {
  const normalized = raw.replace(/\./g, "").replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}

interface RangoEvaluacionRowProps {
  lado: EvaluacionLado;
  texto: string;
  puntaje: number;
  maxPuntajePadre: number;
  readOnly?: boolean;
  canRemove: boolean;
  onTextoChange: (value: string) => void;
  onPuntajeChange: (value: number) => void;
  onRemove: () => void;
}

export function RangoEvaluacionRow({
  lado,
  texto,
  puntaje,
  maxPuntajePadre,
  readOnly = false,
  canRemove,
  onTextoChange,
  onPuntajeChange,
  onRemove,
}: RangoEvaluacionRowProps) {
  const maxLen = lado === "tecnica" ? RANGO_TECNICA_TEXTO_MAX : RANGO_ECONOMICA_TEXTO_MAX;
  const exceeds = maxPuntajePadre > 0 && puntaje > maxPuntajePadre;

  return (
    <tr className="border-b border-dashed border-border/70 last:border-b-0">
      <td className="px-4 py-2 align-top">
        <Input
          value={texto}
          maxLength={maxLen}
          disabled={readOnly}
          placeholder="Ej: Condición / escala…"
          className="h-9 border-0 border-b border-dashed border-border bg-transparent px-2 text-sm shadow-none focus-visible:border-navy focus-visible:ring-0"
          onChange={(e) => onTextoChange(e.target.value)}
        />
      </td>
      <td className="px-4 py-2 align-top">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1">
            <LocalizedDecimalInput
              value={puntaje}
              fractionDigits={2}
              max={100}
              outputMode="raw"
              disabled={readOnly}
              placeholder="0"
              className={cn(
                "h-8 w-16 text-right text-sm",
                exceeds && "border-destructive bg-destructive/5"
              )}
              onValueChange={(raw) => onPuntajeChange(parseLocalized(raw))}
            />
            <span className="text-xs font-semibold text-muted-foreground">pts</span>
          </div>
          {exceeds ? (
            <p className="text-[9px] font-bold text-destructive">Supera máx. ({maxPuntajePadre})</p>
          ) : null}
        </div>
      </td>
      <td className="px-4 py-2 text-center align-top">
        {!readOnly && canRemove ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="mt-0.5 h-8 w-8 text-muted-foreground/50 hover:text-destructive"
            onClick={onRemove}
            aria-label="Eliminar rango"
          >
            <CircleX className="h-4 w-4" />
          </Button>
        ) : null}
      </td>
    </tr>
  );
}

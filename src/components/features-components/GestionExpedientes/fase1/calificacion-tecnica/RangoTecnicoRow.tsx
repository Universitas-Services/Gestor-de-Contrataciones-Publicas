"use client";

import { CircleX } from "lucide-react";

import { RANGO_TEXTO_MAX, type RangoTecnico } from "@/lib/constants/calificacionTecnica";
import { LocalizedDecimalInput } from "@/components/localized-decimal-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function parseLocalized(raw: string): number {
  const normalized = raw.replace(/\./g, "").replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}

interface RangoTecnicoRowProps {
  rango: RangoTecnico;
  maxPuntajePadre: number;
  readOnly?: boolean;
  canRemove: boolean;
  onChange: (next: RangoTecnico) => void;
  onRemove: () => void;
}

export function RangoTecnicoRow({
  rango,
  maxPuntajePadre,
  readOnly = false,
  canRemove,
  onChange,
  onRemove,
}: RangoTecnicoRowProps) {
  const exceeds =
    maxPuntajePadre > 0 && rango.puntuacionRangoCriterioCalificacionTecnicaAuAu > maxPuntajePadre;

  return (
    <tr className="border-b border-dashed border-border/70 last:border-b-0">
      <td className="px-4 py-2 align-top">
        <Input
          value={rango.rangoCriterioCalificacionTecnicaAuAu}
          maxLength={RANGO_TEXTO_MAX}
          disabled={readOnly}
          placeholder="Ej: Mayor a 10 años..."
          className="h-9 border-0 border-b border-dashed border-border bg-transparent px-2 text-sm shadow-none focus-visible:border-navy focus-visible:ring-0"
          onChange={(e) =>
            onChange({ ...rango, rangoCriterioCalificacionTecnicaAuAu: e.target.value })
          }
        />
      </td>
      <td className="px-4 py-2 align-top">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1">
            <LocalizedDecimalInput
              value={rango.puntuacionRangoCriterioCalificacionTecnicaAuAu}
              fractionDigits={0}
              max={100}
              outputMode="raw"
              disabled={readOnly}
              placeholder="0"
              className={cn(
                "h-8 w-16 text-right text-sm",
                exceeds && "border-destructive bg-destructive/5"
              )}
              onValueChange={(raw) =>
                onChange({
                  ...rango,
                  puntuacionRangoCriterioCalificacionTecnicaAuAu: parseLocalized(raw),
                })
              }
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

"use client";

import { CheckCircle2, AlertTriangle } from "lucide-react";

import { FIELD_COPY, TOTAL_PUNTOS_OBJETIVO } from "@/lib/constants/calificacionTecnica";
import { LocalizedDecimalInput } from "@/components/localized-decimal-input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

function parseLocalized(raw: string): number {
  const normalized = raw.replace(/\./g, "").replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}

type TotalState = "incomplete" | "perfect" | "exceeded";

function resolveState(total: number): TotalState {
  if (total === TOTAL_PUNTOS_OBJETIVO) return "perfect";
  if (total > TOTAL_PUNTOS_OBJETIVO) return "exceeded";
  return "incomplete";
}

interface PonderacionTotalStickyProps {
  total: number;
  umbral: number;
  readOnly?: boolean;
  onUmbralChange: (value: number) => void;
}

/** Panel sticky de la página: termómetro + umbral con pregunta y basamento. */
export function PonderacionTotalSticky({
  total,
  umbral,
  readOnly = false,
  onUmbralChange,
}: PonderacionTotalStickyProps) {
  const state = resolveState(total);
  const remaining = Math.abs(TOTAL_PUNTOS_OBJETIVO - total);
  const progressPct = Math.min(100, Math.max(0, (total / TOTAL_PUNTOS_OBJETIVO) * 100));

  const barClass =
    state === "perfect" ? "bg-success" : state === "exceeded" ? "bg-destructive" : "bg-amber-dark";

  const badgeClass =
    state === "perfect"
      ? "border-0 bg-success-bg text-success-text"
      : state === "exceeded"
        ? "border-0 bg-destructive/10 text-destructive"
        : "border-0 bg-doc-warning-bg text-amber-dark";

  const helper =
    state === "perfect"
      ? "¡Perfecto! Suma exacta de 100 puntos."
      : state === "exceeded"
        ? `Excede por ${remaining} puntos.`
        : `Faltan ${remaining} puntos para completar la matriz.`;

  const clampUmbral = (value: number) => {
    const cappedByHundred = Math.min(Math.max(0, value), TOTAL_PUNTOS_OBJETIVO);
    if (total <= 0) return cappedByHundred;
    return Math.min(cappedByHundred, total);
  };

  return (
    <div className="w-full space-y-4">
      <div className="w-full space-y-2">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              Ponderación Total
            </p>
            <p className="text-2xl font-black leading-none text-color-titulos">
              {total.toLocaleString("es-VE", { maximumFractionDigits: 2 })}{" "}
              <span className="text-sm font-semibold text-muted-foreground">
                / {TOTAL_PUNTOS_OBJETIVO} pts
              </span>
            </p>
          </div>
          <Badge className={cn("shrink-0 text-[11px] font-bold", badgeClass)}>
            {state === "perfect" ? (
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                ¡Perfecto!
              </span>
            ) : state === "exceeded" ? (
              <span className="inline-flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                Excede límite
              </span>
            ) : (
              "Incompleto"
            )}
          </Badge>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full transition-all duration-300", barClass)}
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p
          className={cn(
            "text-[10px] font-semibold",
            state === "perfect" && "text-success-text",
            state === "exceeded" && "text-destructive",
            state === "incomplete" && "text-amber-dark"
          )}
        >
          {helper}
        </p>
      </div>

      <div className="w-full space-y-2 border-t border-border pt-4">
        <Label className="block w-full text-sm font-bold leading-snug text-color-titulos">
          {FIELD_COPY.umbral.label}
        </Label>
        <p className="w-full text-[11px] italic leading-relaxed text-muted-foreground">
          {FIELD_COPY.umbral.legal}
        </p>
        <div className="flex items-center gap-2">
          <LocalizedDecimalInput
            value={umbral}
            fractionDigits={0}
            max={TOTAL_PUNTOS_OBJETIVO}
            outputMode="raw"
            disabled={readOnly}
            placeholder="Ej: 75"
            className="h-10 w-28"
            onValueChange={(raw) => {
              const next = parseLocalized(raw);
              onUmbralChange(Math.min(Math.max(0, next), TOTAL_PUNTOS_OBJETIVO));
            }}
            onBlur={() => onUmbralChange(clampUmbral(umbral))}
          />
          <span className="text-sm font-medium text-muted-foreground">pts mínimos</span>
        </div>
      </div>
    </div>
  );
}

interface PonderacionProgressMiniProps {
  total: number;
}

/** Mini barra de progreso para el header del modal de criterio. */
export function PonderacionProgressMini({ total }: PonderacionProgressMiniProps) {
  const state = resolveState(total);
  const remaining = Math.abs(TOTAL_PUNTOS_OBJETIVO - total);
  const progressPct = Math.min(100, Math.max(0, (total / TOTAL_PUNTOS_OBJETIVO) * 100));

  const barClass =
    state === "perfect" ? "bg-success" : state === "exceeded" ? "bg-destructive" : "bg-amber-dark";

  const badgeClass =
    state === "perfect"
      ? "border-0 bg-success-bg text-success-text"
      : state === "exceeded"
        ? "border-0 bg-destructive/10 text-destructive"
        : "border-0 bg-doc-warning-bg text-amber-dark";

  const helper =
    state === "perfect"
      ? "Suma exacta de 100 puntos."
      : state === "exceeded"
        ? `Excede por ${remaining} pts`
        : `Faltan ${remaining} pts`;

  return (
    <div className="rounded-md border border-border bg-muted/40 px-3 py-2">
      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="text-sm font-bold tabular-nums text-navy">
          {total.toLocaleString("es-VE", { maximumFractionDigits: 2 })}
          <span className="font-semibold text-muted-foreground">
            {" "}
            / {TOTAL_PUNTOS_OBJETIVO} pts
          </span>
        </p>
        <Badge className={cn("text-[10px] font-bold", badgeClass)}>
          {state === "perfect" ? (
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Perfecto
            </span>
          ) : state === "exceeded" ? (
            <span className="inline-flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Excede
            </span>
          ) : (
            "Incompleto"
          )}
        </Badge>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all duration-300", barClass)}
          style={{ width: `${progressPct}%` }}
        />
      </div>
      <p
        className={cn(
          "mt-1 text-[10px] font-semibold",
          state === "perfect" && "text-success-text",
          state === "exceeded" && "text-destructive",
          state === "incomplete" && "text-amber-dark"
        )}
      >
        {helper}
      </p>
    </div>
  );
}

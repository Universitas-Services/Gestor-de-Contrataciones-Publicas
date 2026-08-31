"use client";

import { CheckCircle2, AlertTriangle } from "lucide-react";

import { TOTAL_PUNTOS_OBJETIVO } from "@/lib/constants/evaluacionTecnicaEconomica";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type TotalState = "incomplete" | "perfect" | "exceeded";

function resolveState(total: number): TotalState {
  if (total === TOTAL_PUNTOS_OBJETIVO) return "perfect";
  if (total > TOTAL_PUNTOS_OBJETIVO) return "exceeded";
  return "incomplete";
}

interface BolsaCompartidaBarProps {
  totalMatriz: number;
  totalTecnica: number;
  totalEconomica: number;
}

/** Dashboard de la bolsa compartida (100 pts) con desglose Técnica / Económica. */
export function BolsaCompartidaBar({
  totalMatriz,
  totalTecnica,
  totalEconomica,
}: BolsaCompartidaBarProps) {
  const state = resolveState(totalMatriz);
  const remaining = Math.abs(TOTAL_PUNTOS_OBJETIVO - totalMatriz);
  const progressPct = Math.min(100, Math.max(0, (totalMatriz / TOTAL_PUNTOS_OBJETIVO) * 100));

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
      ? "¡Perfecto! Bolsa compartida exacta de 100 puntos."
      : state === "exceeded"
        ? `Excede por ${remaining} puntos.`
        : `Faltan ${remaining} puntos para completar la matriz.`;

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            Bolsa Compartida (100 Puntos)
          </p>
          <p className="text-2xl font-black leading-none text-color-titulos">
            {totalMatriz.toLocaleString("es-VE", { maximumFractionDigits: 2 })}{" "}
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

      <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
        <span className="rounded-md border border-border bg-muted/40 px-2.5 py-1 text-navy">
          Técnica: {totalTecnica.toLocaleString("es-VE", { maximumFractionDigits: 2 })} pts
        </span>
        <span className="rounded-md border border-border bg-muted/40 px-2.5 py-1 text-navy">
          Económica: {totalEconomica.toLocaleString("es-VE", { maximumFractionDigits: 2 })} pts
        </span>
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
  );
}

interface BolsaProgressMiniProps {
  total: number;
}

/** Mini barra de progreso para el header del modal de criterio. */
export function BolsaProgressMini({ total }: BolsaProgressMiniProps) {
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

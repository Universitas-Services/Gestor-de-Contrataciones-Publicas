"use client";

import { PieChart } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TOTAL_PUNTOS_BOLSA } from "@/lib/constants/evaluacionPuntajeEvaluacion";

interface EvaluacionPuntajeScoreHeaderProps {
  titulo: string;
  subtitulo: string;
  totalTecnica: number;
  maxTecnica: number;
  totalEconomica: number;
  maxEconomica: number;
  finalScore: number;
  cumpleTecnica: boolean | null;
  cumpleEconomica: boolean | null;
}

function SideBadge({ cumple }: { cumple: boolean | null }) {
  return (
    <Badge
      className={cn(
        "mt-1 text-[10px] font-bold",
        cumple === true && "border-0 bg-success-bg text-success-text",
        cumple === false && "border-0 bg-destructive/10 text-destructive",
        cumple === null && "border-0 bg-muted text-muted-foreground"
      )}
    >
      {cumple === true ? "Cumple" : cumple === false ? "No cumple" : "Sin evaluar"}
    </Badge>
  );
}

export function EvaluacionPuntajeScoreHeader({
  titulo,
  subtitulo,
  totalTecnica,
  maxTecnica,
  totalEconomica,
  maxEconomica,
  finalScore,
  cumpleTecnica,
  cumpleEconomica,
}: EvaluacionPuntajeScoreHeaderProps) {
  const globalDone = cumpleTecnica !== null && cumpleEconomica !== null;
  const globalOk = cumpleTecnica === true && cumpleEconomica === true;

  return (
    <div className="shrink-0 space-y-4 border-b border-slate-200 bg-white px-6 py-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-navy">
          <PieChart className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h2 className="text-[20px] font-bold leading-tight text-color-titulos md:text-[22px]">
            {titulo}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{subtitulo}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Pesos del pliego: <span className="font-semibold text-navy">{maxTecnica}% técnico</span>
            {" · "}
            <span className="font-semibold text-color-titulos">{maxEconomica}% económico</span>
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-stretch gap-3 rounded-lg border border-border bg-muted/20 p-4">
        <div className="min-w-[7rem] flex-1 border-r border-border pr-3">
          <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            Pts. técnicos
          </p>
          <p className="text-xl font-black text-navy">
            {totalTecnica.toLocaleString("es-VE", { maximumFractionDigits: 2 })}{" "}
            <span className="text-xs font-semibold text-muted-foreground">/ {maxTecnica}</span>
          </p>
          <SideBadge cumple={cumpleTecnica} />
        </div>
        <div className="min-w-[7rem] flex-1 border-r border-border pr-3">
          <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            Pts. económicos
          </p>
          <p className="text-xl font-black text-color-titulos">
            {totalEconomica.toLocaleString("es-VE", { maximumFractionDigits: 2 })}{" "}
            <span className="text-xs font-semibold text-muted-foreground">/ {maxEconomica}</span>
          </p>
          <SideBadge cumple={cumpleEconomica} />
        </div>
        <div className="min-w-[8rem] flex-1 text-center sm:text-left">
          <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            Calificación final
          </p>
          <p className="text-2xl font-black text-color-titulos">
            {finalScore.toLocaleString("es-VE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            <span className="text-sm font-semibold text-muted-foreground">
              / {TOTAL_PUNTOS_BOLSA}
            </span>
          </p>
          <Badge
            className={cn(
              "mt-1 text-[10px] font-bold",
              globalDone && globalOk && "border-0 bg-success-bg text-success-text",
              globalDone && !globalOk && "border-0 bg-destructive/10 text-destructive",
              !globalDone && "border-0 bg-muted text-muted-foreground"
            )}
          >
            {!globalDone ? "En proceso" : globalOk ? "Calificado" : "No calificado"}
          </Badge>
        </div>
      </div>
    </div>
  );
}

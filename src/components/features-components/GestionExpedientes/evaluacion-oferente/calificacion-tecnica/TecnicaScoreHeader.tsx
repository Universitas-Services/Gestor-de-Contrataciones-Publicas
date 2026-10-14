"use client";

import { ClipboardCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TOTAL_PUNTOS_TECNICA } from "@/lib/constants/calificacionTecnicaEvaluacion";

interface TecnicaScoreHeaderProps {
  titulo: string;
  subtitulo: string;
  total: number;
  umbral: number;
  cumple: boolean | null;
}

export function TecnicaScoreHeader({
  titulo,
  subtitulo,
  total,
  umbral,
  cumple,
}: TecnicaScoreHeaderProps) {
  return (
    <div className="shrink-0 space-y-4 border-b border-slate-200 bg-white px-6 py-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-navy">
          <ClipboardCheck className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h2 className="text-[20px] font-bold leading-tight text-color-titulos md:text-[22px]">
            {titulo}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{subtitulo}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3 rounded-lg border border-border bg-muted/20 p-4">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            Puntuación técnica
          </p>
          <p className="text-2xl font-black leading-none text-color-titulos">
            {total.toLocaleString("es-VE", { maximumFractionDigits: 2 })}{" "}
            <span className="text-sm font-semibold text-muted-foreground">
              / {TOTAL_PUNTOS_TECNICA} pts
            </span>
          </p>
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            Umbral mínimo aprobatorio:{" "}
            <span className="font-semibold text-color-titulos">{umbral} pts</span>
          </p>
        </div>
        <Badge
          className={cn(
            "shrink-0 text-[11px] font-bold",
            cumple === true && "border-0 bg-success-bg text-success-text",
            cumple === false && "border-0 bg-destructive/10 text-destructive",
            cumple === null && "border-0 bg-muted text-muted-foreground"
          )}
        >
          {cumple === true ? "Cumple" : cumple === false ? "No cumple" : "Sin evaluar"}
        </Badge>
      </div>
    </div>
  );
}

"use client";

import { Medal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PromocionScoreHeaderProps {
  titulo: string;
  subtitulo: string;
  notaBase: number;
  totalBonos: number;
  puntuacionFinal: number;
}

export function PromocionScoreHeader({
  titulo,
  subtitulo,
  notaBase,
  totalBonos,
  puntuacionFinal,
}: PromocionScoreHeaderProps) {
  const over100 = puntuacionFinal > 100;

  return (
    <div className="shrink-0 space-y-4 border-b border-slate-200 bg-white px-6 py-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-navy">
          <Medal className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h2 className="text-[20px] font-bold leading-tight text-color-titulos md:text-[22px]">
            {titulo}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{subtitulo}</p>
        </div>
      </div>

      <div
        className={cn(
          "flex flex-wrap items-stretch gap-3 rounded-lg border p-4",
          over100 ? "border-amber-200 bg-amber-50/40" : "border-border bg-muted/20"
        )}
      >
        <div className="min-w-[7rem] flex-1 border-r border-border pr-3">
          <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            Nota base
          </p>
          <p className="text-xl font-black text-color-titulos">
            {notaBase.toLocaleString("es-VE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
        <div className="min-w-[7rem] flex-1 border-r border-border pr-3">
          <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            Bonos promo
          </p>
          <p className="text-xl font-black text-navy">
            +
            {totalBonos.toLocaleString("es-VE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
        <div className="min-w-[8rem] flex-1">
          <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            Calificación final
          </p>
          <p className="text-2xl font-black text-color-titulos">
            {puntuacionFinal.toLocaleString("es-VE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            <span className="text-sm font-semibold text-muted-foreground">pts</span>
          </p>
          {over100 ? (
            <Badge className="mt-1 border-0 bg-doc-warning-bg text-[10px] font-bold text-amber-dark">
              Bonificación legal (&gt; 100)
            </Badge>
          ) : null}
        </div>
      </div>
    </div>
  );
}

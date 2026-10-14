"use client";

import { Check, Layers, Package } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { CaracterAdjudicacion } from "./types";

interface CaracterAdjudicacionCardProps {
  value: CaracterAdjudicacion | null;
  canChange: boolean;
  readOnly?: boolean;
  onChange: (value: CaracterAdjudicacion) => boolean;
}

const OPTIONS: {
  value: CaracterAdjudicacion;
  title: string;
  description: string;
  Icon: typeof Package;
}[] = [
  {
    value: "TOTAL",
    title: "Adjudicación Total",
    description: "Se adjudicará la totalidad del procedimiento a la Primera Opción.",
    Icon: Package,
  },
  {
    value: "PARCIAL",
    title: "Adjudicación Parcial",
    description: "Se dictamina por oferente (adjudicado o no) con detalle por porción.",
    Icon: Layers,
  },
];

export function CaracterAdjudicacionCard({
  value,
  canChange,
  readOnly = false,
  onChange,
}: CaracterAdjudicacionCardProps) {
  const locked = readOnly || !canChange;

  return (
    <Card className="border border-border shadow-sm">
      <CardHeader className="border-b border-border bg-slate-50 px-6 py-4">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-bold uppercase tracking-wide text-navy">Paso 1</p>
          <CardTitle className="text-[17px] font-bold text-color-titulos">
            Carácter de la adjudicación
          </CardTitle>
          <p className="text-[12px] text-muted-foreground">
            Seleccione si el procedimiento será de adjudicación total o parcial. Puede cambiar esta
            opción mientras no se haya adjudicado a ningún oferente.
          </p>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 p-6 md:grid-cols-2">
        {OPTIONS.map(({ value: option, title, description, Icon }) => {
          const selected = value === option;
          const button = (
            <button
              type="button"
              disabled={locked && !selected}
              onClick={() => {
                if (locked && !selected) return;
                onChange(option);
              }}
              className={cn(
                "flex w-full items-start gap-4 rounded-lg border-2 p-5 text-left transition-colors",
                selected ? "border-navy bg-navy/5" : "border-border bg-white hover:border-navy/40",
                locked && !selected && "cursor-not-allowed opacity-50"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
                  selected ? "border-navy" : "border-muted-foreground/40"
                )}
              >
                {selected ? <Check className="h-3.5 w-3.5 text-navy" strokeWidth={3} /> : null}
              </span>
              <span className="min-w-0 flex-1">
                <span className="mb-1 flex items-center gap-2">
                  <Icon className="h-4 w-4 text-navy" />
                  <span className="text-sm font-bold text-color-titulos">{title}</span>
                </span>
                <span className="block text-[12px] text-muted-foreground">{description}</span>
              </span>
            </button>
          );

          if (locked && !selected) {
            return (
              <TooltipProvider key={option} delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="block">{button}</span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[240px] text-xs">
                    No puede cambiar el carácter: ya hay adjudicaciones o dictámenes guardados.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          }

          return <div key={option}>{button}</div>;
        })}
      </CardContent>
    </Card>
  );
}

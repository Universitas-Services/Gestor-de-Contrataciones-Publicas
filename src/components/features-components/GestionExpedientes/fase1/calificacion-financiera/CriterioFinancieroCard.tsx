"use client";

import type { ReactNode } from "react";

import { SiNoToggleField } from "@/components/features-components/GestionExpedientes/fase1/actividades-previas/SiNoToggleField";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CriterioFinancieroCardProps {
  title: string;
  pregunta: string;
  basamentoLegal: string;
  value: boolean | undefined;
  readOnly?: boolean;
  inverseRibbon?: boolean;
  onChange: (value: boolean) => void;
  children?: ReactNode;
}

export function CriterioFinancieroCard({
  title,
  pregunta,
  basamentoLegal,
  value,
  readOnly = false,
  inverseRibbon = false,
  onChange,
  children,
}: CriterioFinancieroCardProps) {
  const isActive = value === true;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-card shadow-sm",
        isActive && "border-navy/30"
      )}
    >
      <div className="space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
            {title}
          </p>
          {inverseRibbon ? (
            <Badge className="rounded-md border-0 bg-navy text-[10px] font-bold uppercase text-white">
              Lógica inversa
            </Badge>
          ) : null}
        </div>

        <div className="space-y-1">
          <p className="text-sm font-bold text-color-titulos">{pregunta}</p>
          <p className="text-[11px] italic leading-relaxed text-muted-foreground">
            {basamentoLegal}
          </p>
        </div>

        <div className="max-w-[200px]">
          <SiNoToggleField
            value={value}
            onChange={onChange}
            disabled={readOnly}
            className="gap-2"
            buttonClassName="h-9 text-xs"
          />
        </div>
      </div>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-in-out",
          isActive ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t border-border bg-muted/30 p-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

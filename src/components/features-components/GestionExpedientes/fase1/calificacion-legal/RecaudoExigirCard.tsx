"use client";

import { FileText } from "lucide-react";

import type { RecaudoDef } from "@/lib/constants/calificacionLegal";
import { SiNoToggleField } from "@/components/features-components/GestionExpedientes/fase1/actividades-previas/SiNoToggleField";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ModeloPreviewPayload } from "./ModeloDocumentoDialog";

interface RecaudoExigirCardProps {
  recaudo: RecaudoDef;
  exigido: boolean | undefined;
  substituteValue?: boolean;
  locked?: boolean;
  readOnly?: boolean;
  onExigidoChange: (value: boolean) => void;
  onSubstituteChange?: (value: boolean) => void;
  onVerModelo: (payload: ModeloPreviewPayload) => void;
}

export function RecaudoExigirCard({
  recaudo,
  exigido,
  substituteValue,
  locked = false,
  readOnly = false,
  onExigidoChange,
  onSubstituteChange,
  onVerModelo,
}: RecaudoExigirCardProps) {
  const disabled = readOnly || locked;
  const showSubstitute = exigido === true && Boolean(recaudo.substitute);

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-4 shadow-sm",
        exigido === true && "border-navy/30 bg-muted/20"
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-sm font-semibold leading-snug text-color-titulos">{recaudo.titulo}</p>
          {recaudo.modelUrl ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 border-border text-xs text-navy hover:bg-muted"
              onClick={() =>
                onVerModelo({
                  title: recaudo.titulo,
                  modelUrl: recaudo.modelUrl,
                })
              }
            >
              <FileText className="mr-1.5 h-3.5 w-3.5" />
              Ver modelo
            </Button>
          ) : null}
          {locked ? (
            <p className="text-[11px] font-medium text-muted-foreground">
              Activado automáticamente por configuración previa del expediente.
            </p>
          ) : null}
        </div>

        <div className="shrink-0 space-y-1.5 sm:w-[180px]">
          <p className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
            Exigir
          </p>
          <SiNoToggleField
            value={exigido}
            onChange={onExigidoChange}
            disabled={disabled}
            className="gap-2"
            buttonClassName="h-9 text-xs"
          />
        </div>
      </div>

      {showSubstitute && recaudo.substitute ? (
        <div className="mt-4 space-y-3 rounded-md border border-border bg-muted/40 p-3">
          <p className="text-xs font-medium leading-relaxed text-foreground">
            {recaudo.substitute.pregunta}
          </p>
          {recaudo.substitute.basamentoLegal ? (
            <p className="text-[11px] italic leading-relaxed text-muted-foreground">
              {recaudo.substitute.basamentoLegal}
            </p>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {recaudo.substitute.modelUrl ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 border-border text-xs text-navy hover:bg-muted"
                onClick={() =>
                  onVerModelo({
                    title: recaudo.substitute!.pregunta,
                    modelUrl: recaudo.substitute!.modelUrl,
                  })
                }
              >
                <FileText className="mr-1.5 h-3.5 w-3.5" />
                Ver modelo
              </Button>
            ) : (
              <span />
            )}
            <div className="sm:w-[180px]">
              <SiNoToggleField
                value={substituteValue}
                onChange={(value) => onSubstituteChange?.(value)}
                disabled={readOnly}
                className="gap-2"
                buttonClassName="h-9 text-xs"
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

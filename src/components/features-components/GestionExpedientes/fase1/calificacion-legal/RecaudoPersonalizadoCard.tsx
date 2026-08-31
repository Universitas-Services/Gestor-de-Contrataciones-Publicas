"use client";

import { FileText, Trash2 } from "lucide-react";

import type { RecaudoPersonalizadoItem } from "@/lib/constants/calificacionLegal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ModeloPreviewPayload } from "./ModeloDocumentoDialog";

interface RecaudoPersonalizadoCardProps {
  item: RecaudoPersonalizadoItem;
  readOnly?: boolean;
  onRemove: (id: string) => void;
  onVerModelo: (payload: ModeloPreviewPayload) => void;
}

export function RecaudoPersonalizadoCard({
  item,
  readOnly = false,
  onRemove,
  onVerModelo,
}: RecaudoPersonalizadoCardProps) {
  const canPreview = Boolean(item.archivo?.previewUrl) || Boolean(item.archivo?.fileName);

  return (
    <div className="rounded-lg border border-dashed border-navy/40 bg-sky-50/60 p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="rounded-md border-navy/30 bg-card text-[10px] font-bold uppercase text-navy"
            >
              Personalizado
            </Badge>
          </div>
          <p className="text-sm font-semibold leading-snug whitespace-pre-wrap text-color-titulos">
            {item.descripcion}
          </p>
          <div className="flex flex-wrap gap-2">
            {canPreview ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 border-border text-xs text-navy hover:bg-muted"
                onClick={() =>
                  onVerModelo({
                    title: item.descripcion,
                    previewSrc: item.archivo?.previewUrl ?? null,
                    fileName: item.archivo?.fileName ?? null,
                  })
                }
              >
                <FileText className="mr-1.5 h-3.5 w-3.5" />
                Ver modelo
              </Button>
            ) : null}
          </div>
        </div>

        {!readOnly ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0 border-border text-destructive hover:bg-destructive/10"
            onClick={() => onRemove(item.id)}
            aria-label="Quitar recaudo personalizado"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}

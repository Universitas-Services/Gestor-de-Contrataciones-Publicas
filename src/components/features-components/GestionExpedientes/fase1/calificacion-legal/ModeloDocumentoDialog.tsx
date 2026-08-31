"use client";

import { ExternalLink, FileText, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface ModeloPreviewPayload {
  title: string;
  /** Plantilla externa (p. ej. Google Docs) mientras no haya endpoint */
  modelUrl?: string | null;
  /** URL embebible: blob local o futura respuesta del endpoint de preview */
  previewSrc?: string | null;
  fileName?: string | null;
}

interface ModeloDocumentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payload: ModeloPreviewPayload | null;
  /** Cuando el endpoint esté listo: true mientras carga el preview */
  isLoadingPreview?: boolean;
}

function toEmbeddableUrl(url: string): string {
  // Google Docs: vista embebida aproximada
  if (url.includes("docs.google.com/document")) {
    return url.replace(/\/edit.*$/, "/preview");
  }
  return url;
}

export function ModeloDocumentoDialog({
  open,
  onOpenChange,
  payload,
  isLoadingPreview = false,
}: ModeloDocumentoDialogProps) {
  const title = payload?.title ?? "Modelo del recaudo";
  const previewSrc = payload?.previewSrc
    ? payload.previewSrc
    : payload?.modelUrl
      ? toEmbeddableUrl(payload.modelUrl)
      : null;
  const openExternal = payload?.modelUrl ?? payload?.previewSrc ?? null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden border-border bg-card p-0 sm:max-w-4xl [&_[data-slot=dialog-close]]:text-white [&_[data-slot=dialog-close]]:opacity-90 [&_[data-slot=dialog-close]]:hover:opacity-100 [&_[data-slot=dialog-close]]:hover:bg-white/10">
        <DialogHeader className="shrink-0 space-y-1 border-b-0 bg-navy px-5 py-4 text-left">
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-white">
            <FileText className="h-5 w-5 text-white" />
            Vista previa del modelo
          </DialogTitle>
          <p className="text-xs text-white/80">{title}</p>
          {payload?.fileName ? (
            <p className="text-[11px] font-medium text-white/70">Archivo: {payload.fileName}</p>
          ) : null}
        </DialogHeader>

        <div className="min-h-[360px] flex-1 bg-muted/40 p-3 md:min-h-[480px]">
          {isLoadingPreview ? (
            <div className="flex h-full min-h-[360px] flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-navy" />
              Cargando documento…
            </div>
          ) : previewSrc ? (
            <iframe
              title={`Vista previa: ${title}`}
              src={previewSrc}
              className="h-full min-h-[360px] w-full rounded-md border border-border bg-card md:min-h-[480px]"
            />
          ) : (
            <div className="flex h-full min-h-[360px] flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-card px-6 text-center">
              <FileText className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm font-semibold text-color-titulos">
                Previsualización no disponible aún
              </p>
              <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
                El visor usará el endpoint de documentos cuando esté disponible. Mientras tanto
                puede abrir el modelo externo si existe un enlace.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0 gap-2 border-t border-border px-5 py-3 sm:justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          {openExternal ? (
            <Button type="button" asChild className="bg-navy text-white hover:bg-navy-hover">
              <a href={openExternal} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-1.5 h-4 w-4" />
                Abrir en nueva pestaña
              </a>
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

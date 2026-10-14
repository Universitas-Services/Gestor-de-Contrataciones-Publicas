"use client";

import { useEffect, useRef, useState } from "react";
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
  /** Código en /documentos-ejemplo */
  modelCodigo?: string | null;
  /** URL del archivo (PDF/DOCX/imagen) desde el API */
  previewSrc?: string | null;
  fileName?: string | null;
}

interface ModeloDocumentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payload: ModeloPreviewPayload | null;
  isLoadingPreview?: boolean;
}

type PreviewMode = "idle" | "pdf" | "docx" | "image" | "unsupported";

function looksLikePdf(url: string, fileName?: string | null, contentType?: string | null) {
  if (contentType?.includes("pdf")) return true;
  const lower = `${fileName ?? ""} ${url}`.toLowerCase();
  const cleanUrl = url.split("?")[0]?.toLowerCase() ?? "";
  return (
    cleanUrl.endsWith(".pdf") ||
    lower.includes(".pdf") ||
    lower.includes("/raw/") ||
    cleanUrl.endsWith("pdf")
  );
}

function looksLikeImage(url: string, fileName?: string | null, contentType?: string | null) {
  if (contentType?.startsWith("image/")) return true;
  const lower = `${fileName ?? ""} ${url.split("?")[0] ?? ""}`.toLowerCase();
  return /\.(jpe?g|png|webp|gif)$/i.test(lower);
}

export function ModeloDocumentoDialog({
  open,
  onOpenChange,
  payload,
  isLoadingPreview = false,
}: ModeloDocumentoDialogProps) {
  const title = payload?.title ?? "Modelo del recaudo";
  const previewSrc = payload?.previewSrc ?? null;

  const containerRef = useRef<HTMLDivElement>(null);
  const blobUrlRef = useRef<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<PreviewMode>("idle");

  const revokeBlobUrl = () => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  };

  const resetPreview = () => {
    setIsRendering(false);
    setRenderError(null);
    setPdfUrl(null);
    setImageUrl(null);
    setMode("idle");
    revokeBlobUrl();
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
    }
  };

  useEffect(() => {
    if (!open || !previewSrc || isLoadingPreview) return;

    let cancelled = false;

    const renderDocument = async () => {
      setIsRendering(true);
      setRenderError(null);
      setPdfUrl(null);
      setImageUrl(null);
      setMode("idle");
      revokeBlobUrl();
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }

      try {
        const response = await fetch(previewSrc);
        if (!response.ok) {
          throw new Error("No se pudo descargar el archivo para previsualizar");
        }

        const contentType = response.headers.get("content-type");
        const blob = await response.blob();
        const resolvedType = contentType ?? blob.type;

        if (cancelled) return;

        if (looksLikePdf(previewSrc, payload?.fileName, resolvedType)) {
          const pdfBlob = blob.type.includes("pdf")
            ? blob
            : new Blob([blob], { type: "application/pdf" });
          const objectUrl = URL.createObjectURL(pdfBlob);
          blobUrlRef.current = objectUrl;
          if (!cancelled) {
            setMode("pdf");
            setPdfUrl(objectUrl);
          }
          return;
        }

        if (looksLikeImage(previewSrc, payload?.fileName, resolvedType)) {
          const objectUrl = URL.createObjectURL(blob);
          blobUrlRef.current = objectUrl;
          if (!cancelled) {
            setMode("image");
            setImageUrl(objectUrl);
          }
          return;
        }

        // DOCX / Word: mismo enfoque que ManualPreviewDialog (docx-preview en el modal).
        // Incluye archivos sin extensión en el nombre (Documentos de Ejemplo).
        for (let i = 0; i < 20 && !containerRef.current; i += 1) {
          await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
        }

        if (cancelled || !containerRef.current) {
          throw new Error("No se pudo inicializar el visor del documento");
        }

        const { renderAsync } = await import("docx-preview");

        if (cancelled || !containerRef.current) return;

        setMode("docx");
        containerRef.current.innerHTML = "";

        await renderAsync(blob, containerRef.current, undefined, {
          className: "docx-preview-wrapper",
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: true,
          ignoreFonts: false,
          breakPages: true,
          ignoreLastRenderedPageBreak: true,
          experimental: false,
          trimXmlDeclaration: true,
          useBase64URL: true,
        });
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error ? error.message : "Error al renderizar el documento";
          setRenderError(message);
          setMode("unsupported");
        }
      } finally {
        if (!cancelled) {
          setIsRendering(false);
        }
      }
    };

    void renderDocument();

    return () => {
      cancelled = true;
    };
  }, [open, previewSrc, isLoadingPreview, payload?.fileName]);

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      resetPreview();
    }
    onOpenChange(value);
  };

  const showLoading = isLoadingPreview || isRendering;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
          {payload?.modelCodigo ? (
            <p className="font-mono text-[10px] text-white/60">{payload.modelCodigo}</p>
          ) : null}
        </DialogHeader>

        <div className="relative min-h-[360px] flex-1 overflow-hidden bg-muted/40 md:min-h-[480px]">
          {showLoading ? (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-background/90 text-sm text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-navy" />
              {isLoadingPreview ? "Cargando documento…" : "Renderizando documento…"}
            </div>
          ) : null}

          {renderError && !showLoading ? (
            <div className="flex h-full min-h-[360px] flex-col items-center justify-center gap-3 px-6 text-center md:min-h-[480px]">
              <FileText className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm font-semibold text-color-titulos">
                No se pudo mostrar la vista previa
              </p>
              <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
                {renderError}
              </p>
            </div>
          ) : null}

          {!previewSrc && !showLoading ? (
            <div className="flex h-full min-h-[360px] flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-card px-6 text-center md:min-h-[480px]">
              <FileText className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm font-semibold text-color-titulos">
                Previsualización no disponible
              </p>
              <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
                UNIVERSITAS aún no ha cargado un modelo para este recaudo en Documentos de Ejemplo.
              </p>
            </div>
          ) : null}

          {mode === "pdf" && pdfUrl ? (
            <iframe
              title={`Vista previa: ${title}`}
              src={pdfUrl}
              className="h-full min-h-[360px] w-full border-0 bg-card md:min-h-[480px]"
            />
          ) : null}

          {mode === "image" && imageUrl ? (
            <div className="flex h-full min-h-[360px] items-center justify-center overflow-auto p-4 md:min-h-[480px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={title}
                className="mx-auto max-h-[480px] max-w-full rounded-md border border-border object-contain"
              />
            </div>
          ) : null}

          <div
            ref={containerRef}
            className={
              mode === "docx"
                ? "h-full min-h-[360px] w-full overflow-auto md:min-h-[480px] [&_.docx-wrapper]:bg-muted/40 [&_.docx-wrapper]:p-4 [&_section.docx]:mx-auto [&_section.docx]:mb-4 [&_section.docx]:bg-card [&_section.docx]:shadow-md"
                : "hidden"
            }
          />

          {mode === "unsupported" && previewSrc && !showLoading && !renderError ? (
            <div className="flex h-full min-h-[360px] flex-col items-center justify-center gap-3 px-6 text-center md:min-h-[480px]">
              <FileText className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm font-semibold text-color-titulos">
                Vista previa no disponible para este formato
              </p>
              <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
                Puede abrir o descargar el archivo en una nueva pestaña.
              </p>
            </div>
          ) : null}
        </div>

        <DialogFooter className="shrink-0 gap-2 border-t border-border px-5 py-3 sm:justify-end">
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Cerrar
          </Button>
          {previewSrc ? (
            <Button type="button" asChild className="bg-navy text-white hover:bg-navy-hover">
              <a href={previewSrc} target="_blank" rel="noopener noreferrer">
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

"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ManualPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  urlArchivo: string | null;
  tituloManual: string | null;
  isLoading: boolean;
}

const DOCX_WRAPPER_SELECTOR = ".docx-preview-wrapper-wrapper";
const DOCX_FIT_PADDING = 32;

// Escala el documento (p. ej. páginas horizontales) para que quepa en el ancho del modal.
function fitDocxToWidth(container: HTMLElement) {
  const wrapper = container.querySelector<HTMLElement>(DOCX_WRAPPER_SELECTOR);
  if (!wrapper) return;
  wrapper.style.removeProperty("zoom");
  const sections = Array.from(wrapper.querySelectorAll<HTMLElement>(":scope > section"));
  const widest = Math.max(0, ...sections.map((s) => s.offsetWidth));
  const available = container.clientWidth - DOCX_FIT_PADDING * 2;
  if (widest > 0 && available > 0 && widest > available) {
    wrapper.style.setProperty("zoom", String(available / widest));
  }
}

function looksLikePdf(url: string, contentType?: string | null) {
  if (contentType?.includes("pdf")) return true;
  const clean = url.split("?")[0]?.toLowerCase() ?? "";
  return clean.endsWith(".pdf");
}

export function ManualPreviewDialog({
  open,
  onOpenChange,
  urlArchivo,
  tituloManual,
  isLoading,
}: ManualPreviewDialogProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const blobUrlRef = useRef<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<"idle" | "pdf" | "docx">("idle");

  const revokeBlobUrl = () => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  };

  useEffect(() => {
    if (!open || !urlArchivo) return;

    let cancelled = false;

    const renderDocument = async () => {
      setIsRendering(true);
      setRenderError(null);
      setPdfUrl(null);
      setMode("idle");
      revokeBlobUrl();

      try {
        const response = await fetch(urlArchivo);
        if (!response.ok) {
          throw new Error("No se pudo descargar el archivo para previsualizar");
        }

        const contentType = response.headers.get("content-type");
        const blob = await response.blob();

        if (cancelled) return;

        // PDF: blob URL en iframe (evita X-Frame-Options de Cloudinary con URL remota).
        if (looksLikePdf(urlArchivo, contentType ?? blob.type)) {
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

        // Esperar a que el Dialog monte el contenedor DOCX.
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

        if (!cancelled && containerRef.current) {
          fitDocxToWidth(containerRef.current);
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error ? error.message : "Error al renderizar el documento";
          setRenderError(message);
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
  }, [open, urlArchivo]);

  useEffect(() => {
    const container = containerRef.current;
    if (mode !== "docx" || !container) return;
    const observer = new ResizeObserver(() => fitDocxToWidth(container));
    observer.observe(container);
    return () => observer.disconnect();
  }, [mode]);

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      setIsRendering(false);
      setRenderError(null);
      setPdfUrl(null);
      setMode("idle");
      revokeBlobUrl();
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    }
    onOpenChange(value);
  };

  const showLoading = isLoading || isRendering;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="flex h-[90vh] w-[95vw] max-w-[95vw] flex-col gap-0 p-0 sm:max-w-[70vw]"
        showCloseButton={true}
      >
        <DialogHeader className="shrink-0 border-b px-6 py-4">
          <DialogTitle className="text-lg font-semibold">
            {tituloManual ?? "Pre-visualización del documento"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Vista previa del documento
          </DialogDescription>
        </DialogHeader>

        <div className="relative flex min-h-0 flex-1 overflow-hidden bg-gray-100">
          {showLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="size-10 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {isLoading ? "Obteniendo documento..." : "Renderizando documento..."}
                </p>
              </div>
            </div>
          )}

          {renderError && (
            <div className="flex h-full w-full items-center justify-center p-6">
              <p className="text-sm text-destructive">{renderError}</p>
            </div>
          )}

          {mode === "pdf" && pdfUrl ? (
            <iframe
              title={tituloManual ?? "Vista previa PDF"}
              src={pdfUrl}
              className="h-full w-full flex-1 border-0 bg-white"
            />
          ) : null}

          <div
            ref={containerRef}
            className={
              mode === "docx"
                ? "mx-auto min-h-full w-full overflow-auto [&_.docx-preview-wrapper-wrapper]:bg-gray-100 [&_.docx-preview-wrapper-wrapper]:p-4 [&_.docx-preview-wrapper-wrapper]:[align-items:safe_center] [&_section.docx-preview-wrapper]:mb-4 [&_section.docx-preview-wrapper]:bg-white [&_section.docx-preview-wrapper]:shadow-md"
                : "hidden"
            }
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

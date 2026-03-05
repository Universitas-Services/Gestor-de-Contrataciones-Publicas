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

export function ManualPreviewDialog({
  open,
  onOpenChange,
  urlArchivo,
  tituloManual,
  isLoading,
}: ManualPreviewDialogProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);

  // Renderizar el documento cuando urlArchivo cambia y el dialog está abierto
  useEffect(() => {
    if (!open || !urlArchivo || !containerRef.current) return;

    let cancelled = false;

    const renderDocx = async () => {
      setIsRendering(true);
      setRenderError(null);

      try {
        // Descargar el .docx desde Cloudinary (URL pública)
        const response = await fetch(urlArchivo);
        if (!response.ok) {
          throw new Error("No se pudo descargar el archivo para previsualizar");
        }

        const blob = await response.blob();

        if (cancelled || !containerRef.current) return;

        // Importar docx-preview dinámicamente (solo se carga cuando se necesita)
        const { renderAsync } = await import("docx-preview");

        if (cancelled || !containerRef.current) return;

        // Limpiar contenido previo
        containerRef.current.innerHTML = "";

        // Renderizar el .docx como HTML en el contenedor
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
        }
      } finally {
        if (!cancelled) {
          setIsRendering(false);
        }
      }
    };

    renderDocx();

    return () => {
      cancelled = true;
    };
  }, [open, urlArchivo]);

  // Resetear estado al cerrar
  const handleOpenChange = (value: boolean) => {
    if (!value) {
      setIsRendering(false);
      setRenderError(null);
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
        className="flex h-[90vh] w-[95vw] max-w-[95vw] sm:max-w-[70vw] flex-col gap-0 p-0"
        showCloseButton={true}
      >
        {/* Header */}
        <DialogHeader className="shrink-0 border-b px-6 py-4">
          <DialogTitle className="text-lg font-semibold">
            {tituloManual ?? "Pre-visualización del Manual"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Vista previa del documento
          </DialogDescription>
        </DialogHeader>

        {/* Body: documento renderizado o loading */}
        <div className="relative flex-1 overflow-auto bg-gray-100">
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
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-destructive">{renderError}</p>
            </div>
          )}

          {/* Contenedor donde docx-preview renderiza el HTML */}
          <div
            ref={containerRef}
            className="mx-auto min-h-full [&_.docx-wrapper]:bg-gray-100 [&_.docx-wrapper]:p-4 [&_section.docx]:mx-auto [&_section.docx]:bg-white [&_section.docx]:shadow-md [&_section.docx]:mb-4"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Download, Loader2, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  visualizarDocumentoProveedor,
  descargarDocumentoProveedor,
} from "@/services/proveedores.service";
import { toast } from "sonner";

export interface Documento {
  id: string;
  proveedorId: string;
  tipoDocumento: string;
  urlArchivo: string;
  observaciones?: string;
  fechaCarga: string;
  createdAt: string;
}

interface DocumentoPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documento: Documento | null;
  proveedorId: string;
}

export function DocumentoPreviewDialog({
  open,
  onOpenChange,
  documento,
  proveedorId,
}: DocumentoPreviewDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [urlArchivo, setUrlArchivo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Obtener la URL de previsualización cuando se abre el dialog
  useEffect(() => {
    if (!open || !documento) return;

    let cancelled = false;
    let localUrl: string | null = null;

    const fetchPreview = async () => {
      setIsLoading(true);
      setError(null);
      setUrlArchivo(null);

      try {
        const result = await visualizarDocumentoProveedor(proveedorId, documento.tipoDocumento);
        if (!cancelled) {
          const blob = new Blob([new Uint8Array(result.data)], {
            type: result.contentType || "application/pdf",
          });
          localUrl = URL.createObjectURL(blob);
          setUrlArchivo(localUrl);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : "Error al obtener la previsualización";
          setError(message);
          toast.error(message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchPreview();

    return () => {
      cancelled = true;
      if (localUrl) {
        URL.revokeObjectURL(localUrl);
      }
    };
  }, [open, documento, proveedorId]);

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      setUrlArchivo(null);
      setError(null);
      setIsLoading(false);
    }
    onOpenChange(value);
  };

  const handleDescargar = async () => {
    if (!documento) return;

    setIsDownloading(true);
    try {
      const { data, fileName } = await descargarDocumentoProveedor(
        proveedorId,
        documento.tipoDocumento
      );

      // Crear Blob a partir del Uint8Array recibido del servidor
      const blob = new Blob([new Uint8Array(data)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      // Disparar la descarga programáticamente
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      // Limpiar
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Documento descargado exitosamente");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al descargar el documento";
      toast.error(message);
    } finally {
      setIsDownloading(false);
    }
  };

  const titulo = documento?.tipoDocumento.replace(/_/g, " ") ?? "Documento";
  const showLoading = isLoading;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex h-[90vh] w-[95vw] max-w-[95vw] sm:max-w-[75vw] flex-col gap-0 p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="shrink-0 flex-row items-center justify-between border-b px-6 py-4 space-y-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-navy/10 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-navy" />
            </div>
            <div className="flex flex-col gap-0.5">
              <DialogTitle className="text-base font-semibold text-navy capitalize leading-tight">
                {titulo.toLowerCase()}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground m-0 leading-tight">
                Vista previa del documento del proveedor
              </DialogDescription>
            </div>
          </div>

          <Button
            onClick={handleDescargar}
            disabled={isLoading || isDownloading}
            size="sm"
            className="bg-navy hover:bg-navy-hover text-white gap-2 shrink-0"
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">
              {isDownloading ? "Descargando..." : "Descargar"}
            </span>
          </Button>
        </DialogHeader>

        {/* Body */}
        <div className="relative flex-1 overflow-hidden bg-gray-100">
          {/* Spinner de carga */}
          {showLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="size-10 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Obteniendo documento...</p>
              </div>
            </div>
          )}

          {/* Mensaje de error */}
          {error && !showLoading && (
            <div className="flex h-full items-center justify-center p-6 text-center">
              <p className="text-sm font-medium text-destructive bg-destructive/10 px-6 py-3 rounded-lg">
                {error}
              </p>
            </div>
          )}

          {/* iframe con la URL de previsualización */}
          {urlArchivo && !error && (
            <iframe
              key={urlArchivo}
              src={urlArchivo}
              className="w-full h-full border-none"
              title={`Vista previa - ${titulo}`}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

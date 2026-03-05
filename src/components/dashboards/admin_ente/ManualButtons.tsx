"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Eye, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { previewManual, descargarManual } from "@/services/manualService";
import { ManualPreviewDialog } from "@/components/dashboards/admin_ente/ManualPreviewDialog";

export function ManualButtons() {
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [urlArchivo, setUrlArchivo] = useState<string | null>(null);
  const [tituloManual, setTituloManual] = useState<string | null>(null);

  const handlePreview = async () => {
    setIsPreviewing(true);
    setIsPreviewOpen(true);
    try {
      const result = await previewManual();
      setUrlArchivo(result.urlArchivo);
      setTituloManual(result.tituloManual);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al obtener la previsualización";
      toast.error(message);
      setIsPreviewOpen(false);
    } finally {
      setIsPreviewing(false);
    }
  };

  const handlePreviewClose = (open: boolean) => {
    setIsPreviewOpen(open);
    if (!open) {
      // Limpiar estado al cerrar
      setUrlArchivo(null);
      setTituloManual(null);
    }
  };

  const handleDescargar = async () => {
    setIsDownloading(true);
    try {
      const { data, fileName } = await descargarManual();

      // Crear Blob a partir del Uint8Array recibido del servidor
      const blob = new Blob([new Uint8Array(data)], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      // Disparar la descarga programáticamente
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      // Limpiar
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Manual descargado exitosamente");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error al descargar el manual";
      toast.error(message);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          onClick={handlePreview}
          disabled={isPreviewing}
          size="sm"
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {isPreviewing ? <Loader2 className="animate-spin" /> : <Eye />}
          {isPreviewing ? "Cargando..." : "Pre-visualización del Manual"}
        </Button>

        <Button
          onClick={handleDescargar}
          disabled={isDownloading}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isDownloading ? <Loader2 className="animate-spin" /> : <Download />}
          {isDownloading ? "Descargando..." : "Descargar Manual"}
        </Button>
      </div>

      <ManualPreviewDialog
        open={isPreviewOpen}
        onOpenChange={handlePreviewClose}
        urlArchivo={urlArchivo}
        tituloManual={tituloManual}
        isLoading={isPreviewing}
      />
    </>
  );
}

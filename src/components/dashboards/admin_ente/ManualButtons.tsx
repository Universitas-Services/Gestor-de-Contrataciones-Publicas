"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Eye, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { previewManual, descargarManual } from "@/services/manualService";
import { ManualPreviewDialog } from "@/components/dashboards/admin_ente/ManualPreviewDialog";

interface ManualButtonsProps {
  orientation?: "horizontal" | "vertical";
}

export function ManualButtons({ orientation = "horizontal" }: ManualButtonsProps) {
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

  const isVertical = orientation === "vertical";

  return (
    <>
      <div className={`flex ${isVertical ? "flex-col items-center gap-3" : "items-center gap-2"}`}>
        <Button
          onClick={handlePreview}
          disabled={isPreviewing || isDownloading}
          size={isVertical ? "default" : "sm"}
          className={`${isVertical ? "w-52" : "px-4"} gap-2 bg-[#1B456F] font-semibold text-white hover:bg-[#123050]`}
        >
          {isPreviewing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
          {isVertical ? "Previsualizar manual" : "Ver manual"}
        </Button>

        <Button
          onClick={handleDescargar}
          disabled={isDownloading || isPreviewing}
          size={isVertical ? "default" : "sm"}
          variant={isVertical ? "outline" : "default"}
          className={`${isVertical ? "w-52 border-2 border-[#1B456F] text-[#1B456F] bg-white hover:bg-[#1B456F] hover:text-white" : "bg-[#1B456F] text-white hover:bg-[#123050] px-4"} gap-2 font-semibold`}
        >
          {isDownloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {isVertical ? "Descargar manual" : "Descargar"}
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

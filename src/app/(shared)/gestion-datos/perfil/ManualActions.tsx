"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { previewManual, descargarManual } from "@/services/manualService";
import { ManualPreviewDialog } from "@/components/dashboards/admin_ente/ManualPreviewDialog";

export function ManualActions() {
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
    } catch (error: any) {
      const message =
        error instanceof Error ? error.message : "Error al obtener la previsualización";
      toast.error(message, { id: "preview-manual" });
      setIsPreviewOpen(false);
    } finally {
      setIsPreviewing(false);
    }
  };

  const handlePreviewClose = (open: boolean) => {
    setIsPreviewOpen(open);
    if (!open) {
      setUrlArchivo(null);
      setTituloManual(null);
    }
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      toast.loading("Descargando el manual del ente...", { id: "download-manual" });

      const { data, fileName } = await descargarManual();

      // Convertir el Uint8Array proveniente de la Server Action a Blob
      const blob = new Blob([data.buffer as ArrayBuffer], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // Docx MimeType
      });

      // Crear URL Temporal interactable en navegador
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || "Manual_del_Ente.docx";
      document.body.appendChild(link);
      link.click();

      // Limpieza Memory Leak
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Manual descargado correctamente", { id: "download-manual" });
    } catch (error: any) {
      toast.error(error.message || "Error al descargar el documento", { id: "download-manual" });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <div className="mt-8 flex flex-col gap-3 self-center pl-8">
        <Button
          onClick={handlePreview}
          disabled={isPreviewing || isDownloading}
          className="w-64 gap-3 bg-[#1B456F] font-semibold hover:bg-[#123050]"
        >
          {isPreviewing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
          {isPreviewing ? "Cargando..." : "Previsualizar manual"}
        </Button>
        <Button
          onClick={handleDownload}
          disabled={isDownloading || isPreviewing}
          variant="outline"
          className="w-64 gap-3 border-[#1B456F] font-semibold text-[#1B456F] hover:bg-[#1B456F] hover:text-white"
        >
          {isDownloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {isDownloading ? "Descargando..." : "Descargar manual"}
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

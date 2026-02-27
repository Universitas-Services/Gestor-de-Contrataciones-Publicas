"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FileText, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generarManual, descargarManual } from "@/services/manualService";

export function ManualButtons() {
  const [manualId, setManualId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleGenerar = async () => {
    setIsGenerating(true);
    try {
      const result = await generarManual();
      setManualId(result.id);
      toast.success("Manual generado exitosamente");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error al generar el manual";
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDescargar = async () => {
    if (!manualId) return;

    setIsDownloading(true);
    try {
      const { data, fileName } = await descargarManual(manualId);

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
    <div className="flex items-center gap-2">
      <Button
        onClick={handleGenerar}
        disabled={isGenerating}
        size="sm"
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        {isGenerating ? <Loader2 className="animate-spin" /> : <FileText />}
        {isGenerating ? "Generando..." : "Generar Manual"}
      </Button>

      <Button
        onClick={handleDescargar}
        disabled={!manualId || isDownloading}
        size="sm"
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        {isDownloading ? <Loader2 className="animate-spin" /> : <Download />}
        {isDownloading ? "Descargando..." : "Descargar Manual"}
      </Button>
    </div>
  );
}

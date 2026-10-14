"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FaRegClipboard } from "react-icons/fa";
import { IoDownloadOutline, IoEyeOutline } from "react-icons/io5";

import { ManualPreviewDialog } from "@/components/dashboards/admin_ente/ManualPreviewDialog";
import type { EspecificacionesTecnicasStoredMeta } from "@/lib/constants/especificacionesTecnicas";
import { especificacionesTecnicasFromApi } from "@/lib/utils/fase1MicromodulosMapper";
import { obtenerEspecificacionesTecnicas } from "@/services/fase1MicromodulosService";
import { Card, CardContent } from "@/components/ui/card";
import type { MicromoduleStatus } from "./types/fase1Inicial.types";

export interface EspecificacionesTecnicasDocumentoCardProps {
  expedienteId: string;
  micromoduleStatus: MicromoduleStatus;
}

const ACTION_ICON_CLASS =
  "flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-navy disabled:cursor-not-allowed disabled:opacity-30";

export function EspecificacionesTecnicasDocumentoCard({
  expedienteId,
  micromoduleStatus,
}: EspecificacionesTecnicasDocumentoCardProps) {
  const [meta, setMeta] = useState<EspecificacionesTecnicasStoredMeta | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void obtenerEspecificacionesTecnicas(expedienteId)
      .then((response) => {
        if (cancelled) return;
        setMeta(especificacionesTecnicasFromApi(response));
      })
      .catch(() => {
        if (!cancelled) setMeta(null);
      });

    return () => {
      cancelled = true;
    };
  }, [expedienteId, micromoduleStatus]);

  const hasFile = Boolean(meta?.url);
  const fileLabel = hasFile ? (meta?.fileName ?? "Archivo cargado") : "Sin archivo cargado";

  const handlePreview = () => {
    if (!meta?.url) {
      toast.info("La previsualización no está disponible para este archivo.");
      return;
    }
    setIsPreviewing(true);
    setPreviewUrl(meta.url);
    setPreviewOpen(true);
    setIsPreviewing(false);
  };

  const handleDownload = async () => {
    if (!meta?.url) {
      toast.info("La descarga no está disponible para este archivo.");
      return;
    }

    setIsDownloading(true);
    try {
      const response = await fetch(meta.url);
      if (!response.ok) {
        throw new Error("No se pudo descargar el archivo.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = meta.fileName || "especificaciones-tecnicas.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Documento descargado exitosamente");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al descargar documento");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <Card className="w-full gap-0 border border-border py-0 shadow-sm">
        <CardContent className="w-full px-6 py-4">
          <div className="flex w-full items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <div className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-xl bg-muted">
                <FaRegClipboard className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-bold leading-tight text-color-titulos">
                  Especificaciones Técnicas
                </p>
                <p className="truncate text-[10px] italic text-muted-foreground">{fileLabel}</p>
              </div>
            </div>

            <div className="flex w-[72px] flex-shrink-0 items-center justify-end gap-3">
              <button
                type="button"
                className={ACTION_ICON_CLASS}
                disabled={!hasFile || isPreviewing}
                onClick={handlePreview}
                title="Previsualizar documento"
                aria-label="Previsualizar Especificaciones Técnicas"
              >
                <IoEyeOutline className="h-[26px] w-[26px]" />
              </button>
              <button
                type="button"
                className={ACTION_ICON_CLASS}
                disabled={!hasFile || isDownloading}
                onClick={() => void handleDownload()}
                title="Descargar documento"
                aria-label="Descargar Especificaciones Técnicas"
              >
                <IoDownloadOutline className="h-[26px] w-[26px]" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ManualPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        urlArchivo={previewUrl}
        tituloManual="Especificaciones Técnicas"
        isLoading={isPreviewing}
      />
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FaRegClipboard } from "react-icons/fa";
import { IoDownloadOutline, IoEyeOutline } from "react-icons/io5";

import {
  getEspecificacionesTecnicasStorageKey,
  type EspecificacionesTecnicasStoredMeta,
} from "@/lib/constants/especificacionesTecnicas";
import { Card, CardContent } from "@/components/ui/card";
import type { MicromoduleStatus } from "./types/fase1Inicial.types";

export interface EspecificacionesTecnicasDocumentoCardProps {
  expedienteId: string;
  micromoduleStatus: MicromoduleStatus;
}

const ACTION_ICON_CLASS =
  "flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-navy disabled:cursor-not-allowed disabled:opacity-30";

function loadStoredMeta(expedienteId: string): EspecificacionesTecnicasStoredMeta | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(getEspecificacionesTecnicasStorageKey(expedienteId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as EspecificacionesTecnicasStoredMeta;
    if (!parsed?.fileName) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function EspecificacionesTecnicasDocumentoCard({
  expedienteId,
  micromoduleStatus,
}: EspecificacionesTecnicasDocumentoCardProps) {
  const [meta, setMeta] = useState<EspecificacionesTecnicasStoredMeta | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      setMeta(loadStoredMeta(expedienteId));
    });
  }, [expedienteId, micromoduleStatus]);

  const hasFile = Boolean(meta) && micromoduleStatus === "completed";

  const handlePreview = () => {
    toast.info("La previsualización estará disponible cuando se conecte el backend.");
  };

  const handleDownload = () => {
    toast.info("La descarga estará disponible cuando se conecte el backend.");
  };

  return (
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
              <p className="truncate text-[10px] italic text-muted-foreground">
                {hasFile ? (meta?.fileName ?? "Archivo cargado") : "Sin archivo cargado"}
              </p>
            </div>
          </div>

          <div className="flex w-[72px] flex-shrink-0 items-center justify-end gap-3">
            <button
              type="button"
              className={ACTION_ICON_CLASS}
              disabled={!hasFile}
              onClick={handlePreview}
              title="Previsualizar documento"
              aria-label="Previsualizar Especificaciones Técnicas"
            >
              <IoEyeOutline className="h-[26px] w-[26px]" />
            </button>
            <button
              type="button"
              className={ACTION_ICON_CLASS}
              disabled={!hasFile}
              onClick={handleDownload}
              title="Descargar documento"
              aria-label="Descargar Especificaciones Técnicas"
            >
              <IoDownloadOutline className="h-[26px] w-[26px]" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { BsArrowClockwise } from "react-icons/bs";
import { FaRegClipboard } from "react-icons/fa";
import {
  IoDocumentTextOutline,
  IoDownloadOutline,
  IoEyeOutline,
  IoNewspaperOutline,
  IoReceiptOutline,
} from "react-icons/io5";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FASE1_INICIAL_DOCUMENTOS } from "./constants/fase1Inicial.constants";
import type {
  DocumentoMaestroId,
  DocumentoMaestroStatus,
  Fase1InicialState,
} from "./types/fase1Inicial.types";
import { getDocumentUnlockTooltip } from "./utils/fase1UnlockLogic";

export interface DocumentosProcedimientoPanelProps {
  documents: Fase1InicialState["documents"];
  micromodules: Fase1InicialState["micromodules"];
  readOnly?: boolean;
  onGenerate: (id: DocumentoMaestroId) => void;
  onRegenerate: (id: DocumentoMaestroId) => void;
  getUnlockTooltip?: (id: DocumentoMaestroId) => string | null;
}

const DOC_ICON: Record<DocumentoMaestroId, "clipboard" | "receipt"> = {
  "actividades-previas": "receipt",
  pliego: "clipboard",
  "acta-inicio": "receipt",
  llamado: "receipt",
};

const ACTION_ICON_CLASS =
  "flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-navy disabled:cursor-not-allowed disabled:opacity-30";

function getStatusLabel(status: DocumentoMaestroStatus) {
  if (status === "generated") return "Datos completos";
  if (status === "ready") return "Listo para generar";
  return "Faltan datos";
}

export function DocumentosProcedimientoPanel({
  documents,
  micromodules,
  readOnly = false,
  onGenerate,
  onRegenerate,
  getUnlockTooltip,
}: DocumentosProcedimientoPanelProps) {
  const [processing, setProcessing] = useState<Partial<Record<DocumentoMaestroId, boolean>>>({});

  const handleGenerate = async (id: DocumentoMaestroId) => {
    if (readOnly) return;
    setProcessing((prev) => ({ ...prev, [id]: true }));
    try {
      onGenerate(id);
      toast.success("Documento generado exitosamente");
    } finally {
      setProcessing((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleRegenerate = async (id: DocumentoMaestroId) => {
    if (readOnly) return;
    setProcessing((prev) => ({ ...prev, [id]: true }));
    try {
      onRegenerate(id);
      toast.success("Documento regenerado exitosamente");
    } finally {
      setProcessing((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handlePreview = () => {
    toast.info("La previsualización estará disponible cuando se conecte el backend.");
  };

  const handleDownload = () => {
    toast.info("La descarga estará disponible cuando se conecte el backend.");
  };

  return (
    <Card className="flex flex-col border border-border pt-6 shadow-sm">
      <CardHeader className="px-6 pb-6 pt-0">
        <div className="flex items-center gap-4">
          <IoDocumentTextOutline className="h-6 w-6 text-color-titulos" />
          <CardTitle className="text-[17px] font-bold text-color-titulos">
            Documentos del procedimiento
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col px-6 pb-6">
        <div className="mt-2 space-y-8">
          {FASE1_INICIAL_DOCUMENTOS.map((doc) => {
            const status = documents[doc.id];
            const isGenerated = status === "generated";
            const isReady = status === "ready";
            const isProcessing = processing[doc.id];
            const icon = DOC_ICON[doc.id];
            const unlockTooltip =
              getUnlockTooltip?.(doc.id) ??
              getDocumentUnlockTooltip(doc.id, documents, micromodules);

            return (
              <div key={doc.id} className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-xl bg-muted">
                    {icon === "clipboard" ? (
                      <FaRegClipboard className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <IoReceiptOutline className="h-[22px] w-[22px] text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-bold leading-tight text-color-titulos">
                      {doc.label}
                    </p>
                    <p className="text-[10px] italic text-muted-foreground">
                      {getStatusLabel(status)}
                    </p>
                  </div>
                </div>

                <div className="flex w-[104px] flex-shrink-0 items-center justify-end gap-3">
                  {isProcessing ? (
                    <div className="flex h-[26px] w-[26px] items-center justify-center">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-navy border-t-transparent" />
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        className={ACTION_ICON_CLASS}
                        disabled={!isGenerated}
                        onClick={handlePreview}
                        title="Previsualizar documento"
                        aria-label={`Previsualizar ${doc.label}`}
                      >
                        <IoEyeOutline className="h-[26px] w-[26px]" />
                      </button>
                      <button
                        type="button"
                        className={ACTION_ICON_CLASS}
                        disabled={!isGenerated}
                        onClick={handleDownload}
                        title="Descargar documento"
                        aria-label={`Descargar ${doc.label}`}
                      >
                        <IoDownloadOutline className="h-[26px] w-[26px]" />
                      </button>
                      {isGenerated ? (
                        <button
                          type="button"
                          className={ACTION_ICON_CLASS}
                          disabled={readOnly}
                          onClick={() => handleRegenerate(doc.id)}
                          title="Regenerar documento"
                          aria-label={`Regenerar ${doc.label}`}
                        >
                          <BsArrowClockwise className="h-5 w-5" />
                        </button>
                      ) : (
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-flex">
                                <button
                                  type="button"
                                  className={ACTION_ICON_CLASS}
                                  disabled={!isReady || readOnly}
                                  onClick={() => handleGenerate(doc.id)}
                                  title="Generar documento"
                                  aria-label={`Generar ${doc.label}`}
                                >
                                  <IoNewspaperOutline className="h-6 w-6" />
                                </button>
                              </span>
                            </TooltipTrigger>
                            {!isReady && unlockTooltip ? (
                              <TooltipContent
                                side="top"
                                className="max-w-[240px] text-center text-xs"
                              >
                                {unlockTooltip}
                              </TooltipContent>
                            ) : null}
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

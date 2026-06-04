"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { LuPencil } from "react-icons/lu";
import { BsEye, BsArrowClockwise } from "react-icons/bs";
import { IoDownloadOutline, IoDocumentTextOutline, IoFolderOpenOutline } from "react-icons/io5";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ManualPreviewDialog } from "@/components/dashboards/admin_ente/ManualPreviewDialog";
import { listarEvaluacionesFase3 } from "@/services/oferenteService";
import { obtenerAdjudicacion, obtenerContratoFormalizado } from "@/services/expedienteService";
import {
  obtenerStatusDocumentos,
  previewDocumento,
  descargarDocumento,
  regenerarDocumento,
  type DocumentoStatus,
} from "@/services/generadorDocumentosService";
import { FASE4_DOC_TYPES, FASE4_TIPO_TO_ENDPOINT } from "@/lib/constants/fase4Documentos";
import {
  parseEvaluacionesResponse,
  mapToParticipanteEvaluacion,
  sortByPrelacion,
  getOferenteAdjudicado,
  formatMoneyBs,
  type ParticipanteEvaluacion,
} from "@/lib/utils/evaluacionesFase3Utils";
import { NotificacionOferentesTable } from "./NotificacionOferentesTable";
import { ActaAdjudicacionSheet } from "./ActaAdjudicacionSheet";

function formatDocFecha(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("es-VE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function getDocSubtitulo(doc: DocumentoStatus): string {
  if (!doc.generado) return "Pendiente de generación";
  if (doc.estaDesactualizado) return "Desactualizado — requiere regeneración";
  const fecha = doc.documento?.fechaGeneracion;
  return fecha ? `Generado el ${formatDocFecha(fecha)}` : "Documento generado";
}

function getDocLabel(doc: DocumentoStatus): string {
  if (doc.tipo === "ACTA_ADJUDICACION") return "Acta de adjudicación";
  if (doc.tipo === "CONTRATO") return "Contrato formalizado";
  return doc.label;
}

interface Fase4PanelProps {
  expedienteId: string;
  readOnly?: boolean;
  montoEstimadoBs?: string | number | null;
}

interface DatosAdjudicadoCardProps {
  adjudicado: ParticipanteEvaluacion | null;
  montoFallback?: string | number | null;
}

function DatosAdjudicadoCard({ adjudicado, montoFallback }: DatosAdjudicadoCardProps) {
  const monto =
    adjudicado?.montoOfertaBs != null
      ? formatMoneyBs(adjudicado.montoOfertaBs)
      : formatMoneyBs(montoFallback);

  return (
    <Card className="border border-border shadow-sm flex flex-col h-full">
      <CardHeader className="pb-3 pt-4 px-6 border-b border-border bg-muted m-0">
        <div className="flex items-center gap-3">
          <IoDocumentTextOutline className="w-[22px] h-[22px] text-color-titulos flex-shrink-0" />
          <CardTitle className="text-[17px] font-bold text-color-titulos leading-tight">
            Datos del oferente adjudicado
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-6 py-5 flex-1 flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-[11px] text-muted-foreground font-inter italic mb-1">
              Empresa Adjudicada
            </p>
            <p className="text-sm font-semibold text-color-titulos font-inter">
              {adjudicado?.nombreEmpresa ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-inter italic mb-1">RIF</p>
            <p className="text-sm font-semibold text-color-titulos font-mono">
              {adjudicado?.rif ?? "—"}
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-muted px-5 py-4 mt-auto">
          <p className="text-[11px] text-muted-foreground font-inter italic mb-1">
            Monto de contratación
          </p>
          <p className="text-xl font-bold text-color-titulos font-inter tabular-nums">
            Bs. {monto}
          </p>
        </div>

        {!adjudicado && (
          <p className="text-xs text-muted-foreground italic">
            No se ha registrado un oferente con primera opción de prelación.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

interface DocumentosProcesoCardProps {
  documentos: DocumentoStatus[];
  readOnly?: boolean;
  procesandoDoc: Record<string, boolean>;
  isDownloading: Record<string, boolean>;
  onPreview: (doc: DocumentoStatus) => void;
  onDownload: (doc: DocumentoStatus) => void;
  onRegenerar: (doc: DocumentoStatus) => void;
}

function DocumentosProcesoCard({
  documentos,
  readOnly,
  procesandoDoc,
  isDownloading,
  onPreview,
  onDownload,
  onRegenerar,
}: DocumentosProcesoCardProps) {
  return (
    <Card className="border border-border shadow-sm flex flex-col">
      <CardHeader className="pb-3 pt-4 px-6 border-b border-border bg-muted m-0">
        <div className="flex items-center gap-3">
          <IoFolderOpenOutline className="w-[22px] h-[22px] text-color-titulos flex-shrink-0" />
          <CardTitle className="text-[17px] font-bold text-color-titulos leading-tight">
            Documentos del proceso
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-6 py-4 space-y-3">
        {documentos.length === 0 ? (
          <p className="text-xs text-muted-foreground italic py-2">Cargando documentos...</p>
        ) : (
          documentos.map((doc) => {
            const desactualizado = doc.generado && doc.estaDesactualizado;
            const procesando = procesandoDoc[doc.tipo];
            const descargando = isDownloading[doc.tipo];

            return (
              <div
                key={doc.tipo}
                className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-4 py-3"
              >
                <div>
                  <p className="text-[13px] font-bold text-color-titulos leading-tight">
                    {getDocLabel(doc)}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 italic">
                    {getDocSubtitulo(doc)}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-navy transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Previsualizar documento"
                    disabled={!doc.generado || procesando}
                    onClick={() => onPreview(doc)}
                  >
                    <BsEye className="w-[20px] h-[20px]" />
                  </button>
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-navy transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Descargar documento"
                    disabled={!doc.generado || descargando || procesando}
                    onClick={() => onDownload(doc)}
                  >
                    {descargando ? (
                      <div className="w-[20px] h-[20px] border-2 border-navy border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <IoDownloadOutline className="w-[20px] h-[20px]" />
                    )}
                  </button>
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-navy transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    title={
                      desactualizado
                        ? "Regenerar documento"
                        : "Actualizar documento (disponible cuando esté desactualizado)"
                    }
                    disabled={readOnly || !desactualizado || procesando}
                    onClick={() => onRegenerar(doc)}
                  >
                    {procesando ? (
                      <div className="w-[20px] h-[20px] border-2 border-navy border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <BsArrowClockwise className="w-[20px] h-[20px]" />
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

export function Fase4Panel({ expedienteId, readOnly = false, montoEstimadoBs }: Fase4PanelProps) {
  const router = useRouter();
  const [participantes, setParticipantes] = useState<ParticipanteEvaluacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [actaSheetOpen, setActaSheetOpen] = useState(false);
  const [documentos, setDocumentos] = useState<DocumentoStatus[]>([]);
  const [tieneAdjudicacion, setTieneAdjudicacion] = useState(false);
  const [tieneContrato, setTieneContrato] = useState(false);
  const [procesandoDoc, setProcesandoDoc] = useState<Record<string, boolean>>({});
  const [isDownloading, setIsDownloading] = useState<Record<string, boolean>>({});
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewDocOpen, setPreviewDocOpen] = useState(false);
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);
  const [previewDocTitle, setPreviewDocTitle] = useState("");

  const adjudicado = getOferenteAdjudicado(participantes);
  const actaDoc = documentos.find((d) => d.tipo === "ACTA_ADJUDICACION");
  const actaGenerada = actaDoc?.generado === true;
  const contratoDoc = documentos.find((d) => d.tipo === "CONTRATO");
  const contratoGenerado = contratoDoc?.generado === true;

  const loadDocumentos = useCallback(async () => {
    if (!expedienteId) return;
    try {
      const allDocs = await obtenerStatusDocumentos(expedienteId);
      const fase4Docs = allDocs.filter((d) =>
        (FASE4_DOC_TYPES as readonly string[]).includes(d.tipo)
      );
      setDocumentos(fase4Docs);
    } catch {
      // silencioso — la card muestra estado vacío
    }
  }, [expedienteId]);

  const loadAdjudicacionExists = useCallback(async () => {
    if (!expedienteId) return;
    try {
      const data = await obtenerAdjudicacion(expedienteId);
      setTieneAdjudicacion(!!data?.id);
    } catch {
      setTieneAdjudicacion(false);
    }
  }, [expedienteId]);

  const loadContratoExists = useCallback(async () => {
    if (!expedienteId) return;
    try {
      const data = await obtenerContratoFormalizado(expedienteId);
      setTieneContrato(!!data);
    } catch {
      setTieneContrato(false);
    }
  }, [expedienteId]);

  const refreshFase4State = useCallback(() => {
    loadDocumentos();
    loadAdjudicacionExists();
    loadContratoExists();
  }, [loadDocumentos, loadAdjudicacionExists, loadContratoExists]);

  const loadParticipantes = async () => {
    if (!expedienteId) return;
    setLoading(true);
    try {
      const rawResponse = await listarEvaluacionesFase3(expedienteId).catch(() => null);
      const evaluacionesList = parseEvaluacionesResponse(rawResponse);
      const mapped = sortByPrelacion(evaluacionesList.map(mapToParticipanteEvaluacion));
      setParticipantes(mapped);

      if (!rawResponse) {
        toast.error("Error al cargar la lista de oferentes");
      }
    } catch {
      toast.error("Error al cargar datos de la fase 4");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParticipantes();
    refreshFase4State();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expedienteId]);

  const handleCrearContrato = () => {
    router.push(`/elaboracion-expediente/${expedienteId}/contrato`);
  };

  const handlePreviewDocumento = async (doc: DocumentoStatus) => {
    const endpoint = FASE4_TIPO_TO_ENDPOINT[doc.tipo];
    if (!endpoint || !expedienteId) return;

    setIsPreviewing(true);
    setPreviewDocOpen(true);
    try {
      const result = await previewDocumento(endpoint, expedienteId);
      setPreviewDocUrl(result.urlArchivo);
      setPreviewDocTitle(result.tituloDocumento || doc.label);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al obtener la previsualización";
      toast.error(message);
      setPreviewDocOpen(false);
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleDownloadDocumento = async (doc: DocumentoStatus) => {
    const endpoint = FASE4_TIPO_TO_ENDPOINT[doc.tipo];
    if (!endpoint || !expedienteId) return;

    setIsDownloading((prev) => ({ ...prev, [doc.tipo]: true }));
    try {
      const { data, fileName } = await descargarDocumento(endpoint, expedienteId);
      const blob = new Blob([new Uint8Array(data)], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Documento descargado exitosamente");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al descargar documento");
    } finally {
      setIsDownloading((prev) => ({ ...prev, [doc.tipo]: false }));
    }
  };

  const handleRegenerarDocumento = async (doc: DocumentoStatus) => {
    if (readOnly) return;
    if (!doc.documento?.id) return;

    setProcesandoDoc((prev) => ({ ...prev, [doc.tipo]: true }));
    try {
      await regenerarDocumento(doc.documento.id);
      toast.success("Documento regenerado exitosamente");
      await loadDocumentos();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al regenerar documento");
    } finally {
      setProcesandoDoc((prev) => ({ ...prev, [doc.tipo]: false }));
    }
  };

  const actaButtonLabel = actaGenerada
    ? "Editar acta de adjudicación"
    : tieneAdjudicacion
      ? "Editar datos de adjudicación"
      : "Crear acta de adjudicación";

  const contratoButtonLabel = contratoGenerado
    ? "Editar contrato"
    : tieneContrato
      ? "Editar datos del contrato"
      : "Crear contrato";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <DatosAdjudicadoCard adjudicado={adjudicado} montoFallback={montoEstimadoBs} />

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={readOnly}
              onClick={() => setActaSheetOpen(true)}
              className="border-navy text-navy hover:bg-muted font-semibold text-sm gap-2"
            >
              {actaGenerada || tieneAdjudicacion ? (
                <LuPencil className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {actaButtonLabel}
            </Button>
            <Button
              type="button"
              disabled={readOnly}
              onClick={handleCrearContrato}
              className="bg-navy hover:bg-navy-hover text-white font-semibold text-sm gap-2"
            >
              {contratoGenerado || tieneContrato ? (
                <LuPencil className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {contratoButtonLabel}
            </Button>
          </div>

          <DocumentosProcesoCard
            documentos={documentos}
            readOnly={readOnly}
            procesandoDoc={procesandoDoc}
            isDownloading={isDownloading}
            onPreview={handlePreviewDocumento}
            onDownload={handleDownloadDocumento}
            onRegenerar={handleRegenerarDocumento}
          />
        </div>
      </div>

      <NotificacionOferentesTable
        participantes={participantes}
        loading={loading}
        readOnly={readOnly}
      />

      <ActaAdjudicacionSheet
        expedienteId={expedienteId}
        open={actaSheetOpen}
        onOpenChange={setActaSheetOpen}
        readOnly={readOnly}
        onAdjudicacionSaved={refreshFase4State}
        onActaGenerada={refreshFase4State}
      />

      <ManualPreviewDialog
        open={previewDocOpen}
        onOpenChange={setPreviewDocOpen}
        urlArchivo={previewDocUrl}
        tituloManual={previewDocTitle}
        isLoading={isPreviewing}
      />
    </div>
  );
}

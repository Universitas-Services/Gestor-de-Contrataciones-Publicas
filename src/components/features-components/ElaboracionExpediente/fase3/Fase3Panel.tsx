"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BsEye, BsArrowClockwise } from "react-icons/bs";
import { IoDownloadOutline, IoDocumentTextOutline, IoTimeOutline } from "react-icons/io5";
import { IoMdAttach, IoMdPlay, IoMdCheckboxOutline } from "react-icons/io";
import { IoReceiptOutline } from "react-icons/io5";
import { FaRegClipboard } from "react-icons/fa";
import { LuPencil } from "react-icons/lu";
import { ManualPreviewDialog } from "@/components/dashboards/admin_ente/ManualPreviewDialog";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";

import {
  listarEvaluacionesFase3,
  obtenerMetricasEvaluacionFase3,
} from "@/services/oferenteService";
import {
  obtenerStatusDocumentos,
  previewDocumento,
  descargarDocumento,
  previewListaCotejoEvaluacion,
  descargarListaCotejoEvaluacion,
  type DocumentoStatus,
} from "@/services/generadorDocumentosService";
import {
  parseEvaluacionesResponse,
  mapToParticipanteEvaluacion,
  sortByPrelacion,
  type ParticipanteEvaluacion,
} from "@/lib/utils/evaluacionesFase3Utils";
import { EvaluacionBadgeEstado } from "../shared/EvaluacionBadgeEstado";

const ITEMS_PER_PAGE = 4;

// ─── Componente Principal ─────────────────────────────────────────────

interface Fase3PanelProps {
  expedienteId: string;
  readOnly?: boolean;
}

export function Fase3Panel({ expedienteId, readOnly = false }: Fase3PanelProps) {
  const router = useRouter();
  const [participantes, setParticipantes] = useState<ParticipanteEvaluacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({
    ofertasRecibidas: 0,
    evaluadas: 0,
    descalificadas: 0,
    porEvaluar: 0,
  });
  const [informeGenerado, setInformeGenerado] = useState(false);
  const [informeDoc, setInformeDoc] = useState<DocumentoStatus | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [previewDocOpen, setPreviewDocOpen] = useState(false);
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);
  const [previewDocTitle, setPreviewDocTitle] = useState("");

  const loadInformeStatus = async () => {
    if (!expedienteId) return;
    try {
      const allDocs = await obtenerStatusDocumentos(expedienteId);
      const doc = allDocs.find((d) => d.tipo === "INFORME_RECOMENDACION") ?? null;
      setInformeDoc(doc);
      setInformeGenerado(doc?.generado === true);
    } catch {
      // silencioso
    }
  };

  // ── Carga de datos ──
  const loadParticipantes = async () => {
    if (!expedienteId) return;
    setLoading(true);
    try {
      const [rawResponse, statsData] = await Promise.all([
        listarEvaluacionesFase3(expedienteId).catch(() => null),
        obtenerMetricasEvaluacionFase3(expedienteId).catch(() => null),
      ]);

      const evaluacionesList = parseEvaluacionesResponse(rawResponse);
      const mapped = sortByPrelacion(evaluacionesList.map(mapToParticipanteEvaluacion));
      setParticipantes(mapped);

      if (statsData) {
        setStats({
          ofertasRecibidas: statsData.ofertasRecibidas || 0,
          evaluadas: statsData.evaluadas || 0,
          descalificadas: statsData.descalificadas || 0,
          porEvaluar: statsData.porEvaluar || 0,
        });
      }

      if (!rawResponse) {
        toast.error("Error al cargar la lista de evaluaciones");
      }
    } catch (error) {
      toast.error("Error al cargar datos de evaluación");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParticipantes();
    loadInformeStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expedienteId]);

  // ── Paginación ──
  const totalPages = Math.ceil(participantes.length / ITEMS_PER_PAGE);
  const paginatedItems = participantes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // ── Métricas ──
  // Las métricas ahora se cargan desde el backend en el estado `stats`

  // ── Página de números a mostrar en paginación ──
  const pageNumbers = Array.from({ length: Math.min(totalPages, 4) }, (_, i) => i + 1);

  const handlePreviewInforme = async () => {
    if (!expedienteId) return;
    setIsPreviewing(true);
    setPreviewDocOpen(true);
    try {
      const result = await previewDocumento("informe-recomendacion", expedienteId);
      setPreviewDocUrl(result.urlArchivo);
      setPreviewDocTitle(result.tituloDocumento || "Informe de Recomendación");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al obtener la previsualización";
      toast.error(message);
      setPreviewDocOpen(false);
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleDownloadInforme = async () => {
    if (!expedienteId) return;
    setIsDownloading(true);
    try {
      const { data, fileName } = await descargarDocumento("informe-recomendacion", expedienteId);
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
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ── Tabla: Evaluación de ofertas de participantes ── */}
      <Card className="border border-border shadow-sm overflow-hidden flex flex-col p-0 gap-0">
        {/* Header */}
        <CardHeader className="pb-3 pt-4 px-6 border-b border-border bg-slate-50 m-0">
          <div className="flex items-center gap-3">
            <IoMdAttach className="w-[22px] h-[22px] text-color-titulos flex-shrink-0" />
            <div>
              <CardTitle className="text-[17px] font-bold text-color-titulos leading-tight">
                Evaluación de ofertas de participantes
              </CardTitle>
              <p className="text-[11px] text-muted-foreground font-inter mt-0.5 italic">
                Revise y califique las propuestas técnicas y económicas recibidas.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
          <div className="overflow-x-auto w-full">
            <Table className="table-fixed w-full min-w-[700px]">
              <TableHeader>
                <TableRow className="bg-slate-50 border-b border-border">
                  <TableHead className="text-color-titulos font-bold px-4 h-11 text-[11px] text-center w-[25%]">
                    Razón Social
                  </TableHead>
                  <TableHead className="text-color-titulos font-bold px-2 h-11 text-[11px] text-center w-[15%]">
                    RIF
                  </TableHead>
                  <TableHead className="text-color-titulos font-bold px-2 h-11 text-[11px] text-center w-[20%]">
                    Estado Actual
                  </TableHead>
                  <TableHead className="text-color-titulos font-bold px-2 h-11 text-[11px] text-center w-[13%]">
                    Prelación
                  </TableHead>
                  <TableHead className="text-color-titulos font-bold px-2 h-11 text-[11px] text-center w-[13%]">
                    Evaluación
                  </TableHead>
                  <TableHead className="text-color-titulos font-bold px-2 h-11 text-[11px] text-center w-[14%]">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground italic py-12"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-navy border-t-transparent rounded-full animate-spin" />
                        <p>Cargando participantes...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedItems.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground italic py-12"
                    >
                      No hay oferentes registrados para evaluación.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedItems.map((p) => (
                    <TableRow key={p.id} className="border-b border-border hover:bg-slate-50/50">
                      {/* Nombre + Rep Legal */}
                      <TableCell className="px-4 py-3 text-center">
                        <p className="text-[10px] font-semibold text-color-titulos leading-tight">
                          {p.nombreEmpresa}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 italic">
                          {p.representanteLegal}
                        </p>
                      </TableCell>

                      {/* RIF */}
                      <TableCell className="text-[10px] font-semibold text-color-subtitulos font-mono text-center px-2 py-3">
                        {p.rif}
                      </TableCell>

                      {/* Estado actual */}
                      <TableCell className="text-center px-2 py-3">
                        <EvaluacionBadgeEstado calificado={p.oferenteCalificado} />
                      </TableCell>

                      {/* Prelación */}
                      <TableCell className="text-[10px] font-bold text-color-titulos text-center tabular-nums px-2 py-3">
                        {p.prelacion ?? "—"}
                      </TableCell>

                      {/* Evaluación — Iniciar o Editar */}
                      <TableCell className="text-center px-2 py-3">
                        {p.oferenteCalificado === null ? (
                          <button
                            className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-md bg-navy text-white hover:bg-navy-hover transition-colors font-semibold text-[10px] min-w-[75px]"
                            title="Iniciar evaluación"
                            disabled={readOnly}
                            onClick={() =>
                              router.push(
                                `/elaboracion-expediente/${expedienteId}/evaluacion/${p.id}/sobre-1`
                              )
                            }
                          >
                            <IoMdPlay className="w-[12px] h-[12px]" />
                            Iniciar
                          </button>
                        ) : (
                          <button
                            className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-navy transition-colors font-semibold text-[10px] min-w-[75px]"
                            title="Editar evaluación"
                            disabled={readOnly}
                            onClick={() =>
                              router.push(
                                `/elaboracion-expediente/${expedienteId}/evaluacion/${p.id}/sobre-1`
                              )
                            }
                          >
                            <LuPencil className="w-[12px] h-[12px]" />
                            Editar
                          </button>
                        )}
                      </TableCell>

                      {/* Acciones */}
                      <TableCell className="text-center px-2 py-3">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            className={`transition-colors ${p.oferenteCalificado !== null ? "text-slate-500 hover:text-navy" : "text-slate-300 cursor-not-allowed"}`}
                            title="Previsualizar lista de cotejo"
                            disabled={p.oferenteCalificado === null}
                            onClick={async () => {
                              if (p.oferenteCalificado === null) return;
                              setIsPreviewing(true);
                              setPreviewDocOpen(true);
                              try {
                                const result = await previewListaCotejoEvaluacion(p.id);
                                setPreviewDocUrl(result.urlArchivo);
                                setPreviewDocTitle(result.tituloDocumento || "Lista de Cotejo");
                              } catch (error: unknown) {
                                const msg =
                                  error instanceof Error ? error.message : "Error al previsualizar";
                                toast.error(msg);
                                setPreviewDocOpen(false);
                              } finally {
                                setIsPreviewing(false);
                              }
                            }}
                          >
                            <BsEye className="w-[18px] h-[18px]" />
                          </button>
                          <button
                            className={`transition-colors ${p.oferenteCalificado !== null ? "text-slate-500 hover:text-navy" : "text-slate-300 cursor-not-allowed"}`}
                            title="Descargar lista de cotejo"
                            disabled={p.oferenteCalificado === null}
                            onClick={async () => {
                              if (p.oferenteCalificado === null) return;
                              try {
                                const { data, fileName } = await descargarListaCotejoEvaluacion(
                                  p.id
                                );
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
                                toast.success("Lista de cotejo descargada exitosamente");
                              } catch (error) {
                                toast.error(
                                  error instanceof Error ? error.message : "Error al descargar"
                                );
                              }
                            }}
                          >
                            <IoDownloadOutline className="w-[18px] h-[18px]" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* ── Paginación ── */}
          <div className="px-6 py-4 bg-slate-50 border-t border-border mt-auto">
            <Pagination className="justify-end">
              <PaginationContent className="gap-1">
                {/* Anterior */}
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage((p) => p - 1);
                    }}
                    className="h-8 w-8 p-0 border border-border bg-white text-muted-foreground hover:bg-slate-100 rounded-md"
                  >
                    &lt;
                  </PaginationLink>
                </PaginationItem>

                {pageNumbers.map((n) => (
                  <PaginationItem key={n}>
                    <PaginationLink
                      href="#"
                      isActive={n === currentPage}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(n);
                      }}
                      className={
                        n === currentPage
                          ? "h-8 w-8 p-0 bg-navy text-white hover:bg-navy-hover border-transparent rounded-md"
                          : "h-8 w-8 p-0 bg-white border border-border text-muted-foreground hover:bg-slate-100 rounded-md"
                      }
                    >
                      {n}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                {/* Siguiente */}
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) setCurrentPage((p) => p + 1);
                    }}
                    className="h-8 w-8 p-0 border border-border bg-white text-muted-foreground hover:bg-slate-100 rounded-md"
                  >
                    &gt;
                  </PaginationLink>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

      {/* ── Row inferior: Estadísticas + Informe ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ── Card: Estadísticas de evaluación ── */}
        <Card className="border border-border shadow-sm flex flex-col p-0 overflow-hidden">
          <CardHeader className="pb-3 pt-4 px-6 border-b border-border bg-slate-50 m-0">
            <div className="flex items-center gap-3">
              <IoDocumentTextOutline className="w-[22px] h-[22px] text-color-titulos" />
              <CardTitle className="text-[17px] font-bold text-color-titulos leading-tight">
                Estadísticas de evaluación
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex-1 flex flex-col">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-border">
                  <TableHead className="text-center font-bold text-[11px] text-color-titulos h-10">
                    Ofertas recibidas
                  </TableHead>
                  <TableHead className="text-center font-bold text-[11px] text-color-titulos h-10">
                    <span className="inline-flex items-center justify-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
                      Evaluadas
                    </span>
                  </TableHead>
                  <TableHead className="text-center font-bold text-[11px] text-color-titulos h-10">
                    <span className="inline-flex items-center justify-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--danger)]" />
                      Descalificadas
                    </span>
                  </TableHead>
                  <TableHead className="text-center font-bold text-[11px] text-color-titulos h-10">
                    <span className="inline-flex items-center justify-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--pendiente)]" />
                      Por evaluar
                    </span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="hover:bg-transparent">
                  <TableCell className="text-center py-3 text-[15px] font-bold text-color-titulos tabular-nums">
                    {stats.ofertasRecibidas}
                  </TableCell>
                  <TableCell className="text-center py-3 text-[15px] font-bold text-[var(--success-text)] tabular-nums">
                    {stats.evaluadas}
                  </TableCell>
                  <TableCell className="text-center py-3 text-[15px] font-bold text-[var(--danger)] tabular-nums">
                    {stats.descalificadas}
                  </TableCell>
                  <TableCell className="text-center py-3 text-[15px] font-bold text-[var(--pendiente-border)] tabular-nums">
                    {stats.porEvaluar}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* ── Card: Informe de recomendaciones ── */}
        <Card className="border border-border shadow-sm flex flex-col p-0 overflow-hidden">
          <CardHeader className="pb-3 pt-4 px-6 border-b border-border bg-slate-50 m-0">
            <div className="flex items-center gap-3">
              <IoDocumentTextOutline className="w-[22px] h-[22px] text-color-titulos" />
              <CardTitle className="text-[17px] font-bold text-color-titulos leading-tight">
                Informe de recomendaciones
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="px-6 py-[14px] flex-1 flex flex-col justify-between">
            {/* Documento */}
            <div className="flex items-center gap-4">
              {/* Icono documento */}
              <div className="w-[46px] h-[46px] rounded-xl bg-slate-200 flex items-center justify-center flex-shrink-0">
                <FaRegClipboard className="w-[20px] h-[20px] text-slate-600" />
              </div>

              {/* Info + acciones */}
              <div className="flex-1">
                <p className="text-[11px] font-bold text-color-titulos leading-tight">
                  Informe de recomendaciones
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5 italic">
                  Estado: {informeGenerado ? "Generado" : "Pendiente de revisión"}
                </p>
              </div>

              {/* Acciones */}
              <div className="flex flex-col gap-2 flex-shrink-0 items-end min-w-[120px]">
                <button
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-navy text-white hover:bg-navy-hover transition-colors font-semibold text-[11px] w-full"
                  title={informeGenerado ? "Editar informe" : "Iniciar informe"}
                  disabled={readOnly}
                  onClick={() => router.push(`/elaboracion-expediente/${expedienteId}/informe`)}
                >
                  <IoMdPlay className="w-[14px] h-[14px]" />
                  {informeGenerado ? "Editar" : "Iniciar"}
                </button>

                <div className="flex items-center justify-between w-full px-1">
                  <button
                    className={`transition-colors ${informeGenerado ? "text-slate-500 hover:text-navy" : "text-slate-300 cursor-not-allowed"}`}
                    title="Previsualizar informe"
                    disabled={!informeGenerado || isPreviewing}
                    onClick={handlePreviewInforme}
                  >
                    {isPreviewing ? (
                      <div className="w-[18px] h-[18px] border-2 border-navy border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <BsEye className="w-[18px] h-[18px]" />
                    )}
                  </button>
                  <button
                    className={`transition-colors ${informeGenerado ? "text-slate-500 hover:text-navy" : "text-slate-300 cursor-not-allowed"}`}
                    title="Descargar informe"
                    disabled={!informeGenerado || isDownloading}
                    onClick={handleDownloadInforme}
                  >
                    {isDownloading ? (
                      <div className="w-[18px] h-[18px] border-2 border-navy border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <IoDownloadOutline className="w-[18px] h-[18px]" />
                    )}
                  </button>
                  <button
                    className="text-slate-500 hover:text-navy transition-colors"
                    title="Recargar estado"
                    onClick={loadInformeStatus}
                  >
                    <BsArrowClockwise className="w-[18px] h-[18px]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <p className="text-[11px] text-muted-foreground italic mt-[14px] border-t border-border pt-3">
              Documento consolidado basado en las evaluaciones técnicas.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Dialog de Previsualización ── */}
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

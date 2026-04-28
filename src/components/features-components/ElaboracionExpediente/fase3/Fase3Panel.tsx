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

import { listarEvaluacionesFase3 } from "@/services/oferenteService";

// ─── Tipos locales ────────────────────────────────────────────────────

interface ParticipanteEvaluacion {
  id: string;
  ofertaId: string;
  nombreEmpresa: string;
  representanteLegal: string;
  rif: string;
  oferenteCalificado: boolean | null;
  puntuacion: number | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 4;

function BadgeEstado({ calificado }: { calificado: boolean | null }) {
  if (calificado === true) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--evaluado-bg)] text-[var(--success-text)]">
        ● Evaluado
      </span>
    );
  }
  if (calificado === false) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--rechazado-bg)] text-[var(--rechazado)]">
        ● Descalificado
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
      ● Por evaluar
    </span>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────

interface Fase3PanelProps {
  expedienteId: string;
}

export function Fase3Panel({ expedienteId }: Fase3PanelProps) {
  const router = useRouter();
  const [participantes, setParticipantes] = useState<ParticipanteEvaluacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // ── Carga de datos ──
  const loadParticipantes = async () => {
    if (!expedienteId) return;
    setLoading(true);
    try {
      const raw = await listarEvaluacionesFase3(expedienteId);
      const mapped: ParticipanteEvaluacion[] = raw
        .map((item: any) => ({
          id: item.id,
          ofertaId: item.ofertaId,
          nombreEmpresa: item.nombreProveedorEvaluado ?? "—",
          representanteLegal: item.nombreRepLegalEvaluado ?? "—",
          rif: item.rifProveedorEvaluado ?? "—",
          oferenteCalificado: item.oferenteCalificado,
          puntuacion: item.totalEvaluacion,
        }))
        .reverse();
      setParticipantes(mapped);
    } catch (error) {
      toast.error("Error al cargar participantes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParticipantes();
  }, [expedienteId]);

  // ── Paginación ──
  const totalPages = Math.ceil(participantes.length / ITEMS_PER_PAGE);
  const paginatedItems = participantes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // ── Métricas ──
  const totalPropuestas = participantes.length;
  const evaluadas = participantes.filter((p) => p.oferenteCalificado === true).length;
  const descalificadas = participantes.filter((p) => p.oferenteCalificado === false).length;
  const pendientes = participantes.filter((p) => p.oferenteCalificado === null).length;

  // ── Página de números a mostrar en paginación ──
  const pageNumbers = Array.from({ length: Math.min(totalPages, 4) }, (_, i) => i + 1);

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
                    Puntuación
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
                        <BadgeEstado calificado={p.oferenteCalificado} />
                      </TableCell>

                      {/* Puntuación */}
                      <TableCell className="text-[10px] font-bold text-color-titulos text-center tabular-nums px-2 py-3">
                        {p.puntuacion ?? "—"}
                      </TableCell>

                      {/* Evaluación — Iniciar o Editar */}
                      <TableCell className="text-center px-2 py-3">
                        {p.oferenteCalificado === null ? (
                          <button
                            className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-md bg-navy text-white hover:bg-navy-hover transition-colors font-semibold text-[10px] min-w-[75px]"
                            title="Iniciar evaluación"
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
                            className="text-slate-500 hover:text-navy transition-colors"
                            title="Ver detalle"
                            onClick={() =>
                              toast.info(`Vista detallada de "${p.nombreEmpresa}" próximamente.`)
                            }
                          >
                            <BsEye className="w-[18px] h-[18px]" />
                          </button>
                          <button
                            className="text-slate-500 hover:text-navy transition-colors"
                            title="Descargar oferta"
                            onClick={() =>
                              toast.info(`Descarga de oferta de "${p.nombreEmpresa}" próximamente.`)
                            }
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
                    {totalPropuestas}
                  </TableCell>
                  <TableCell className="text-center py-3 text-[15px] font-bold text-[var(--success-text)] tabular-nums">
                    {evaluadas}
                  </TableCell>
                  <TableCell className="text-center py-3 text-[15px] font-bold text-[var(--danger)] tabular-nums">
                    {descalificadas}
                  </TableCell>
                  <TableCell className="text-center py-3 text-[15px] font-bold text-[var(--pendiente-border)] tabular-nums">
                    {pendientes}
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
                  Estado: Pendiente de revisión
                </p>
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  className="text-slate-500 hover:text-navy transition-colors"
                  title="Generar informe"
                  onClick={() => toast.info("Generación de informe próximamente.")}
                >
                  <IoMdPlay className="w-[18px] h-[18px]" />
                </button>
                <button
                  className="text-slate-500 hover:text-navy transition-colors"
                  title="Previsualizar informe"
                  onClick={() => toast.info("Vista previa de informe próximamente.")}
                >
                  <BsEye className="w-[20px] h-[20px]" />
                </button>
                <button
                  className="text-slate-500 hover:text-navy transition-colors"
                  title="Descargar informe"
                  onClick={() => toast.info("Descarga de informe próximamente.")}
                >
                  <IoDownloadOutline className="w-[20px] h-[20px]" />
                </button>
                <button
                  className="text-slate-500 hover:text-navy transition-colors"
                  title="Regenerar informe"
                  onClick={() => toast.info("Regeneración de informe próximamente.")}
                >
                  <BsArrowClockwise className="w-[20px] h-[20px]" />
                </button>
              </div>
            </div>

            {/* Footer */}
            <p className="text-[11px] text-muted-foreground italic mt-[14px] border-t border-border pt-3">
              Documento consolidado basado en las evaluaciones técnicas.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

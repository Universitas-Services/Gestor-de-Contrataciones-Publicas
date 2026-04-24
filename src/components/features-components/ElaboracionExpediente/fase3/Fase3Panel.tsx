"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { BsEye, BsArrowClockwise } from "react-icons/bs";
import { IoDownloadOutline, IoDocumentTextOutline, IoTimeOutline } from "react-icons/io5";
import { IoMdAttach, IoMdPlay, IoMdCheckboxOutline } from "react-icons/io";
import { IoReceiptOutline } from "react-icons/io5";
import { FaRegClipboard } from "react-icons/fa";

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

import { listarOferentes } from "@/services/oferenteService";

// ─── Tipos locales ────────────────────────────────────────────────────

interface ParticipanteEvaluacion {
  id: string;
  nombreEmpresa: string;
  representanteLegal: string;
  rif: string;
  /** "EVALUADO" | "POR_EVALUAR" — placeholder hasta que el backend lo exponga */
  estadoActual: "EVALUADO" | "POR_EVALUAR";
  /** 0-100 — placeholder hasta que el backend lo exponga */
  puntuacion: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 4;

function BadgeEstado({ estado }: { estado: "EVALUADO" | "POR_EVALUAR" }) {
  if (estado === "EVALUADO") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--evaluado-bg)] text-[oklch(0.4_0.12_145)]">
        ● Evaluado
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
  const [participantes, setParticipantes] = useState<ParticipanteEvaluacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // ── Última actualización (simulada) ──
  const [lastUpdated] = useState<Date>(new Date());

  // ── Carga de datos ──
  const loadParticipantes = async () => {
    if (!expedienteId) return;
    setLoading(true);
    try {
      const raw = await listarOferentes(expedienteId);
      const mapped: ParticipanteEvaluacion[] = raw.map((item: any) => ({
        id: item.id,
        nombreEmpresa: item.nombreProveedorOferente ?? "—",
        representanteLegal: item.nombreRepLegalOferente ?? "—",
        rif: item.rifProveedorOferente ?? "—",
        // Estos campos aún no existen en el endpoint; se usan valores placeholder
        estadoActual: (item.estadoEvaluacion as "EVALUADO" | "POR_EVALUAR") ?? "POR_EVALUAR",
        puntuacion: item.puntuacion ?? 0,
      }));
      setParticipantes(mapped);
    } catch (err) {
      console.error("Error al cargar participantes:", err);
      toast.error("No se pudo cargar la lista de participantes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParticipantes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expedienteId]);

  // ── Paginación ──
  const totalPages = Math.max(1, Math.ceil(participantes.length / ITEMS_PER_PAGE));
  const paginatedItems = participantes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // ── Métricas ──
  const totalPropuestas = participantes.length;
  const evaluadas = participantes.filter((p) => p.estadoActual === "EVALUADO").length;
  const pendientes = totalPropuestas - evaluadas;

  // ── Formato de tiempo relativo ──
  function formatRelativeTime(date: Date): string {
    const diffMs = Date.now() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "hace menos de 1 minuto";
    if (diffMin === 1) return "hace 1 minuto";
    return `hace ${diffMin} minutos`;
  }

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

        {/* Tabla */}
        <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-border">
                <TableHead className="text-color-titulos font-bold px-4 h-11 text-[11px] text-center w-[28%]">
                  Nombre del Oferente
                </TableHead>
                <TableHead className="text-color-titulos font-bold px-2 h-11 text-[11px] text-center w-[15%]">
                  Rif
                </TableHead>
                <TableHead className="text-color-titulos font-bold px-2 h-11 text-[11px] text-center w-[17%]">
                  Estado actual
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
                  <TableCell colSpan={6} className="text-center text-muted-foreground italic py-12">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-navy border-t-transparent rounded-full animate-spin" />
                      <p>Cargando participantes...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground italic py-12">
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
                      <BadgeEstado estado={p.estadoActual} />
                    </TableCell>

                    {/* Puntuación */}
                    <TableCell className="text-[10px] font-bold text-color-titulos text-center tabular-nums px-2 py-3">
                      {p.estadoActual === "EVALUADO" ? p.puntuacion : 0}
                    </TableCell>

                    {/* Evaluación — play o check */}
                    <TableCell className="text-center px-2 py-3">
                      {p.estadoActual === "EVALUADO" ? (
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--evaluado-bg)]">
                          <IoMdCheckboxOutline className="w-[18px] h-[18px] text-[oklch(0.45_0.14_145)]" />
                        </div>
                      ) : (
                        <button
                          className="text-slate-500 hover:text-navy transition-colors"
                          title="Iniciar evaluación"
                          onClick={() =>
                            toast.info(`Evaluación de "${p.nombreEmpresa}" próximamente.`)
                          }
                        >
                          <IoMdPlay className="w-[16px] h-[16px]" />
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
        <Card className="border border-border shadow-sm flex flex-col pt-5">
          <CardHeader className="pb-4 pt-0 px-6">
            <div className="flex items-center gap-3">
              <IoDocumentTextOutline className="w-[22px] h-[22px] text-color-titulos" />
              <CardTitle className="text-[17px] font-bold text-color-titulos">
                Estadísticas de evaluación
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="px-6 pb-5 flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              {/* Propuestas Recibidas */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-400 flex-shrink-0" />
                  <span className="text-[11px] text-color-titulos font-medium">
                    Propuestas Recibidas
                  </span>
                </div>
                <span className="text-[13px] font-bold text-color-titulos tabular-nums">
                  {totalPropuestas}
                </span>
              </div>

              {/* Evaluadas */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[oklch(0.7653_0.165_119.86)] flex-shrink-0" />
                  <span className="text-[11px] text-color-titulos font-medium">Evaluadas</span>
                </div>
                <span className="text-[13px] font-bold text-[oklch(0.45_0.14_145)] tabular-nums">
                  {evaluadas}
                </span>
              </div>

              {/* Pendientes */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                  <span className="text-[11px] text-color-titulos font-medium">Pendientes</span>
                </div>
                <span className="text-[13px] font-bold text-amber-600 tabular-nums">
                  {pendientes}
                </span>
              </div>
            </div>

            {/* Footer: última actualización */}
            <div className="flex items-center gap-1.5 mt-5 text-[11px] text-muted-foreground italic">
              <IoTimeOutline className="w-4 h-4 flex-shrink-0" />
              <span>Última actualización: {formatRelativeTime(lastUpdated)}</span>
            </div>
          </CardContent>
        </Card>

        {/* ── Card: Informe de recomendaciones ── */}
        <Card className="border border-border shadow-sm flex flex-col pt-5">
          <CardHeader className="pb-4 pt-0 px-6">
            <div className="flex items-center gap-3">
              <IoDocumentTextOutline className="w-[22px] h-[22px] text-color-titulos" />
              <CardTitle className="text-[17px] font-bold text-color-titulos">
                Informe de recomendaciones
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="px-6 pb-5 flex-1 flex flex-col justify-between">
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
            <p className="text-[11px] text-muted-foreground italic mt-5">
              Documento consolidado basado en las evaluaciones técnicas.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

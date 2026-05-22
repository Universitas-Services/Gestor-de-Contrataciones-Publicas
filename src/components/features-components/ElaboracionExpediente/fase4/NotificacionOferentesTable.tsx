"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { BsEye } from "react-icons/bs";
import { IoDownloadOutline } from "react-icons/io5";
import { IoMdAttach } from "react-icons/io";
import { Loader2 } from "lucide-react";

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

import type { ParticipanteEvaluacion } from "@/lib/utils/evaluacionesFase3Utils";
import { EvaluacionBadgeEstado } from "../shared/EvaluacionBadgeEstado";
import { ManualPreviewDialog } from "@/components/dashboards/admin_ente/ManualPreviewDialog";
import {
  previewNotificacionEvaluacion,
  descargarNotificacionEvaluacion,
} from "@/services/generadorDocumentosService";

const ITEMS_PER_PAGE = 4;

interface NotificacionOferentesTableProps {
  participantes: ParticipanteEvaluacion[];
  loading: boolean;
  readOnly?: boolean;
}

export function NotificacionOferentesTable({
  participantes,
  loading,
  readOnly = false,
}: NotificacionOferentesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [previewing, setPreviewing] = useState<Record<string, boolean>>({});
  const [downloading, setDownloading] = useState<Record<string, boolean>>({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState("");

  const totalPages = Math.max(1, Math.ceil(participantes.length / ITEMS_PER_PAGE));
  const paginatedItems = participantes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const pageNumbers = Array.from({ length: Math.min(totalPages, 4) }, (_, i) => i + 1);

  const handlePreview = async (p: ParticipanteEvaluacion) => {
    setPreviewing((prev) => ({ ...prev, [p.id]: true }));
    setPreviewOpen(true);
    try {
      const result = await previewNotificacionEvaluacion(p.id);
      setPreviewUrl(result.urlArchivo);
      setPreviewTitle(`Notificación — ${p.nombreEmpresa}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al previsualizar la notificación"
      );
      setPreviewOpen(false);
    } finally {
      setPreviewing((prev) => ({ ...prev, [p.id]: false }));
    }
  };

  const handleDownload = async (p: ParticipanteEvaluacion) => {
    setDownloading((prev) => ({ ...prev, [p.id]: true }));
    try {
      const { data, fileName } = await descargarNotificacionEvaluacion(p.id);
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
      toast.success("Notificación descargada exitosamente.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al descargar la notificación");
    } finally {
      setDownloading((prev) => ({ ...prev, [p.id]: false }));
    }
  };

  return (
    <>
      <Card className="border border-border shadow-sm overflow-hidden flex flex-col p-0 gap-0">
        <CardHeader className="pb-3 pt-4 px-6 border-b border-border bg-muted m-0">
          <div className="flex items-center gap-3">
            <IoMdAttach className="w-[22px] h-[22px] text-color-titulos flex-shrink-0" />
            <div>
              <CardTitle className="text-[17px] font-bold text-color-titulos leading-tight">
                Notificación a los oferentes
              </CardTitle>
              <p className="text-[11px] text-muted-foreground font-inter mt-0.5 italic">
                Previsualice y descargue la notificación de cada oferente.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
          <div className="overflow-x-auto w-full">
            <Table className="table-fixed w-full min-w-[600px]">
              <TableHeader>
                <TableRow className="bg-muted border-b border-border">
                  <TableHead className="text-color-titulos font-bold px-4 h-11 text-[11px] text-center w-[30%]">
                    Nombre del Oferente
                  </TableHead>
                  <TableHead className="text-color-titulos font-bold px-2 h-11 text-[11px] text-center w-[15%]">
                    RIF
                  </TableHead>
                  <TableHead className="text-color-titulos font-bold px-2 h-11 text-[11px] text-center w-[20%]">
                    Estado actual
                  </TableHead>
                  <TableHead className="text-color-titulos font-bold px-2 h-11 text-[11px] text-center w-[15%]">
                    Prelación
                  </TableHead>
                  <TableHead className="text-color-titulos font-bold px-2 h-11 text-[11px] text-center w-[20%]">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground italic py-12"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-navy border-t-transparent rounded-full animate-spin" />
                        <p>Cargando oferentes...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedItems.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground italic py-12"
                    >
                      No hay oferentes registrados para notificación.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedItems.map((p) => {
                    const isPreviewing = previewing[p.id];
                    const isDownloading = downloading[p.id];
                    const isBusy = isPreviewing || isDownloading;

                    return (
                      <TableRow key={p.id} className="border-b border-border hover:bg-muted/50">
                        <TableCell className="px-4 py-3 text-center">
                          <p className="text-[10px] font-semibold text-color-titulos leading-tight">
                            {p.nombreEmpresa}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 italic">
                            {p.representanteLegal}
                          </p>
                        </TableCell>

                        <TableCell className="text-[10px] font-semibold text-color-subtitulos font-mono text-center px-2 py-3">
                          {p.rif}
                        </TableCell>

                        <TableCell className="text-center px-2 py-3">
                          <EvaluacionBadgeEstado calificado={p.oferenteCalificado} />
                        </TableCell>

                        <TableCell className="text-[10px] font-bold text-color-titulos text-center tabular-nums px-2 py-3 capitalize">
                          {p.prelacion ?? "—"}
                        </TableCell>

                        <TableCell className="text-center px-2 py-3">
                          <div className="flex items-center justify-center gap-3">
                            {/* Previsualizar */}
                            <button
                              type="button"
                              className="text-muted-foreground hover:text-navy transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              title="Previsualizar notificación"
                              disabled={isBusy || readOnly}
                              onClick={() => handlePreview(p)}
                            >
                              {isPreviewing ? (
                                <Loader2 className="w-[18px] h-[18px] animate-spin" />
                              ) : (
                                <BsEye className="w-[18px] h-[18px]" />
                              )}
                            </button>

                            {/* Descargar */}
                            <button
                              type="button"
                              className="text-muted-foreground hover:text-navy transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              title="Descargar notificación"
                              disabled={isBusy || readOnly}
                              onClick={() => handleDownload(p)}
                            >
                              {isDownloading ? (
                                <Loader2 className="w-[18px] h-[18px] animate-spin" />
                              ) : (
                                <IoDownloadOutline className="w-[18px] h-[18px]" />
                              )}
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <div className="px-6 py-4 bg-muted border-t border-border mt-auto">
            <Pagination className="justify-end">
              <PaginationContent className="gap-1">
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage((prev) => prev - 1);
                    }}
                    className="h-8 w-8 p-0 border border-border bg-card text-muted-foreground hover:bg-muted rounded-md"
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
                          : "h-8 w-8 p-0 bg-card border border-border text-muted-foreground hover:bg-muted rounded-md"
                      }
                    >
                      {n}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
                    }}
                    className="h-8 w-8 p-0 border border-border bg-card text-muted-foreground hover:bg-muted rounded-md"
                  >
                    &gt;
                  </PaginationLink>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

      <ManualPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        urlArchivo={previewUrl}
        tituloManual={previewTitle}
        isLoading={Object.values(previewing).some(Boolean)}
      />
    </>
  );
}

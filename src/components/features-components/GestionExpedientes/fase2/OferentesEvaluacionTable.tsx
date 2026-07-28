"use client";

import { FaBalanceScale, FaRegTrashAlt } from "react-icons/fa";
import { IoCheckboxOutline, IoDownloadOutline, IoEyeOutline } from "react-icons/io5";
import { MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";

import { EvaluacionBadgeEstado } from "@/components/features-components/ElaboracionExpediente/shared/EvaluacionBadgeEstado";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { evaluacionPath } from "@/lib/utils/evaluacionRoutes";
import type { ParticipanteEvaluacion } from "@/lib/utils/evaluacionesFase3Utils";

function formatMonto(monto: number | null): string {
  if (monto === null || Number.isNaN(monto)) return "—";
  return new Intl.NumberFormat("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(monto);
}

interface OferentesEvaluacionTableProps {
  participantes: ParticipanteEvaluacion[];
  loading: boolean;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  basePath: string;
  expedienteId: string;
  readOnly?: boolean;
  onViewOferente: (ofertaId: string) => void;
  onDeleteOferente: (ofertaId: string) => void;
  onPreviewListaCotejo: (evaluacionId: string) => void;
  onDownloadListaCotejo: (evaluacionId: string) => void;
  downloadingId?: string | null;
}

export function OferentesEvaluacionTable({
  participantes,
  loading,
  page,
  pageSize,
  onPageChange,
  basePath,
  expedienteId,
  readOnly = false,
  onViewOferente,
  onDeleteOferente,
  onPreviewListaCotejo,
  onDownloadListaCotejo,
  downloadingId = null,
}: OferentesEvaluacionTableProps) {
  const router = useRouter();
  const totalPages = Math.max(Math.ceil(participantes.length / pageSize), 1);
  const start = (page - 1) * pageSize;
  const paginados = participantes.slice(start, start + pageSize);

  return (
    <>
      <Table className="w-full table-fixed">
        <TableHeader>
          <TableRow className="border-b border-border hover:bg-transparent">
            <TableHead className="h-10 w-[20%] px-2 text-center text-[11px] font-bold text-color-titulos">
              Nombre de la Empresa
            </TableHead>
            <TableHead className="h-10 w-[12%] px-2 text-center text-[11px] font-bold text-color-titulos">
              RIF
            </TableHead>
            <TableHead className="h-10 w-[16%] px-2 text-center text-[11px] font-bold text-color-titulos">
              Representante Legal
            </TableHead>
            <TableHead className="h-10 w-[12%] px-2 text-center text-[11px] font-bold text-color-titulos">
              Monto oferta (Bs)
            </TableHead>
            <TableHead className="h-10 w-[12%] px-2 text-center text-[11px] font-bold text-color-titulos">
              Estado
            </TableHead>
            <TableHead className="h-10 w-[28%] px-2 text-center text-[11px] font-bold text-color-titulos">
              Acciones
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="py-12 text-center italic text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-navy border-t-transparent" />
                  <p>Cargando participantes...</p>
                </div>
              </TableCell>
            </TableRow>
          ) : participantes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-12 text-center italic text-muted-foreground">
                No hay oferentes registrados.
              </TableCell>
            </TableRow>
          ) : (
            paginados.map((p) => {
              const cotejoHecho = p.listaCotejoCompletada;
              const evaluacionCerrada = p.oferenteCalificado !== null;
              const canUseListaCotejoDoc = cotejoHecho || evaluacionCerrada;
              const listaCotejoLabel = cotejoHecho ? "Editar lista" : "Lista Cotejo";
              const calificarLabel = evaluacionCerrada
                ? "Editar calificación"
                : "Calificar/Evaluar";

              return (
                <TableRow key={p.id} className="border-b border-border hover:bg-muted/40">
                  <TableCell className="break-words px-2 py-3 text-center text-[10px] font-semibold leading-tight">
                    <button
                      type="button"
                      className="text-color-titulos underline-offset-2 transition-colors hover:text-navy hover:underline"
                      title="Ver datos del oferente"
                      onClick={() => onViewOferente(p.ofertaId)}
                    >
                      {p.nombreEmpresa}
                    </button>
                  </TableCell>
                  <TableCell className="break-all px-2 py-3 text-center font-mono text-[10px] font-semibold leading-tight text-color-subtitulos">
                    {p.rif}
                  </TableCell>
                  <TableCell className="break-words px-2 py-3 text-center text-[10px] font-semibold leading-tight text-color-subtitulos">
                    {p.representanteLegal}
                  </TableCell>
                  <TableCell className="break-all px-2 py-3 text-center text-[12px] font-bold tabular-nums leading-tight text-color-titulos">
                    {formatMonto(p.montoOfertaBs)}
                  </TableCell>
                  <TableCell className="px-2 py-3 text-center">
                    <EvaluacionBadgeEstado calificado={p.oferenteCalificado} />
                  </TableCell>
                  <TableCell className="px-2 py-3">
                    <div className="flex flex-nowrap items-center justify-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={readOnly}
                        title={listaCotejoLabel}
                        className="h-8 shrink-0 gap-1.5 border-navy/30 px-2.5 text-[10px] font-semibold text-navy hover:bg-navy/5 hover:text-navy"
                        onClick={() =>
                          router.push(evaluacionPath(basePath, expedienteId, p.id, "sobre-1"))
                        }
                      >
                        <IoCheckboxOutline className="h-3.5 w-3.5" />
                        {listaCotejoLabel}
                      </Button>

                      {cotejoHecho ? (
                        <Button
                          type="button"
                          size="sm"
                          disabled={readOnly}
                          title={calificarLabel}
                          className="h-8 shrink-0 gap-1.5 bg-navy px-2.5 text-[10px] font-semibold text-white hover:bg-navy-hover"
                          onClick={() =>
                            router.push(
                              evaluacionPath(basePath, expedienteId, p.id, "calificacion")
                            )
                          }
                        >
                          <FaBalanceScale className="h-3 w-3" />
                          {calificarLabel}
                        </Button>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex">
                              <Button
                                type="button"
                                size="sm"
                                disabled
                                title="Complete la lista de cotejo primero"
                                className="h-8 shrink-0 gap-1.5 bg-navy px-2.5 text-[10px] font-semibold text-white hover:bg-navy-hover"
                              >
                                <FaBalanceScale className="h-3 w-3" />
                                Calificar/Evaluar
                              </Button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>Complete la lista de cotejo primero</TooltipContent>
                        </Tooltip>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-navy"
                            title="Más opciones"
                          >
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Más opciones</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuItem
                            disabled={!canUseListaCotejoDoc}
                            onClick={() => onPreviewListaCotejo(p.id)}
                          >
                            <IoEyeOutline className="h-4 w-4" />
                            Ver lista de cotejo
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={!canUseListaCotejoDoc || downloadingId === p.id}
                            onClick={() => onDownloadListaCotejo(p.id)}
                          >
                            <IoDownloadOutline className="h-4 w-4" />
                            {downloadingId === p.id
                              ? "Descargando..."
                              : "Descargar lista de cotejo"}
                          </DropdownMenuItem>
                          {!readOnly ? (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => onDeleteOferente(p.ofertaId)}
                              >
                                <FaRegTrashAlt className="h-3.5 w-3.5" />
                                Eliminar oferente
                              </DropdownMenuItem>
                            </>
                          ) : null}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <div className="mt-auto border-t border-border bg-muted/40 px-6 py-4">
        <Pagination className="justify-end">
          <PaginationContent className="gap-1">
            <PaginationItem>
              <button
                type="button"
                disabled={page === 1}
                onClick={() => onPageChange(Math.max(page - 1, 1))}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                &lt;
              </button>
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => {
              const pageNum = i + 1;
              return (
                <PaginationItem key={pageNum}>
                  <button
                    type="button"
                    onClick={() => onPageChange(pageNum)}
                    className={`flex h-8 w-8 items-center justify-center rounded-md text-[13px] font-semibold transition-colors ${
                      page === pageNum
                        ? "bg-navy text-white hover:bg-navy-hover"
                        : "border border-border bg-card text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {pageNum}
                  </button>
                </PaginationItem>
              );
            })}
            <PaginationItem>
              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => onPageChange(Math.min(page + 1, totalPages))}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                &gt;
              </button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </>
  );
}

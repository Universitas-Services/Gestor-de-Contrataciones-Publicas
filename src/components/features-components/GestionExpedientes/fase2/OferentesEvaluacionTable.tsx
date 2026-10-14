"use client";

import { FaRegTrashAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";

import { EvaluacionBadgeEstado } from "@/components/features-components/ElaboracionExpediente/shared/EvaluacionBadgeEstado";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { evaluacionHubPath } from "@/lib/utils/evaluacionRoutes";
import {
  displayPrelacionLabel,
  resolveEstadoEvaluacionUi,
  type EstadoEvaluacionUi,
  type ParticipanteEvaluacion,
} from "@/lib/utils/evaluacionesFase3Utils";

function formatMonto(monto: number | null): string {
  if (monto === null || Number.isNaN(monto)) return "—";
  return new Intl.NumberFormat("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(monto);
}

function ctaClassForEstado(estado: EstadoEvaluacionUi): string {
  switch (estado) {
    case "en_evaluacion":
      return "bg-orange-500 text-white hover:bg-orange-600";
    case "evaluado":
      return "border border-green-500 bg-white text-green-700 hover:bg-green-50";
    case "descalificado":
      return "border border-border bg-white text-color-subtitulos hover:bg-muted";
    default:
      return "bg-navy text-white hover:bg-navy-hover";
  }
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
}: OferentesEvaluacionTableProps) {
  const router = useRouter();
  const totalPages = Math.max(Math.ceil(participantes.length / pageSize), 1);
  const start = (page - 1) * pageSize;
  const paginados = participantes.slice(start, start + pageSize);

  const goEvaluacion = (evaluacionId: string) => {
    router.push(evaluacionHubPath(basePath, expedienteId, evaluacionId));
  };

  return (
    <>
      <div className="w-full overflow-x-auto">
        <Table className="w-full min-w-0 table-fixed">
          <TableHeader>
            <TableRow className="border-b border-border hover:bg-transparent">
              <TableHead className="h-10 w-[26%] px-2 text-left text-[11px] font-bold text-color-titulos">
                Empresa oferente
              </TableHead>
              <TableHead className="h-10 w-[14%] px-2 text-center text-[11px] font-bold text-color-titulos">
                Monto oferta (Bs)
              </TableHead>
              <TableHead className="h-10 w-[18%] px-2 text-center text-[11px] font-bold text-color-titulos">
                Estado eval.
              </TableHead>
              <TableHead className="h-10 w-[16%] px-2 text-center text-[11px] font-bold text-color-titulos">
                Orden de prelación
              </TableHead>
              <TableHead className="h-10 w-[26%] px-2 text-center text-[11px] font-bold text-color-titulos">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center italic text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-navy border-t-transparent" />
                    <p>Cargando participantes...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : participantes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center italic text-muted-foreground">
                  No hay oferentes registrados.
                </TableCell>
              </TableRow>
            ) : (
              paginados.map((p) => {
                const estado = resolveEstadoEvaluacionUi(p);
                const isDescalificado = estado === "descalificado";
                const prelacionLabel = displayPrelacionLabel(p);

                let ctaLabel = "Evaluar";
                if (estado === "en_evaluacion") {
                  ctaLabel = "Continuar";
                } else if (estado === "evaluado") {
                  ctaLabel = "Ver Puntaje";
                } else if (estado === "descalificado") {
                  ctaLabel = "Detalles";
                }

                return (
                  <TableRow
                    key={p.id}
                    className={`border-b border-border hover:bg-muted/40 ${
                      isDescalificado ? "opacity-50" : ""
                    }`}
                  >
                    <TableCell className="px-2 py-3 text-left">
                      <button
                        type="button"
                        className="max-w-full text-left transition-colors hover:text-navy"
                        title="Ver datos del oferente"
                        onClick={() => onViewOferente(p.ofertaId)}
                      >
                        <span className="block truncate text-[11px] font-semibold leading-tight text-color-titulos underline-offset-2 hover:underline">
                          {p.nombreEmpresa}
                        </span>
                        <span className="mt-0.5 block truncate font-mono text-[10px] font-medium text-color-subtitulos">
                          {p.rif}
                        </span>
                      </button>
                    </TableCell>
                    <TableCell className="break-all px-2 py-3 text-center text-[11px] font-bold tabular-nums leading-tight text-color-titulos">
                      {formatMonto(p.montoOfertaBs)}
                    </TableCell>
                    <TableCell className="px-2 py-3 text-center">
                      <EvaluacionBadgeEstado
                        variante="gestion"
                        calificado={p.oferenteCalificado}
                        listaCotejoCompletada={p.listaCotejoCompletada}
                        puntuacion={p.puntuacionFinalConBonos}
                      />
                    </TableCell>
                    <TableCell className="px-2 py-3 text-center text-[11px] font-semibold text-color-subtitulos">
                      {prelacionLabel === "—" ? (
                        <span className="text-muted-foreground">—</span>
                      ) : prelacionLabel === "N/A" ? (
                        <span className="italic text-muted-foreground">N/A</span>
                      ) : (
                        prelacionLabel
                      )}
                    </TableCell>
                    <TableCell className="px-2 py-3">
                      <div className="flex flex-nowrap items-center justify-center gap-1">
                        <Button
                          type="button"
                          size="sm"
                          disabled={readOnly && estado !== "evaluado" && estado !== "descalificado"}
                          title={ctaLabel}
                          className={`h-8 shrink-0 px-2.5 text-[10px] font-semibold ${ctaClassForEstado(estado)}`}
                          onClick={() => goEvaluacion(p.id)}
                        >
                          {ctaLabel}
                        </Button>

                        {!readOnly ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                            title="Eliminar oferente"
                            onClick={() => onDeleteOferente(p.ofertaId)}
                          >
                            <FaRegTrashAlt className="h-3.5 w-3.5" />
                            <span className="sr-only">Eliminar</span>
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="border-t border-border bg-muted/40 px-4 py-2.5">
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Haga clic en <strong className="text-color-titulos">&quot;Evaluar&quot;</strong> en cada
          oferente para acceder a la calificación (Legal, Financiera, Técnica) y el puntaje final.
        </p>
      </div>

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

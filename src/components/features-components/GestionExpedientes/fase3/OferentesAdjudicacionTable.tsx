"use client";

import { FileX2, Gavel, Pencil, Send } from "lucide-react";
import { IoDownloadOutline, IoEyeOutline } from "react-icons/io5";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  displayPrelacionLabel,
  formatMoneyBs,
  isPrimeraOpcion,
  type ParticipanteEvaluacion,
} from "@/lib/utils/evaluacionesFase3Utils";
import type { DictamenOferenteLocal } from "./types";

interface OferentesAdjudicacionTableProps {
  participantes: ParticipanteEvaluacion[];
  loading?: boolean;
  dictamenes: Record<string, DictamenOferenteLocal>;
  canAdjudicar: (p: ParticipanteEvaluacion) => boolean;
  requiereCausa: (p: ParticipanteEvaluacion) => boolean;
  notificacionesUnlocked: boolean;
  notificacionesGeneradas: boolean;
  readOnly?: boolean;
  onAdjudicar: (p: ParticipanteEvaluacion) => void;
  onRegistrarCausa: (p: ParticipanteEvaluacion) => void;
  onNotificar: (p: ParticipanteEvaluacion) => void;
  onPreviewNotificacion: (p: ParticipanteEvaluacion) => void;
  onDownloadNotificacion: (p: ParticipanteEvaluacion) => void;
}

export function OferentesAdjudicacionTable({
  participantes,
  loading = false,
  dictamenes,
  canAdjudicar,
  requiereCausa,
  notificacionesUnlocked,
  notificacionesGeneradas,
  readOnly = false,
  onAdjudicar,
  onRegistrarCausa,
  onNotificar,
  onPreviewNotificacion,
  onDownloadNotificacion,
}: OferentesAdjudicacionTableProps) {
  return (
    <Card className="overflow-hidden border border-border shadow-sm">
      <CardHeader className="border-b border-border bg-slate-50 px-6 py-4">
        <p className="text-[10px] font-bold uppercase tracking-wide text-navy">Paso 2</p>
        <CardTitle className="text-[17px] font-bold text-color-titulos">
          Registro de oferentes y adjudicación
        </CardTitle>
        <p className="text-[12px] text-muted-foreground">
          Oferentes que llegaron a esta fase, ordenados por prelación / puntaje.
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="w-full overflow-x-auto">
          <Table className="w-full min-w-[860px] table-fixed">
            <TableHeader>
              <TableRow className="border-b border-border hover:bg-transparent">
                <TableHead className="h-11 w-[24%] px-4 text-left text-[11px] font-bold text-color-titulos">
                  Nombre del oferente
                </TableHead>
                <TableHead className="h-11 w-[13%] px-2 text-center text-[11px] font-bold text-color-titulos">
                  RIF
                </TableHead>
                <TableHead className="h-11 w-[15%] px-2 text-center text-[11px] font-bold text-color-titulos">
                  Monto de la oferta
                </TableHead>
                <TableHead className="h-11 w-[16%] px-2 text-center text-[11px] font-bold text-color-titulos">
                  Orden de prelación
                </TableHead>
                <TableHead className="h-11 w-[32%] px-2 text-center text-[11px] font-bold text-color-titulos">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                    Cargando oferentes...
                  </TableCell>
                </TableRow>
              ) : participantes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                    No hay oferentes evaluados para esta fase.
                  </TableCell>
                </TableRow>
              ) : (
                participantes.map((p) => {
                  const prelacionLabel = displayPrelacionLabel(p);
                  const dictamen = dictamenes[p.id];
                  const guardado = dictamen?.guardado === true;
                  const elegible = p.oferenteCalificado === true;
                  const allowAdj = canAdjudicar(p) && !readOnly;
                  // Se generan todas a la vez (adjudicados, no adjudicados y descalificados).
                  const notifDone = notificacionesGeneradas;
                  const causaPendiente = elegible && requiereCausa(p);
                  const causaGuardada = Boolean(dictamen?.causaNoAdjudicado);

                  return (
                    <TableRow key={p.id} className="border-b border-border">
                      <TableCell className="px-4 py-3">
                        <p className="truncate text-sm font-bold text-color-titulos">
                          {p.nombreEmpresa}
                        </p>
                        {!elegible ? (
                          <p className="text-[11px] font-medium text-destructive">
                            {p.oferenteCalificado === false
                              ? "Descalificado (Fase 2)"
                              : "Pendiente de evaluación"}
                          </p>
                        ) : null}
                      </TableCell>
                      <TableCell className="px-2 text-center text-sm text-color-subtitulos">
                        {p.rif}
                      </TableCell>
                      <TableCell className="px-2 text-center text-sm font-semibold text-color-titulos">
                        {formatMoneyBs(p.montoOfertaBs)}
                      </TableCell>
                      <TableCell className="px-2 text-center">
                        {prelacionLabel === "N/A" || prelacionLabel === "—" ? (
                          <span className="text-xs italic text-muted-foreground">
                            {prelacionLabel}
                          </span>
                        ) : (
                          <Badge
                            className={
                              isPrimeraOpcion(p.prelacion)
                                ? "border-0 bg-pendiente-bg text-[11px] font-bold text-pendiente"
                                : "border-0 bg-muted text-[11px] font-bold text-color-subtitulos"
                            }
                          >
                            {prelacionLabel}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="px-2">
                        <div
                          className={
                            notificacionesUnlocked
                              ? "mx-auto grid max-w-[300px] grid-cols-2 items-center gap-2"
                              : "mx-auto flex max-w-[150px] items-center justify-center"
                          }
                        >
                          {causaPendiente ? (
                            <Button
                              type="button"
                              size="sm"
                              disabled={readOnly && !causaGuardada}
                              variant={causaGuardada ? "outline" : "default"}
                              className={
                                causaGuardada
                                  ? "h-8 w-full border-navy px-3 text-xs font-bold text-navy hover:bg-navy/5"
                                  : "h-8 w-full bg-navy px-3 text-xs font-bold text-white hover:bg-navy-hover disabled:opacity-40"
                              }
                              onClick={() => onRegistrarCausa(p)}
                            >
                              {causaGuardada ? (
                                <>
                                  <Pencil className="mr-1 h-3.5 w-3.5" />
                                  Editar causa
                                </>
                              ) : (
                                <>
                                  <FileX2 className="mr-1 h-3.5 w-3.5" />
                                  Registrar causa
                                </>
                              )}
                            </Button>
                          ) : elegible ? (
                            <Button
                              type="button"
                              size="sm"
                              disabled={!allowAdj && !guardado}
                              variant={guardado ? "outline" : "default"}
                              className={
                                guardado
                                  ? "h-8 w-full border-navy px-3 text-xs font-bold text-navy hover:bg-navy/5"
                                  : "h-8 w-full bg-navy px-3 text-xs font-bold text-white hover:bg-navy-hover disabled:opacity-40"
                              }
                              onClick={() => onAdjudicar(p)}
                            >
                              {guardado ? (
                                <>
                                  <Pencil className="mr-1 h-3.5 w-3.5" />
                                  Editar
                                </>
                              ) : (
                                <>
                                  <Gavel className="mr-1 h-3.5 w-3.5" />
                                  Adjudicar
                                </>
                              )}
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              size="sm"
                              disabled
                              variant="ghost"
                              className="h-8 w-full px-3 text-xs text-muted-foreground"
                            >
                              N/A
                            </Button>
                          )}

                          {notificacionesUnlocked ? (
                            notifDone ? (
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-navy"
                                  title="Previsualizar notificación"
                                  onClick={() => onPreviewNotificacion(p)}
                                >
                                  <IoEyeOutline className="h-5 w-5" />
                                </button>
                                <button
                                  type="button"
                                  className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-navy"
                                  title="Descargar notificación"
                                  onClick={() => onDownloadNotificacion(p)}
                                >
                                  <IoDownloadOutline className="h-5 w-5" />
                                </button>
                              </div>
                            ) : (
                              <Button
                                type="button"
                                size="sm"
                                disabled={readOnly}
                                className="h-8 w-full bg-success px-3 text-xs font-bold text-white hover:opacity-90"
                                onClick={() => onNotificar(p)}
                              >
                                <Send className="mr-1 h-3.5 w-3.5" />
                                Notificar
                              </Button>
                            )
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
      </CardContent>
    </Card>
  );
}

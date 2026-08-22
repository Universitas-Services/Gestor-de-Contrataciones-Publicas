"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  descargarDictamenJuridico,
  descargarInformeDocumento,
  revisionJuridicaYDescargar,
} from "@/services/complianceApi";
import type { SesionCompliance } from "@/types/compliance.types";
import { TIPO_DOCUMENTO_LABELS } from "@/types/compliance.types";
import { FileDown, FileText, FolderOpen, Loader2, Scale } from "lucide-react";
import { useState } from "react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sesion: SesionCompliance | null;
  busy?: boolean;
  readOnly?: boolean;
  onSesionUpdate?: (sesion: SesionCompliance) => void;
  onError?: (msg: string) => void;
  onBusy?: (v: boolean) => void;
}

export function FilesSheet({
  open,
  onOpenChange,
  sesion,
  busy = false,
  readOnly = false,
  onSesionUpdate,
  onError,
  onBusy,
}: Props) {
  const [generating, setGenerating] = useState(false);
  const docs = sesion?.documentos_analizados ?? [];
  const dictamenes = sesion?.dictamenes_juridicos ?? [];
  const canGenerate =
    Boolean(sesion) && docs.length > 0 && sesion?.estado === "ACTIVA" && !readOnly;

  async function handleJuridico(formato: "pdf" | "docx") {
    if (!sesion || !canGenerate || busy || generating) return;
    setGenerating(true);
    onBusy?.(true);
    try {
      const res = await revisionJuridicaYDescargar(sesion.id, formato);
      onSesionUpdate?.(res.sesion);
    } catch (e) {
      onError?.(e instanceof Error ? e.message : String(e));
    } finally {
      setGenerating(false);
      onBusy?.(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="z-[100] flex h-full w-full flex-col gap-0 overflow-hidden bg-white p-0 border-l border-border-light sm:max-w-md md:max-w-[420px]"
      >
        <SheetHeader className="shrink-0 space-y-1 border-b border-border-light px-6 py-5 pr-12 text-left">
          <SheetTitle className="text-xl font-bold text-heading-dark">Archivos</SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            {sesion
              ? `${docs.length} cargado${docs.length === 1 ? "" : "s"} · ${dictamenes.length} generado${dictamenes.length === 1 ? "" : "s"}`
              : "Documentos cargados y generados de la sesión"}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-y-contain px-5 py-5">
          {!sesion ? (
            <p className="rounded-xl border border-dashed border-border-light bg-slate-bg px-4 py-8 text-center text-sm text-muted-foreground">
              No hay sesión activa.
            </p>
          ) : (
            <>
              <section className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <FolderOpen className="size-3.5 text-navy" />
                  <h3 className="text-xs font-bold tracking-wider text-heading-dark uppercase">
                    Cargados
                  </h3>
                </div>

                {docs.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border-light bg-slate-bg px-4 py-6 text-center text-xs text-muted-foreground">
                    Aún no hay documentos cargados. Usa el icono de adjuntar en el chat.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {docs.map((doc) => (
                      <li
                        key={doc.id}
                        className="rounded-xl border border-border-light bg-white p-3 shadow-sm"
                      >
                        <div className="flex items-start gap-2">
                          <FileText className="mt-0.5 size-4 shrink-0 text-navy" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-heading-dark">
                              {doc.nombre_archivo}
                            </p>
                            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                              {TIPO_DOCUMENTO_LABELS[doc.tipo] || doc.tipo}
                            </p>
                            <div className="mt-2">
                              {doc.tipo_coincide === false ? (
                                <Badge className="border-danger bg-doc-warning-bg text-danger text-[10px]">
                                  Tipo incorrecto
                                </Badge>
                              ) : doc.estatus_global === "Verde" ||
                                (!doc.estatus_global && doc.cumple) ? (
                                <Badge className="border-vigente-border bg-success-bg text-success-text text-[10px]">
                                  {doc.estatus_global || "Cumple"}
                                </Badge>
                              ) : doc.estatus_global === "Rojo" ? (
                                <Badge className="border-danger bg-doc-warning-bg text-danger text-[10px]">
                                  Rojo
                                </Badge>
                              ) : (
                                <Badge className="border-amber-300 bg-amber-50 text-amber-800 text-[10px]">
                                  {doc.estatus_global || "No cumple"}
                                </Badge>
                              )}
                              {doc.preguntas_seguimiento.length > 0 ? (
                                <Badge
                                  variant="outline"
                                  className="ml-1 border-border-light text-[10px]"
                                >
                                  Rúbrica{" "}
                                  {doc.preguntas_seguimiento.filter((p) => p.respondida).length}/
                                  {doc.preguntas_seguimiento.length}
                                </Badge>
                              ) : null}
                            </div>
                            {doc.preguntas_seguimiento.length > 0 ? (
                              <ul className="mt-2 max-h-40 space-y-1.5 overflow-y-auto rounded-lg border border-border-light bg-slate-bg/60 p-2">
                                {doc.preguntas_seguimiento.map((p, i) => (
                                  <li key={p.id} className="text-[11px] leading-snug">
                                    <span className="font-semibold text-heading-dark">
                                      {i + 1}. [{(p.estado || "—").toUpperCase()}]
                                    </span>{" "}
                                    <span className="text-muted-foreground">{p.texto}</span>
                                    {p.respuesta ? (
                                      <p className="mt-0.5 pl-2 text-muted-foreground">
                                        → {p.respuesta}
                                      </p>
                                    ) : null}
                                  </li>
                                ))}
                              </ul>
                            ) : null}
                            <div className="mt-2 flex gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 border-border-light px-2 text-[11px]"
                                onClick={() =>
                                  void descargarInformeDocumento(sesion.id, doc.id, "pdf")
                                }
                              >
                                <FileDown className="size-3" />
                                PDF
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 border-border-light px-2 text-[11px]"
                                onClick={() =>
                                  void descargarInformeDocumento(sesion.id, doc.id, "docx")
                                }
                              >
                                <FileDown className="size-3" />
                                DOCX
                              </Button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <Scale className="size-3.5 text-navy" />
                  <h3 className="text-xs font-bold tracking-wider text-heading-dark uppercase">
                    Generados
                  </h3>
                </div>

                {!readOnly && (
                  <div className="flex flex-col gap-2 rounded-xl border border-border-light bg-slate-bg p-3">
                    <p className="text-[11px] text-muted-foreground">
                      Genera el dictamen jurídico (parcial/final) y descarga el archivo.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-border-light bg-white"
                        disabled={!canGenerate || busy || generating}
                        onClick={() => void handleJuridico("pdf")}
                      >
                        {generating ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Scale className="size-3.5" />
                        )}
                        Jurídico PDF
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-border-light bg-white"
                        disabled={!canGenerate || busy || generating}
                        onClick={() => void handleJuridico("docx")}
                      >
                        {generating ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <FileDown className="size-3.5" />
                        )}
                        Jurídico DOCX
                      </Button>
                    </div>
                  </div>
                )}

                {dictamenes.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border-light bg-slate-bg px-4 py-6 text-center text-xs text-muted-foreground">
                    Todavía no hay dictámenes generados.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {dictamenes.map((d) => (
                      <li
                        key={d.id}
                        className="rounded-xl border border-border-light bg-white p-3 shadow-sm"
                      >
                        <div className="flex items-start gap-2">
                          <Scale className="mt-0.5 size-4 shrink-0 text-navy" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-heading-dark">
                              Dictamen {d.alcance.toLowerCase()}
                            </p>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                              {new Date(d.fecha).toLocaleString()}
                            </p>
                            <Badge
                              variant="outline"
                              className="mt-2 border-border-light text-[10px]"
                            >
                              {d.alcance}
                            </Badge>
                            <div className="mt-2 flex gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 border-border-light px-2 text-[11px]"
                                onClick={() =>
                                  void descargarDictamenJuridico(sesion.id, d.id, "pdf")
                                }
                              >
                                <FileDown className="size-3" />
                                PDF
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 border-border-light px-2 text-[11px]"
                                onClick={() =>
                                  void descargarDictamenJuridico(sesion.id, d.id, "docx")
                                }
                              >
                                <FileDown className="size-3" />
                                DOCX
                              </Button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

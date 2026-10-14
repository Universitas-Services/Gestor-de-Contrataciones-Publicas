"use client";

import { BsArrowClockwise } from "react-icons/bs";
import { IoDownloadOutline, IoEyeOutline, IoNewspaperOutline } from "react-icons/io5";
import { FileCheck2, FileText, Lock, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ACTION_ICON_CLASS =
  "flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-navy disabled:cursor-not-allowed disabled:opacity-30";

interface DocumentosLegalesFase3Props {
  docsUnlocked: boolean;
  informePersistido: boolean;
  informeGenerado: boolean;
  actaUnlocked: boolean;
  documentoAdjudicacionGenerado: boolean;
  readOnly?: boolean;
  onOpenInforme: () => void;
  onGenerateInforme: () => void;
  onPreviewInforme: () => void;
  onDownloadInforme: () => void;
  onRegenerateInforme: () => void;
  onGenerateActa: () => void;
  onPreviewActa: () => void;
  onDownloadActa: () => void;
  onRegenerateActa: () => void;
}

export function DocumentosLegalesFase3({
  docsUnlocked,
  informePersistido,
  informeGenerado,
  actaUnlocked,
  documentoAdjudicacionGenerado,
  readOnly = false,
  onOpenInforme,
  onGenerateInforme,
  onPreviewInforme,
  onDownloadInforme,
  onRegenerateInforme,
  onGenerateActa,
  onPreviewActa,
  onDownloadActa,
  onRegenerateActa,
}: DocumentosLegalesFase3Props) {
  return (
    <Card className="overflow-hidden border border-border shadow-sm">
      <CardHeader className="border-b border-border bg-slate-50 px-6 py-4">
        <p className="text-[10px] font-bold uppercase tracking-wide text-navy">Paso 3</p>
        <CardTitle className="text-[17px] font-bold text-color-titulos">
          Emisión de documentos legales
        </CardTitle>
        <p className="text-[12px] text-muted-foreground">
          El informe se habilita al completar las adjudicaciones. El documento de adjudicación
          requiere el informe generado.
        </p>
      </CardHeader>
      <CardContent className="grid gap-4 p-6 md:grid-cols-2">
        {/* Informe */}
        <div className="flex min-h-[180px] flex-col justify-between rounded-lg border border-border bg-white p-5">
          <div className="mb-4 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">
              <FileText className="h-6 w-6 text-navy" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-color-titulos">Informe de recomendación</h4>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Consolida evaluaciones y concluye el dictamen de la comisión.
              </p>
              <p className="mt-2 text-[11px] font-semibold italic text-muted-foreground">
                {informeGenerado
                  ? "Generado"
                  : informePersistido
                    ? "Formulario guardado · documento pendiente de generar"
                    : "Pendiente de creación"}
              </p>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            {!informeGenerado && informePersistido ? (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  disabled={readOnly}
                  className="h-10 flex-1 border-navy font-semibold text-navy hover:bg-navy/5"
                  onClick={onOpenInforme}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar formulario
                </Button>
                <Button
                  type="button"
                  disabled={!docsUnlocked || readOnly}
                  className="h-10 flex-1 bg-navy font-semibold text-white hover:bg-navy-hover"
                  onClick={onGenerateInforme}
                >
                  <IoNewspaperOutline className="mr-2 h-5 w-5" />
                  Generar informe
                </Button>
              </div>
            ) : !informeGenerado ? (
              <Button
                type="button"
                disabled={!docsUnlocked || readOnly}
                className="h-10 w-full bg-navy font-semibold text-white hover:bg-navy-hover"
                onClick={onOpenInforme}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Generar informe de recomendaciones
              </Button>
            ) : (
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  className={ACTION_ICON_CLASS}
                  title="Previsualizar documento"
                  onClick={onPreviewInforme}
                >
                  <IoEyeOutline className="h-[26px] w-[26px]" />
                </button>
                <button
                  type="button"
                  className={ACTION_ICON_CLASS}
                  title="Descargar documento"
                  onClick={onDownloadInforme}
                >
                  <IoDownloadOutline className="h-[26px] w-[26px]" />
                </button>
                <button
                  type="button"
                  className={ACTION_ICON_CLASS}
                  title="Regenerar documento"
                  disabled={readOnly}
                  onClick={onRegenerateInforme}
                >
                  <BsArrowClockwise className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Documento adjudicación */}
        <div
          className={cn(
            "flex min-h-[180px] flex-col justify-between rounded-lg border border-border p-5",
            actaUnlocked ? "bg-white" : "bg-muted/40"
          )}
        >
          <div className={cn("mb-4 flex items-start gap-4", !actaUnlocked && "opacity-60")}>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">
              <FileCheck2
                className={cn("h-6 w-6", actaUnlocked ? "text-navy" : "text-muted-foreground")}
              />
            </div>
            <div className="min-w-0">
              <h4
                className={cn(
                  "text-sm font-bold",
                  actaUnlocked ? "text-color-titulos" : "text-muted-foreground"
                )}
              >
                Documento de adjudicación
              </h4>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Oficializa la decisión. Se habilita al emitir el informe.
              </p>
              <p className="mt-2 text-[11px] font-semibold italic text-muted-foreground">
                {documentoAdjudicacionGenerado ? "Generado" : "Pendiente de creación"}
              </p>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            {!actaUnlocked ? (
              <Button
                type="button"
                disabled
                className="h-10 w-full cursor-not-allowed bg-muted font-semibold text-muted-foreground"
              >
                <Lock className="mr-2 h-4 w-4" />
                Bloqueado
              </Button>
            ) : !documentoAdjudicacionGenerado ? (
              <Button
                type="button"
                disabled={readOnly}
                className="h-10 w-full bg-navy font-semibold text-white hover:bg-navy-hover"
                onClick={onGenerateActa}
              >
                <IoNewspaperOutline className="mr-2 h-5 w-5" />
                Generar adjudicación
              </Button>
            ) : (
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  className={ACTION_ICON_CLASS}
                  title="Previsualizar documento"
                  onClick={onPreviewActa}
                >
                  <IoEyeOutline className="h-[26px] w-[26px]" />
                </button>
                <button
                  type="button"
                  className={ACTION_ICON_CLASS}
                  title="Descargar documento"
                  onClick={onDownloadActa}
                >
                  <IoDownloadOutline className="h-[26px] w-[26px]" />
                </button>
                <button
                  type="button"
                  className={ACTION_ICON_CLASS}
                  title="Regenerar documento"
                  disabled={readOnly}
                  onClick={onRegenerateActa}
                >
                  <BsArrowClockwise className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

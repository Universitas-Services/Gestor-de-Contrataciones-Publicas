"use client";

import { useRef } from "react";
import { Plus, Upload } from "lucide-react";

import {
  CALIFICACION_LEGAL_DESC_MAX,
  type RecaudoArchivoMeta,
  type RecaudoSobre,
} from "@/lib/constants/calificacionLegal";
import { SiNoToggleField } from "@/components/features-components/GestionExpedientes/fase1/actividades-previas/SiNoToggleField";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface RecaudoPersonalizadoPanelProps {
  sobre: RecaudoSobre;
  indOtro: boolean | undefined;
  descripcion: string;
  quiereModelo: boolean | undefined;
  archivo: RecaudoArchivoMeta | null;
  readOnly?: boolean;
  onIndOtroChange: (value: boolean) => void;
  onDescripcionChange: (value: string) => void;
  onQuiereModeloChange: (value: boolean) => void;
  onArchivoChange: (meta: RecaudoArchivoMeta | null) => void;
  onAdd: () => void;
}

function toMeta(file: File): RecaudoArchivoMeta {
  return {
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type || "application/octet-stream",
    uploadedAt: new Date().toISOString(),
    previewUrl: URL.createObjectURL(file),
  };
}

export function RecaudoPersonalizadoPanel({
  sobre,
  indOtro,
  descripcion,
  quiereModelo,
  archivo,
  readOnly = false,
  onIndOtroChange,
  onDescripcionChange,
  onQuiereModeloChange,
  onArchivoChange,
  onAdd,
}: RecaudoPersonalizadoPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const pregunta =
    sobre === 1
      ? "¿Desea agregar un recaudo o requisito legal/financiero/técnico personalizado adicional al Sobre N° 1?"
      : "¿Desea agregar un requisito técnico o económico personalizado adicional al Sobre N° 2?";
  const basamento = "Artículo 66, Numeral 24 de la Ley de Contrataciones Públicas.";
  const descLabel =
    sobre === 1
      ? "Escriba el nombre y la descripción detallada del nuevo recaudo legal/financiero que exigirá de forma obligatoria en el Sobre N° 1."
      : "Escriba el nombre y la descripción detallada del nuevo requisito técnico o económico que exigirá de forma obligatoria en el Sobre N° 2.";

  const canAdd = !readOnly && indOtro === true && descripcion.trim().length > 0;

  return (
    <div className="space-y-4 rounded-lg border border-dashed border-navy/40 bg-muted/20 p-4">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-color-titulos">{pregunta}</p>
        <p className="text-[11px] italic text-muted-foreground">{basamento}</p>
        <div className="max-w-[200px]">
          <SiNoToggleField
            value={indOtro}
            onChange={onIndOtroChange}
            disabled={readOnly}
            className="gap-2"
            buttonClassName="h-9 text-xs"
          />
        </div>
      </div>

      {indOtro === true ? (
        <div className="space-y-4 border-t border-border pt-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold leading-snug text-color-titulos">
              {descLabel}
            </Label>
            <Textarea
              value={descripcion}
              disabled={readOnly}
              maxLength={CALIFICACION_LEGAL_DESC_MAX}
              rows={4}
              onChange={(e) => onDescripcionChange(e.target.value)}
              className="resize-y text-sm"
            />
            <p className="text-right text-[10px] text-muted-foreground">
              {descripcion.length}/{CALIFICACION_LEGAL_DESC_MAX}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-color-titulos">
              ¿Desea incluir un modelo o plantilla sugerida para este recaudo?
            </p>
            <div className="max-w-[200px]">
              <SiNoToggleField
                value={quiereModelo}
                onChange={onQuiereModeloChange}
                disabled={readOnly}
                className="gap-2"
                buttonClassName="h-9 text-xs"
              />
            </div>
          </div>

          {quiereModelo === true ? (
            <div className="space-y-2">
              <input
                ref={inputRef}
                type="file"
                className="sr-only"
                disabled={readOnly}
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (archivo?.previewUrl?.startsWith("blob:")) {
                    URL.revokeObjectURL(archivo.previewUrl);
                  }
                  onArchivoChange(file ? toMeta(file) : null);
                  e.target.value = "";
                }}
              />
              {archivo ? (
                <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-card px-3 py-2">
                  <p className="truncate text-xs font-medium text-foreground">{archivo.fileName}</p>
                  {!readOnly ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-destructive"
                      onClick={() => {
                        if (archivo.previewUrl?.startsWith("blob:")) {
                          URL.revokeObjectURL(archivo.previewUrl);
                        }
                        onArchivoChange(null);
                      }}
                    >
                      Quitar
                    </Button>
                  ) : null}
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  disabled={readOnly}
                  className="border-border text-navy"
                  onClick={() => inputRef.current?.click()}
                >
                  <Upload className="mr-1.5 h-4 w-4" />
                  Cargar archivo
                </Button>
              )}
            </div>
          ) : null}

          {!readOnly ? (
            <Button
              type="button"
              disabled={!canAdd}
              onClick={onAdd}
              className="bg-navy text-white hover:bg-navy-hover"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Agregar a la lista de recaudos
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

"use client";

import type { ReactNode } from "react";
import { Plus, Trash2 } from "lucide-react";

import {
  CRITERIO_DESC_MAX,
  CRITERIO_NOMBRE_MAX,
  FIELD_COPY,
  createEmptyRango,
  type CriterioTecnico,
  type RangoTecnico,
} from "@/lib/constants/calificacionTecnica";
import { LocalizedDecimalInput } from "@/components/localized-decimal-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RangoTecnicoRow } from "./RangoTecnicoRow";

function parseLocalized(raw: string): number {
  const normalized = raw.replace(/\./g, "").replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}

function FieldBlock({
  label,
  legal,
  children,
}: {
  label: string;
  legal: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-bold leading-snug text-color-titulos">{label}</Label>
      <p className="text-[11px] italic leading-relaxed text-muted-foreground">{legal}</p>
      {children}
    </div>
  );
}

interface CriterioTecnicoFormFieldsProps {
  criterio: CriterioTecnico;
  readOnly?: boolean;
  onChange: (next: CriterioTecnico) => void;
}

/** Campos del criterio (pregunta + basamento + input) para usar dentro del modal. */
export function CriterioTecnicoFormFields({
  criterio,
  readOnly = false,
  onChange,
}: CriterioTecnicoFormFieldsProps) {
  const patch = (partial: Partial<CriterioTecnico>) => onChange({ ...criterio, ...partial });

  const patchRango = (rangoId: string, next: RangoTecnico) => {
    patch({
      rangos: criterio.rangos.map((r) => (r.id === rangoId ? next : r)),
    });
  };

  const removeRango = (rangoId: string) => {
    if (criterio.rangos.length <= 1) return;
    patch({ rangos: criterio.rangos.filter((r) => r.id !== rangoId) });
  };

  const addRango = () => {
    patch({ rangos: [...criterio.rangos, createEmptyRango()] });
  };

  return (
    <div className="space-y-5">
      <FieldBlock label={FIELD_COPY.nombre.label} legal={FIELD_COPY.nombre.legal}>
        <Input
          value={criterio.criterioCalificacionTecnicaAuAu}
          maxLength={CRITERIO_NOMBRE_MAX}
          disabled={readOnly}
          placeholder="Nombre del criterio técnico…"
          className="h-10"
          onChange={(e) => patch({ criterioCalificacionTecnicaAuAu: e.target.value })}
        />
      </FieldBlock>

      <FieldBlock label={FIELD_COPY.ponderacion.label} legal={FIELD_COPY.ponderacion.legal}>
        <div className="flex items-center gap-2">
          <LocalizedDecimalInput
            value={criterio.puntuacionCriterioCalificacionTecnicaAuAu}
            fractionDigits={2}
            max={100}
            outputMode="raw"
            disabled={readOnly}
            placeholder="Ej: 40"
            className="h-10 w-28"
            onValueChange={(raw) =>
              patch({ puntuacionCriterioCalificacionTecnicaAuAu: parseLocalized(raw) })
            }
          />
          <span className="text-sm font-medium text-muted-foreground">puntos</span>
        </div>
      </FieldBlock>

      <FieldBlock label={FIELD_COPY.descripcion.label} legal={FIELD_COPY.descripcion.legal}>
        <Textarea
          value={criterio.descCriterioCalificacionTecnicaAuAu}
          maxLength={CRITERIO_DESC_MAX}
          disabled={readOnly}
          rows={3}
          placeholder="Descripción del criterio…"
          className="resize-y text-sm"
          onChange={(e) => patch({ descCriterioCalificacionTecnicaAuAu: e.target.value })}
        />
        <p className="text-[10px] text-muted-foreground">
          {criterio.descCriterioCalificacionTecnicaAuAu.length}/{CRITERIO_DESC_MAX}
        </p>
      </FieldBlock>

      <div className="space-y-3">
        <FieldBlock label={FIELD_COPY.rango.label} legal={FIELD_COPY.rango.legal}>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full min-w-[440px] text-left text-sm">
              <thead className="bg-muted/40 text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
                <tr>
                  <th className="w-3/5 px-3 py-2">Escala / Rango</th>
                  <th className="w-1/4 px-3 py-2">Puntaje</th>
                  <th className="px-2 py-2 text-center">Acción</th>
                </tr>
              </thead>
              <tbody>
                {criterio.rangos.map((rango) => (
                  <RangoTecnicoRow
                    key={rango.id}
                    rango={rango}
                    maxPuntajePadre={criterio.puntuacionCriterioCalificacionTecnicaAuAu}
                    readOnly={readOnly}
                    canRemove={criterio.rangos.length > 1}
                    onChange={(next) => patchRango(rango.id, next)}
                    onRemove={() => removeRango(rango.id)}
                  />
                ))}
              </tbody>
            </table>
            {!readOnly ? (
              <div className="border-t border-border bg-muted/20 p-2 text-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs font-bold text-navy hover:bg-muted"
                  onClick={addRango}
                >
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Agregar Rango de Evaluación
                </Button>
              </div>
            ) : null}
          </div>
        </FieldBlock>
      </div>
    </div>
  );
}

interface CriterioTecnicoListItemProps {
  index: number;
  criterio: CriterioTecnico;
  readOnly?: boolean;
  onEdit: () => void;
  onRemove: () => void;
}

/** Fila resumen en el listado principal (tras guardar en modal). */
export function CriterioTecnicoListItem({
  index,
  criterio,
  readOnly = false,
  onEdit,
  onRemove,
}: CriterioTecnicoListItemProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
          Criterio {index + 1}
        </p>
        <p className="truncate text-sm font-bold text-color-titulos">
          {criterio.criterioCalificacionTecnicaAuAu.trim() || "Sin nombre"}
        </p>
        <p className="text-xs text-muted-foreground">
          {criterio.rangos.length} rango{criterio.rangos.length === 1 ? "" : "s"}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="rounded-md border border-border bg-muted/40 px-2.5 py-1 text-sm font-bold text-navy">
          {criterio.puntuacionCriterioCalificacionTecnicaAuAu} pts
        </span>
        {!readOnly ? (
          <>
            <Button type="button" variant="outline" size="sm" onClick={onEdit}>
              Editar
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={onRemove}
              aria-label="Eliminar criterio"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
}

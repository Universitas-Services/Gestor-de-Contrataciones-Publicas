"use client";

import type { ReactNode } from "react";
import { Plus, Trash2 } from "lucide-react";

import {
  CRITERIO_DESC_MAX,
  CRITERIO_NOMBRE_MAX,
  FIELD_COPY,
  PUNTUACION_CRITERIO_MAX,
  createEmptyRangoEconomica,
  createEmptyRangoTecnica,
  type CriterioEvalEconomica,
  type CriterioEvalTecnica,
  type EvaluacionLado,
  type RangoEvalEconomica,
  type RangoEvalTecnica,
} from "@/lib/constants/evaluacionTecnicaEconomica";
import { LocalizedDecimalInput } from "@/components/localized-decimal-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RangoEvaluacionRow } from "./RangoEvaluacionRow";

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

type CriterioUnion = CriterioEvalTecnica | CriterioEvalEconomica;

interface CriterioEvaluacionFormFieldsProps {
  lado: EvaluacionLado;
  criterio: CriterioUnion;
  readOnly?: boolean;
  onChange: (next: CriterioUnion) => void;
}

export function CriterioEvaluacionFormFields({
  lado,
  criterio,
  readOnly = false,
  onChange,
}: CriterioEvaluacionFormFieldsProps) {
  const copy = FIELD_COPY[lado];

  if (lado === "tecnica") {
    const c = criterio as CriterioEvalTecnica;
    const patch = (partial: Partial<CriterioEvalTecnica>) => onChange({ ...c, ...partial });

    const patchRango = (rangoId: string, next: RangoEvalTecnica) => {
      patch({ rangos: c.rangos.map((r) => (r.id === rangoId ? next : r)) });
    };

    return (
      <div className="space-y-5">
        <FieldBlock label={copy.nombre.label} legal={copy.nombre.legal}>
          <Input
            value={c.criterioEvaluacionTecnicaAuAu}
            maxLength={CRITERIO_NOMBRE_MAX}
            disabled={readOnly}
            placeholder="Nombre del criterio técnico…"
            className="h-10"
            onChange={(e) => patch({ criterioEvaluacionTecnicaAuAu: e.target.value })}
          />
        </FieldBlock>

        <FieldBlock label={copy.ponderacion.label} legal={copy.ponderacion.legal}>
          <div className="flex items-center gap-2">
            <LocalizedDecimalInput
              value={c.puntuacionCriterioEvaluacionTecnicaAuAu}
              fractionDigits={2}
              max={PUNTUACION_CRITERIO_MAX}
              outputMode="raw"
              disabled={readOnly}
              placeholder="Ej: 40"
              className="h-10 w-28"
              onValueChange={(raw) =>
                patch({ puntuacionCriterioEvaluacionTecnicaAuAu: parseLocalized(raw) })
              }
            />
            <span className="text-sm font-medium text-muted-foreground">puntos</span>
          </div>
        </FieldBlock>

        <FieldBlock label={copy.descripcion.label} legal={copy.descripcion.legal}>
          <Textarea
            value={c.descCriterioEvaluacionTecnicaAuAu}
            maxLength={CRITERIO_DESC_MAX}
            disabled={readOnly}
            rows={3}
            placeholder="Descripción del criterio…"
            className="resize-y text-sm"
            onChange={(e) => patch({ descCriterioEvaluacionTecnicaAuAu: e.target.value })}
          />
          <p className="text-[10px] text-muted-foreground">
            {c.descCriterioEvaluacionTecnicaAuAu.length}/{CRITERIO_DESC_MAX}
          </p>
        </FieldBlock>

        <RangosTable
          lado="tecnica"
          copyRango={copy.rango}
          readOnly={readOnly}
          maxPadre={c.puntuacionCriterioEvaluacionTecnicaAuAu}
          rows={c.rangos.map((r) => ({
            id: r.id,
            texto: r.rangoCriterioEvaluacionTecnicaAuAu,
            puntaje: r.puntuacionRangoCriterioEvaluacionTecnicaAuAu,
          }))}
          onAdd={() => patch({ rangos: [...c.rangos, createEmptyRangoTecnica()] })}
          onRemove={(id) => {
            if (c.rangos.length <= 1) return;
            patch({ rangos: c.rangos.filter((r) => r.id !== id) });
          }}
          onTextoChange={(id, value) => {
            const found = c.rangos.find((r) => r.id === id);
            if (!found) return;
            patchRango(id, { ...found, rangoCriterioEvaluacionTecnicaAuAu: value });
          }}
          onPuntajeChange={(id, value) => {
            const found = c.rangos.find((r) => r.id === id);
            if (!found) return;
            patchRango(id, {
              ...found,
              puntuacionRangoCriterioEvaluacionTecnicaAuAu: value,
            });
          }}
        />
      </div>
    );
  }

  const c = criterio as CriterioEvalEconomica;
  const patch = (partial: Partial<CriterioEvalEconomica>) => onChange({ ...c, ...partial });

  const patchRango = (rangoId: string, next: RangoEvalEconomica) => {
    patch({ rangos: c.rangos.map((r) => (r.id === rangoId ? next : r)) });
  };

  return (
    <div className="space-y-5">
      <FieldBlock label={copy.nombre.label} legal={copy.nombre.legal}>
        <Input
          value={c.criterioEvaluacionEconomicaAuAu}
          maxLength={CRITERIO_NOMBRE_MAX}
          disabled={readOnly}
          placeholder="Nombre del criterio económico…"
          className="h-10"
          onChange={(e) => patch({ criterioEvaluacionEconomicaAuAu: e.target.value })}
        />
      </FieldBlock>

      <FieldBlock label={copy.ponderacion.label} legal={copy.ponderacion.legal}>
        <div className="flex items-center gap-2">
          <LocalizedDecimalInput
            value={c.puntuacionCriterioEvaluacionEconomicaAuAu}
            fractionDigits={2}
            max={PUNTUACION_CRITERIO_MAX}
            outputMode="raw"
            disabled={readOnly}
            placeholder="Ej: 50"
            className="h-10 w-28"
            onValueChange={(raw) =>
              patch({ puntuacionCriterioEvaluacionEconomicaAuAu: parseLocalized(raw) })
            }
          />
          <span className="text-sm font-medium text-muted-foreground">puntos</span>
        </div>
      </FieldBlock>

      <FieldBlock label={copy.descripcion.label} legal={copy.descripcion.legal}>
        <Textarea
          value={c.descCriterioEvaluacionEconomicaAuAu}
          maxLength={CRITERIO_DESC_MAX}
          disabled={readOnly}
          rows={3}
          placeholder="Descripción del criterio…"
          className="resize-y text-sm"
          onChange={(e) => patch({ descCriterioEvaluacionEconomicaAuAu: e.target.value })}
        />
        <p className="text-[10px] text-muted-foreground">
          {c.descCriterioEvaluacionEconomicaAuAu.length}/{CRITERIO_DESC_MAX}
        </p>
      </FieldBlock>

      <RangosTable
        lado="economica"
        copyRango={copy.rango}
        readOnly={readOnly}
        maxPadre={c.puntuacionCriterioEvaluacionEconomicaAuAu}
        rows={c.rangos.map((r) => ({
          id: r.id,
          texto: r.rangoCriterioEvaluacionEconomicaAuAu,
          puntaje: r.puntuacionRangoCriterioEvaluacionEconomicaAuAu,
        }))}
        onAdd={() => patch({ rangos: [...c.rangos, createEmptyRangoEconomica()] })}
        onRemove={(id) => {
          if (c.rangos.length <= 1) return;
          patch({ rangos: c.rangos.filter((r) => r.id !== id) });
        }}
        onTextoChange={(id, value) => {
          const found = c.rangos.find((r) => r.id === id);
          if (!found) return;
          patchRango(id, { ...found, rangoCriterioEvaluacionEconomicaAuAu: value });
        }}
        onPuntajeChange={(id, value) => {
          const found = c.rangos.find((r) => r.id === id);
          if (!found) return;
          patchRango(id, {
            ...found,
            puntuacionRangoCriterioEvaluacionEconomicaAuAu: value,
          });
        }}
      />
    </div>
  );
}

function RangosTable({
  lado,
  copyRango,
  readOnly,
  maxPadre,
  rows,
  onAdd,
  onRemove,
  onTextoChange,
  onPuntajeChange,
}: {
  lado: EvaluacionLado;
  copyRango: { label: string; legal: string };
  readOnly?: boolean;
  maxPadre: number;
  rows: { id: string; texto: string; puntaje: number }[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onTextoChange: (id: string, value: string) => void;
  onPuntajeChange: (id: string, value: number) => void;
}) {
  return (
    <div className="space-y-3">
      <FieldBlock label={copyRango.label} legal={copyRango.legal}>
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
              {rows.map((row) => (
                <RangoEvaluacionRow
                  key={row.id}
                  lado={lado}
                  texto={row.texto}
                  puntaje={row.puntaje}
                  maxPuntajePadre={maxPadre}
                  readOnly={readOnly}
                  canRemove={rows.length > 1}
                  onTextoChange={(value) => onTextoChange(row.id, value)}
                  onPuntajeChange={(value) => onPuntajeChange(row.id, value)}
                  onRemove={() => onRemove(row.id)}
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
                onClick={onAdd}
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Agregar Rango de Evaluación
              </Button>
            </div>
          ) : null}
        </div>
      </FieldBlock>
    </div>
  );
}

interface CriterioEvaluacionListItemProps {
  lado: EvaluacionLado;
  index: number;
  nombre: string;
  puntos: number;
  rangosCount: number;
  readOnly?: boolean;
  onEdit: () => void;
  onRemove: () => void;
}

export function CriterioEvaluacionListItem({
  lado,
  index,
  nombre,
  puntos,
  rangosCount,
  readOnly = false,
  onEdit,
  onRemove,
}: CriterioEvaluacionListItemProps) {
  const label = lado === "tecnica" ? "Criterio técnico" : "Criterio económico";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
          {label} {index + 1}
        </p>
        <p className="truncate text-sm font-bold text-color-titulos">
          {nombre.trim() || "Sin nombre"}
        </p>
        <p className="text-xs text-muted-foreground">
          {rangosCount} rango{rangosCount === 1 ? "" : "s"}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="rounded-md border border-border bg-muted/40 px-2.5 py-1 text-sm font-bold text-navy">
          {puntos} pts
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

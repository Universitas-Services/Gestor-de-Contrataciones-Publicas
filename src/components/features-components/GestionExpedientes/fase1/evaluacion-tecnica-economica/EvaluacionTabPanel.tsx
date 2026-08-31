"use client";

import { ChartPie, Plus } from "lucide-react";

import {
  FIELD_COPY,
  TOTAL_PUNTOS_OBJETIVO,
  type CriterioEvalEconomica,
  type CriterioEvalTecnica,
  type EvaluacionLado,
} from "@/lib/constants/evaluacionTecnicaEconomica";
import { LocalizedDecimalInput } from "@/components/localized-decimal-input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CriterioEvaluacionListItem } from "./CriterioEvaluacionCard";

function parseLocalized(raw: string): number {
  const normalized = raw.replace(/\./g, "").replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}

interface EvaluacionTabPanelProps {
  lado: EvaluacionLado;
  totalSeccion: number;
  umbral: number;
  emptyTitle: string;
  emptyDescription: string;
  addLabel: string;
  criteriosTecnicos?: CriterioEvalTecnica[];
  criteriosEconomicos?: CriterioEvalEconomica[];
  readOnly?: boolean;
  onUmbralChange: (value: number) => void;
  onUmbralBlur: () => void;
  onAdd: () => void;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
}

export function EvaluacionTabPanel({
  lado,
  totalSeccion,
  umbral,
  emptyTitle,
  emptyDescription,
  addLabel,
  criteriosTecnicos = [],
  criteriosEconomicos = [],
  readOnly = false,
  onUmbralChange,
  onUmbralBlur,
  onAdd,
  onEdit,
  onRemove,
}: EvaluacionTabPanelProps) {
  const copy = FIELD_COPY[lado];
  const isEmpty =
    lado === "tecnica" ? criteriosTecnicos.length === 0 : criteriosEconomicos.length === 0;

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label className="text-sm font-bold leading-snug text-color-titulos">
          {copy.totalSeccion.label}
        </Label>
        <p className="text-[11px] italic leading-relaxed text-muted-foreground">
          {copy.totalSeccion.legal}
        </p>
        <div className="flex items-center gap-2">
          <span className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm font-bold tabular-nums text-navy">
            {totalSeccion.toLocaleString("es-VE", { maximumFractionDigits: 2 })} pts
          </span>
          <span className="text-xs text-muted-foreground">(calculado, solo lectura)</span>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label className="text-sm font-bold leading-snug text-color-titulos">
          {copy.umbral.label}
        </Label>
        <p className="text-[11px] italic leading-relaxed text-muted-foreground">
          {copy.umbral.legal}
        </p>
        <div className="flex items-center gap-2">
          <LocalizedDecimalInput
            value={umbral}
            fractionDigits={2}
            max={TOTAL_PUNTOS_OBJETIVO}
            outputMode="raw"
            disabled={readOnly}
            placeholder="Ej: 30"
            className="h-10 w-28"
            onValueChange={(raw) => {
              const next = parseLocalized(raw);
              onUmbralChange(Math.min(Math.max(0, next), TOTAL_PUNTOS_OBJETIVO));
            }}
            onBlur={onUmbralBlur}
          />
          <span className="text-sm font-medium text-muted-foreground">pts mínimos</span>
        </div>
      </div>

      <Separator />

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
          <ChartPie className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm font-bold text-color-titulos">{emptyTitle}</p>
          <p className="mt-1 max-w-md text-xs leading-relaxed text-muted-foreground">
            {emptyDescription}
          </p>
          {!readOnly ? (
            <Button
              type="button"
              onClick={onAdd}
              className="mt-4 bg-navy text-white hover:bg-navy-hover"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              {addLabel}
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm font-bold text-color-titulos">
            {lado === "tecnica" ? "Criterios técnicos" : "Criterios económicos"}
          </p>
          {lado === "tecnica"
            ? criteriosTecnicos.map((criterio, index) => (
                <CriterioEvaluacionListItem
                  key={criterio.id}
                  lado="tecnica"
                  index={index}
                  nombre={criterio.criterioEvaluacionTecnicaAuAu}
                  puntos={criterio.puntuacionCriterioEvaluacionTecnicaAuAu}
                  rangosCount={criterio.rangos.length}
                  readOnly={readOnly}
                  onEdit={() => onEdit(criterio.id)}
                  onRemove={() => onRemove(criterio.id)}
                />
              ))
            : criteriosEconomicos.map((criterio, index) => (
                <CriterioEvaluacionListItem
                  key={criterio.id}
                  lado="economica"
                  index={index}
                  nombre={criterio.criterioEvaluacionEconomicaAuAu}
                  puntos={criterio.puntuacionCriterioEvaluacionEconomicaAuAu}
                  rangosCount={criterio.rangos.length}
                  readOnly={readOnly}
                  onEdit={() => onEdit(criterio.id)}
                  onRemove={() => onRemove(criterio.id)}
                />
              ))}
          {!readOnly ? (
            <Button
              type="button"
              variant="outline"
              onClick={onAdd}
              className="w-full border-dashed border-navy/40 text-navy hover:bg-muted"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              {addLabel}
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}

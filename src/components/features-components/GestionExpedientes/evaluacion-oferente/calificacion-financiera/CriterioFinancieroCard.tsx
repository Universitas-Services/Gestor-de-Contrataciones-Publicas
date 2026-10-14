"use client";

import { SiNoToggleField } from "@/components/features-components/GestionExpedientes/fase1/actividades-previas/SiNoToggleField";
import { LocalizedDecimalInput } from "@/components/localized-decimal-input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  formatRangoAscendenteLabel,
  formatRangoInversoLabel,
  scoreCriterio,
} from "@/lib/constants/calificacionFinancieraEvaluacion";
import type {
  BandaFinanciera,
  CriterioFinancieroPlantilla,
  CriterioFinancieroRespuesta,
} from "@/types/evaluacionOferente.types";

interface CriterioFinancieroCardProps {
  index: number;
  criterio: CriterioFinancieroPlantilla;
  respuesta: CriterioFinancieroRespuesta | undefined;
  error?: boolean;
  readOnly?: boolean;
  onChange: (valor: string) => void;
}

function RubricTable({
  rows,
  activeBanda,
}: {
  rows: Array<{ banda: BandaFinanciera; label: string; pts: number }>;
  activeBanda: BandaFinanciera | null;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] table-fixed border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-border text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
            <th className="px-2 py-2">Criterio</th>
            <th className="px-2 py-2 w-[30%]">Puntaje</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const active = activeBanda === row.banda;
            return (
              <tr
                key={row.banda}
                className={cn("border-b border-border/60", active && "bg-navy/5")}
              >
                <td className="px-2 py-3 font-medium text-color-titulos">{row.label}</td>
                <td className="px-2 py-3">
                  <span
                    className={cn("font-semibold", active ? "text-navy" : "text-muted-foreground")}
                  >
                    {row.pts} pts
                    {active ? " · aplicado" : ""}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function CriterioFinancieroCard({
  index,
  criterio,
  respuesta,
  error = false,
  readOnly = false,
  onChange,
}: CriterioFinancieroCardProps) {
  const scored = scoreCriterio(criterio, respuesta);
  const activeBanda: BandaFinanciera | null = scored?.banda ?? null;

  if (criterio.kind === "descapital") {
    const valor = respuesta?.valor;
    const siNoValue = valor === "SI" ? true : valor === "NO" ? false : undefined;

    return (
      <div
        className={cn(
          "overflow-hidden rounded-lg border border-border bg-card shadow-sm",
          error && "border-destructive",
          siNoValue !== undefined && "border-navy/30"
        )}
      >
        <div className="space-y-3 p-4">
          <p className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
            {index}. {criterio.titulo}
          </p>
          <div className="space-y-1">
            <p className="text-sm font-bold text-color-titulos">{criterio.pregunta}</p>
            <p className="text-[11px] italic leading-relaxed text-muted-foreground">
              {criterio.basamentoLegal}
            </p>
          </div>
          <div className="max-w-[200px]">
            <SiNoToggleField
              value={siNoValue}
              onChange={(next) => onChange(next ? "SI" : "NO")}
              disabled={readOnly}
              className="gap-2"
              buttonClassName="h-9 text-xs"
            />
          </div>
          {error ? (
            <p className="text-[11px] font-medium text-destructive">Debe marcar SI o NO.</p>
          ) : null}
        </div>

        <div className="border-t border-border bg-muted/30 p-4">
          <RubricTable
            activeBanda={activeBanda}
            rows={[
              { banda: "min", label: "Si la respuesta es SÍ", pts: 0 },
              { banda: "max", label: "Si la respuesta es NO", pts: criterio.puntajeMaximo },
            ]}
          />
          {scored ? (
            <p className="mt-3 text-right text-[11px] font-bold text-navy">+{scored.pts} pts</p>
          ) : null}
        </div>
      </div>
    );
  }

  const labelFn =
    criterio.mode === "inverso" ? formatRangoInversoLabel : formatRangoAscendenteLabel;
  const raw =
    typeof respuesta?.valor === "string" && respuesta.valor !== "SI" && respuesta.valor !== "NO"
      ? respuesta.valor
      : "";

  const parsed = raw.trim() === "" ? null : Number(raw.replace(",", "."));
  const inputValue = parsed !== null && Number.isFinite(parsed) ? parsed : null;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-card shadow-sm",
        error && "border-destructive",
        scored && "border-navy/30"
      )}
    >
      <div className="space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
            {index}. {criterio.titulo}
          </p>
          {criterio.mode === "inverso" ? (
            <Badge className="rounded-md border-0 bg-navy text-[10px] font-bold uppercase text-white">
              Lógica inversa
            </Badge>
          ) : null}
        </div>

        <div className="space-y-1">
          <p className="text-sm font-bold text-color-titulos">{criterio.pregunta}</p>
          <p className="text-[11px] italic leading-relaxed text-muted-foreground">
            {criterio.basamentoLegal}
          </p>
        </div>

        <div className="max-w-xs space-y-1.5">
          <Label className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
            Índice obtenido
          </Label>
          <LocalizedDecimalInput
            value={inputValue}
            fractionDigits={2}
            allowEmpty
            outputMode="raw"
            disabled={readOnly}
            className="h-9 w-28"
            onValueChange={(value) => onChange(value)}
          />
          {error ? (
            <p className="text-[11px] font-medium text-destructive">Indique el índice obtenido.</p>
          ) : null}
        </div>
      </div>

      <div className="border-t border-border bg-muted/30 p-4">
        <p className="mb-2 text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
          Rúbrica · {criterio.aspectoHint}
        </p>
        <RubricTable
          activeBanda={activeBanda}
          rows={[
            {
              banda: "max",
              label: labelFn("max", criterio.rangos),
              pts: criterio.rangos.puntajeMaximo,
            },
            {
              banda: "medio",
              label: labelFn("medio", criterio.rangos),
              pts: criterio.rangos.puntajeMedio,
            },
            {
              banda: "min",
              label: labelFn("min", criterio.rangos),
              pts: criterio.rangos.puntajeMinimo,
            },
          ]}
        />
        {scored ? (
          <p className="mt-3 text-right text-[11px] font-bold text-navy">+{scored.pts} pts</p>
        ) : null}
      </div>
    </div>
  );
}

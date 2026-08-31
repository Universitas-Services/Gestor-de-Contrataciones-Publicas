"use client";

import type { TresRangosMode, TresRangosValues } from "@/lib/constants/calificacionFinanciera";
import { LocalizedDecimalInput } from "@/components/localized-decimal-input";

function parseLocalized(raw: string): number {
  const normalized = raw.replace(/\./g, "").replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}

function parseOptionalPuntaje(raw: string): number | null {
  if (!raw.trim()) return null;
  const normalized = raw.replace(/\./g, "").replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

function percentHint(n: number): string {
  return `${(n * 100).toFixed(2).replace(/\.?0+$/, "")}%`;
}

interface CriterioTresRangosPanelProps {
  values: TresRangosValues;
  mode: TresRangosMode;
  aspectoLabel: string;
  aspectoHint: string;
  unitSuffix?: string;
  showPercentHint?: boolean;
  fractionDigits?: number;
  readOnly?: boolean;
  onChange: (next: TresRangosValues) => void;
}

/** Ancho fijo para alinear inputs bajo Criterio (cubre "Igual o mayor/menor a"). */
const LABEL_COL = "w-[9.5rem] shrink-0";
const INPUT_W = "h-9 w-24";

export function CriterioTresRangosPanel({
  values,
  mode,
  aspectoLabel,
  aspectoHint,
  unitSuffix,
  showPercentHint = false,
  fractionDigits = 2,
  readOnly = false,
  onChange,
}: CriterioTresRangosPanelProps) {
  const patch = (partial: Partial<TresRangosValues>) => onChange({ ...values, ...partial });

  const highLabel = mode === "ascendente" ? "Igual o mayor a" : "Igual o menor a";
  const lowLabel = mode === "ascendente" ? "Menor a" : "Mayor a";
  const suffix = unitSuffix ? ` ${unitSuffix}` : "";

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] table-fixed border-collapse text-left text-xs">
        <colgroup>
          <col className="w-[28%]" />
          <col className="w-[52%]" />
          <col className="w-[20%]" />
        </colgroup>
        <thead>
          <tr className="border-b border-border text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
            <th className="px-2 py-2">Aspecto a evaluar</th>
            <th className="px-2 py-2">Criterio</th>
            <th className="px-2 py-2">Puntajes</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-border/60">
            <td rowSpan={3} className="px-2 py-3 align-top font-semibold text-color-titulos">
              {aspectoLabel}
              <p className="mt-1 text-[10px] font-normal italic text-muted-foreground">
                {aspectoHint}
              </p>
            </td>
            <td className="px-2 py-3">
              <div className="flex items-center gap-2">
                <span className={`${LABEL_COL} font-medium`}>{highLabel}</span>
                <LocalizedDecimalInput
                  value={values.rangoMaximo}
                  fractionDigits={fractionDigits}
                  outputMode="raw"
                  disabled={readOnly}
                  className={INPUT_W}
                  onValueChange={(raw) => patch({ rangoMaximo: parseLocalized(raw) })}
                />
                {suffix ? <span className="text-muted-foreground">{suffix}</span> : null}
                {showPercentHint ? (
                  <span className="text-[10px] text-muted-foreground">
                    ({percentHint(values.rangoMaximo)})
                  </span>
                ) : null}
              </div>
            </td>
            <td className="px-2 py-3">
              <LocalizedDecimalInput
                value={values.puntajeMaximo}
                fractionDigits={0}
                max={100}
                allowEmpty
                outputMode="raw"
                disabled={readOnly}
                className={INPUT_W}
                onValueChange={(raw) => patch({ puntajeMaximo: parseOptionalPuntaje(raw) })}
              />
            </td>
          </tr>
          <tr className="border-b border-border/60">
            <td className="px-2 py-3">
              <div className="flex items-center gap-2">
                <span className={`${LABEL_COL} font-medium`}>Desde</span>
                <LocalizedDecimalInput
                  value={values.rangoMedioDesde}
                  fractionDigits={fractionDigits}
                  outputMode="raw"
                  disabled={readOnly}
                  className={INPUT_W}
                  onValueChange={(raw) => patch({ rangoMedioDesde: parseLocalized(raw) })}
                />
                <span className="w-10 shrink-0 text-center font-medium">hasta</span>
                <LocalizedDecimalInput
                  value={values.rangoMedioHasta}
                  fractionDigits={fractionDigits}
                  outputMode="raw"
                  disabled={readOnly}
                  className={INPUT_W}
                  onValueChange={(raw) => patch({ rangoMedioHasta: parseLocalized(raw) })}
                />
                {suffix ? <span className="text-muted-foreground">{suffix}</span> : null}
              </div>
            </td>
            <td className="px-2 py-3">
              <LocalizedDecimalInput
                value={values.puntajeMedio}
                fractionDigits={0}
                max={100}
                allowEmpty
                outputMode="raw"
                disabled={readOnly}
                className={INPUT_W}
                onValueChange={(raw) => patch({ puntajeMedio: parseOptionalPuntaje(raw) })}
              />
            </td>
          </tr>
          <tr>
            <td className="px-2 py-3">
              <div className="flex items-center gap-2">
                <span className={`${LABEL_COL} font-medium`}>{lowLabel}</span>
                <LocalizedDecimalInput
                  value={values.rangoMinimo}
                  fractionDigits={fractionDigits}
                  outputMode="raw"
                  disabled={readOnly}
                  className={INPUT_W}
                  onValueChange={(raw) => patch({ rangoMinimo: parseLocalized(raw) })}
                />
                {suffix ? <span className="text-muted-foreground">{suffix}</span> : null}
                {showPercentHint ? (
                  <span className="text-[10px] text-muted-foreground">
                    ({percentHint(values.rangoMinimo)})
                  </span>
                ) : null}
              </div>
            </td>
            <td className="px-2 py-3">
              <LocalizedDecimalInput
                value={values.puntajeMinimo}
                fractionDigits={0}
                max={100}
                allowEmpty
                outputMode="raw"
                disabled={readOnly}
                className={INPUT_W}
                onValueChange={(raw) => patch({ puntajeMinimo: parseOptionalPuntaje(raw) })}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

import type { ActaAdjudicacionFormValues } from "@/lib/schemas/fase4Schema";
import type { AdjudicacionPayload, AdjudicacionResponse } from "@/services/expedienteService";

export function parseDecimalInputToNumber(value: string): number {
  const normalized = value.trim().replace(/\./g, "").replace(",", ".");
  const n = Number.parseFloat(normalized);
  return Number.isFinite(n) ? n : NaN;
}

export function formatNumberToDecimalInput(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "";
  return String(value).replace(".", ",");
}

export function parseAdjudicacionApiResponse(json: unknown): AdjudicacionResponse | null {
  if (!json || typeof json !== "object") return null;

  const record = json as Record<string, unknown>;
  const raw =
    record.data != null && typeof record.data === "object"
      ? (record.data as Record<string, unknown>)
      : record;

  const montoAdjudicadoBs = raw.montoAdjudicadoBs;
  const partidaPresupuestariaGasto = raw.partidaPresupuestariaGasto;
  const montoCrsBs = raw.montoCrsBs;
  const referenciaRecomendacion = raw.referenciaRecomendacion;

  if (
    typeof montoAdjudicadoBs !== "number" ||
    typeof partidaPresupuestariaGasto !== "string" ||
    typeof montoCrsBs !== "number" ||
    typeof referenciaRecomendacion !== "string"
  ) {
    return null;
  }

  return {
    montoAdjudicadoBs,
    partidaPresupuestariaGasto,
    montoCrsBs,
    referenciaRecomendacion,
    id: typeof raw.id === "string" ? raw.id : undefined,
    expedienteId: typeof raw.expedienteId === "string" ? raw.expedienteId : undefined,
  };
}

export function toAdjudicacionPayload(values: ActaAdjudicacionFormValues): AdjudicacionPayload {
  const montoAdjudicadoBs = parseDecimalInputToNumber(values.montoContratacionConIva);
  const montoCrsBs = parseDecimalInputToNumber(values.montoResponsabilidadSocial);

  if (!Number.isFinite(montoAdjudicadoBs) || !Number.isFinite(montoCrsBs)) {
    throw new Error("Los montos ingresados no son válidos");
  }

  return {
    montoAdjudicadoBs,
    partidaPresupuestariaGasto: values.partidaPresupuestaria.trim(),
    montoCrsBs,
    referenciaRecomendacion: values.referenciaRecomendacion.trim(),
  };
}

export function toActaFormValues(data: AdjudicacionResponse): ActaAdjudicacionFormValues {
  return {
    montoContratacionConIva: formatNumberToDecimalInput(data.montoAdjudicadoBs),
    partidaPresupuestaria: data.partidaPresupuestariaGasto,
    montoResponsabilidadSocial: formatNumberToDecimalInput(data.montoCrsBs),
    referenciaRecomendacion: data.referenciaRecomendacion,
  };
}

export const ACTA_ADJUDICACION_EMPTY_VALUES: ActaAdjudicacionFormValues = {
  montoContratacionConIva: "",
  partidaPresupuestaria: "",
  montoResponsabilidadSocial: "",
  referenciaRecomendacion: "",
};

export const CAUSALES_DECLARATORIA_DESIERTO = [
  {
    value: "NINGUNA_OFERTA_PRESENTADA",
    label: "1. Ninguna oferta haya sido presentada",
    shortLabel: "1. Ninguna oferta presentada",
    apiLabel: "Ninguna oferta haya sido presentada",
  },
  {
    value: "OFERTAS_RECHAZADAS_O_DESCALIFICADAS",
    label:
      "2. Todas las ofertas resulten rechazadas o los oferentes descalificados, de conformidad con lo establecido en el pliego de condiciones",
    shortLabel: "2. Ofertas rechazadas o oferentes descalificados",
    apiLabel:
      "Todas las ofertas resulten rechazadas o los oferentes descalificados, de conformidad con lo establecido en el pliego de condiciones",
  },
  {
    value: "PERJUICIO_AL_CONTRATANTE",
    label:
      "3. Esté suficientemente justificado que de continuar el procedimiento podría causarse perjuicio al contratante",
    shortLabel: "3. Perjuicio al contratante si continúa el procedimiento",
    apiLabel:
      "Esté suficientemente justificado que de continuar el procedimiento podría causarse perjuicio al contratante",
  },
] as const;

export type CausalDeclaratoriaDesierto = (typeof CAUSALES_DECLARATORIA_DESIERTO)[number]["value"];

export function toCausalDeclaratoriaDesiertoApi(value: CausalDeclaratoriaDesierto): string {
  const found = CAUSALES_DECLARATORIA_DESIERTO.find((c) => c.value === value);
  return found?.apiLabel ?? value;
}

/** Intenta mapear el texto del API de vuelta al enum del front. */
export function fromCausalDeclaratoriaDesiertoApi(
  apiText: string | null | undefined
): CausalDeclaratoriaDesierto | "" {
  if (!apiText?.trim()) return "";
  const normalized = apiText.trim().toLowerCase();
  const found = CAUSALES_DECLARATORIA_DESIERTO.find(
    (c) =>
      c.apiLabel.toLowerCase() === normalized ||
      c.label.toLowerCase() === normalized ||
      c.value.toLowerCase() === normalized
  );
  return found?.value ?? "";
}

export function isEstatusProcesoDesierto(estatus: string | null | undefined): boolean {
  if (!estatus) return false;
  return estatus.toUpperCase().includes("DESIERTO");
}

export const INFORME_RECOMENDACION_DESIERTO_TIPO = "INFORME_RECOMENDACION_DESIERTO";

export const INFORME_RECOMENDACION_DESIERTO_LABEL =
  "Informe de recomendación (procedimiento desierto)";

export const DECLARATORIA_DESIERTO_STORAGE_PREFIX = "declaratoria-desierto:";

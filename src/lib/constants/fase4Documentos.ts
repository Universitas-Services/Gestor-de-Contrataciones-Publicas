export const FASE4_DOC_TYPES = ["ACTA_ADJUDICACION", "CONTRATO"] as const;

export type Fase4DocTipo = (typeof FASE4_DOC_TYPES)[number];

/** Mapeo de tipo de documento → segmento del endpoint de generación/preview/download */
export const FASE4_TIPO_TO_ENDPOINT: Record<string, string> = {
  ACTA_ADJUDICACION: "acta-adjudicacion",
  CONTRATO: "contrato",
};

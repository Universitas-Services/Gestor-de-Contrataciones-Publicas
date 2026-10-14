export const ADJUDICACION_TOTAL_TITLE = "Adjudicación total";
export const ADJUDICACION_TOTAL_SUBTITLE =
  "Complete los datos de adjudicación total para el oferente seleccionado.";

export const ADJUDICACION_TOTAL_FIELD_COPY = {
  partidasAdjudicadasTotalAuAu: {
    label: "Indique las partidas presupuestarias de los ítems adjudicados a este oferente.",
    legal: "Artículos 74 LCP; 21 NORMAS SUNAI.",
  },
  montoAdjudicadoTotalAuAu: {
    label:
      "Indique el monto total adjudicado resultante para la adjudicación total, coincidente con la oferta económica presentada por este oferente sin incluir el Impuesto al Valor Agregado (I.V.A.) expresado en Bolívares.",
    legal: "Artículo 95 y 109 LCP; 25 NORMAS SUNAI.",
  },
  plazoEjecucionOfertaGanadoraAuAu: {
    label:
      "Indique el plazo de ejecución o tiempo de entrega (en días) correspondiente a este oferente.",
    legal: "Artículos: 66.18 LCP; 24 (e) NORMAS DE CONTROL INTERNO SUNAI.",
  },
  montoManoObraOfertadoAuAu: {
    label: "Indique el monto de mano de obra ofertado correspondiente a este oferente.",
    legal: "",
  },
} as const;

/** Fallback mock si el expediente no tiene partidas en presupuesto. */
export const MOCK_CODIGOS_PARTIDA = [
  "4.03.01.01.00",
  "4.03.01.02.00",
  "4.04.01.01.00",
  "4.04.02.01.00",
] as const;

export function joinPartidasSeleccionadas(codigos: string[]): string {
  return codigos
    .map((c) => c.trim())
    .filter(Boolean)
    .join(", ");
}

export function parsePartidasSeleccionadas(value: string | undefined): string[] {
  if (!value?.trim()) return [];
  return value
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
}

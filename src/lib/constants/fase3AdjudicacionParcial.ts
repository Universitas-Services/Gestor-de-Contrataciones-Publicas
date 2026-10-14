export const ADJUDICACION_PARCIAL_TITLE = "Adjudicación parcial";
export const ADJUDICACION_PARCIAL_SUBTITLE =
  "Indique si el oferente será adjudicado y complete el dictamen correspondiente.";
export const ADJUDICACION_PARCIAL_DETALLE_TITLE =
  "Detalle del alcance de la adjudicación parcial a este oferente";

export const ADJUDICACION_PARCIAL_FIELD_COPY = {
  oferenteAdjudicadoProcedimientoAuAu: {
    label: "¿Este oferente será adjudicado?",
    legal: "Artículos 95, 109, 110, 111 LCP; 18.6 LOPA.",
  },
  causaNoAdjudicadoAuAu: {
    label: "Indique un resumen de la causa de No Adjudicación o Descalificación (Motivación).",
    legal: "Artículo: 9 LOPA.",
  },
  cantidadRenglonesAuAu: {
    label:
      "Indique la cantidad total de renglones o ítems adjudicados parcialmente a este oferente.",
    legal: "Artículos 109 LCP.",
  },
  alcanceAdjudicacionParcialAuAu: {
    labelFallback: "Indique el Nro. de renglones o descripción del lote asignado",
    legal: "Artículos 109 LCP; 3 NORMAS SUNAI.",
  },
  partidasAdjudicadasParcialAuAu: {
    label:
      "Indique las partidas presupuestarias de los ítems adjudicados parcialmente a este oferente.",
    legal: "Artículos 74 LCP; 21 NORMAS SUNAI.",
  },
  montoAdjudicadoParcialAuAu: {
    label:
      "Indique el monto total resultante de la sumatoria de los renglones o ítems seleccionados a este oferente sin incluir el Impuesto al Valor Agregado (I.V.A.) expresado en Bolívares.",
    legal: "Artículo 95 y 109 LCP; 21 NORMAS SUNAI.",
  },
  plazoEjecucionOfertaParcialAuAu: {
    label:
      "Indique el plazo de ejecución o tiempo de entrega (en días) correspondiente a este oferente.",
    legal: "Artículos: 66.18 LCP; 24 (e) NORMAS DE CONTROL INTERNO SUNAI.",
  },
  montoManoObraOfertadoAuAu: {
    label: "Indique el monto de mano de obra ofertado correspondiente a este oferente.",
    legal: "",
  },
} as const;

/** Label de alcance según tipo_objeto_contratacion. */
export function getAlcanceParcialLabel(tipoObjetoContratacion?: string | null): string {
  const tipo = (tipoObjetoContratacion ?? "").toLowerCase().trim();
  if (tipo.includes("bien")) return "Indique el Nro. del ítems";
  if (tipo.includes("obra")) return "Indique el Nro. de la Partidas";
  if (tipo.includes("servicio")) {
    return "Indique el Nro. del Renglones o descripción del lote asignado";
  }
  return ADJUDICACION_PARCIAL_FIELD_COPY.alcanceAdjudicacionParcialAuAu.labelFallback;
}

import type {
  PlantillaPromocion,
  PromocionEconomicaEvaluacionValues,
} from "@/types/evaluacionOferente.types";

export const PROMOCION_EVAL_TITLE = "Evaluación de medidas de promoción";
export const PROMOCION_EVAL_SUBTITLE =
  "Verifique los incentivos de Valor Agregado Nacional, preferencia local y sujeto protegido configurados en el pliego. Artículos 11 y 12 LCP.";

export const PROMOCION_ALERT =
  "Este oferente superó las evaluaciones técnica y económica. Complete los recaudos de promoción económica activados en Actividades Previas.";

export const PROMOCION_VAN_ARTICULOS =
  "Artículos 11, 13 de la Ley de Contrataciones Públicas; Artículos 9, 10 del Reglamento de la LCP.";

export const PROMOCION_LOCAL_ARTICULOS =
  "Artículo 22 de la Ley de Contrataciones Públicas; Norma 24 de las Normas de Control Interno de la SUNAI 2025.";

export const PROMOCION_SUJETO_ARTICULOS =
  "Artículo 11 de la Ley de Contrataciones Públicas; Norma 34 de las Normas de Control Interno de la SUNAI 2025.";

export const PROMOCION_VAN_CONSIGNO_LABEL =
  "¿El oferente consignó la Declaración Jurada de auto-cálculo de VAN?";

export const PROMOCION_VAN_PCT_LABEL =
  "Transcriba el porcentaje (%) de Valor Agregado Nacional (VAN) indicado por el proponente en su Declaración Jurada de auto-cálculo consignada.";

export const PROMOCION_VAN_PTS_LABEL =
  "Indique la puntuación final asignada al oferente por concepto de Valor Agregado Nacional, calculada de conformidad con la fórmula del Pliego de Condiciones.";

export const PROMOCION_LOCAL_LABEL =
  "¿El proponente demostró mediante su RIF vigente y Patente que su domicilio principal se encuentra en la jurisdicción local configurada por el Ente?";

export const PROMOCION_SUJETO_LABEL =
  "¿El proponente consignó su Certificado de Registro PyME o constancia vigente de SUNACOOP en el Sobre N° 1 para optar al incentivo de sujeto protegido?";

export function buildMockPlantillaPromocion(): PlantillaPromocion {
  return {
    activa: true,
    requiereVan: true,
    puntajeVanMax: 5,
    indPrefLocal: true,
    puntuacionBonoLocal: 8,
    indBonoSujeto: true,
    puntuacionBonoSujeto: 5,
  };
}

export function emptyPromocionFormValues(): PromocionEconomicaEvaluacionValues {
  return {
    consignoDeclaracionVan: undefined,
    valVanOferente: null,
    ptsBonoVan: null,
    aplicaPrefLocal: undefined,
    aplicaBonoSujeto: undefined,
    ptsBonoLocal: 0,
    ptsBonoSujeto: 0,
    totalPuntosPromocion: 0,
    puntuacionFinalConBonos: 0,
    calculado: false,
  };
}

export function parsePromocionDecimal(raw: string | number | null | undefined): number | null {
  if (raw === undefined || raw === null) return null;
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;
  const trimmed = String(raw).trim().replace(/\./g, "").replace(",", ".");
  if (trimmed === "") return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

export function exceedVanPtsMessage(maxPts: number): string {
  return `El puntaje asignado no puede exceder la puntuación máxima de este criterio (${maxPts} pts)`;
}

export interface PromocionBonosResult {
  ptsBonoVan: number;
  ptsBonoLocal: number;
  ptsBonoSujeto: number;
  totalPuntosPromocion: number;
  puntuacionFinalConBonos: number;
  valVanOferente: number;
  vanPtsOverMax: boolean;
  vanPctInvalid: boolean;
}

export function computePromocionBonos(
  plantilla: PlantillaPromocion,
  form: PromocionEconomicaEvaluacionValues,
  notaBase: number
): PromocionBonosResult {
  let ptsBonoVan = 0;
  let valVanOferente = 0;
  let vanPtsOverMax = false;
  let vanPctInvalid = false;

  if (plantilla.requiereVan) {
    if (form.consignoDeclaracionVan === true) {
      const pct = form.valVanOferente;
      const pts = form.ptsBonoVan;
      if (pct !== null && pct !== undefined && Number.isFinite(pct)) {
        if (pct < 0 || pct > 100) vanPctInvalid = true;
        else valVanOferente = pct;
      }
      if (pts !== null && pts !== undefined && Number.isFinite(pts)) {
        if (pts > plantilla.puntajeVanMax || pts < 0) {
          vanPtsOverMax = pts > plantilla.puntajeVanMax;
          ptsBonoVan = pts < 0 ? 0 : pts;
        } else {
          ptsBonoVan = pts;
        }
      }
    } else {
      // NO consignó o sin responder: bono VAN = 0
      ptsBonoVan = 0;
      valVanOferente = 0;
    }
  }

  const ptsBonoVanFinal = form.consignoDeclaracionVan === true ? ptsBonoVan : 0;
  const ptsBonoLocal =
    plantilla.indPrefLocal && form.aplicaPrefLocal === true ? plantilla.puntuacionBonoLocal : 0;

  const ptsBonoSujeto =
    plantilla.indBonoSujeto && form.aplicaBonoSujeto === true ? plantilla.puntuacionBonoSujeto : 0;

  const totalPuntosPromocion = ptsBonoVanFinal + ptsBonoLocal + ptsBonoSujeto;

  return {
    ptsBonoVan: ptsBonoVanFinal,
    ptsBonoLocal,
    ptsBonoSujeto,
    totalPuntosPromocion,
    puntuacionFinalConBonos: notaBase + totalPuntosPromocion,
    valVanOferente: form.consignoDeclaracionVan === true ? valVanOferente : 0,
    vanPtsOverMax: form.consignoDeclaracionVan === true && vanPtsOverMax,
    vanPctInvalid: form.consignoDeclaracionVan === true && vanPctInvalid,
  };
}

export function applyComputedToForm(
  form: PromocionEconomicaEvaluacionValues,
  computed: PromocionBonosResult,
  calculado = true
): PromocionEconomicaEvaluacionValues {
  return {
    ...form,
    ptsBonoLocal: computed.ptsBonoLocal,
    ptsBonoSujeto: computed.ptsBonoSujeto,
    totalPuntosPromocion: computed.totalPuntosPromocion,
    puntuacionFinalConBonos: computed.puntuacionFinalConBonos,
    calculado,
  };
}

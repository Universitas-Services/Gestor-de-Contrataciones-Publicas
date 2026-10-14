import { SNC_DEFAULTS } from "@/lib/constants/calificacionFinanciera";
import type {
  BandaFinanciera,
  CalificacionFinancieraEvaluacionValues,
  ChecklistSiNo,
  CriterioFinancieroPlantilla,
  CriterioFinancieroRespuesta,
  PlantillaFinanciera,
  TresRangosPlantilla,
} from "@/types/evaluacionOferente.types";

export const CALIFICACION_FINANCIERA_EVAL_TITLE = "Calificación financiera";
export const CALIFICACION_FINANCIERA_EVAL_SUBTITLE =
  "Ingrese los resultados de los estados financieros del oferente. El sistema calculará automáticamente la puntuación en base a la rúbrica configurada en el pliego. Quedará calificado si su puntuación supera el umbral mínimo de aprobación.";

export const CALIFICACION_FINANCIERA_JUSTIFICACION_ARTICULOS =
  "Artículos 95 LCP; 18.4 LOPA; 16 Normas SUNAI";

export const CALIFICACION_FINANCIERA_JUSTIF_CUMPLE =
  "Indique una breve justificación del porqué cumplió con la calificación financiera este oferente.";

export const CALIFICACION_FINANCIERA_JUSTIF_NO_CUMPLE =
  "Indique una breve justificación del porqué No cumplió con la calificación financiera este oferente.";

export const CALIFICACION_FINANCIERA_JUSTIFICACION_MAX = 1000;
export const TOTAL_PUNTOS_FINANCIERA = 100;

function cloneRangos(r: TresRangosPlantilla): TresRangosPlantilla {
  return { ...r };
}

/** Plantilla mock: 6 criterios activos con puntajes SNC (suma máximos = 100). */
export function buildMockPlantillaFinanciera(): PlantillaFinanciera {
  return {
    puntuacionMinima: SNC_DEFAULTS.puntuacionMinima,
    criterios: [
      {
        id: "descapital",
        kind: "descapital",
        titulo: "Proceso de Descapitalización",
        pregunta:
          "Indique si el proponente se encuentra en proceso de descapitalización de conformidad con la planilla resumen del RNC o sus estados financieros presentados.",
        basamentoLegal:
          "Artículo 67 del Reglamento de la Ley de Contrataciones Públicas; Providencias del Servicio Nacional de Contratistas (SNC).",
        puntajeMaximo: SNC_DEFAULTS.descapitalPuntaje,
      },
      {
        id: "solvencia",
        kind: "indice",
        titulo: "Solvencia (Activo Circulante / Pasivo Circulante)",
        pregunta:
          "Indique el resultado numérico obtenido en el Índice de Solvencia (Activo Circulante/Pasivo Circulante) para este oferente.",
        basamentoLegal:
          "Artículo 67 del Reglamento de la Ley de Contrataciones Públicas; Parámetros de Calificación Financiera del SNC.",
        aspectoHint: "Activo Circulante / Pasivo Circulante",
        mode: "ascendente",
        rangos: cloneRangos(SNC_DEFAULTS.solvencia),
      },
      {
        id: "rotacion",
        kind: "indice",
        titulo: "Rotación Cuentas por Cobrar (Ventas / CxC)",
        pregunta:
          "Indique el resultado numérico obtenido en el Índice de Rotación de Cuentas por Cobrar (Ventas / Cuentas por Cobrar) para este oferente.",
        basamentoLegal:
          "Artículo 67 del Reglamento de la Ley de Contrataciones Públicas; Parámetros de Calificación Financiera del SNC.",
        aspectoHint: "Ventas / Cuentas por Cobrar",
        mode: "ascendente",
        rangos: cloneRangos(SNC_DEFAULTS.rotacion),
      },
      {
        id: "rendimiento",
        kind: "indice",
        titulo: "Rendimiento sobre Activos ROA",
        pregunta:
          "Indique el resultado numérico obtenido en el Rendimiento sobre Activos ROA (Utilidad Neta/Activo Total) para este oferente.",
        basamentoLegal:
          "Artículo 67 del Reglamento de la Ley de Contrataciones Públicas; Parámetros de Calificación Financiera del SNC.",
        aspectoHint: "Utilidad Neta / Activo Total",
        mode: "ascendente",
        rangos: cloneRangos(SNC_DEFAULTS.rendimiento),
      },
      {
        id: "rentabilidad",
        kind: "indice",
        titulo: "Rentabilidad del Patrimonio (ROE)",
        pregunta:
          "Indique el resultado numérico obtenido en la Rentabilidad del Patrimonio (ROE) para este proponente.",
        basamentoLegal:
          "Artículo 67 del Reglamento de la Ley de Contrataciones Públicas; Parámetros de Calificación Financiera del SNC.",
        aspectoHint: "Utilidad Neta / Patrimonio",
        mode: "ascendente",
        rangos: cloneRangos(SNC_DEFAULTS.rentabilidad),
      },
      {
        id: "endeudamiento",
        kind: "indice",
        titulo: "Endeudamiento (Pasivo Total / Activo Total)",
        pregunta:
          "Indique el resultado numérico obtenido en el Índice de Endeudamiento (Pasivo Total/Activo Total) para este oferente.",
        basamentoLegal:
          "Artículo 67 del Reglamento de la Ley de Contrataciones Públicas; Parámetros de Calificación Financiera del SNC.",
        aspectoHint: "Pasivo Total / Activo Total",
        mode: "inverso",
        rangos: cloneRangos(SNC_DEFAULTS.endeudamiento),
      },
    ],
  };
}

export function emptyFinancieraFormValues(
  plantilla: PlantillaFinanciera
): CalificacionFinancieraEvaluacionValues {
  const criterios: Record<string, CriterioFinancieroRespuesta> = {};
  for (const c of plantilla.criterios) {
    criterios[c.id] = { valor: undefined };
  }
  return { criterios, justificacion: "" };
}

export function parseIndiceValor(raw: string | undefined): number | null {
  if (raw === undefined || raw === null) return null;
  const trimmed = String(raw).trim().replace(",", ".");
  if (trimmed === "") return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

export function scoreDescapital(
  valor: ChecklistSiNo | undefined,
  puntajeMaximo: number
): { pts: number; banda: BandaFinanciera } | null {
  if (valor !== "SI" && valor !== "NO") return null;
  if (valor === "SI") return { pts: 0, banda: "min" };
  return { pts: puntajeMaximo, banda: "max" };
}

/**
 * Ascendente (doc): >= rangoMaximo → max; else >= rangoMinimo → medio; else → mínimo.
 */
export function scoreAscendente(
  valor: number,
  rangos: TresRangosPlantilla
): { pts: number; banda: BandaFinanciera } {
  if (valor >= rangos.rangoMaximo) return { pts: rangos.puntajeMaximo, banda: "max" };
  if (valor >= rangos.rangoMinimo) return { pts: rangos.puntajeMedio, banda: "medio" };
  return { pts: rangos.puntajeMinimo, banda: "min" };
}

/**
 * Inverso / endeudamiento (doc): <= rangoMaximo → max; else <= rangoMinimo → medio; else → mínimo.
 */
export function scoreInverso(
  valor: number,
  rangos: TresRangosPlantilla
): { pts: number; banda: BandaFinanciera } {
  if (valor <= rangos.rangoMaximo) return { pts: rangos.puntajeMaximo, banda: "max" };
  if (valor <= rangos.rangoMinimo) return { pts: rangos.puntajeMedio, banda: "medio" };
  return { pts: rangos.puntajeMinimo, banda: "min" };
}

export function scoreCriterio(
  criterio: CriterioFinancieroPlantilla,
  respuesta: CriterioFinancieroRespuesta | undefined
): { pts: number; banda: BandaFinanciera } | null {
  if (criterio.kind === "descapital") {
    const v = respuesta?.valor;
    if (v !== "SI" && v !== "NO") return null;
    return scoreDescapital(v, criterio.puntajeMaximo);
  }
  const num = parseIndiceValor(typeof respuesta?.valor === "string" ? respuesta.valor : undefined);
  if (num === null) return null;
  return criterio.mode === "inverso"
    ? scoreInverso(num, criterio.rangos)
    : scoreAscendente(num, criterio.rangos);
}

export function isCriterioRespondido(
  criterio: CriterioFinancieroPlantilla,
  respuesta: CriterioFinancieroRespuesta | undefined
): boolean {
  return scoreCriterio(criterio, respuesta) !== null;
}

export function computeFinancieraTotal(
  plantilla: PlantillaFinanciera,
  criterios: Record<string, CriterioFinancieroRespuesta>
): { total: number; allAnswered: boolean; cumple: boolean | null } {
  let total = 0;
  let allAnswered = true;
  for (const c of plantilla.criterios) {
    const scored = scoreCriterio(c, criterios[c.id]);
    if (!scored) {
      allAnswered = false;
      continue;
    }
    total += scored.pts;
  }
  total = Math.round(total * 100) / 100;
  const cumple = allAnswered ? total >= plantilla.puntuacionMinima : null;
  return { total, allAnswered, cumple };
}

export function formatRangoAscendenteLabel(
  banda: BandaFinanciera,
  rangos: TresRangosPlantilla
): string {
  if (banda === "max") return `Mayor o igual a ${formatNum(rangos.rangoMaximo)}`;
  if (banda === "medio")
    return `Entre ${formatNum(rangos.rangoMedioDesde)} y ${formatNum(rangos.rangoMedioHasta)}`;
  return `Menor a ${formatNum(rangos.rangoMinimo)}`;
}

export function formatRangoInversoLabel(
  banda: BandaFinanciera,
  rangos: TresRangosPlantilla
): string {
  if (banda === "max") return `Menor o igual a ${formatNum(rangos.rangoMaximo)}`;
  if (banda === "medio")
    return `Entre ${formatNum(rangos.rangoMedioDesde)} y ${formatNum(rangos.rangoMedioHasta)}`;
  return `Mayor a ${formatNum(rangos.rangoMinimo)}`;
}

function formatNum(n: number): string {
  return new Intl.NumberFormat("es-VE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  }).format(n);
}

import type {
  CalificacionEvaluacionTecnicaPayload,
  CalificacionPayload,
  ChecklistSiNo,
  Sobre2EvaluacionPayload,
} from "@/types/evaluacionFase3.types";

export const CRITERIOS_MATRIZ_MAX = [15, 15, 10, 15] as const;

export const CRITERIOS_MATRIZ_POR_TIPO: Record<"BIENES" | "SERVICIOS" | "OBRAS", string[]> = {
  BIENES: [
    "Tiempo de entrega a partir de la recepción de la Orden de compra.",
    "Garantía, Canje o Sustitución de los Bienes / insumos.",
    "Especificaciones Técnicas de los Bienes / insumos",
    "Disponibilidad de los Bienes / insumos requeridos.",
  ],
  SERVICIOS: [
    "Ejecución del servicio.",
    "Experiencia en prestación del servicio.",
    "Maquinarias, Equipos y Herramientas disponibles.",
    "Tiempo de respuesta ante fallas.",
  ],
  OBRAS: [
    "Ejecución del Servicio.",
    "Maquinaria, Equipos y herramientas disponibles.",
    "Experiencia del personal técnico clave (Ingeniero Residente).",
    "Plan de trabajo y Cronograma de ejecución.",
  ],
};

export function getCriteriosMatrizPorTipo(tipoContratacion: string | undefined | null): string[] {
  const key = (tipoContratacion ?? "").toUpperCase();
  if (key === "BIENES" || key === "SERVICIOS" || key === "OBRAS") {
    return CRITERIOS_MATRIZ_POR_TIPO[key];
  }
  return CRITERIOS_MATRIZ_POR_TIPO.BIENES;
}

export const OPCIONES_PRELACION_DEFAULT = [
  "Primera opción",
  "Segunda opción",
  "Tercera opción",
  "Cuarta opción",
  "Quinta opción",
  "Sexta opción",
] as const;

export interface CalificacionFormState {
  oferenteCalificadoLegal: ChecklistSiNo | undefined;
  justificacionCalificadoLegal: string;
  indiceLiquidez: string;
  indiceSolvencia: string;
  oferenteCalificadoFinanciera: ChecklistSiNo | undefined;
  justificacionCalificadaFinanciera: string;
  actividadComercial: string;
  relacionSuministros: string;
  referenciasComercialesPuntaje: string;
  oferenteCalificadoTecnica: ChecklistSiNo | undefined;
  justificacionCalificadoTecnica: string;
  oferenteCalificado: ChecklistSiNo | undefined;
  motivoDescalificacion: string;
  itemsDescalificacion: string;
}

export function emptyCalificacionFormState(): CalificacionFormState {
  return {
    oferenteCalificadoLegal: undefined,
    justificacionCalificadoLegal: "",
    indiceLiquidez: "",
    indiceSolvencia: "",
    oferenteCalificadoFinanciera: undefined,
    justificacionCalificadaFinanciera: "",
    actividadComercial: "",
    relacionSuministros: "",
    referenciasComercialesPuntaje: "",
    oferenteCalificadoTecnica: undefined,
    justificacionCalificadoTecnica: "",
    oferenteCalificado: undefined,
    motivoDescalificacion: "",
    itemsDescalificacion: "",
  };
}

function toBool(v: ChecklistSiNo | undefined): boolean {
  return v === "SI";
}

function parseNum(v: string, fallback = 0): number {
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
}

function clamp0_100(n: number): number {
  if (n < 0) return 0;
  if (n > 100) return 100;
  return n;
}

export function buildCalificacionPayload(state: CalificacionFormState): CalificacionPayload {
  const califica = toBool(state.oferenteCalificado);
  return {
    oferenteCalificadoLegal: toBool(state.oferenteCalificadoLegal),
    justificacionCalificadoLegal: state.justificacionCalificadoLegal.trim(),
    indiceLiquidez: clamp0_100(parseNum(state.indiceLiquidez)),
    indiceSolvencia: clamp0_100(parseNum(state.indiceSolvencia)),
    oferenteCalificadoFinanciera: toBool(state.oferenteCalificadoFinanciera),
    justificacionCalificadaFinanciera: state.justificacionCalificadaFinanciera.trim(),
    actividadComercial: clamp0_100(parseNum(state.actividadComercial)),
    relacionSuministros: clamp0_100(parseNum(state.relacionSuministros)),
    referenciasComercialesPuntaje: clamp0_100(parseNum(state.referenciasComercialesPuntaje)),
    oferenteCalificadoTecnica: toBool(state.oferenteCalificadoTecnica),
    justificacionCalificadoTecnica: state.justificacionCalificadoTecnica.trim(),
    oferenteCalificado: califica,
    motivoDescalificacion: califica ? "" : state.motivoDescalificacion.trim(),
    itemsDescalificacion: califica ? "" : state.itemsDescalificacion.trim(),
  };
}

function boolToSiNo(v: unknown): ChecklistSiNo | undefined {
  if (v === true) return "SI";
  if (v === false) return "NO";
  return undefined;
}

function numToStr(v: unknown): string {
  if (v === null || v === undefined || v === "") return "";
  const n = Number(v);
  return Number.isFinite(n) ? String(n) : "";
}

/** Hidrata el form de calificación desde la raíz de la evaluación o un objeto anidado. */
export function hydrateCalificacionFromApi(
  data: Record<string, unknown> | null | undefined
): CalificacionFormState {
  const base = emptyCalificacionFormState();
  if (!data) return base;

  const src =
    data.calificacion && typeof data.calificacion === "object"
      ? (data.calificacion as Record<string, unknown>)
      : data;

  return {
    oferenteCalificadoLegal: boolToSiNo(src.oferenteCalificadoLegal),
    justificacionCalificadoLegal: String(src.justificacionCalificadoLegal ?? ""),
    indiceLiquidez: numToStr(src.indiceLiquidez),
    indiceSolvencia: numToStr(src.indiceSolvencia),
    oferenteCalificadoFinanciera: boolToSiNo(src.oferenteCalificadoFinanciera),
    justificacionCalificadaFinanciera: String(src.justificacionCalificadaFinanciera ?? ""),
    actividadComercial: numToStr(src.actividadComercial),
    relacionSuministros: numToStr(src.relacionSuministros),
    referenciasComercialesPuntaje: numToStr(src.referenciasComercialesPuntaje),
    oferenteCalificadoTecnica: boolToSiNo(src.oferenteCalificadoTecnica),
    justificacionCalificadoTecnica: String(src.justificacionCalificadoTecnica ?? ""),
    oferenteCalificado: boolToSiNo(src.oferenteCalificado),
    motivoDescalificacion: String(src.motivoDescalificacion ?? ""),
    itemsDescalificacion: String(src.itemsDescalificacion ?? ""),
  };
}

export interface MatrizFormState {
  puntuaciones: [number, number, number, number];
  oferenteEvaluadoTecnico: ChecklistSiNo | undefined;
  justificacionEvaluadoTecnico: string;
  montoOfertaBs: string;
  porcentajeVan: string;
  posicionPrelacion: string;
}

export function emptyMatrizFormState(): MatrizFormState {
  return {
    puntuaciones: [0, 0, 0, 0],
    oferenteEvaluadoTecnico: undefined,
    justificacionEvaluadoTecnico: "",
    montoOfertaBs: "",
    porcentajeVan: "",
    posicionPrelacion: "",
  };
}

export function hydrateMatrizFromApi(
  data: Record<string, unknown> | null | undefined
): MatrizFormState {
  const base = emptyMatrizFormState();
  if (!data) return base;

  const sobre2 =
    data.sobre2 && typeof data.sobre2 === "object"
      ? (data.sobre2 as Record<string, unknown>)
      : data;

  const p1 = Number(sobre2.puntuacionCriterio1 ?? 0);
  const p2 = Number(sobre2.puntuacionCriterio2 ?? 0);
  const p3 = Number(sobre2.puntuacionCriterio3 ?? 0);
  const p4 = Number(sobre2.puntuacionCriterio4 ?? 0);

  const monto = sobre2.montoOfertaBs ?? data.montoOfertaBs;

  return {
    puntuaciones: [
      Number.isFinite(p1) ? p1 : 0,
      Number.isFinite(p2) ? p2 : 0,
      Number.isFinite(p3) ? p3 : 0,
      Number.isFinite(p4) ? p4 : 0,
    ],
    oferenteEvaluadoTecnico: boolToSiNo(
      sobre2.oferenteEvaluadoTecnico ?? data.oferenteEvaluadoTecnico
    ),
    justificacionEvaluadoTecnico: String(
      sobre2.justificacionEvaluadoTecnico ?? data.justificacionEvaluadoTecnico ?? ""
    ),
    montoOfertaBs: monto === null || monto === undefined || monto === "" ? "" : String(monto),
    porcentajeVan: numToStr(sobre2.porcentajeVan ?? data.porcentajeVan),
    posicionPrelacion: String(sobre2.posicionPrelacion ?? data.posicionPrelacion ?? ""),
  };
}

function clampMax(n: number, max: number): number {
  if (n < 0) return 0;
  if (n > max) return max;
  return n;
}

export function buildSobre2EvaluacionPayload(
  criterios: string[],
  state: MatrizFormState,
  includeVan: boolean
): Sobre2EvaluacionPayload {
  const [c1, c2, c3, c4] = criterios;
  const [p1, p2, p3, p4] = state.puntuaciones;

  const cleanMonto =
    typeof state.montoOfertaBs === "string"
      ? state.montoOfertaBs.replace(/\./g, "").replace(",", ".")
      : String(state.montoOfertaBs);

  const payload: Sobre2EvaluacionPayload = {
    criterio1Evaluacion: c1 ?? "",
    puntuacionCriterio1: clampMax(p1, CRITERIOS_MATRIZ_MAX[0]),
    criterio2Evaluacion: c2 ?? "",
    puntuacionCriterio2: clampMax(p2, CRITERIOS_MATRIZ_MAX[1]),
    criterio3Evaluacion: c3 ?? "",
    puntuacionCriterio3: clampMax(p3, CRITERIOS_MATRIZ_MAX[2]),
    criterio4Evaluacion: c4 ?? "",
    puntuacionCriterio4: clampMax(p4, CRITERIOS_MATRIZ_MAX[3]),
    montoOfertaBs: parseFloat(cleanMonto) || 0,
    posicionPrelacion: state.posicionPrelacion,
    oferenteCalificado: true,
    motivoDescalificacion: "",
  };

  if (includeVan) {
    payload.porcentajeVan = clamp0_100(parseNum(state.porcentajeVan));
  }

  return payload;
}

export function buildCalificacionEvaluacionTecnicaPayload(
  state: MatrizFormState
): CalificacionEvaluacionTecnicaPayload {
  return {
    oferenteEvaluadoTecnico: toBool(state.oferenteEvaluadoTecnico),
    justificacionEvaluadoTecnico: state.justificacionEvaluadoTecnico.trim(),
  };
}

export type EvaluacionTecnicaEconomicaFormStatus = "draft" | "completed";

export type EvaluacionLado = "tecnica" | "economica";

export interface RangoEvalTecnica {
  id: string;
  rangoCriterioEvaluacionTecnicaAuAu: string;
  puntuacionRangoCriterioEvaluacionTecnicaAuAu: number;
}

export interface CriterioEvalTecnica {
  id: string;
  criterioEvaluacionTecnicaAuAu: string;
  puntuacionCriterioEvaluacionTecnicaAuAu: number;
  descCriterioEvaluacionTecnicaAuAu: string;
  rangos: RangoEvalTecnica[];
}

export interface RangoEvalEconomica {
  id: string;
  rangoCriterioEvaluacionEconomicaAuAu: string;
  puntuacionRangoCriterioEvaluacionEconomicaAuAu: number;
}

export interface CriterioEvalEconomica {
  id: string;
  criterioEvaluacionEconomicaAuAu: string;
  puntuacionCriterioEvaluacionEconomicaAuAu: number;
  descCriterioEvaluacionEconomicaAuAu: string;
  rangos: RangoEvalEconomica[];
}

export interface EvaluacionTecnicaEconomicaFormValues {
  criteriosTecnicos: CriterioEvalTecnica[];
  puntuacionMinimaEvaluacionTecnicaAuAu: number;
  criteriosEconomicos: CriterioEvalEconomica[];
  puntuacionMinimaEvaluacionEconomicaAuAu: number;
}

export interface EvaluacionTecnicaEconomicaStoredForm {
  values: EvaluacionTecnicaEconomicaFormValues;
  status: EvaluacionTecnicaEconomicaFormStatus;
}

export const EVALUACION_TE_WIZARD_TITLE = "Matriz de Evaluación Técnica y Económica";

export const EVALUACION_TE_EMPTY_TECNICA_TITLE = "Sin criterios técnicos";
export const EVALUACION_TE_EMPTY_TECNICA_DESCRIPTION =
  "Agregue criterios técnicos. La bolsa compartida (técnica + económica) debe sumar exactamente 100 puntos.";
export const EVALUACION_TE_EMPTY_ECONOMICA_TITLE = "Sin criterios económicos";
export const EVALUACION_TE_EMPTY_ECONOMICA_DESCRIPTION =
  "Agregue criterios económicos. La bolsa compartida (técnica + económica) debe sumar exactamente 100 puntos.";

export const EVALUACION_TE_DRAFT_LABEL = "Guardar borrador";
export const EVALUACION_TE_SUBMIT_LABEL = "Guardar Matriz Completa";
export const EVALUACION_TE_SUBMIT_DISABLED_HINT =
  "Distribuye los 100 puntos de la bolsa compartida entre ambas pestañas (la asignación no puede ser 100/0 o 0/100) para poder avanzar.";

export const EVALUACION_TE_SUCCESS_TITLE = "Matriz de evaluación guardada";
export const EVALUACION_TE_SUCCESS_DESCRIPTION =
  "La matriz de evaluación técnica y económica ha sido configurada exitosamente.";

export const EVALUACION_TE_TOTAL_EXACT_MESSAGE =
  "La suma de la bolsa compartida (técnica + económica) debe ser exactamente 100 puntos.";
export const EVALUACION_TE_BOTH_SIDES_MESSAGE =
  "Debe asignar puntos a ambas evaluaciones (técnica y económica); no se admite 100/0 ni 0/100.";
export const EVALUACION_TE_CRITERIO_MAX_MESSAGE =
  "La ponderación de un criterio no puede ser 100; reserve puntos para la otra evaluación.";

export const CRITERIO_NOMBRE_MAX = 255;
export const CRITERIO_DESC_MAX = 500;
export const RANGO_TECNICA_TEXTO_MAX = 255;
export const RANGO_ECONOMICA_TEXTO_MAX = 500;
export const TOTAL_PUNTOS_OBJETIVO = 100;
/** Máximo por criterio individual (deja al menos 1 pt para la otra pestaña). */
export const PUNTUACION_CRITERIO_MAX = 99;

export const FIELD_COPY = {
  tecnica: {
    nombre: {
      label:
        "Defina el nombre del criterio técnico que se utilizará para evaluar la propuesta de los oferentes. (Ejemplos sugeridos para el usuario: Tiempo de entrega; Plazo de ejecución; Garantía técnica extendida; Rendimiento de insumos).",
      legal: "Artículos 95 y 109 LCP; 24 Literal b NORMAS DE CONTROL INTERNO SUNAI.",
    },
    ponderacion: {
      label:
        "Indique el puntaje máximo (peso) que se le otorgará a este criterio dentro de la evaluación técnica.",
      legal: "Artículos 95 y 109 LCP; 24 Literal b NORMAS DE CONTROL INTERNO SUNAI.",
    },
    descripcion: {
      label:
        "Redacta una descripción detallada o texto explicativo que defina el contenido de este criterio de evaluación técnica.",
      legal:
        'Artículos 95 y 109 de la Ley de Contrataciones Públicas; Artículo 18, Numeral 4 de la LOPA; Artículo 24, Literal "b" de las Normas de Control Interno de la SUNAI 2025.',
    },
    rango: {
      label:
        "Establezca la escala o rango de cumplimiento requerido para la asignación de este criterio e indique el puntaje específico que obtendrá el oferente al satisfacer dicha condición.",
      legal: "Artículos 95 y 109 LCP; 24 Literal b NORMAS DE CONTROL INTERNO SUNAI.",
    },
    umbral: {
      label:
        "Establezca la puntuación mínima requerida (umbral de calidad) que la propuesta debe alcanzar para ser declarada 'Técnicamente Válida' y proceder a la evaluación de la oferta económica.",
      legal: "Artículos 95 y 109 LCP; 16 y 24 Literal b NORMAS DE CONTROL INTERNO SUNAI.",
    },
    totalSeccion: {
      label: "Puntuación total asignada a la Evaluación Técnica.",
      legal: "Artículos 95 LCP; 21 de las Normas de Control Interno SUNAI.",
    },
  },
  economica: {
    nombre: {
      label:
        "Defina el nombre del criterio económico que se utilizará para evaluar la propuesta de los oferentes.",
      legal: "Artículos 95 y 109 de la LCP; 21 de las Normas de Control Interno SUNAI.",
    },
    ponderacion: {
      label:
        "Indique el puntaje máximo (peso) que se le otorgará a este criterio dentro de la evaluación económica.",
      legal: "Artículos 95 LCP; Artículo 11 de las Normas de Control Interno SUNAI.",
    },
    descripcion: {
      label:
        "Redacta una descripción detallada o texto explicativo que defina el contenido de este criterio de evaluación económica.",
      legal:
        "Artículos 95 y 109 de la Ley de Contrataciones Públicas; Artículo 21 de las Normas de Control Interno de la SUNAI 2025.",
    },
    rango: {
      label:
        "Establezca la escala o rango de cumplimiento requerido para la asignación de este criterio e indique el puntaje específico que obtendrá el oferente al satisfacer dicha condición.",
      legal: "Artículos 95 y 109 LCP; 21 de las Normas de Control Interno SUNAI.",
    },
    umbral: {
      label:
        "Establezca la puntuación mínima aprobatoria (umbral de corte) que la propuesta debe alcanzar para ser declarada 'Económicamente Válida'.",
      legal: "Artículos 95 y 113 LCP; 21 de las Normas de Control Interno SUNAI.",
    },
    totalSeccion: {
      label: "Puntuación total asignada a la Evaluación Económica.",
      legal: "Artículos 95 LCP; 21 de las Normas de Control Interno SUNAI.",
    },
  },
} as const;

export function getEvaluacionTecnicaEconomicaFormStorageKey(expedienteId: string): string {
  return `evaluacion-tecnica-economica-form:${expedienteId}`;
}

export function createId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createEmptyRangoTecnica(): RangoEvalTecnica {
  return {
    id: createId(),
    rangoCriterioEvaluacionTecnicaAuAu: "",
    puntuacionRangoCriterioEvaluacionTecnicaAuAu: 0,
  };
}

export function createEmptyCriterioTecnica(): CriterioEvalTecnica {
  return {
    id: createId(),
    criterioEvaluacionTecnicaAuAu: "",
    puntuacionCriterioEvaluacionTecnicaAuAu: 0,
    descCriterioEvaluacionTecnicaAuAu: "",
    rangos: [createEmptyRangoTecnica()],
  };
}

export function createEmptyRangoEconomica(): RangoEvalEconomica {
  return {
    id: createId(),
    rangoCriterioEvaluacionEconomicaAuAu: "",
    puntuacionRangoCriterioEvaluacionEconomicaAuAu: 0,
  };
}

export function createEmptyCriterioEconomica(): CriterioEvalEconomica {
  return {
    id: createId(),
    criterioEvaluacionEconomicaAuAu: "",
    puntuacionCriterioEvaluacionEconomicaAuAu: 0,
    descCriterioEvaluacionEconomicaAuAu: "",
    rangos: [createEmptyRangoEconomica()],
  };
}

export function createDefaultEvaluacionTecnicaEconomicaValues(): EvaluacionTecnicaEconomicaFormValues {
  return {
    criteriosTecnicos: [],
    puntuacionMinimaEvaluacionTecnicaAuAu: 0,
    criteriosEconomicos: [],
    puntuacionMinimaEvaluacionEconomicaAuAu: 0,
  };
}

export function sumPonderacionesTecnicas(criterios: CriterioEvalTecnica[]): number {
  return criterios.reduce(
    (acc, c) => acc + (Number(c.puntuacionCriterioEvaluacionTecnicaAuAu) || 0),
    0
  );
}

export function sumPonderacionesEconomicas(criterios: CriterioEvalEconomica[]): number {
  return criterios.reduce(
    (acc, c) => acc + (Number(c.puntuacionCriterioEvaluacionEconomicaAuAu) || 0),
    0
  );
}

export function roundPts(n: number): number {
  return Math.round(n * 100) / 100;
}

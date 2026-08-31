export type CalificacionTecnicaFormStatus = "draft" | "completed";

export interface RangoTecnico {
  id: string;
  rangoCriterioCalificacionTecnicaAuAu: string;
  puntuacionRangoCriterioCalificacionTecnicaAuAu: number;
}

export interface CriterioTecnico {
  id: string;
  criterioCalificacionTecnicaAuAu: string;
  puntuacionCriterioCalificacionTecnicaAuAu: number;
  descCriterioCalificacionTecnicaAuAu: string;
  rangos: RangoTecnico[];
}

export interface CalificacionTecnicaFormValues {
  criterios: CriterioTecnico[];
  puntuacionMinimaCalifTecnicaAuAu: number;
}

export interface CalificacionTecnicaStoredForm {
  values: CalificacionTecnicaFormValues;
  status: CalificacionTecnicaFormStatus;
}

export const CALIFICACION_TECNICA_WIZARD_TITLE = "Matriz calificación técnica";

export const CALIFICACION_TECNICA_EMPTY_TITLE = "La matriz técnica está vacía";
export const CALIFICACION_TECNICA_EMPTY_DESCRIPTION =
  "Agregue criterios técnicos hasta que la suma de sus ponderaciones sea exactamente 100 puntos.";

export const CALIFICACION_TECNICA_DRAFT_LABEL = "Guardar borrador";
export const CALIFICACION_TECNICA_SUBMIT_LABEL = "Guardar Calificación Técnica";
export const CALIFICACION_TECNICA_SUBMIT_DISABLED_HINT =
  "Faltan o sobran puntos. Alcanza exactamente los 100 puntos para habilitar esta acción.";

export const CALIFICACION_TECNICA_SUCCESS_TITLE = "Calificación técnica guardada";
export const CALIFICACION_TECNICA_SUCCESS_DESCRIPTION =
  "La matriz de calificación técnica ha sido configurada exitosamente.";

export const CALIFICACION_TECNICA_TOTAL_EXACT_MESSAGE =
  "La suma de las ponderaciones de los criterios técnicos debe ser exactamente 100 puntos.";

export const CRITERIO_NOMBRE_MAX = 255;
export const CRITERIO_DESC_MAX = 500;
export const RANGO_TEXTO_MAX = 255;
export const TOTAL_PUNTOS_OBJETIVO = 100;

export const FIELD_COPY = {
  nombre: {
    label:
      "Defina el nombre del criterio técnico que se utilizará para calificar la especialidad y capacidad del oferente (Ejemplo: Experiencia acumulada en proyectos de infraestructura hidráulica; Disponibilidad de maquinaria pesada propia; Perfil académico del personal clave).",
    legal:
      "Artículos 65 de la LCP; 68 del Reglamento de la LCP; 16 de las NORMAS DE CONTROL INTERNO SUNAI.",
  },
  ponderacion: {
    label: "Establezca la ponderación máxima (puntaje) asignada a este criterio técnico.",
    legal: "Artículos 65 de la LCP; 68 del Reglamento de la LCP.",
  },
  descripcion: {
    label:
      "Redacta una descripción detallada o texto explicativo que defina el contenido de este criterio de calificación técnica.",
    legal:
      "Artículos 65 de la Ley de Contrataciones Públicas; 68 del Reglamento de la Ley de Contrataciones Públicas; 16 de las Normas de Control Interno de la SUNAI 2025.",
  },
  rango: {
    label:
      "Establezca la escala o rango de cumplimiento requerido para la asignación de este criterio e indique el puntaje específico que obtendrá el oferente al satisfacer dicha condición.",
    legal: "Artículos 65 de la LCP; 68 del Reglamento de la LCP.",
  },
  umbral: {
    label:
      "Establezca la puntuación mínima aprobatoria (umbral de corte) que el oferente debe alcanzar en la Calificación Técnica para ser declarado 'APTO' y proceder a la evaluación de su oferta técnica y económica.",
    legal:
      "Artículo 68 del Reglamento de la Ley de Contrataciones Públicas (RLCP); 16 de las Normas de Control Interno de la SUNAI.",
  },
} as const;

export function getCalificacionTecnicaFormStorageKey(expedienteId: string): string {
  return `calificacion-tecnica-form:${expedienteId}`;
}

export function createId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createEmptyRango(): RangoTecnico {
  return {
    id: createId(),
    rangoCriterioCalificacionTecnicaAuAu: "",
    puntuacionRangoCriterioCalificacionTecnicaAuAu: 0,
  };
}

export function createEmptyCriterio(): CriterioTecnico {
  return {
    id: createId(),
    criterioCalificacionTecnicaAuAu: "",
    puntuacionCriterioCalificacionTecnicaAuAu: 0,
    descCriterioCalificacionTecnicaAuAu: "",
    rangos: [createEmptyRango()],
  };
}

export function createDefaultCalificacionTecnicaValues(): CalificacionTecnicaFormValues {
  return {
    criterios: [],
    puntuacionMinimaCalifTecnicaAuAu: 0,
  };
}

export function sumPonderaciones(criterios: CriterioTecnico[]): number {
  return criterios.reduce(
    (acc, c) => acc + (Number(c.puntuacionCriterioCalificacionTecnicaAuAu) || 0),
    0
  );
}

export function roundPts(n: number): number {
  return Math.round(n * 100) / 100;
}

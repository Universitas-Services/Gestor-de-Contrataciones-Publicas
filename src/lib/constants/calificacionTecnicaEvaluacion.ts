import type {
  CalificacionTecnicaEvaluacionValues,
  CriterioTecnicoPlantilla,
  CriterioTecnicoRespuesta,
  PlantillaTecnica,
} from "@/types/evaluacionOferente.types";

export const CALIFICACION_TECNICA_EVAL_TITLE = "Calificación técnica";
export const CALIFICACION_TECNICA_EVAL_SUBTITLE =
  "Evalúe el cumplimiento técnico del oferente. Seleccione los rangos predefinidos o ingrese la puntuación manual según corresponda a la configuración de cada criterio.";

export const CALIFICACION_TECNICA_JUSTIFICACION_ARTICULOS =
  "Artículos 95 LCP; 18.4 LOPA; 16 Normas SUNAI";

export const CALIFICACION_TECNICA_JUSTIF_CUMPLE =
  "Indique una breve justificación del porqué cumplió con la calificación técnica este oferente.";

export const CALIFICACION_TECNICA_JUSTIF_NO_CUMPLE =
  "Indique una breve justificación del porqué No cumplió con la calificación técnica este oferente.";

export const CALIFICACION_TECNICA_JUSTIFICACION_MAX = 1000;
export const VALOR_OBTENIDO_MAX = 255;
export const TOTAL_PUNTOS_TECNICA = 100;

export function isModoA(criterio: CriterioTecnicoPlantilla): boolean {
  return criterio.rangos.length > 1;
}

export function isModoB(criterio: CriterioTecnicoPlantilla): boolean {
  return criterio.rangos.length === 1;
}

export function getPuntajeMaximoCriterio(criterio: CriterioTecnicoPlantilla): number {
  if (isModoB(criterio)) {
    return criterio.rangos[0]?.puntaje ?? criterio.ponderacion;
  }
  return Math.max(...criterio.rangos.map((r) => r.puntaje), 0);
}

/** Plantilla mock: mezcla Modo A (múltiples rangos) y Modo B (rango único). Suma = 100. */
export function buildMockPlantillaTecnica(): PlantillaTecnica {
  return {
    puntuacionMinima: 60,
    criterios: [
      {
        id: "experiencia",
        nombre: "Experiencia Comprobada de la Empresa",
        descripcion:
          "Años de experiencia demostrables en la ejecución de proyectos de naturaleza similar al objeto de la contratación.",
        ponderacion: 30,
        rangos: [
          { id: "exp-r1", descripcion: "Mayor a 10 años", puntaje: 30 },
          { id: "exp-r2", descripcion: "Entre 5 y 10 años", puntaje: 20 },
          { id: "exp-r3", descripcion: "Menor a 5 años", puntaje: 10 },
        ],
      },
      {
        id: "metodologia",
        nombre: "Calidad de la Propuesta Metodológica",
        descripcion:
          "Evaluación cualitativa del plan de trabajo, cronograma de ejecución y valor agregado tecnológico.",
        ponderacion: 40,
        rangos: [
          {
            id: "met-r1",
            descripcion: "Evaluación basada en matriz cualitativa del Pliego.",
            puntaje: 40,
          },
        ],
      },
      {
        id: "garantia",
        nombre: "Tiempos de Garantía y Soporte",
        descripcion:
          "Garantía extendida ofrecida sobre los bienes o servicios, por encima del mínimo exigido.",
        ponderacion: 30,
        rangos: [
          { id: "gar-r1", descripcion: "Más de 24 meses de garantía", puntaje: 30 },
          { id: "gar-r2", descripcion: "Hasta 24 meses de garantía", puntaje: 10 },
        ],
      },
    ],
  };
}

export function emptyTecnicaFormValues(
  plantilla: PlantillaTecnica
): CalificacionTecnicaEvaluacionValues {
  const criterios: Record<string, CriterioTecnicoRespuesta> = {};
  for (const c of plantilla.criterios) {
    criterios[c.id] = {
      rangoIdSeleccionado: undefined,
      puntuacionObtenida: null,
      valorObtenido: "",
    };
  }
  return { criterios, justificacion: "" };
}

export function parsePuntuacionTecnica(raw: string | number | null | undefined): number | null {
  if (raw === undefined || raw === null) return null;
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;
  const trimmed = String(raw).trim().replace(/\./g, "").replace(",", ".");
  if (trimmed === "") return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

export function scoreCriterioTecnico(
  criterio: CriterioTecnicoPlantilla,
  respuesta: CriterioTecnicoRespuesta | undefined
): number | null {
  if (!respuesta) return null;

  if (isModoA(criterio)) {
    const rangoId = respuesta.rangoIdSeleccionado;
    if (!rangoId) return null;
    const rango = criterio.rangos.find((r) => r.id === rangoId);
    if (!rango) return null;
    return rango.puntaje;
  }

  const pts = respuesta.puntuacionObtenida;
  if (pts === null || pts === undefined || !Number.isFinite(pts)) return null;
  const max = getPuntajeMaximoCriterio(criterio);
  if (pts < 0 || pts > max) return null;
  return pts;
}

export function isCriterioTecnicoRespondido(
  criterio: CriterioTecnicoPlantilla,
  respuesta: CriterioTecnicoRespuesta | undefined
): boolean {
  if (scoreCriterioTecnico(criterio, respuesta) === null) return false;
  return Boolean(respuesta?.valorObtenido?.trim());
}

export function computeTecnicaTotal(
  plantilla: PlantillaTecnica,
  criterios: Record<string, CriterioTecnicoRespuesta>
): { total: number; allAnswered: boolean; cumple: boolean | null; hasOverMax: boolean } {
  let total = 0;
  let allAnswered = true;
  let hasOverMax = false;

  for (const criterio of plantilla.criterios) {
    const respuesta = criterios[criterio.id];
    if (isModoB(criterio)) {
      const pts = respuesta?.puntuacionObtenida;
      const max = getPuntajeMaximoCriterio(criterio);
      if (pts !== null && pts !== undefined && Number.isFinite(pts) && pts > max) {
        hasOverMax = true;
      }
    }

    const scored = scoreCriterioTecnico(criterio, respuesta);
    if (scored !== null) {
      total += scored;
    }
    const valorOk = Boolean(respuesta?.valorObtenido?.trim());
    if (scored === null || !valorOk) {
      allAnswered = false;
    }
  }

  const cumple = allAnswered && !hasOverMax ? total >= plantilla.puntuacionMinima : null;
  return { total, allAnswered, cumple, hasOverMax };
}

export function exceedMaxMessage(maxPts: number): string {
  return `El puntaje asignado no puede exceder la puntuación máxima de este criterio (${maxPts} pts)`;
}

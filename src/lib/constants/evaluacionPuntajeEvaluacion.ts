import {
  computeTecnicaTotal,
  emptyTecnicaFormValues,
} from "@/lib/constants/calificacionTecnicaEvaluacion";
import type {
  CriterioEvaluacionPlantilla,
  CriterioEvaluacionRespuesta,
  EvaluacionPuntajeEvaluacionValues,
  LadoEvaluacionPlantilla,
  PlantillaEvaluacion,
} from "@/types/evaluacionOferente.types";

export const EVALUACION_PUNTAJE_TITLE = "Evaluación técnica y económica";
export const EVALUACION_PUNTAJE_SUBTITLE =
  "Evalúe los criterios técnicos y económicos configurados en el pliego. El marcador aplica la bolsa compartida de 100 puntos definida en Fase 1.";

export const EVALUACION_PUNTAJE_JUSTIFICACION_ARTICULOS =
  "Artículos 95 LCP; 18.4 LOPA; 16 Normas SUNAI";

export const EVALUACION_TEC_JUSTIF_CUMPLE =
  "Indique una breve justificación del porqué cumplió con la evaluación técnica este oferente.";
export const EVALUACION_TEC_JUSTIF_NO_CUMPLE =
  "Indique una breve justificación del porqué No cumplió con la evaluación técnica este oferente.";

export const EVALUACION_ECO_JUSTIF_CUMPLE =
  "Indique una breve justificación del porqué cumplió con la evaluación económica este oferente.";
export const EVALUACION_ECO_JUSTIF_NO_CUMPLE =
  "Indique una breve justificación del porqué No cumplió con la evaluación económica este oferente.";

export const EVALUACION_PUNTAJE_JUSTIFICACION_MAX = 1000;
export const TOTAL_PUNTOS_BOLSA = 100;

export const POSICION_PRELACION_OPTIONS = [
  "Primera Opción",
  "Segunda Opción",
  "Tercera Opción",
  "Cuarta Opción",
  "Quinta Opción",
  "Sexta Opción",
] as const;

export type PosicionPrelacion = (typeof POSICION_PRELACION_OPTIONS)[number];

function ladoFromCriterios(
  criterios: CriterioEvaluacionPlantilla[],
  puntuacionMinima: number
): LadoEvaluacionPlantilla {
  const maxPuntos = criterios.reduce((acc, c) => acc + c.ponderacion, 0);
  return { puntuacionMinima, maxPuntos, criterios };
}

/** Mock bolsa 60 técnica / 40 económica (como tests Fase 1). */
export function buildMockPlantillaEvaluacion(): PlantillaEvaluacion {
  const tecnica = ladoFromCriterios(
    [
      {
        id: "eval-tec-materiales",
        nombre: "Calidad de Materiales y Certificaciones",
        descripcion:
          "Evaluación de las fichas técnicas y certificaciones ISO aportadas en la oferta.",
        ponderacion: 30,
        rangos: [
          {
            id: "et-mat-r1",
            descripcion: "Certificación ISO y calidad superior.",
            puntaje: 30,
          },
          {
            id: "et-mat-r2",
            descripcion: "Calidad estándar acorde al pliego.",
            puntaje: 15,
          },
          {
            id: "et-mat-r3",
            descripcion: "No cumple los estándares.",
            puntaje: 0,
          },
        ],
      },
      {
        id: "eval-tec-entrega",
        nombre: "Tiempo de Entrega Mejorado",
        descripcion:
          "Evaluación proporcional para quienes ofrezcan tiempos de entrega menores al máximo exigido.",
        ponderacion: 30,
        rangos: [
          {
            id: "et-ent-r1",
            descripcion: "Proporcionalidad según plazo ofertado vs. plazo máximo del pliego.",
            puntaje: 30,
          },
        ],
      },
    ],
    36
  );

  const economica = ladoFromCriterios(
    [
      {
        id: "eval-eco-precio",
        nombre: "Proporcionalidad del Precio Ofertado",
        descripcion:
          "Asignación de puntos según la fórmula de proporcionalidad inversa respecto a la oferta de menor precio.",
        ponderacion: 25,
        rangos: [
          {
            id: "ee-pre-r1",
            descripcion: "Cálculo manual según fórmula del pliego (máx. 25 pts).",
            puntaje: 25,
          },
        ],
      },
      {
        id: "eval-eco-descuento",
        nombre: "Descuentos y Condiciones Comerciales",
        descripcion: "Descuentos comerciales u otras mejoras económicas ofrecidas.",
        ponderacion: 15,
        rangos: [
          {
            id: "ee-desc-r1",
            descripcion: "Descuento igual o mayor al 5%.",
            puntaje: 15,
          },
          {
            id: "ee-desc-r2",
            descripcion: "Descuento menor al 5%.",
            puntaje: 8,
          },
          {
            id: "ee-desc-r3",
            descripcion: "Sin descuento comercial.",
            puntaje: 0,
          },
        ],
      },
    ],
    24
  );

  return { tecnica, economica };
}

export function emptyEvaluacionPuntajeFormValues(
  plantilla: PlantillaEvaluacion
): EvaluacionPuntajeEvaluacionValues {
  const tec = emptyTecnicaFormValues({
    puntuacionMinima: plantilla.tecnica.puntuacionMinima,
    criterios: plantilla.tecnica.criterios,
  });
  const eco = emptyTecnicaFormValues({
    puntuacionMinima: plantilla.economica.puntuacionMinima,
    criterios: plantilla.economica.criterios,
  });
  return {
    tecnica: { criterios: tec.criterios, justificacion: "" },
    economica: { criterios: eco.criterios, justificacion: "" },
    posicionPrelacion: "",
  };
}

export function computeLadoEvaluacion(
  lado: LadoEvaluacionPlantilla,
  criterios: Record<string, CriterioEvaluacionRespuesta>
) {
  return computeTecnicaTotal(
    { puntuacionMinima: lado.puntuacionMinima, criterios: lado.criterios },
    criterios
  );
}

export function computeMarcadorGlobal(
  plantilla: PlantillaEvaluacion,
  form: Pick<EvaluacionPuntajeEvaluacionValues, "tecnica" | "economica">
) {
  const tecnica = computeLadoEvaluacion(plantilla.tecnica, form.tecnica.criterios);
  const economica = computeLadoEvaluacion(plantilla.economica, form.economica.criterios);
  const finalScore = tecnica.total + economica.total;
  const ambosCompletos =
    tecnica.allAnswered && economica.allAnswered && !tecnica.hasOverMax && !economica.hasOverMax;
  const ambosCumplen = ambosCompletos && tecnica.cumple === true && economica.cumple === true;
  const algunoNoCumple =
    (tecnica.allAnswered && !tecnica.hasOverMax && tecnica.cumple === false) ||
    (economica.allAnswered && !economica.hasOverMax && economica.cumple === false);

  return {
    tecnica,
    economica,
    finalScore,
    ambosCompletos,
    ambosCumplen,
    algunoNoCumple,
    hasOverMax: tecnica.hasOverMax || economica.hasOverMax,
  };
}

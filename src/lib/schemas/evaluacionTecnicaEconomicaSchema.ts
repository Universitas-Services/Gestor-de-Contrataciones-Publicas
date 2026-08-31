import { z } from "zod";

import {
  CRITERIO_DESC_MAX,
  CRITERIO_NOMBRE_MAX,
  EVALUACION_TE_BOTH_SIDES_MESSAGE,
  EVALUACION_TE_CRITERIO_MAX_MESSAGE,
  EVALUACION_TE_TOTAL_EXACT_MESSAGE,
  PUNTUACION_CRITERIO_MAX,
  RANGO_ECONOMICA_TEXTO_MAX,
  RANGO_TECNICA_TEXTO_MAX,
  TOTAL_PUNTOS_OBJETIVO,
  roundPts,
  sumPonderacionesEconomicas,
  sumPonderacionesTecnicas,
  type CriterioEvalEconomica,
  type CriterioEvalTecnica,
  type EvaluacionTecnicaEconomicaFormValues,
} from "@/lib/constants/evaluacionTecnicaEconomica";

const rangoTecnicaSchema = z.object({
  id: z.string().min(1),
  rangoCriterioEvaluacionTecnicaAuAu: z.string().trim().min(1).max(RANGO_TECNICA_TEXTO_MAX),
  puntuacionRangoCriterioEvaluacionTecnicaAuAu: z.number().min(0),
});

const criterioTecnicaSchema = z.object({
  id: z.string().min(1),
  criterioEvaluacionTecnicaAuAu: z.string().trim().min(1).max(CRITERIO_NOMBRE_MAX),
  puntuacionCriterioEvaluacionTecnicaAuAu: z
    .number()
    .gt(0)
    .max(PUNTUACION_CRITERIO_MAX, { message: EVALUACION_TE_CRITERIO_MAX_MESSAGE }),
  descCriterioEvaluacionTecnicaAuAu: z.string().trim().max(CRITERIO_DESC_MAX),
  rangos: z.array(rangoTecnicaSchema).min(1, {
    message: "Agregue al menos un rango de evaluación técnica.",
  }),
});

const rangoEconomicaSchema = z.object({
  id: z.string().min(1),
  rangoCriterioEvaluacionEconomicaAuAu: z.string().trim().min(1).max(RANGO_ECONOMICA_TEXTO_MAX),
  puntuacionRangoCriterioEvaluacionEconomicaAuAu: z.number().min(0),
});

const criterioEconomicaSchema = z.object({
  id: z.string().min(1),
  criterioEvaluacionEconomicaAuAu: z.string().trim().min(1).max(CRITERIO_NOMBRE_MAX),
  puntuacionCriterioEvaluacionEconomicaAuAu: z
    .number()
    .gt(0)
    .max(PUNTUACION_CRITERIO_MAX, { message: EVALUACION_TE_CRITERIO_MAX_MESSAGE }),
  descCriterioEvaluacionEconomicaAuAu: z.string().trim().max(CRITERIO_DESC_MAX),
  rangos: z.array(rangoEconomicaSchema).min(1, {
    message: "Agregue al menos un rango de evaluación económica.",
  }),
});

export const evaluacionTecnicaEconomicaFormSchema = z
  .object({
    criteriosTecnicos: z.array(criterioTecnicaSchema).min(1, {
      message: "Agregue al menos un criterio técnico.",
    }),
    puntuacionMinimaEvaluacionTecnicaAuAu: z.number().min(0).max(TOTAL_PUNTOS_OBJETIVO),
    criteriosEconomicos: z.array(criterioEconomicaSchema).min(1, {
      message: "Agregue al menos un criterio económico.",
    }),
    puntuacionMinimaEvaluacionEconomicaAuAu: z.number().min(0).max(TOTAL_PUNTOS_OBJETIVO),
  })
  .superRefine((data, ctx) => {
    const totalTecnica = roundPts(
      sumPonderacionesTecnicas(data.criteriosTecnicos as CriterioEvalTecnica[])
    );
    const totalEconomica = roundPts(
      sumPonderacionesEconomicas(data.criteriosEconomicos as CriterioEvalEconomica[])
    );
    const totalMatriz = roundPts(totalTecnica + totalEconomica);

    if (totalMatriz !== TOTAL_PUNTOS_OBJETIVO) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${EVALUACION_TE_TOTAL_EXACT_MESSAGE} Suma actual: ${totalMatriz} puntos.`,
        path: ["criteriosTecnicos"],
      });
    }

    if (totalTecnica <= 0 || totalEconomica <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: EVALUACION_TE_BOTH_SIDES_MESSAGE,
        path: ["criteriosEconomicos"],
      });
    }

    if (data.puntuacionMinimaEvaluacionTecnicaAuAu > totalTecnica) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El umbral técnico no puede superar el total de la evaluación técnica.",
        path: ["puntuacionMinimaEvaluacionTecnicaAuAu"],
      });
    }

    if (data.puntuacionMinimaEvaluacionEconomicaAuAu > totalEconomica) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El umbral económico no puede superar el total de la evaluación económica.",
        path: ["puntuacionMinimaEvaluacionEconomicaAuAu"],
      });
    }

    data.criteriosTecnicos.forEach((criterio, cIdx) => {
      const maxPadre = criterio.puntuacionCriterioEvaluacionTecnicaAuAu;
      criterio.rangos.forEach((rango, rIdx) => {
        if (rango.puntuacionRangoCriterioEvaluacionTecnicaAuAu > maxPadre) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `El puntaje del rango no puede superar la ponderación del criterio (${maxPadre}).`,
            path: [
              "criteriosTecnicos",
              cIdx,
              "rangos",
              rIdx,
              "puntuacionRangoCriterioEvaluacionTecnicaAuAu",
            ],
          });
        }
      });
    });

    data.criteriosEconomicos.forEach((criterio, cIdx) => {
      const maxPadre = criterio.puntuacionCriterioEvaluacionEconomicaAuAu;
      criterio.rangos.forEach((rango, rIdx) => {
        if (rango.puntuacionRangoCriterioEvaluacionEconomicaAuAu > maxPadre) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `El puntaje del rango no puede superar la ponderación del criterio (${maxPadre}).`,
            path: [
              "criteriosEconomicos",
              cIdx,
              "rangos",
              rIdx,
              "puntuacionRangoCriterioEvaluacionEconomicaAuAu",
            ],
          });
        }
      });
    });
  });

export function getTotalTecnica(values: EvaluacionTecnicaEconomicaFormValues): number {
  return roundPts(sumPonderacionesTecnicas(values.criteriosTecnicos));
}

export function getTotalEconomica(values: EvaluacionTecnicaEconomicaFormValues): number {
  return roundPts(sumPonderacionesEconomicas(values.criteriosEconomicos));
}

export function getTotalMatriz(values: EvaluacionTecnicaEconomicaFormValues): number {
  return roundPts(getTotalTecnica(values) + getTotalEconomica(values));
}

export function canSubmitEvaluacionTecnicaEconomica(
  values: EvaluacionTecnicaEconomicaFormValues
): boolean {
  return evaluacionTecnicaEconomicaFormSchema.safeParse(values).success;
}

export function getEvaluacionTecnicaEconomicaIssues(
  values: EvaluacionTecnicaEconomicaFormValues
): string[] {
  const result = evaluacionTecnicaEconomicaFormSchema.safeParse(values);
  if (result.success) return [];
  // Omitir mensajes técnicos de Zod en inglés (p. ej. "Too small: expected array…").
  const messages = result.error.issues
    .map((i) => i.message)
    .filter((m) => !/^(Too small|Too big|Invalid |Expected |Required)/i.test(m));
  return [...new Set(messages)];
}

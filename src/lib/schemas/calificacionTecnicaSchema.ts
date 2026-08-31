import { z } from "zod";

import {
  CALIFICACION_TECNICA_TOTAL_EXACT_MESSAGE,
  CRITERIO_DESC_MAX,
  CRITERIO_NOMBRE_MAX,
  RANGO_TEXTO_MAX,
  TOTAL_PUNTOS_OBJETIVO,
  roundPts,
  sumPonderaciones,
  type CalificacionTecnicaFormValues,
  type CriterioTecnico,
} from "@/lib/constants/calificacionTecnica";

const rangoSchema = z.object({
  id: z.string().min(1),
  rangoCriterioCalificacionTecnicaAuAu: z.string().trim().min(1).max(RANGO_TEXTO_MAX),
  puntuacionRangoCriterioCalificacionTecnicaAuAu: z.number().min(0),
});

const criterioSchema = z.object({
  id: z.string().min(1),
  criterioCalificacionTecnicaAuAu: z.string().trim().min(1).max(CRITERIO_NOMBRE_MAX),
  puntuacionCriterioCalificacionTecnicaAuAu: z.number().gt(0),
  descCriterioCalificacionTecnicaAuAu: z.string().trim().max(CRITERIO_DESC_MAX),
  rangos: z.array(rangoSchema).min(1),
});

export const calificacionTecnicaFormSchema = z
  .object({
    criterios: z.array(criterioSchema).min(1),
    puntuacionMinimaCalifTecnicaAuAu: z.number().min(0).max(TOTAL_PUNTOS_OBJETIVO),
  })
  .superRefine((data, ctx) => {
    const total = roundPts(sumPonderaciones(data.criterios as CriterioTecnico[]));

    if (total !== TOTAL_PUNTOS_OBJETIVO) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${CALIFICACION_TECNICA_TOTAL_EXACT_MESSAGE} Suma actual: ${total} puntos.`,
        path: ["criterios"],
      });
    }

    if (data.puntuacionMinimaCalifTecnicaAuAu > total) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El umbral aprobatorio no puede superar el total de ponderaciones.",
        path: ["puntuacionMinimaCalifTecnicaAuAu"],
      });
    }

    data.criterios.forEach((criterio, cIdx) => {
      const maxPadre = criterio.puntuacionCriterioCalificacionTecnicaAuAu;
      criterio.rangos.forEach((rango, rIdx) => {
        if (rango.puntuacionRangoCriterioCalificacionTecnicaAuAu > maxPadre) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `El puntaje del rango no puede superar la ponderación del criterio (${maxPadre}).`,
            path: [
              "criterios",
              cIdx,
              "rangos",
              rIdx,
              "puntuacionRangoCriterioCalificacionTecnicaAuAu",
            ],
          });
        }
      });
    });
  });

export function getTotalPonderacion(values: CalificacionTecnicaFormValues): number {
  return roundPts(sumPonderaciones(values.criterios));
}

export function canSubmitCalificacionTecnica(values: CalificacionTecnicaFormValues): boolean {
  return calificacionTecnicaFormSchema.safeParse(values).success;
}

export function getCalificacionTecnicaIssues(values: CalificacionTecnicaFormValues): string[] {
  const result = calificacionTecnicaFormSchema.safeParse(values);
  if (result.success) return [];
  return [...new Set(result.error.issues.map((i) => i.message))];
}

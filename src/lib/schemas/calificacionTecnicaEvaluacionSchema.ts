import { z } from "zod";

import {
  CALIFICACION_TECNICA_JUSTIFICACION_MAX,
  VALOR_OBTENIDO_MAX,
  exceedMaxMessage,
  getPuntajeMaximoCriterio,
  isModoA,
  isModoB,
} from "@/lib/constants/calificacionTecnicaEvaluacion";
import type { PlantillaTecnica } from "@/types/evaluacionOferente.types";

const criterioRespuestaSchema = z.object({
  rangoIdSeleccionado: z.string().optional(),
  puntuacionObtenida: z.number().nullable().optional(),
  valorObtenido: z.string().max(VALOR_OBTENIDO_MAX),
});

export function createCalificacionTecnicaSubmitSchema(plantilla: PlantillaTecnica) {
  return z
    .object({
      criterios: z.record(z.string(), criterioRespuestaSchema),
      justificacion: z
        .string()
        .trim()
        .min(1, "Indique una breve justificación de la calificación técnica.")
        .max(CALIFICACION_TECNICA_JUSTIFICACION_MAX),
    })
    .superRefine((data, ctx) => {
      for (const criterio of plantilla.criterios) {
        const resp = data.criterios[criterio.id];
        if (!resp?.valorObtenido?.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Transcriba el valor físico detectado en la oferta.",
            path: ["criterios", criterio.id, "valorObtenido"],
          });
        }

        if (isModoA(criterio)) {
          const rangoId = resp?.rangoIdSeleccionado;
          if (!rangoId || !criterio.rangos.some((r) => r.id === rangoId)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Seleccione un rango.",
              path: ["criterios", criterio.id, "rangoIdSeleccionado"],
            });
          }
          continue;
        }

        if (isModoB(criterio)) {
          const max = getPuntajeMaximoCriterio(criterio);
          const pts = resp?.puntuacionObtenida;
          if (pts === null || pts === undefined || !Number.isFinite(pts)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Indique el puntaje obtenido.",
              path: ["criterios", criterio.id, "puntuacionObtenida"],
            });
          } else if (pts < 0 || pts > max) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: exceedMaxMessage(max),
              path: ["criterios", criterio.id, "puntuacionObtenida"],
            });
          }
        }
      }
    });
}

export type CalificacionTecnicaSubmitValues = z.infer<
  ReturnType<typeof createCalificacionTecnicaSubmitSchema>
>;

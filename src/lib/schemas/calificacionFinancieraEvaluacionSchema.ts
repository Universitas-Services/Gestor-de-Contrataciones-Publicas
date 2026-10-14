import { z } from "zod";

import {
  CALIFICACION_FINANCIERA_JUSTIFICACION_MAX,
  parseIndiceValor,
} from "@/lib/constants/calificacionFinancieraEvaluacion";
import type { PlantillaFinanciera } from "@/types/evaluacionOferente.types";

const criterioRespuestaSchema = z.object({
  valor: z.union([z.enum(["SI", "NO"]), z.string()]).optional(),
});

export function createCalificacionFinancieraSubmitSchema(plantilla: PlantillaFinanciera) {
  return z
    .object({
      criterios: z.record(z.string(), criterioRespuestaSchema),
      justificacion: z
        .string()
        .trim()
        .min(1, "Indique una breve justificación de la calificación financiera.")
        .max(CALIFICACION_FINANCIERA_JUSTIFICACION_MAX),
    })
    .superRefine((data, ctx) => {
      for (const criterio of plantilla.criterios) {
        const raw = data.criterios[criterio.id]?.valor;
        if (criterio.kind === "descapital") {
          if (raw !== "SI" && raw !== "NO") {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Debe marcar SI o NO.",
              path: ["criterios", criterio.id, "valor"],
            });
          }
          continue;
        }
        if (parseIndiceValor(typeof raw === "string" ? raw : undefined) === null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Indique el índice obtenido.",
            path: ["criterios", criterio.id, "valor"],
          });
        }
      }
    });
}

export type CalificacionFinancieraSubmitValues = z.infer<
  ReturnType<typeof createCalificacionFinancieraSubmitSchema>
>;

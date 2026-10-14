import { z } from "zod";

import { JUSTIFICACION_MAX_LEN, OBS_MAX_LEN } from "@/lib/constants/calificacionLegalEvaluacion";
import type { RecaudoCotejoItem } from "@/types/evaluacionOferente.types";

const respuestaSchema = z.object({
  consignado: z.enum(["SI", "NO"]).optional(),
  observacion: z.string().max(OBS_MAX_LEN),
});

export function createCalificacionLegalSubmitSchema(items: RecaudoCotejoItem[]) {
  // API hub: al confirmar exige SI/NO en todos los ítems de la plantilla;
  // solo los eliminatorios definen el dictamen.
  return z
    .object({
      items: z.record(z.string(), respuestaSchema),
      justificacion: z
        .string()
        .trim()
        .min(1, "Indique una breve justificación de la calificación legal.")
        .max(JUSTIFICACION_MAX_LEN),
      indVerificadoGarantia: z.boolean().nullable(),
      indVerificadoCrs: z.boolean().nullable(),
      obsVerificadoGarantia: z.string().max(OBS_MAX_LEN),
      obsVerificadoCrs: z.string().max(OBS_MAX_LEN),
    })
    .superRefine((data, ctx) => {
      if (typeof data.indVerificadoGarantia !== "boolean") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Debe indicar si se verificó la garantía de mantenimiento de la oferta.",
          path: ["indVerificadoGarantia"],
        });
      }
      if (typeof data.indVerificadoCrs !== "boolean") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Debe indicar si se verificó el compromiso de responsabilidad social.",
          path: ["indVerificadoCrs"],
        });
      }
      for (const item of items) {
        const val = data.items[item.id]?.consignado;
        if (val !== "SI" && val !== "NO") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Debe marcar SI o NO en este recaudo.",
            path: ["items", item.id, "consignado"],
          });
        }
      }
    });
}

export function createSobre1SiguienteSchema(items: RecaudoCotejoItem[]) {
  const sobre1 = items.filter((item) => item.sobre === 1 && item.eliminatorio);

  return z
    .object({
      items: z.record(z.string(), respuestaSchema),
      justificacion: z.string(),
      indVerificadoGarantia: z.boolean().nullable(),
      indVerificadoCrs: z.boolean().nullable(),
      obsVerificadoGarantia: z.string().max(OBS_MAX_LEN),
      obsVerificadoCrs: z.string().max(OBS_MAX_LEN),
    })
    .superRefine((data, ctx) => {
      for (const item of sobre1) {
        const val = data.items[item.id]?.consignado;
        if (val !== "SI" && val !== "NO") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Debe evaluar todos los recaudos obligatorios del Sobre N° 1.",
            path: ["items", item.id, "consignado"],
          });
        }
      }
    });
}

export type CalificacionLegalSubmitValues = z.infer<
  ReturnType<typeof createCalificacionLegalSubmitSchema>
>;

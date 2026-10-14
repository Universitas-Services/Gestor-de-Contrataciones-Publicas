import { z } from "zod";

import { exceedVanPtsMessage } from "@/lib/constants/promocionEconomicaEvaluacion";
import type { PlantillaPromocion } from "@/types/evaluacionOferente.types";

export function createPromocionEconomicaSubmitSchema(plantilla: PlantillaPromocion) {
  return z
    .object({
      consignoDeclaracionVan: z.boolean().optional(),
      valVanOferente: z.number().nullable(),
      ptsBonoVan: z.number().nullable(),
      aplicaPrefLocal: z.boolean().optional(),
      aplicaBonoSujeto: z.boolean().optional(),
      ptsBonoLocal: z.number(),
      ptsBonoSujeto: z.number(),
      totalPuntosPromocion: z.number(),
      puntuacionFinalConBonos: z.number(),
      calculado: z.boolean(),
    })
    .superRefine((data, ctx) => {
      if (plantilla.requiereVan) {
        if (data.consignoDeclaracionVan === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Debe marcar SÍ o NO.",
            path: ["consignoDeclaracionVan"],
          });
        } else if (data.consignoDeclaracionVan === true) {
          const pct = data.valVanOferente;
          if (pct === null || pct === undefined || !Number.isFinite(pct)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Indique el porcentaje de VAN (0.00 a 100.00).",
              path: ["valVanOferente"],
            });
          } else if (pct < 0 || pct > 100) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "El porcentaje de VAN debe estar entre 0.00 y 100.00.",
              path: ["valVanOferente"],
            });
          }

          const pts = data.ptsBonoVan;
          if (pts === null || pts === undefined || !Number.isFinite(pts)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Indique la puntuación del bono VAN.",
              path: ["ptsBonoVan"],
            });
          } else if (pts < 0 || pts > plantilla.puntajeVanMax) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: exceedVanPtsMessage(plantilla.puntajeVanMax),
              path: ["ptsBonoVan"],
            });
          }
        }
      }

      if (plantilla.indPrefLocal && data.aplicaPrefLocal === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Debe marcar SÍ o NO.",
          path: ["aplicaPrefLocal"],
        });
      }

      if (plantilla.indBonoSujeto && data.aplicaBonoSujeto === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Debe marcar SÍ o NO.",
          path: ["aplicaBonoSujeto"],
        });
      }
    });
}

export type PromocionEconomicaSubmitValues = z.infer<
  ReturnType<typeof createPromocionEconomicaSubmitSchema>
>;

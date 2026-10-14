import { z } from "zod";

import {
  VALOR_OBTENIDO_MAX,
  exceedMaxMessage,
  getPuntajeMaximoCriterio,
  isModoA,
  isModoB,
} from "@/lib/constants/calificacionTecnicaEvaluacion";
import {
  EVALUACION_PUNTAJE_JUSTIFICACION_MAX,
  computeLadoEvaluacion,
} from "@/lib/constants/evaluacionPuntajeEvaluacion";
import type {
  LadoEvaluacionPlantilla,
  PlantillaEvaluacion,
} from "@/types/evaluacionOferente.types";

const criterioRespuestaSchema = z.object({
  rangoIdSeleccionado: z.string().optional(),
  puntuacionObtenida: z.number().nullable().optional(),
  valorObtenido: z.string().max(VALOR_OBTENIDO_MAX),
});

function refineLado(
  lado: LadoEvaluacionPlantilla,
  data: {
    criterios: Record<
      string,
      {
        rangoIdSeleccionado?: string;
        puntuacionObtenida?: number | null;
        valorObtenido: string;
      }
    >;
    justificacion: string;
  },
  pathPrefix: "tecnica" | "economica",
  ctx: z.RefinementCtx,
  requireJustificacion: boolean
) {
  for (const criterio of lado.criterios) {
    const resp = data.criterios[criterio.id];
    if (!resp?.valorObtenido?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Transcriba el valor físico detectado en la oferta.",
        path: [pathPrefix, "criterios", criterio.id, "valorObtenido"],
      });
    }

    if (isModoA(criterio)) {
      const rangoId = resp?.rangoIdSeleccionado;
      if (!rangoId || !criterio.rangos.some((r) => r.id === rangoId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Seleccione un rango.",
          path: [pathPrefix, "criterios", criterio.id, "rangoIdSeleccionado"],
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
          path: [pathPrefix, "criterios", criterio.id, "puntuacionObtenida"],
        });
      } else if (pts < 0 || pts > max) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: exceedMaxMessage(max),
          path: [pathPrefix, "criterios", criterio.id, "puntuacionObtenida"],
        });
      }
    }
  }

  if (requireJustificacion && !data.justificacion.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Indique una breve justificación.",
      path: [pathPrefix, "justificacion"],
    });
  }
}

export function createEvaluacionPuntajeSubmitSchema(plantilla: PlantillaEvaluacion) {
  const ladoSchema = z.object({
    criterios: z.record(z.string(), criterioRespuestaSchema),
    justificacion: z.string().max(EVALUACION_PUNTAJE_JUSTIFICACION_MAX),
  });

  return z
    .object({
      tecnica: ladoSchema,
      economica: ladoSchema,
      // Lo calcula el backend; se mantiene en el form solo para hidratar lectura.
      posicionPrelacion: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      const techResult = computeLadoEvaluacion(plantilla.tecnica, data.tecnica.criterios);

      if (!techResult.allAnswered || techResult.hasOverMax) {
        refineLado(plantilla.tecnica, data.tecnica, "tecnica", ctx, false);
        return;
      }

      refineLado(plantilla.tecnica, data.tecnica, "tecnica", ctx, true);

      if (techResult.cumple === false) {
        // Filtro pre-económico: no exige económica completa para rechazar.
        return;
      }

      const ecoResult = computeLadoEvaluacion(plantilla.economica, data.economica.criterios);
      if (!ecoResult.allAnswered || ecoResult.hasOverMax) {
        refineLado(plantilla.economica, data.economica, "economica", ctx, false);
        return;
      }

      refineLado(plantilla.economica, data.economica, "economica", ctx, true);
    });
}

export type EvaluacionPuntajeSubmitValues = z.infer<
  ReturnType<typeof createEvaluacionPuntajeSubmitSchema>
>;

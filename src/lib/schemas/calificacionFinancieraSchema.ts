import { z } from "zod";

import {
  CALIFICACION_FINANCIERA_SUMA_EXCEDIDA,
  TOTAL_PUNTAJE_MAXIMO,
  getTotalPuntajeMaximoActivos,
  type CalificacionFinancieraFormValues,
  type TresRangosValues,
} from "@/lib/constants/calificacionFinanciera";

const nullablePuntaje = z.number().nullable();

const tresRangosShape = z.object({
  rangoMaximo: z.number(),
  puntajeMaximo: nullablePuntaje,
  rangoMedioDesde: z.number(),
  rangoMedioHasta: z.number(),
  puntajeMedio: nullablePuntaje,
  rangoMinimo: z.number(),
  puntajeMinimo: nullablePuntaje,
});

function isFilledPuntaje(n: number | null | undefined): n is number {
  return typeof n === "number" && Number.isFinite(n);
}

function validatePuntajesCompletos(v: TresRangosValues, ctx: z.RefinementCtx, prefix: string) {
  if (
    !isFilledPuntaje(v.puntajeMaximo) ||
    !isFilledPuntaje(v.puntajeMedio) ||
    !isFilledPuntaje(v.puntajeMinimo)
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `${prefix}: complete todos los puntajes.`,
      path: [`${prefix}.puntajeMaximo`],
    });
    return false;
  }
  return true;
}

function validatePuntajesDecrecientes(v: TresRangosValues, ctx: z.RefinementCtx, prefix: string) {
  if (!validatePuntajesCompletos(v, ctx, prefix)) return;
  if (!(v.puntajeMaximo! >= v.puntajeMedio! && v.puntajeMedio! >= v.puntajeMinimo!)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `${prefix}: los puntajes deben cumplir máximo ≥ medio ≥ mínimo.`,
      path: [`${prefix}.puntajeMaximo`],
    });
  }
}

function validateRangosAscendente(v: TresRangosValues, ctx: z.RefinementCtx, prefix: string) {
  const ok =
    v.rangoMaximo > v.rangoMedioHasta &&
    v.rangoMedioHasta >= v.rangoMedioDesde &&
    v.rangoMedioDesde >= v.rangoMinimo;
  if (!ok) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `${prefix}: los rangos deben cumplir máximo > hasta ≥ desde ≥ mínimo.`,
      path: [`${prefix}.rangoMaximo`],
    });
  }
  validatePuntajesDecrecientes(v, ctx, prefix);
}

function validateRangosInverso(v: TresRangosValues, ctx: z.RefinementCtx, prefix: string) {
  const ok =
    v.rangoMaximo < v.rangoMedioDesde &&
    v.rangoMedioDesde <= v.rangoMedioHasta &&
    v.rangoMedioHasta <= v.rangoMinimo;
  if (!ok) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `${prefix}: los rangos inversos deben cumplir óptimo < desde ≤ hasta ≤ deficiente.`,
      path: [`${prefix}.rangoMaximo`],
    });
  }
  validatePuntajesDecrecientes(v, ctx, prefix);
}

function isAscendenteOk(v: TresRangosValues): boolean {
  return (
    isFilledPuntaje(v.puntajeMaximo) &&
    isFilledPuntaje(v.puntajeMedio) &&
    isFilledPuntaje(v.puntajeMinimo) &&
    v.rangoMaximo > v.rangoMedioHasta &&
    v.rangoMedioHasta >= v.rangoMedioDesde &&
    v.rangoMedioDesde >= v.rangoMinimo &&
    v.puntajeMaximo >= v.puntajeMedio &&
    v.puntajeMedio >= v.puntajeMinimo
  );
}

function isInversoOk(v: TresRangosValues): boolean {
  return (
    isFilledPuntaje(v.puntajeMaximo) &&
    isFilledPuntaje(v.puntajeMedio) &&
    isFilledPuntaje(v.puntajeMinimo) &&
    v.rangoMaximo < v.rangoMedioDesde &&
    v.rangoMedioDesde <= v.rangoMedioHasta &&
    v.rangoMedioHasta <= v.rangoMinimo &&
    v.puntajeMaximo >= v.puntajeMedio &&
    v.puntajeMedio >= v.puntajeMinimo
  );
}

function countActiveCriteria(values: CalificacionFinancieraFormValues): number {
  return [
    values.criterioCalifFinanDescapitalAuAu,
    values.criterioCalifFinanSolvenciaAuAu,
    values.criterioCalifFinanRotacionAuAu,
    values.criterioCalifFinanRendimientoAuAu,
    values.criterioCalifFinanRentabilidadAuAu,
    values.criterioCalifFinanEndeudamientoAuAu,
  ].filter((v) => v === true).length;
}

export const calificacionFinancieraFormSchema = z
  .object({
    criterioCalifFinanDescapitalAuAu: z.boolean().optional(),
    puntajeMaximoDescapitalAuAu: nullablePuntaje,
    criterioCalifFinanSolvenciaAuAu: z.boolean().optional(),
    solvencia: tresRangosShape,
    criterioCalifFinanRotacionAuAu: z.boolean().optional(),
    rotacion: tresRangosShape,
    criterioCalifFinanRendimientoAuAu: z.boolean().optional(),
    rendimiento: tresRangosShape,
    criterioCalifFinanRentabilidadAuAu: z.boolean().optional(),
    rentabilidad: tresRangosShape,
    criterioCalifFinanEndeudamientoAuAu: z.boolean().optional(),
    endeudamiento: tresRangosShape,
    puntuacionMinimaCalifFinancieraAuAu: z.number().int().min(1).max(100),
  })
  .superRefine((data, ctx) => {
    if (data.criterioCalifFinanDescapitalAuAu === true) {
      if (
        !isFilledPuntaje(data.puntajeMaximoDescapitalAuAu) ||
        data.puntajeMaximoDescapitalAuAu < 0 ||
        data.puntajeMaximoDescapitalAuAu > 100
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Descapitalización: indique un puntaje entre 0 y 100.",
          path: ["puntajeMaximoDescapitalAuAu"],
        });
      }
    }
    if (data.criterioCalifFinanSolvenciaAuAu === true) {
      validateRangosAscendente(data.solvencia, ctx, "Solvencia");
    }
    if (data.criterioCalifFinanRotacionAuAu === true) {
      validateRangosAscendente(data.rotacion, ctx, "Rotación");
    }
    if (data.criterioCalifFinanRendimientoAuAu === true) {
      validateRangosAscendente(data.rendimiento, ctx, "ROA");
    }
    if (data.criterioCalifFinanRentabilidadAuAu === true) {
      validateRangosAscendente(data.rentabilidad, ctx, "ROE");
    }
    if (data.criterioCalifFinanEndeudamientoAuAu === true) {
      validateRangosInverso(data.endeudamiento, ctx, "Endeudamiento");
    }

    if (getTotalPuntajeMaximoActivos(data) > TOTAL_PUNTAJE_MAXIMO) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: CALIFICACION_FINANCIERA_SUMA_EXCEDIDA,
        path: ["puntajeMaximoDescapitalAuAu"],
      });
    }
  });

/** Activación temprana: ≥1 criterio activo válido + puntuación mínima; todos los SÍ válidos. */
export function canSubmitCalificacionFinanciera(values: CalificacionFinancieraFormValues): boolean {
  const minimaOk =
    Number.isInteger(values.puntuacionMinimaCalifFinancieraAuAu) &&
    values.puntuacionMinimaCalifFinancieraAuAu >= 1 &&
    values.puntuacionMinimaCalifFinancieraAuAu <= 100;

  if (!minimaOk) return false;

  const hasAtLeastOne =
    (values.criterioCalifFinanDescapitalAuAu === true &&
      isFilledPuntaje(values.puntajeMaximoDescapitalAuAu) &&
      values.puntajeMaximoDescapitalAuAu >= 0 &&
      values.puntajeMaximoDescapitalAuAu <= 100) ||
    (values.criterioCalifFinanSolvenciaAuAu === true && isAscendenteOk(values.solvencia)) ||
    (values.criterioCalifFinanRotacionAuAu === true && isAscendenteOk(values.rotacion)) ||
    (values.criterioCalifFinanRendimientoAuAu === true && isAscendenteOk(values.rendimiento)) ||
    (values.criterioCalifFinanRentabilidadAuAu === true && isAscendenteOk(values.rentabilidad)) ||
    (values.criterioCalifFinanEndeudamientoAuAu === true && isInversoOk(values.endeudamiento));

  if (!hasAtLeastOne) return false;

  if (getTotalPuntajeMaximoActivos(values) > TOTAL_PUNTAJE_MAXIMO) return false;

  return calificacionFinancieraFormSchema.safeParse(values).success;
}

export function getCalificacionFinancieraIssues(
  values: CalificacionFinancieraFormValues
): string[] {
  const messages: string[] = [];

  if (countActiveCriteria(values) < 1) {
    messages.push("Active y configure correctamente al menos un criterio financiero.");
  }

  const result = calificacionFinancieraFormSchema.safeParse(values);
  if (!result.success) {
    messages.push(...result.error.issues.map((i) => i.message));
  }

  return [...new Set(messages)];
}

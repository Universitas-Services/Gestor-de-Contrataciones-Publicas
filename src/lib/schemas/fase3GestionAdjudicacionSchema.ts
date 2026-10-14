import { z } from "zod";

const montoManoObraField = z
  .string()
  .regex(/^[\d.,]*$/, { message: "Solo se permiten valores numéricos" })
  .optional();

const montoField = (label: string) =>
  z
    .string()
    .min(1, { message: `${label} es requerido` })
    .regex(/^[\d.,]+$/, { message: "Solo se permiten valores numéricos" });

export const adjudicacionTotalLocalSchema = z.object({
  partidasSeleccionadas: z
    .array(z.string())
    .min(1, { message: "Seleccione al menos una partida presupuestaria" }),
  montoAdjudicadoTotalAuAu: montoField("El monto adjudicado sin I.V.A."),
  plazoEjecucionOfertaGanadoraAuAu: z
    .string()
    .min(1, { message: "Indique el plazo de ejecución en días" })
    .regex(/^\d+$/, { message: "Debe ser un número entero" })
    .refine((v) => Number(v) > 0, { message: "Debe ser mayor a cero" }),
  montoManoObraOfertadoAuAu: montoManoObraField,
});

export type AdjudicacionTotalLocalValues = z.infer<typeof adjudicacionTotalLocalSchema>;

export const adjudicacionParcialLocalSchema = z
  .object({
    oferenteAdjudicadoProcedimientoAuAu: z.boolean().optional(),
    causaNoAdjudicadoAuAu: z.string().optional(),
    cantidadRenglonesAuAu: z.string().optional(),
    alcanceAdjudicacionParcialAuAu: z.string().optional(),
    partidasSeleccionadas: z.array(z.string()).optional(),
    montoAdjudicadoParcialAuAu: z.string().optional(),
    plazoEjecucionOfertaParcialAuAu: z.string().optional(),
    montoManoObraOfertadoAuAu: montoManoObraField,
  })
  .superRefine((data, ctx) => {
    if (
      data.oferenteAdjudicadoProcedimientoAuAu !== true &&
      data.oferenteAdjudicadoProcedimientoAuAu !== false
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["oferenteAdjudicadoProcedimientoAuAu"],
        message: "Indique si el oferente será adjudicado",
      });
      return;
    }

    if (data.oferenteAdjudicadoProcedimientoAuAu === false) {
      if (!data.causaNoAdjudicadoAuAu?.trim() || data.causaNoAdjudicadoAuAu.trim().length < 10) {
        ctx.addIssue({
          code: "custom",
          path: ["causaNoAdjudicadoAuAu"],
          message: "Indique la causa de no adjudicación (mín. 10 caracteres)",
        });
      }
      return;
    }

    if (!data.cantidadRenglonesAuAu?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["cantidadRenglonesAuAu"],
        message: "Indique la cantidad de renglones o ítems",
      });
    }
    if (!data.alcanceAdjudicacionParcialAuAu?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["alcanceAdjudicacionParcialAuAu"],
        message: "Indique el alcance de la adjudicación parcial",
      });
    }
    if (!data.partidasSeleccionadas || data.partidasSeleccionadas.length < 1) {
      ctx.addIssue({
        code: "custom",
        path: ["partidasSeleccionadas"],
        message: "Seleccione al menos una partida presupuestaria",
      });
    }
    if (
      !data.montoAdjudicadoParcialAuAu?.trim() ||
      !/^[\d.,]+$/.test(data.montoAdjudicadoParcialAuAu)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["montoAdjudicadoParcialAuAu"],
        message: "Indique el monto adjudicado sin I.V.A.",
      });
    }
    if (
      !data.plazoEjecucionOfertaParcialAuAu?.trim() ||
      !/^\d+$/.test(data.plazoEjecucionOfertaParcialAuAu) ||
      Number(data.plazoEjecucionOfertaParcialAuAu) <= 0
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["plazoEjecucionOfertaParcialAuAu"],
        message: "Indique el plazo de ejecución en días (mayor a cero)",
      });
    }
  });

export type AdjudicacionParcialLocalValues = z.infer<typeof adjudicacionParcialLocalSchema>;

export const informeRecomendacionLocalSchema = z
  .object({
    existeItemsSinOfertasAuAu: z.boolean().optional(),
    itemsSinOfertasAuAu: z.string().max(4000).optional().default(""),
    motivoItemsSinOfertasAuAu: z.string().max(4000).optional().default(""),
    actualizacionPresupuestoAuAu: z.boolean().optional(),
    montoNuevoPresupuestoAuAu: z.string().optional().default(""),
    justificacionActualizacionPresupuestoAuAu: z.string().max(4000).optional().default(""),
    observacionFormalidadesAuAu: z.boolean().optional(),
    omisionFormalidadesAuAu: z.string().max(4000).optional().default(""),
    subsanacionActoAuAu: z.string().max(4000).optional().default(""),
    datosActoSubsanacionAuAu: z.string().max(4000).optional().default(""),
  })
  .superRefine((data, ctx) => {
    if (data.existeItemsSinOfertasAuAu !== true && data.existeItemsSinOfertasAuAu !== false) {
      ctx.addIssue({
        code: "custom",
        path: ["existeItemsSinOfertasAuAu"],
        message: "Indique si existen ítems o renglones sin ofertas válidas",
      });
    }
    if (data.existeItemsSinOfertasAuAu === true) {
      if (!data.itemsSinOfertasAuAu?.trim() || data.itemsSinOfertasAuAu.trim().length < 10) {
        ctx.addIssue({
          code: "custom",
          path: ["itemsSinOfertasAuAu"],
          message: "Indique los ítems o renglones (mín. 10 caracteres)",
        });
      }
      if (
        !data.motivoItemsSinOfertasAuAu?.trim() ||
        data.motivoItemsSinOfertasAuAu.trim().length < 10
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["motivoItemsSinOfertasAuAu"],
          message: "Indique el motivo de declaratoria de desierto (mín. 10 caracteres)",
        });
      }
    }

    if (data.actualizacionPresupuestoAuAu !== true && data.actualizacionPresupuestoAuAu !== false) {
      ctx.addIssue({
        code: "custom",
        path: ["actualizacionPresupuestoAuAu"],
        message: "Indique si se actualizó el presupuesto base",
      });
    }
    if (data.actualizacionPresupuestoAuAu === true) {
      if (
        !data.montoNuevoPresupuestoAuAu?.trim() ||
        !/^[\d.,]+$/.test(data.montoNuevoPresupuestoAuAu)
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["montoNuevoPresupuestoAuAu"],
          message: "Indique el nuevo monto de referencia del presupuesto base",
        });
      }
      if (
        !data.justificacionActualizacionPresupuestoAuAu?.trim() ||
        data.justificacionActualizacionPresupuestoAuAu.trim().length < 10
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["justificacionActualizacionPresupuestoAuAu"],
          message: "Indique la justificación técnica (mín. 10 caracteres)",
        });
      }
    }

    if (data.observacionFormalidadesAuAu !== true && data.observacionFormalidadesAuAu !== false) {
      ctx.addIssue({
        code: "custom",
        path: ["observacionFormalidadesAuAu"],
        message: "Indique si se observaron omisiones de formalidades",
      });
    }
    if (data.observacionFormalidadesAuAu === true) {
      if (
        !data.omisionFormalidadesAuAu?.trim() ||
        data.omisionFormalidadesAuAu.trim().length < 10
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["omisionFormalidadesAuAu"],
          message: "Describa la omisión observada (mín. 10 caracteres)",
        });
      }
      if (!data.subsanacionActoAuAu?.trim() || data.subsanacionActoAuAu.trim().length < 10) {
        ctx.addIssue({
          code: "custom",
          path: ["subsanacionActoAuAu"],
          message: "Describa la decisión tomada (mín. 10 caracteres)",
        });
      }
      if (
        !data.datosActoSubsanacionAuAu?.trim() ||
        data.datosActoSubsanacionAuAu.trim().length < 10
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["datosActoSubsanacionAuAu"],
          message: "Indique los datos del acto de subsanación (mín. 10 caracteres)",
        });
      }
    }
  });

export type InformeRecomendacionLocalValues = z.infer<typeof informeRecomendacionLocalSchema>;

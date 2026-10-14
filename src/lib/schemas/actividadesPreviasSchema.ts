import { z } from "zod";

const MAX_TEXT_100 = 100;
const MAX_TEXT_255 = 255;
const MAX_TEXT_500 = 500;

function parseDecimalString(value: string) {
  const raw = value.trim();
  if (!raw) return Number.NaN;
  if (/^\d+(\.\d+)?$/.test(raw)) return Number(raw);
  const normalized = raw.replace(/\./g, "").replace(",", ".");
  return Number(normalized);
}

function requiredText(message: string, maxLength = MAX_TEXT_255) {
  return z
    .string({ message })
    .trim()
    .min(1, message)
    .max(maxLength, `Máximo ${maxLength} caracteres`);
}

function requiredBoolean(message: string) {
  return z
    .boolean()
    .optional()
    .refine((value) => value === true || value === false, { message });
}

function requiredPositiveIntegerString(message: string) {
  return z
    .string({ message })
    .trim()
    .min(1, message)
    .refine((value) => /^\d+$/.test(value), "Debe ingresar un número entero")
    .refine((value) => Number(value) > 0, "Debe ser mayor a cero");
}

function optionalDecimalString() {
  return z
    .string()
    .transform((value) => value.trim())
    .refine((value) => value === "" || !Number.isNaN(parseDecimalString(value)), {
      message: "Debe ingresar un número válido",
    });
}

function requiredVanScoreString(message: string) {
  return z
    .string({ message })
    .trim()
    .min(1, message)
    .refine((value) => /^\d+$/.test(value), "Debe ingresar un número entero")
    .refine((value) => {
      const num = Number(value);
      return num > 0 && num <= 10;
    }, "Debe ser un valor entre 1 y 10 puntos");
}

function requiredDateString(message: string) {
  return z
    .string({ message })
    .trim()
    .min(1, message)
    .refine((value) => /^\d{4}-\d{2}-\d{2}$/.test(value), "Debe seleccionar una fecha válida");
}

const baseActividadesPreviasSchema = z.object({
  numReferenciaSncAuAu: requiredText(
    "Indique el número de referencia del requerimiento ante el SNC",
    MAX_TEXT_100
  ),
  modifRequerimientoSncAuAu: requiredBoolean(
    "Indique si el requerimiento ha sido modificado posteriormente"
  ),
  numeroModifRequerimientoSncAuAu: z.string().max(MAX_TEXT_100).optional(),
  justificacionNecesidadContratacionAuAu: requiredText(
    "La justificación de la necesidad es requerida",
    MAX_TEXT_255
  ),
  justificacionVentajasAuAu: requiredText(
    "Describa las ventajas técnicas y económicas",
    MAX_TEXT_255
  ),
  condicionPlurianualAuAu: requiredBoolean("Indique si la contratación es plurianual"),
  proyectoAprobadoAuAu: z.boolean().optional(),
  permitePymesCooperativasAuAu: requiredBoolean(
    "Indique si el requerimiento es compatible con PyMES y Cooperativas"
  ),
  justificacionPermitePymesCooperativasAuAu: z.string().max(MAX_TEXT_255).optional(),
  viabilidadContratoMarcoAuAu: requiredBoolean(
    "Indique la viabilidad de agrupar o utilizar contrato marco"
  ),
  // DB: fase_preparatoria.justificacion_contrato_marco_au_au VARCHAR(100)
  justificacionContratoMarcoAuAu: z.string().max(MAX_TEXT_100).optional(),
  fecEstudioMercadoAuAu: requiredDateString("Indique la fecha del estudio de mercado"),
  numCertificacionPresupuestariaAuAu: requiredText(
    "Indique el número de referencia de la CDP",
    MAX_TEXT_100
  ),
  plazoEjecucionProcedimientoAuAu: requiredPositiveIntegerString(
    "Indique el plazo de ejecución en días"
  ),
  lugarLogisticaEjecucionAuAu: requiredText(
    "Indique la ubicación y dirección de entrega/ejecución",
    MAX_TEXT_500
  ),
  requiereEspecializadoAuAu: requiredBoolean(
    "Indique si requiere personal, maquinaria o instalaciones especializadas"
  ),
  detalleEspecializadoAuAu: z.string().max(MAX_TEXT_500).optional(),
  requiereMuestrasAuAu: requiredBoolean("Indique si se requieren muestras físicas"),
  detalleProcedimientoMuestrasAuAu: z.string().max(MAX_TEXT_500).optional(),
  activaPromocionEconomicaAuAu: requiredBoolean(
    "Indique si desea activar las medidas de promoción económica"
  ),
  requiereVanAuAu: z.boolean().optional(),
  puntajeVanAuAu: z.string().optional(),
  indPrefLocalAuAu: z.boolean().optional(),
  puntuacionBonoLocalAuAu: z.string().optional(),
  indBonoSujetoAuAu: z.boolean().optional(),
  puntuacionBonoSujetoAuAu: z.string().optional(),
  requiereGarantiaLaboralAuAu: requiredBoolean("Indique si se exigirá la Garantía Laboral"),
  porcentajeGarantiaLaboralAuAu: optionalDecimalString(),
  retencionFianzaLaboralAuAu: z.boolean().optional(),
  polizaResponsabilidadCivilAuAu: requiredBoolean(
    "Indique si se exigirá Póliza de Responsabilidad Civil"
  ),
  porcentajeResponsabilidadCivilAuAu: optionalDecimalString(),
  montoResponsabilidadCivilBsAuAu: optionalDecimalString(),
  anticipoContratoAuAu: requiredBoolean("Indique si desea otorgar un Anticipo Contractual"),
  porcentajeAnticipoAuAu: optionalDecimalString(),
});

export type ActividadesPreviasFormInputValues = z.input<typeof baseActividadesPreviasSchema>;

export function buildActividadesPreviasFormSchema(
  tipoContratacion: "BIENES" | "SERVICIOS" | "OBRAS"
) {
  return baseActividadesPreviasSchema.superRefine((data, ctx) => {
    if (data.modifRequerimientoSncAuAu === true) {
      if (!data.numeroModifRequerimientoSncAuAu?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["numeroModifRequerimientoSncAuAu"],
          message: "Indique el número de referencia de la modificación ante el SNC",
        });
      }
    }

    if (tipoContratacion === "OBRAS" && data.proyectoAprobadoAuAu === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["proyectoAprobadoAuAu"],
        message: "Indique si cuenta con el proyecto aprobado",
      });
    }

    if (data.permitePymesCooperativasAuAu === false) {
      if (!data.justificacionPermitePymesCooperativasAuAu?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["justificacionPermitePymesCooperativasAuAu"],
          message: "Indique la justificación por la cual no se permitirá la participación",
        });
      }
    }

    if (data.viabilidadContratoMarcoAuAu === true) {
      if (!data.justificacionContratoMarcoAuAu?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["justificacionContratoMarcoAuAu"],
          message: "Deje constancia de la evaluación sobre contrato marco o agrupación",
        });
      }
    }

    if (data.requiereEspecializadoAuAu === true) {
      if (!data.detalleEspecializadoAuAu?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["detalleEspecializadoAuAu"],
          message: "Describa el personal, maquinaria o instalaciones necesarias",
        });
      }
    }

    if (data.requiereMuestrasAuAu === true) {
      if (!data.detalleProcedimientoMuestrasAuAu?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["detalleProcedimientoMuestrasAuAu"],
          message: "Describa los ítems, cantidad y procedimiento de evaluación de muestras",
        });
      }
    }

    if (data.activaPromocionEconomicaAuAu === true) {
      if (data.requiereVanAuAu === undefined) {
        ctx.addIssue({
          code: "custom",
          path: ["requiereVanAuAu"],
          message: "Indique si se incorporará preferencia por VAN",
        });
      }
      if (data.indPrefLocalAuAu === undefined) {
        ctx.addIssue({
          code: "custom",
          path: ["indPrefLocalAuAu"],
          message: "Indique si otorgará bonificación territorial",
        });
      }
      if (data.indBonoSujetoAuAu === undefined) {
        ctx.addIssue({
          code: "custom",
          path: ["indBonoSujetoAuAu"],
          message: "Indique si asignará puntuación adicional a PyMIS y cooperativas",
        });
      }

      if (data.requiereVanAuAu === true) {
        const result = requiredVanScoreString("Indique la puntuación máxima de VAN").safeParse(
          data.puntajeVanAuAu ?? ""
        );
        if (!result.success) {
          ctx.addIssue({
            code: "custom",
            path: ["puntajeVanAuAu"],
            message: result.error.issues[0]?.message ?? "Puntuación VAN inválida",
          });
        }
      }

      if (data.indPrefLocalAuAu === true) {
        const result = requiredPositiveIntegerString(
          "Indique el puntaje adicional local"
        ).safeParse(data.puntuacionBonoLocalAuAu ?? "");
        if (!result.success) {
          ctx.addIssue({
            code: "custom",
            path: ["puntuacionBonoLocalAuAu"],
            message: result.error.issues[0]?.message ?? "Puntaje local inválido",
          });
        }
      }

      if (data.indBonoSujetoAuAu === true) {
        const result = requiredPositiveIntegerString(
          "Indique el puntaje adicional por categoría de sujeto"
        ).safeParse(data.puntuacionBonoSujetoAuAu ?? "");
        if (!result.success) {
          ctx.addIssue({
            code: "custom",
            path: ["puntuacionBonoSujetoAuAu"],
            message: result.error.issues[0]?.message ?? "Puntaje por sujeto inválido",
          });
        }
      }
    }

    if (data.requiereGarantiaLaboralAuAu === true) {
      const pct = data.porcentajeGarantiaLaboralAuAu?.trim() ?? "";
      if (!pct) {
        ctx.addIssue({
          code: "custom",
          path: ["porcentajeGarantiaLaboralAuAu"],
          message: "Indique el porcentaje de la Garantía Laboral",
        });
      } else {
        const num = parseDecimalString(pct);
        if (Number.isNaN(num) || num < 0 || num > 100) {
          ctx.addIssue({
            code: "custom",
            path: ["porcentajeGarantiaLaboralAuAu"],
            message: "Debe ser un valor entre 0 y 100",
          });
        }
      }
      if (data.retencionFianzaLaboralAuAu !== true && data.retencionFianzaLaboralAuAu !== false) {
        ctx.addIssue({
          code: "custom",
          path: ["retencionFianzaLaboralAuAu"],
          message: "Indique si se admitirá retención para la Garantía Laboral",
        });
      }
    }

    if (data.polizaResponsabilidadCivilAuAu === true) {
      const pct = data.porcentajeResponsabilidadCivilAuAu?.trim() ?? "";
      if (!pct) {
        ctx.addIssue({
          code: "custom",
          path: ["porcentajeResponsabilidadCivilAuAu"],
          message: "Indique el porcentaje de la suma asegurada",
        });
      } else {
        const num = parseDecimalString(pct);
        if (Number.isNaN(num) || num < 0 || num > 100) {
          ctx.addIssue({
            code: "custom",
            path: ["porcentajeResponsabilidadCivilAuAu"],
            message: "Debe ser un valor entre 0 y 100",
          });
        }
      }
      const monto = data.montoResponsabilidadCivilBsAuAu?.trim() ?? "";
      if (!monto) {
        ctx.addIssue({
          code: "custom",
          path: ["montoResponsabilidadCivilBsAuAu"],
          message: "Indique el monto total de la Suma Asegurada",
        });
      } else if (Number.isNaN(parseDecimalString(monto)) || parseDecimalString(monto) <= 0) {
        ctx.addIssue({
          code: "custom",
          path: ["montoResponsabilidadCivilBsAuAu"],
          message: "Debe ser un monto mayor a cero",
        });
      }
    }

    if (data.anticipoContratoAuAu === true) {
      const pct = data.porcentajeAnticipoAuAu?.trim() ?? "";
      if (!pct) {
        ctx.addIssue({
          code: "custom",
          path: ["porcentajeAnticipoAuAu"],
          message: "Indique el porcentaje de anticipo",
        });
      } else {
        const num = parseDecimalString(pct);
        if (Number.isNaN(num) || num < 0 || num > 50) {
          ctx.addIssue({
            code: "custom",
            path: ["porcentajeAnticipoAuAu"],
            message: "El anticipo debe ser un valor entre 0 y 50",
          });
        }
      }
    }
  });
}

export type ActividadesPreviasFormValues = z.infer<
  ReturnType<typeof buildActividadesPreviasFormSchema>
>;

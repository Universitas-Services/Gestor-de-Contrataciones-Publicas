import { z } from "zod";

const MAX_TEXT_100 = 100;
const MAX_TEXT_255 = 255;
const MAX_TEXT_500 = 500;

function parseDecimalString(value: string) {
  const normalized = value.trim().replace(/\./g, "").replace(",", ".");
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

function requiredPositiveDecimalString(message: string) {
  return z
    .string({ message })
    .trim()
    .min(1, message)
    .refine((value) => !Number.isNaN(parseDecimalString(value)), "Debe ingresar un número válido")
    .refine((value) => parseDecimalString(value) > 0, "Debe ser mayor a cero");
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
  justificacionContratoMarcoAuAu: z.string().max(MAX_TEXT_255).optional(),
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
        const result = requiredPositiveDecimalString(
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
        const result = requiredPositiveDecimalString(
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
  });
}

export type ActividadesPreviasFormValues = z.infer<
  ReturnType<typeof buildActividadesPreviasFormSchema>
>;

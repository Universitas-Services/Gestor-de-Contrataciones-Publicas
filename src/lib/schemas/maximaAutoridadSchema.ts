import { z } from "zod";

/**
 * Schema de validación para el formulario de Máxima Autoridad
 * Endpoint: POST /maxima-autoridad
 */
export const maximaAutoridadSchema = z
  .object({
    // Datos de la Autoridad
    nombreCompletoAutoridad: z.string().min(1, "El nombre completo de la autoridad es requerido"),
    cedulaAutoridad: z.string().min(1, "La cédula de la autoridad es requerida"),
    cargoOficialAutoridad: z.string().min(1, "El cargo oficial de la autoridad es requerido"),
    datosDesignacionAutoridad: z
      .string()
      .min(1, "Los datos de designación de la autoridad son requeridos"),
    leyesAtribucionesSuscribirAutoridad: z
      .string()
      .min(1, "Las leyes y atribuciones de la autoridad son requeridas"),

    // Campos de estado
    esDelegado: z.boolean(),
    vigente: z.boolean(),

    // Datos del Delegado (opcionales, condicionales a esDelegado === true)
    nombreCompletoDelegado: z.string().optional(),
    cedulaDelegado: z.string().optional(),
    cargoOficialDelegado: z.string().optional(),
    datosDesignacionDelegado: z.string().optional(),
    leyesAtribucionesSuscribirDelegado: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Si esDelegado es true, los campos del delegado se vuelven obligatorios
    if (data.esDelegado) {
      if (!data.nombreCompletoDelegado || data.nombreCompletoDelegado.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El nombre completo del delegado es requerido",
          path: ["nombreCompletoDelegado"],
        });
      }
      if (!data.cedulaDelegado || data.cedulaDelegado.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La cédula del delegado es requerida",
          path: ["cedulaDelegado"],
        });
      }
      if (!data.cargoOficialDelegado || data.cargoOficialDelegado.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El cargo oficial del delegado es requerido",
          path: ["cargoOficialDelegado"],
        });
      }
      if (!data.datosDesignacionDelegado || data.datosDesignacionDelegado.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Los datos de designación del delegado son requeridos",
          path: ["datosDesignacionDelegado"],
        });
      }
      if (
        !data.leyesAtribucionesSuscribirDelegado ||
        data.leyesAtribucionesSuscribirDelegado.trim() === ""
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Las leyes y atribuciones del delegado son requeridas",
          path: ["leyesAtribucionesSuscribirDelegado"],
        });
      }
    }
  });

export type MaximaAutoridadFormValues = z.infer<typeof maximaAutoridadSchema>;

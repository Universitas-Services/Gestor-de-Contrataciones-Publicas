import { z } from "zod";

/**
 * Schema de validación para el formulario de Máxima Autoridad
 * Endpoint: POST /maxima-autoridad
 */
export const maximaAutoridadSchema = z
  .object({
    // Datos de la Autoridad
    nombreCompletoAutoridad: z
      .string()
      .min(1, "El nombre completo de la autoridad es requerido")
      .max(255, "Máximo 255 caracteres"),
    cedulaAutoridad: z
      .string()
      .min(1, "La cédula de la autoridad es requerida")
      .regex(/^[VE]-\d{6,8}$/, "Formato de cédula inválido (ej. V-12345678)"),
    cargoOficialAutoridad: z
      .string()
      .min(1, "El cargo oficial de la autoridad es requerido")
      .max(255, "Máximo 255 caracteres"),
    datosDesignacionAutoridad: z
      .string()
      .min(1, "Los datos de designación de la autoridad son requeridos")
      .max(255, "Máximo 255 caracteres"),
    leyesAtribucionesSuscribirAutoridad: z
      .string()
      .min(1, "Las leyes y atribuciones de la autoridad son requeridas")
      .max(600, "Máximo 600 caracteres"),

    // Campos de estado
    esDelegado: z.boolean(),
    vigente: z.boolean(),

    // Datos del Delegado (opcionales, se validan en superRefine si esDelegado es true)
    nombreCompletoDelegado: z.string().max(255, "Máximo 255 caracteres").optional(),
    cedulaDelegado: z.string().optional(),
    cargoOficialDelegado: z.string().max(255, "Máximo 255 caracteres").optional(),
    datosDesignacionDelegado: z.string().max(255, "Máximo 255 caracteres").optional(),
    leyesAtribucionesSuscribirDelegado: z.string().max(600, "Máximo 600 caracteres").optional(),
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
      } else if (!/^[VE]-\d{6,8}$/.test(data.cedulaDelegado)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Formato de cédula inválido (ej. V-12345678)",
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

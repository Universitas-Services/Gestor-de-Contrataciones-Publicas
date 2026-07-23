import { z } from "zod";

/**
 * Schema de validación para el formulario de Unidad Usuaria
 * Endpoint: POST /unidad-usuaria
 */
export const unidadUsuariaSchema = z.object({
  nombreUnidadUsuaria: z
    .string()
    .min(1, "El nombre de la Unidad Usuaria es requerido")
    .max(255, "Máximo 255 caracteres"),
  nombreResponsableUnidadUsuaria: z
    .string()
    .min(1, "El nombre del responsable es requerido")
    .max(255, "Máximo 255 caracteres"),
  cedulaResponsableUnidadUsuaria: z
    .string()
    .min(1, "La cédula del responsable es requerida")
    .regex(/^[VE]-\d{6,8}$/, "Formato de cédula inválido (ej. V-12345678)"),
  cargoResponsableUnidadUsuaria: z
    .string()
    .min(1, "El cargo del responsable es requerido")
    .max(255, "Máximo 255 caracteres"),
  datosDesignacionUnidadUsuaria: z
    .string()
    .min(1, "Los datos de designación son requeridos")
    .max(255, "Máximo 255 caracteres"),
});

export type UnidadUsuariaFormValues = z.infer<typeof unidadUsuariaSchema>;

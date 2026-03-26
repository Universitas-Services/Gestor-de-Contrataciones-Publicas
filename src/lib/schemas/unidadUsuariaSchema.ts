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
  cargoResponsableUnidadUsuaria: z
    .string()
    .min(1, "El cargo del responsable es requerido")
    .max(255, "Máximo 255 caracteres"),
});

export type UnidadUsuariaFormValues = z.infer<typeof unidadUsuariaSchema>;

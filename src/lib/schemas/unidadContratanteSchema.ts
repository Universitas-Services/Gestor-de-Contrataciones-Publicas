import { z } from "zod";

/**
 * Schema de validación para el formulario de Unidad Contratante
 * Endpoint: POST /unidad-contratante
 */
export const unidadContratanteSchema = z.object({
  nombreUnidadContratante: z
    .string()
    .min(1, "El nombre de la Unidad Contratante es requerido")
    .max(255, "Máximo 255 caracteres"),
  nombreResponsableUnidad: z
    .string()
    .min(1, "El nombre del responsable de la unidad es requerido")
    .max(255, "Máximo 255 caracteres"),
  cargoResponsable: z
    .string()
    .min(1, "El cargo del responsable es requerido")
    .max(255, "Máximo 255 caracteres"),
});

export type UnidadContratanteFormValues = z.infer<typeof unidadContratanteSchema>;

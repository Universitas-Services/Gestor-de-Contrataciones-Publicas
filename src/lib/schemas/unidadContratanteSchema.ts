import { z } from "zod";

/**
 * Schema de validación para el formulario de Unidad Contratante
 * Endpoint: POST /unidad-contratante
 */
export const unidadContratanteSchema = z.object({
  nombreUnidadContratante: z.string().min(1, "El nombre de la Unidad Contratante es requerido"),
  nombreResponsableUnidad: z.string().min(1, "El nombre del responsable de la unidad es requerido"),
  cargoResponsable: z.string().min(1, "El cargo del responsable es requerido"),
  activa: z.boolean(),
});

export type UnidadContratanteFormValues = z.infer<typeof unidadContratanteSchema>;

import { z } from "zod";

/**
 * Schema de validación para el formulario de Unidad Usuaria
 * Endpoint: POST /unidad-usuaria
 */
export const unidadUsuariaSchema = z.object({
  nombreUnidadUsuaria: z.string().min(1, "El nombre de la Unidad Usuaria es requerido"),
  nombreResponsableUnidadUsuaria: z.string().min(1, "El nombre del responsable es requerido"),
  cargoResponsableUnidadUsuaria: z.string().min(1, "El cargo del responsable es requerido"),
});

export type UnidadUsuariaFormValues = z.infer<typeof unidadUsuariaSchema>;

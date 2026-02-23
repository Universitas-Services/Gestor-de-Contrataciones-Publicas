import { z } from "zod";

/**
 * Schema de validación para el formulario de Completar Datos del Ente
 */
export const completarEnteSchema = z.object({
  nombre: z.string().min(1, "El nombre del ente es requerido"),
  rif: z.string().min(1, "El RIF es requerido"),
  siglas: z.string().min(1, "Las siglas son requeridas"),
  direccionFiscal: z.string().min(1, "La dirección fiscal es requerida"),
  estado: z.string().min(1, "El estado es requerido"),
  municipio: z.string().min(1, "El municipio es requerido"),
  parroquia: z.string().min(1, "La parroquia es requerida"),
  nombreUnidadAdminFinanciera: z
    .string()
    .min(1, "El nombre de la Unidad Administrativa Financiera es requerido"),
  nombreUnidadTecnologia: z.string().min(1, "El nombre de la Unidad de Tecnología es requerido"),
  nombreUnidadContratante: z.string().min(1, "El nombre de la Unidad Contratante es requerido"),
  organoAdscripcion: z.string().min(1, "El órgano de adscripción es requerido"),
});

export type CompletarEnteFormValues = z.infer<typeof completarEnteSchema>;

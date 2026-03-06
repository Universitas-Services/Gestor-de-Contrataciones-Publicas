import { z } from "zod";

/**
 * Schema de validación para el formulario de Completar Datos del Ente
 */
export const completarEnteSchema = z.object({
  nombre: z.string().min(1, "El nombre del ente es requerido"),
  rif: z
    .string()
    .min(1, "El RIF es requerido")
    .regex(/^[GJ]-\d{8}-\d$/, "El RIF debe tener formato G-00000000-0 o J-00000000-0"),
  siglas: z
    .string()
    .min(1, "Las siglas son requeridas")
    .regex(
      /^[a-zA-Z0-9\.\(\) ]+$/,
      "Las siglas solo pueden contener letras, números, puntos y paréntesis"
    ),
  direccionFiscal: z.string().min(1, "La dirección fiscal es requerida"),
  estado: z.string().min(1, "El estado es requerido"),
  municipio: z.string().min(1, "El municipio es requerido"),
  ciudad: z.string().min(1, "La ciudad es requerida"),
  parroquia: z.string().min(1, "La parroquia es requerida"),
  nombreUnidadAdminFinanciera: z
    .string()
    .min(1, "La Unidad Administrativa y Financiera es requerida"),
  nombreUnidadTecnologia: z.string().min(1, "La Unidad de Tecnología es requerida"),
  nombreUnidadContratante: z.string().min(1, "La Unidad Contratante es requerida"),
  organoAdscripcion: z.string().min(1, "El órgano de adscripción es requerido"),
});

export type CompletarEnteFormValues = z.infer<typeof completarEnteSchema>;

import { z } from "zod";

/**
 * Schema de validación para el formulario de Completar Datos del Ente
 */
export const completarEnteSchema = z.object({
  nombre: z.string().min(1, "El nombre del ente es requerido").max(255, "Máximo 255 caracteres"),
  rif: z
    .string()
    .min(1, "El RIF es requerido")
    .regex(/^[GJ]-\d{8}-\d$/, "El RIF debe tener formato G-00000000-0 o J-00000000-0"),
  siglas: z
    .string()
    .min(1, "Las siglas son requeridas")
    .max(255, "Máximo 255 caracteres")
    .regex(
      /^[a-zA-Z0-9\.\(\) ]+$/,
      "Las siglas solo pueden contener letras, números, puntos y paréntesis"
    ),
  direccionFiscal: z
    .string()
    .min(1, "La dirección fiscal es requerida")
    .max(255, "Máximo 255 caracteres"),
  estado: z.string().min(1, "El estado es requerido").max(255, "Máximo 255 caracteres"),
  municipio: z.string().min(1, "El municipio es requerido").max(255, "Máximo 255 caracteres"),
  ciudad: z.string().min(1, "La ciudad es requerida").max(255, "Máximo 255 caracteres"),
  parroquia: z.string().min(1, "La parroquia es requerida").max(255, "Máximo 255 caracteres"),
  nombreUnidadAdminFinanciera: z
    .string()
    .min(1, "La Unidad Administrativa y Financiera es requerida")
    .max(255, "Máximo 255 caracteres"),
  nombreUnidadTecnologia: z
    .string()
    .min(1, "La Unidad de Tecnología es requerida")
    .max(255, "Máximo 255 caracteres"),
  nombreUnidadContratante: z
    .string()
    .min(1, "La Unidad Contratante es requerida")
    .max(255, "Máximo 255 caracteres"),
  organoAdscripcion: z
    .string()
    .min(1, "El órgano de adscripción es requerido")
    .max(255, "Máximo 255 caracteres"),
});

export type CompletarEnteFormValues = z.infer<typeof completarEnteSchema>;

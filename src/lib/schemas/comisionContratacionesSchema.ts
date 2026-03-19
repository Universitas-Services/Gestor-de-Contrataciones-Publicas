import { z } from "zod";

/**
 * Valores permitidos por el backend para tipoMiembro y areaRepresentacion
 */
/**
 * Valores permitidos por el backend para tipoMiembro y areaRepresentacion
 */
export const TIPO_MIEMBRO_OPTIONS = ["MIEMBRO_PRINCIPAL", "MIEMBRO_SUPLENTE"] as const;

export const AREA_REPRESENTACION_OPTIONS = [
  "AREA_JURIDICA",
  "AREA_TECNICA",
  "AREA_ECONOMICA_FINANCIERA",
  "SECRETARIO_A",
] as const;

/**
 * Mapeo de valores de backend a etiquetas legibles para el usuario
 */
export const TIPO_MIEMBRO_LABELS: Record<(typeof TIPO_MIEMBRO_OPTIONS)[number], string> = {
  MIEMBRO_PRINCIPAL: "Miembro principal",
  MIEMBRO_SUPLENTE: "Miembro suplente",
};

export const AREA_REPRESENTACION_LABELS: Record<
  (typeof AREA_REPRESENTACION_OPTIONS)[number],
  string
> = {
  AREA_JURIDICA: "Área jurídica",
  AREA_TECNICA: "Área técnica",
  AREA_ECONOMICA_FINANCIERA: "Área económica-financiera",
  SECRETARIO_A: "Secretario(a)",
};

/**
 * Schema de validación para cada miembro de la comisión
 */
export const miembroSchema = z.object({
  id: z.number().optional(), // El backend seguramente devolverá un ID
  nombreCompletoMiembro: z
    .string()
    .min(1, "El nombre completo del miembro es requerido")
    .max(255, "Máximo 255 caracteres"),
  cedulaMiembro: z
    .string()
    .min(1, "La cédula del miembro es requerida")
    .regex(/^[VE]-\d{6,8}$/, "Formato de cédula inválido (ej. V-12345678)"),
  tipoMiembro: z.enum(TIPO_MIEMBRO_OPTIONS, {
    message: "Seleccione un tipo de miembro",
  }),
  areaRepresentacion: z.enum(AREA_REPRESENTACION_OPTIONS, {
    message: "Seleccione un área de representación",
  }),
});

/**
 * Schema de validación para el formulario base de Comisión de Contrataciones
 */
export const comisionContratacionesSchema = z.object({
  id: z.number().optional(),
  denominacionComision: z
    .string()
    .min(1, "La denominación de la comisión es requerida")
    .max(255, "Máximo 255 caracteres"),
  datosDesignacionComision: z
    .string()
    .min(1, "Los datos de designación son requeridos")
    .max(255, "Máximo 255 caracteres"),
  comisionCertificada: z.boolean(),
  miembros: z.array(miembroSchema).optional(),
});

export type MiembroFormValues = z.infer<typeof miembroSchema>;
export type ComisionContratacionesFormValues = z.infer<typeof comisionContratacionesSchema>;

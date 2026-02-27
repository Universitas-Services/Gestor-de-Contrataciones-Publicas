import { z } from "zod";

/**
 * Valores permitidos por el backend para tipoMiembro y areaRepresentacion
 */
export const TIPO_MIEMBRO_OPTIONS = ["TITULAR", "SUPLENTE", "COORDINADOR", "SECRETARIO"] as const;

export const AREA_REPRESENTACION_OPTIONS = [
  "JURIDICA",
  "TECNICA",
  "FINANCIERA",
  "ADMINISTRATIVA",
] as const;

/**
 * Schema de validación para cada miembro de la comisión
 * Se usa tanto en el Sheet de agregar miembro como en el schema principal
 */
export const miembroSchema = z.object({
  nombreCompletoMiembro: z.string().min(1, "El nombre completo del miembro es requerido"),
  cedulaMiembro: z.string().min(1, "La cédula del miembro es requerida"),
  tipoMiembro: z.enum(TIPO_MIEMBRO_OPTIONS, {
    message: "Seleccione un tipo de miembro",
  }),
  areaRepresentacion: z.enum(AREA_REPRESENTACION_OPTIONS, {
    message: "Seleccione un área de representación",
  }),
});

/**
 * Schema de validación para el formulario de Comisión de Contrataciones
 */
export const comisionContratacionesSchema = z.object({
  denominacionComision: z.string().min(1, "La denominación de la comisión es requerida"),
  datosDesignacionComision: z.string().min(1, "Los datos de designación son requeridos"),
  comisionCertificada: z.boolean(),
  miembros: z.array(miembroSchema).min(1, "Debe agregar al menos un miembro"),
});

export type MiembroFormValues = z.infer<typeof miembroSchema>;
export type ComisionContratacionesFormValues = z.infer<typeof comisionContratacionesSchema>;

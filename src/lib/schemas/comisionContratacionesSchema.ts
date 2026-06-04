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
  id: z.union([z.number(), z.string()]).optional(), // El backend puede devolver string o number
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
  id: z.union([z.number(), z.string()]).optional(),
  denominacionComision: z
    .string()
    .min(1, "La denominación de la comisión es requerida")
    .max(255, "Máximo 255 caracteres"),
  datosDesignacionComision: z
    .string()
    .min(1, "Los datos de designación son requeridos")
    .max(255, "Máximo 255 caracteres"),
  correoElectronico: z
    .string()
    .min(1, { message: "El correo electrónico es requerido" })
    .email({ message: "Ingrese un correo electrónico válido" }),
  telefono: z.string().min(1, { message: "El teléfono de contacto es requerido" }),
  comisionCertificada: z.boolean(),
  miembros: z
    .array(miembroSchema)
    .length(8, "La comisión debe tener exactamente 8 miembros")
    .refine((miembros) => {
      const rolesPorArea: Record<string, Set<string>> = {};

      for (const miembro of miembros) {
        if (!miembro.areaRepresentacion || !miembro.tipoMiembro) continue;
        if (!rolesPorArea[miembro.areaRepresentacion]) {
          rolesPorArea[miembro.areaRepresentacion] = new Set();
        }
        rolesPorArea[miembro.areaRepresentacion].add(miembro.tipoMiembro);
      }

      const areasRequeridas = [
        "AREA_JURIDICA",
        "AREA_TECNICA",
        "AREA_ECONOMICA_FINANCIERA",
        "SECRETARIO_A",
      ];

      for (const area of areasRequeridas) {
        if (!rolesPorArea[area] || rolesPorArea[area].size !== 2) {
          return false;
        }
      }
      return true;
    }, "Debe haber exactamente un miembro principal y un suplente por cada área")
    .superRefine((miembros, ctx) => {
      const seenCedulas = new Map<string, number>();
      miembros.forEach((miembro, index) => {
        const cedula = miembro.cedulaMiembro?.trim().toUpperCase();
        if (!cedula) return;

        if (seenCedulas.has(cedula)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Esta cédula ya está registrada para otro miembro",
            path: [index, "cedulaMiembro"],
          });
        } else {
          seenCedulas.set(cedula, index);
        }
      });
    }),
});

export type MiembroFormValues = z.infer<typeof miembroSchema>;
export type ComisionContratacionesFormValues = z.infer<typeof comisionContratacionesSchema>;

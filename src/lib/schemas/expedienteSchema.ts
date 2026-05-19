import { z } from "zod";

/**
 * Modalidad de Contratación Sugerida (hardcoded)
 */
export const MODALIDAD_SUGERIDA = "Concurso Abierto, acto único, apertura única";

/**
 * Base Legal (hardcoded)
 */
export const BASE_LEGAL = "Artículo 78, Numeral [1], DLCP";

// ─── Enum values alineados con el backend ────────────────────────────

export const TIPOS_CONTRATACION_BACKEND = ["OBRAS", "BIENES", "SERVICIOS"] as const;
export type TipoContratacionBackend = (typeof TIPOS_CONTRATACION_BACKEND)[number];

export const MODALIDADES_SELECCION = ["LICITACION_PUBLICA"] as const;
export type ModalidadSeleccion = (typeof MODALIDADES_SELECCION)[number];

// ─── Opciones de tipo de contratación para los Selects ───────────────

export const TIPOS_CONTRATACION_OPTIONS = [
  { value: "OBRAS", label: "Obras" },
  { value: "BIENES", label: "Bienes" },
  { value: "SERVICIOS", label: "Servicios" },
] as const;

// ─── Schema Paso 1: Datos Básicos ────────────────────────────────────

/**
 * Schema de validación para el formulario de Datos Básicos (Paso 1)
 * Endpoint: POST /expedientes/borrador
 */
export const datosBasicosSchema = z.object({
  descripcionObjeto: z
    .string()
    .min(1, "La descripción del objeto del procedimiento es requerida")
    .max(500, "Máximo 500 caracteres"),

  codigoNomenclatura: z
    .string()
    .min(1, "El código de nomenclatura es requerido")
    .max(100, "Máximo 100 caracteres"),

  tipoContratacion: z.enum(TIPOS_CONTRATACION_BACKEND, {
    message: "Debe seleccionar un tipo de contratación",
  }),

  montoEstimadoBs: z
    .number({ message: "El monto en Bs. es requerido" })
    .positive("El monto en Bs. debe ser mayor a cero"),
});

export type DatosBasicosFormValues = z.infer<typeof datosBasicosSchema>;

// ─── Schema Paso 3: Configuración de Actores ────────────────────────

/**
 * Schema de validación para el formulario de Configuración de Actores (Paso 3)
 * Endpoint: PUT /expedientes/{id}/actores
 */
export const configuracionActoresSchema = z.object({
  autoridadId: z.string().min(1, "Debe seleccionar una Máxima Autoridad"),

  /** true si el usuario seleccionó al delegado, false si eligió la autoridad directa */
  autoridadFirmaComoDelegado: z.boolean(),

  comisionId: z.string().min(1, "Debe seleccionar una Comisión de Contrataciones"),

  unidadUsuariaId: z.string().min(1, "Debe seleccionar una Unidad Usuaria"),

  fechaLlamadoParticipar: z.string().min(1, "Debe seleccionar la fecha del Llamado a participar"),
});

export type ConfiguracionActoresFormValues = z.infer<typeof configuracionActoresSchema>;

// ─── Schema Paso 4: Cronograma ──────────────────────────────────────

/**
 * Schema de validación para el cronograma de fechas (Paso 4)
 * Endpoint: PUT /expedientes/{id}/cronograma
 */
export const cronogramaSchema = z.object({
  fechaLlamadoParticipar: z.string().min(1, "La fecha de llamado a participar es requerida"),
  fechaInicioDisponibilidadPliego: z
    .string()
    .min(1, "La fecha de inicio de disponibilidad del pliego es requerida"),
  fechaFinDisponibilidadPliego: z
    .string()
    .min(1, "La fecha fin de disponibilidad del pliego es requerida"),
  fechaSolicitudAclaratorias: z
    .string()
    .min(1, "La fecha de solicitud de aclaratorias es requerida"),
  fechaRespuestaAclaratorias: z
    .string()
    .min(1, "La fecha de respuesta de aclaratorias es requerida"),
  fechaModificacionPliego: z.string().min(1, "La fecha de modificación del pliego es requerida"),
  fechaActoRecepcionAperturaSobres: z
    .string()
    .min(1, "La fecha de recepción y apertura de sobres es requerida"),
  fechaLimiteEvaluacion: z.string().min(1, "La fecha límite de evaluación es requerida"),
  fechaLimiteAdjudicacion: z.string().min(1, "La fecha límite de adjudicación es requerida"),
  fechaLimiteNotificacion: z.string().min(1, "La fecha límite de notificación es requerida"),
  fechaLimiteGarantias: z.string().min(1, "La fecha límite de garantías es requerida"),
  fechaLimiteFirmaContrato: z.string().min(1, "La fecha límite de firma de contrato es requerida"),
});

export type CronogramaFormValues = z.infer<typeof cronogramaSchema>;

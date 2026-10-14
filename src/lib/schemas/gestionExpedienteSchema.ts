import { z } from "zod";

import { TIPOS_CONTRATACION_BACKEND } from "@/lib/schemas/expedienteSchema";

export const MONEDAS_ENTRADA = ["USD", "BS"] as const;
export type MonedaEntrada = (typeof MONEDAS_ENTRADA)[number];

export const MODALIDADES_SELECCION_GESTION = [
  "CONCURSO_ABIERTO",
  "CONCURSO_CERRADO",
  "CONSULTA_PRECIOS",
  "CONTRATACION_DIRECTA",
  "MODALIDADES_EXCLUIDAS",
] as const;

export type ModalidadSeleccionGestion = (typeof MODALIDADES_SELECCION_GESTION)[number];

export const MODALIDAD_SELECCION_OPTIONS: {
  value: ModalidadSeleccionGestion;
  label: string;
}[] = [
  { value: "CONCURSO_ABIERTO", label: "Concurso Abierto" },
  { value: "CONCURSO_CERRADO", label: "Concurso Cerrado" },
  { value: "CONSULTA_PRECIOS", label: "Consulta de Precios" },
  { value: "CONTRATACION_DIRECTA", label: "Contratación Directa" },
  { value: "MODALIDADES_EXCLUIDAS", label: "Modalidades Excluidas" },
];

/** Subtipos de Concurso Abierto (Paso 2). */
export const MODALIDADES_CONCURSO_ABIERTO = [
  "ACTO_UNICO_APERTURA_UNICA",
  "ACTO_UNICO_APERTURA_SEPARADA",
  "ACTOS_SEPARADOS",
] as const;

export type ModalidadConcursoAbierto = (typeof MODALIDADES_CONCURSO_ABIERTO)[number];

export const MODALIDAD_CONCURSO_ABIERTO_OPTIONS: {
  value: ModalidadConcursoAbierto;
  label: string;
  enabled: boolean;
}[] = [
  {
    value: "ACTO_UNICO_APERTURA_UNICA",
    label: "Acto Único Apertura Única",
    enabled: true,
  },
  {
    value: "ACTO_UNICO_APERTURA_SEPARADA",
    label: "Acto Único Apertura Separada",
    enabled: false,
  },
  {
    value: "ACTOS_SEPARADOS",
    label: "Actos Separados",
    enabled: false,
  },
];

/** Campos editables antes de Validar montos. */
export const calculoModalidadInputSchema = z.object({
  fechaActaInicio: z.string().min(1, "La fecha de elaboración del acta de inicio es requerida"),
  tasaReferencialBcv: z
    .number({ message: "La tasa referencial BCV es requerida" })
    .positive("La tasa referencial BCV debe ser mayor a cero"),
  tipoContratacion: z.enum(TIPOS_CONTRATACION_BACKEND, {
    message: "Debe seleccionar un tipo de contratación",
  }),
  monedaEntrada: z.enum(MONEDAS_ENTRADA, {
    message: "Debe seleccionar la moneda",
  }),
  montoEntrada: z
    .number({ message: "El monto estimado es requerido" })
    .positive("El monto estimado debe ser mayor a cero"),
});

export type CalculoModalidadInputValues = z.infer<typeof calculoModalidadInputSchema>;

/** Snapshot del dictamen tras Validar (estado en memoria del wizard). */
export interface DictamenModalidadResult {
  fechaActaInicio: string;
  tasaReferencialBcv: number;
  tipoContratacion: CalculoModalidadInputValues["tipoContratacion"];
  monedaEntrada: MonedaEntrada;
  montoEntrada: number;
  montoEstimadoBs: number;
  montoEstimadoDolar: number;
  valorUcauBase: number;
  /** Alias del valor usado en el cálculo (= tasaReferencialBcv). */
  tasaBcvUsd: number;
  valorUcau: number;
  modalidadSugeridaLabel: string;
  baseLegalSugerida: string;
  modalidadSugeridaSeleccion: ModalidadSeleccionGestion;
  aceptaSugerida: boolean | null;
  modalidadSeleccion: ModalidadSeleccionGestion;
}

/** Paso 2 — Detalles Concurso Abierto. */
export const detallesConcursoAbiertoSchema = z.object({
  modalidadConcursoAbierto: z.enum(["ACTO_UNICO_APERTURA_UNICA"], {
    message: "Debe seleccionar la modalidad de Concurso Abierto",
  }),
  descripcionObjeto: z
    .string()
    .min(1, "La descripción del objeto es requerida")
    .max(500, "Máximo 500 caracteres"),
  codigoNomenclatura: z
    .string()
    .min(1, "La nomenclatura es requerida")
    .max(50, "Máximo 50 caracteres"),
});

export type DetallesConcursoAbiertoFormValues = z.infer<typeof detallesConcursoAbiertoSchema>;

const NUMERALES_CD = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
] as const;

/** Paso 2 — Causal de Contratación Directa (Art. 101 LCP) + objeto/nomenclatura. */
export const detallesContratacionDirectaSchema = z.object({
  numeralCausalProcedenciaCd: z.enum(NUMERALES_CD, {
    message: "Debe seleccionar una causal de procedencia",
  }),
  causalProcedenciaCd: z.string().min(1, "El texto legal de la causal es requerido"),
  /** Backend: desc_objeto_contratacion_cd */
  descObjetoContratacionCd: z
    .string()
    .min(1, "La descripción del objeto es requerida")
    .max(500, "Máximo 500 caracteres"),
  /** Backend: cod_nomenclatura_proceso_cd */
  codNomenclaturaProcesoCd: z
    .string()
    .min(1, "La nomenclatura es requerida")
    .max(50, "Máximo 50 caracteres"),
});

export type DetallesContratacionDirectaFormValues = z.infer<
  typeof detallesContratacionDirectaSchema
>;

/**
 * Paso 3 — Actores CD.
 * `requiereComision` depende de valor_ucau_base vs umbrales Art. 103 LCP.
 */
export function createActoresContratacionDirectaSchema(requiereComision: boolean) {
  return z.object({
    autoridadId: z.string().min(1, "Debe seleccionar una Máxima Autoridad"),
    autoridadFirmaComoDelegado: z.boolean(),
    unidadUsuariaId: z.string().min(1, "Debe seleccionar una Unidad Usuaria"),
    /** Backend: id_unidad_contratante */
    unidadContratanteId: z.string().min(1, "Debe seleccionar una Unidad Contratante"),
    /** Backend: id_comision — obligatorio solo si supera umbral UCAU */
    comisionId: requiereComision
      ? z.string().min(1, "Debe seleccionar una Comisión de Contrataciones")
      : z.string().optional(),
    /** Backend: fec_envio_invitacion_cd */
    fecEnvioInvitacionCd: z
      .string()
      .min(1, "Debe seleccionar la fecha de emisión de la Solicitud de Oferta / Invitación"),
  });
}

export type ActoresContratacionDirectaFormValues = z.infer<
  ReturnType<typeof createActoresContratacionDirectaSchema>
>;

/** Paso 4 — Cronograma abreviado Contratación Directa (variables _cd). */
export const cronogramaContratacionDirectaSchema = z.object({
  fecEnvioInvitacionCd: z.string().min(1),
  fecRecepcionOfertaCd: z.string().min(1),
  fecLimiteAdjudicacionCd: z.string().min(1),
  fecLimiteNotificacionCd: z.string().min(1),
  fecLimiteGarantiasCd: z.string().min(1),
  fecLimiteFirmaContratoCd: z.string().min(1),
});

export type CronogramaContratacionDirectaFormValues = z.infer<
  typeof cronogramaContratacionDirectaSchema
>;

const CAUSALES_CC_VALUES = [
  "POR_MONTO_ESTIMADO",
  "EQUIPOS_ESPECIALIZADOS",
  "SEGURIDAD_DEFENSA",
  "CONCURSO_ABIERTO_DESIERTO",
] as const;

/** Paso 2 — Detalles Concurso Cerrado (Art. 85 LCP). */
export const detallesConcursoCerradoSchema = z.object({
  /** Backend: causal_procedencia_cc (texto de la opción seleccionada) */
  causalProcedenciaCc: z.enum(CAUSALES_CC_VALUES, {
    message: "Debe seleccionar una causal de procedencia",
  }),
  /** Justificación detallada (UI; maqueta) */
  justificacionCausalCc: z
    .string()
    .min(1, "Debe detallar la justificación de la causal")
    .max(500, "Máximo 500 caracteres"),
  /** Backend: desc_objeto_contratacion_cc */
  descObjetoContratacionCc: z
    .string()
    .min(1, "La descripción del objeto es requerida")
    .max(500, "Máximo 500 caracteres"),
  /** Backend: cod_nomenclatura_proceso_cc */
  codNomenclaturaProcesoCc: z
    .string()
    .min(1, "La nomenclatura es requerida")
    .max(50, "Máximo 50 caracteres"),
});

export type DetallesConcursoCerradoFormValues = z.infer<typeof detallesConcursoCerradoSchema>;

/** Paso 3 — Actores Concurso Cerrado. */
export const actoresConcursoCerradoSchema = z.object({
  autoridadId: z.string().min(1, "Debe seleccionar una Máxima Autoridad"),
  autoridadFirmaComoDelegado: z.boolean(),
  comisionId: z.string().min(1, "Debe seleccionar una Comisión de Contrataciones"),
  unidadUsuariaId: z.string().min(1, "Debe seleccionar una Unidad Usuaria"),
  /** Backend: fec_envio_invitacion_cc */
  fecEnvioInvitacionCc: z
    .string()
    .min(1, "Debe seleccionar la fecha de envío de las Invitaciones a Participar"),
});

export type ActoresConcursoCerradoFormValues = z.infer<typeof actoresConcursoCerradoSchema>;

/** Paso 4 — Cronograma Concurso Cerrado (variables _cc). */
export const cronogramaConcursoCerradoSchema = z.object({
  fecEnvioInvitacionCc: z.string().min(1),
  fecInicioDisponibilidadPliegoCc: z.string().min(1),
  fecFinDisponibilidadPliegoCc: z.string().min(1),
  fecSolicitudAclaratoriasCc: z.string().min(1),
  fecRespuestaAclaratoriasCc: z.string().min(1),
  fecModificPliegoCc: z.string().min(1),
  fecActoRecepAperSobresCc: z.string().min(1),
  fecLimiteEvaluacionCc: z.string().min(1),
  fecLimiteAdjudicacionCc: z.string().min(1),
  fecLimiteNotificacionCc: z.string().min(1),
  fecLimiteGarantiasCc: z.string().min(1),
  fecLimiteFirmaContratoCc: z.string().min(1),
});

export type CronogramaConcursoCerradoFormValues = z.infer<typeof cronogramaConcursoCerradoSchema>;

const CAUSALES_CP_VALUES = [
  "LIMITES_CUANTITATIVOS_UCAU",
  "PLAN_EXCEPCIONAL_INTERES_GENERAL",
] as const;

/** Paso 2 — Detalles Consulta de Precios (Art. 96 LCP). */
export const detallesConsultaPreciosSchema = z.object({
  /** Backend: causal_procedencia_cp */
  causalProcedenciaCp: z.enum(CAUSALES_CP_VALUES, {
    message: "Debe seleccionar una causal de procedencia",
  }),
  /** Backend: desc_objeto_contratacion_cp */
  descObjetoContratacionCp: z
    .string()
    .min(1, "La descripción del objeto es requerida")
    .max(500, "Máximo 500 caracteres"),
  /** Backend: cod_nomenclatura_proceso_cp */
  codNomenclaturaProcesoCp: z
    .string()
    .min(1, "La nomenclatura es requerida")
    .max(50, "Máximo 50 caracteres"),
});

export type DetallesConsultaPreciosFormValues = z.infer<typeof detallesConsultaPreciosSchema>;

/**
 * Paso 3 — Actores Consulta de Precios.
 * `requiereComision` depende de umbrales CP (2.500 / 10.000 UCAU).
 */
export function createActoresConsultaPreciosSchema(requiereComision: boolean) {
  return z.object({
    autoridadId: z.string().min(1, "Debe seleccionar una Máxima Autoridad"),
    autoridadFirmaComoDelegado: z.boolean(),
    unidadUsuariaId: z.string().min(1, "Debe seleccionar una Unidad Usuaria"),
    unidadContratanteId: z.string().min(1, "Debe seleccionar una Unidad Contratante"),
    comisionId: requiereComision
      ? z.string().min(1, "Debe seleccionar una Comisión de Contrataciones")
      : z.string().optional(),
    /** Backend: fec_envio_invitacion_cp */
    fecEnvioInvitacionCp: z
      .string()
      .min(1, "Debe seleccionar la fecha de envío de las Invitaciones"),
  });
}

export type ActoresConsultaPreciosFormValues = z.infer<
  ReturnType<typeof createActoresConsultaPreciosSchema>
>;

/** Paso 4 — Cronograma Consulta de Precios (variables _cp). */
export const cronogramaConsultaPreciosSchema = z.object({
  fecEnvioInvitacionCp: z.string().min(1),
  fecSolicitudAclaratoriasCp: z.string().min(1),
  fecRespuestaAclaratoriasCp: z.string().min(1),
  fecRecepcionOfertasCp: z.string().min(1),
  fecLimiteNotificacionCp: z.string().min(1),
  fecLimiteGarantiasCp: z.string().min(1),
  fecLimiteFirmaContratoCp: z.string().min(1),
});

export type CronogramaConsultaPreciosFormValues = z.infer<typeof cronogramaConsultaPreciosSchema>;

const CAUSALES_ME_VALUES = [
  "ART4_ACUERDOS_INTERNACIONALES",
  "ART4_EMPRESAS_ACUERDOS_INTERNACIONALES",
  "ART4_SERVICIOS_LABORALES",
  "ART4_ARRENDAMIENTO_INMUEBLES",
  "ART4_PATROCINIO",
  "ART5_SERVICIOS_PROFESIONALES",
  "ART5_SERVICIOS_FINANCIEROS",
  "ART5_ADQUISICION_INMUEBLES",
  "ART5_ADQUISICION_SEMOVIENTES",
  "ART5_OBRAS_ARTISTICAS_LITERARIAS_CIENTIFICAS",
  "ART5_ALIANZAS_COMERCIALES_ESTRATEGICAS",
  "ART5_SERVICIOS_BASICOS_INDISPENSABLES",
  "ART5_EJECUCION_DIRECTA_ADMINISTRACION",
  "ART5_CONTRATACION_ENTES_ESTADO",
  "ART5_ENCOMIENDAS_GESTION",
  "ART5_COMPRAS_CAJA_CHICA",
  "ART5_ESTADOS_EXCEPCION",
  "ART5_SEGURIDAD_DEFENSA_INTELIGENCIA",
  "ART5_DESABASTECIMIENTO_PRIMERA_NECESIDAD",
] as const;

/** Paso 2 — Detalles Modalidades Excluidas (Art. 4 y 5 LCP). */
export const detallesModalidadesExcluidasSchema = z.object({
  /** Backend: causal_procedencia_me */
  causalProcedenciaMe: z.enum(CAUSALES_ME_VALUES, {
    message: "Debe seleccionar una causal de exclusión",
  }),
  /** Backend: desc_objeto_contratacion_me */
  descObjetoContratacionMe: z
    .string()
    .min(1, "La descripción del objeto es requerida")
    .max(500, "Máximo 500 caracteres"),
  /** Backend: cod_nomenclatura_proceso_me */
  codNomenclaturaProcesoMe: z
    .string()
    .min(1, "La nomenclatura es requerida")
    .max(50, "Máximo 50 caracteres"),
});

export type DetallesModalidadesExcluidasFormValues = z.infer<
  typeof detallesModalidadesExcluidasSchema
>;

/**
 * Paso 3 — Actores Modalidades Excluidas.
 * Adjudicación directa por Máxima Autoridad: sin Comisión ni Unidad Contratante.
 */
export const actoresModalidadesExcluidasSchema = z.object({
  autoridadId: z.string().min(1, "Debe seleccionar una Máxima Autoridad"),
  autoridadFirmaComoDelegado: z.boolean(),
  unidadUsuariaId: z.string().min(1, "Debe seleccionar una Unidad Usuaria"),
  /** Backend: fec_inicio_procedimiento_me */
  fecInicioProcedimientoMe: z
    .string()
    .min(1, "Debe seleccionar la fecha de inicio del procedimiento"),
});

export type ActoresModalidadesExcluidasFormValues = z.infer<
  typeof actoresModalidadesExcluidasSchema
>;

/** Paso 4 — Cronograma Modalidades Excluidas (variables _me). */
export const cronogramaModalidadesExcluidasSchema = z.object({
  fecInicioProcedimientoMe: z.string().min(1),
  fecVerificacionRecaudosMe: z.string().min(1),
  fecLimiteAdjudicacionMe: z.string().min(1),
  fecLimiteGarantiasMe: z.string().min(1),
  fecLimiteFirmaContratoMe: z.string().min(1),
});

export type CronogramaModalidadesExcluidasFormValues = z.infer<
  typeof cronogramaModalidadesExcluidasSchema
>;

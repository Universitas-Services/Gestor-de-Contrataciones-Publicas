import type { TipoContratacionBackend } from "@/lib/schemas/expedienteSchema";
import type { Fase1FieldCopy, Fase1StepMeta } from "@/types/fase1.types";

export const FASE1_WIZARD_TITLE = "Fase de preparación y estructura del procedimiento";
export const FASE1_WIZARD_DESCRIPTION =
  "Complete la información técnica, financiera y legal para generar automáticamente el Acta de Inicio, el Pliego de Condiciones y el Llamado a Participar.";

export const FASE1_STEPS: Fase1StepMeta[] = [
  { number: 1, title: "Definición técnica y financiera" },
  { number: 2, title: "Estructura del presupuesto base" },
  { number: 3, title: "Parámetros legales del pliego" },
  { number: 4, title: "Configuración del llamado público" },
  { number: 5, title: "Observaciones finales" },
];

export const FASE1_SECTION_DESCRIPTIONS = {
  1: "Defina el alcance técnico de la contratación y desglose la estructura de costos estimada.",
  2: "Defina el alcance técnico de la contratación y desglose la estructura de costos estimada.",
  3: "Establezca los lapsos de validez y garantías que regirán el proceso de selección.",
  4: "Defina los detalles logísticos para la disponibilidad y adquisición del Pliego de Condiciones.",
  5: "Registre las condiciones especiales sobre temporalidad o agrupación de contratos.",
} as const;

export const FASE1_STEP_FIELDS = {
  1: [
    "datosActoAutorizacionInicio",
    "fechaActaInicio",
    "detallesTecnicosCalidad",
    "alcanceCantidadesObra",
    "justificacionVentajas",
    "origenCrsRegistro",
  ],
  2: [],
  3: [
    "diasValidezOferta",
    "autoridadAclaratorias",
    "normativaLegal",
    "diasVigenciaGarantiaExtension",
  ],
  4: [
    "objetivosEspecificos1",
    "objetivosEspecificos2",
    "objetivosEspecificos3",
    "direccionRetiroPliego",
    "horarioRetiroPliego",
    "pliegoGratuito",
    "horaActoRecepAper",
    "costoPliegoBs",
    "bancoPagoPliego",
    "cuentaPagoPliego",
    "titularPagoPliego",
  ],
  5: ["condicionPlurianual", "viabilidadContratoMarco", "justificacionContratoMarco"],
} as const;

export const FASE1_FIELD_COPY: Record<string, Fase1FieldCopy> = {
  datosActoAutorizacionInicio: {
    label:
      "Indique los datos del acto administrativo de autorización de inicio emitido por la Máxima Autoridad (Número y fecha punto de cuenta)",
    description: "Artículos 18.3 LOPA; 23 NORMAS DE CONTROL INTERNO SUNAI.",
    placeholder: "Ejemplo: 0002-2026 de fecha 02-03-2026",
  },
  fechaActaInicio: {
    label: "Indique la fecha de elaboración del acta de inicio",
    description: "Artículos 18.3 LOPA; 23 NORMAS DE CONTROL INTERNO SUNAI.",
    placeholder: "Seleccione una fecha",
  },
  detallesTecnicosCalidad: {
    label:
      "Describa de manera precisa y detallada las características técnicas, funcionales y de calidad que deben cumplir los bienes a contratar.",
    description:
      "Artículo 66. 3.4 LCP; 7 RLCP; (criterio ver sentencia Eduardo Manuit); 38.5, 91.1 LOCGR; 65 LCC; 24 LIT. B NORMAS DE CONTROL INTERNO SUNAI.",
  },
  alcanceCantidadesObra: {
    label: "Describa de manera precisa y detallada las cantidades del bien a contratar.",
    description:
      "Artículo 7 RLCP; 38.5, 91.1 LOCGR; 65 LCC; 24 LIT. B NORMAS DE CONTROL INTERNO SUNAI.",
  },
  justificacionVentajas: {
    label: "Indique las ventajas económicas y técnicas que justifican esta contratación.",
    description: "Artículo 7 RLCP.",
  },
  origenCrsRegistro: {
    label:
      "Indique si el proyecto de responsabilidad social solicitado tiene su origen en el registro institucional de necesidades sociales del Ente.",
    description: "Artículos 29, 32 LCP; 5 NORMAS DE CONTROL INTERNO SUNAI.",
  },
  diasValidezOferta: {
    label:
      "Indique el plazo mínimo de validez que deben mantener las manifestaciones de voluntad y ofertas.",
    description: "Artículos 66.5, 71 LCP; 18 NORMAS DE CONTROL INTERNO SUNAI.",
    placeholder: "Ejemplo: 30",
  },
  autoridadAclaratorias: {
    label:
      "Indique la autoridad competente encargada de responder aclaratorias, modificar el documento y notificar las decisiones durante el procedimiento de contratación.",
    description: "Artículo 66.8 LCP; 5 NORMAS DE CONTROL INTERNO SUNAI.",
  },
  normativaLegal: {
    label:
      "Agregue el Régimen Jurídico aplicable al procedimiento de contratación, cualquier otra normativa nacional y sectorial que considere pertinente.",
    description: "Artículos 6.17 LCP; 6 NORMAS DE CONTROL INTERNO SUNAI.",
  },
  diasVigenciaGarantiaExtension: {
    label:
      "Indique el número de días de vigencia de la Garantía de Mantenimiento de la Oferta después del período de validez de la misma.",
    description: "Artículo 64 LCP; 19 NORMAS DE CONTROL INTERNO SUNAI.",
    placeholder: "Ejemplo: 90",
  },
  objetivosEspecificos1: {
    label:
      "Describa tres objetivos específicos relacionados con el objeto del procedimiento de contratación.",
    description: "Artículo 80.6 LCP; 107.1 RLCP; 3 NORMAS DE CONTROL INTERNO SUNAI.",
    placeholder: "Objetivo 1",
  },
  objetivosEspecificos2: {
    label: "Objetivo 2",
    description: "",
    placeholder: "Objetivo 2",
  },
  objetivosEspecificos3: {
    label: "Objetivo 3",
    description: "",
    placeholder: "Objetivo 3",
  },
  direccionRetiroPliego: {
    label:
      "Indique la dirección exacta de la dependencia donde estará disponible el pliego de condiciones (si es física).",
    description: "Artículo 80.3 LCP; 7 NORMAS DE CONTROL INTERNO SUNAI.",
  },
  horarioRetiroPliego: {
    label: "Indique el horario de atención para la disponibilidad del pliego.",
    description: "Artículo 80.3 LCP; 7 NORMAS DE CONTROL INTERNO SUNAI.",
    placeholder: "Ejemplo: 08:00am a 12:00m y 01:00pm a 04:00pm",
  },
  pliegoGratuito: {
    label: "¿El pliego de condiciones tendrá un costo?",
    description: "Artículo 80.3.6 LCP; 3 NORMAS DE CONTROL INTERNO SUNAI.",
  },
  costoPliegoBs: {
    label: "Indique el costo (Bs) del pliego de condiciones.",
    description: "Ejemplo: 2.000,00",
    placeholder: "2.000,00",
  },
  bancoPagoPliego: {
    label: "Indique el nombre del Banco para el pago del pliego.",
    description: "Ejemplo: Banco de Venezuela",
  },
  cuentaPagoPliego: {
    label: "Indique el número de la cuenta para el pago del pliego.",
    description: "Ejemplo: 0102-0123-45-1234567890",
  },
  titularPagoPliego: {
    label: "Indique el nombre del Titular de la cuenta para el pago del pliego.",
    description: "Ejemplo: Dirección de Salud de la Gobernación del Estado Lara",
  },
  horaActoRecepAper: {
    label:
      "Indique la hora del Acto de Recepción y Apertura de las manifestaciones de voluntad de participar, documentos de calificación y ofertas.",
    description: "Artículos 78.1, 80.4 LCP; 96 RLCP; 3 NORMAS DE CONTROL INTERNO SUNAI.",
    placeholder: "Seleccione una hora",
  },
  condicionPlurianual: {
    label: "¿La contratación es de ejecución plurianual?",
    description:
      "Artículo 107.2 RLCP; 17, 22, 65 LCC; 38.5, 91.1, 9.29 LOCGR; 10 NORMAS DE CONTROL INTERNO SUNAI.",
  },
  viabilidadContratoMarco: {
    label: "¿Se optó por agrupar esta contratación o utilizar un contrato marco?",
    description:
      "Artículo 107.6 RLCP; 17, 22, 65 LCC; 38.5, 91.1, 9.29 LOCGR; 11, 24.J NORMAS DE CONTROL INTERNO SUNAI.",
  },
  justificacionContratoMarco: {
    label:
      "Deje constancia de la evaluación sobre la viabilidad de agrupar esta contratación o utilizar un contrato marco.",
    description:
      "Artículo 107.6 RLCP; 17, 22, 65 LCC; 38.5, 91.1, 9.29 LOCGR; 11, 24.J NORMAS DE CONTROL INTERNO SUNAI.",
    placeholder: "Ingrese la evaluación correspondiente",
  },
  descripcionItem: {
    label: "Descripción del ítem",
    description: "Ejemplo: Estación de trabajo Tipo A - Ergonómica",
  },
  codigoPartida: {
    label: "Partida presupuestaria",
    description: "Ejemplo: 401-01-01-002",
  },
  unidadMedida: {
    label: "Unidad de medida",
    description: "(Kg, Mts, Horas, Unidad). Ejemplo: Unidad",
  },
  cantidadRequerida: {
    label: "Cantidad",
    description: "Ejemplo: 1",
  },
  precioUnitarioEstimado: {
    label: "Precio unitario estimado en bolívares (Bs.)",
    description: "Ejemplo: 10.000,00",
  },
};

const FASE1_DYNAMIC_FIELD_COPY = {
  detallesTecnicosCalidad: {
    BIENES: {
      label:
        "Describa de manera precisa y detallada las características técnicas, funcionales y de calidad que deben cumplir los bienes a contratar.",
      description:
        "Artículo 66. 3.4 LCP; 7 RLCP; (criterio ver sentencia Eduardo Manuit); 38.5, 91.1 LOCGR; 65 LCC; 24 LIT. B NORMAS DE CONTROL INTERNO SUNAI.",
    },
    SERVICIOS: {
      label:
        "Describa de manera precisa y detallada las características técnicas, funcionales y de calidad que deben cumplir los servicios a contratar.",
      description:
        "Artículos 66.3.4 LCP; 7 RLCP; (criterio ver sentencia Eduardo Manuit); 38.5, 91.1 LOCGR; 65 LCC; 24 LIT. B NORMAS DE CONTROL INTERNO SUNAI.",
    },
    OBRAS: {
      label:
        "Describa de manera precisa y detallada las características técnicas, funcionales y de calidad que deben cumplir las obras a contratar.",
      description:
        "Artículos 66.3.4 LCP; 7 RLCP; (criterio ver sentencia Eduardo Manuit); 38.5, 91.1 LOCGR; 65 LCC; 24 LIT. B NORMAS DE CONTROL INTERNO SUNAI.",
    },
  },
  alcanceCantidadesObra: {
    BIENES: {
      label: "Describa de manera precisa y detallada las cantidades del bien a contratar.",
      description:
        "Artículos 7 RLCP; 38.5, 91.1 LOCGR; 65 LCC; 24 LIT. B NORMAS DE CONTROL INTERNO SUNAI.",
    },
    SERVICIOS: {
      label: "Describa de manera precisa y detallada el alcance del servicio a contratar.",
      description:
        "Artículos 7 RLCP; 38.5, 91.1 LOCGR; 65 LCC; 24 LIT. B NORMAS DE CONTROL INTERNO SUNAI.",
    },
    OBRAS: {
      label: "Describa de manera precisa y detallada las cantidades de obra a contratar.",
      description:
        "Artículos 7 RLCP; 38.5, 91.1 LOCGR; 65 LCC; 24 LIT. B NORMAS DE CONTROL INTERNO SUNAI.",
    },
  },
} satisfies Record<
  "detallesTecnicosCalidad" | "alcanceCantidadesObra",
  Record<TipoContratacionBackend, Pick<Fase1FieldCopy, "label" | "description">>
>;

export function getFase1DynamicFieldCopy(
  fieldName: "detallesTecnicosCalidad" | "alcanceCantidadesObra",
  tipoContratacion: TipoContratacionBackend
) {
  return FASE1_DYNAMIC_FIELD_COPY[fieldName][tipoContratacion];
}

function buildTimeOptions() {
  const options: Array<{ value: string; label: string }> = [];

  for (let hour = 7; hour <= 18; hour += 1) {
    for (const minute of [0, 30]) {
      if (hour === 18 && minute === 30) continue;

      const suffix = hour >= 12 ? "PM" : "AM";
      const hour12 = hour % 12 === 0 ? 12 : hour % 12;
      const minutesLabel = minute.toString().padStart(2, "0");
      const label = `${hour12.toString().padStart(2, "0")}:${minutesLabel} ${suffix}`;
      options.push({ value: label, label });
    }
  }

  return options;
}

export const FASE1_HORA_OPTIONS = buildTimeOptions();

export const FASE1_PDF_MARKER_MAP: Record<string, string> = {
  datosActoAutorizacionInicio: "datos_acto_autorizacion_inicio_au_au",
  fechaActaInicio: "fec_acta_inicio_au_au",
  detallesTecnicosCalidad: "detalles_tecnicos_calidad_au_au",
  alcanceCantidadesObra: "alcance_cantidades_obra_au_au",
  justificacionVentajas: "justificacion_ventajas_au_au",
  origenCrsRegistro: "ind_origen_crs_registro_au_au",
  descripcionItem: "descripcion_item_au_au",
  codigoPartida: "codigo_partida_au_au",
  unidadMedida: "unidad_medida_au_au",
  cantidadRequerida: "cantidad_requerida_au_au",
  precioUnitarioEstimado: "precio_unitario_estimado_au_au",
  totalItems: "total_items_au_au",
  diasValidezOferta: "dias_validez_oferta_au_au",
  autoridadAclaratorias: "autoridad_aclaratorias_au_au",
  normativaLegal: "normativa_legal_au_au",
  diasVigenciaGarantiaExtension: "dias_vigencia_garantia_ext_au_au",
  objetivosEspecificos1: "objetivos_especificos_llamado_1_au_au",
  objetivosEspecificos2: "objetivos_especificos_llamado_2_au_au",
  objetivosEspecificos3: "objetivos_especificos_llamado_3_au_au",
  direccionRetiroPliego: "direccion_retiro_pliego_au_au",
  horarioRetiroPliego: "horario_retiro_pliego_au_au",
  pliegoGratuito: "pliego_gratuito_au_au",
  costoPliegoBs: "costo_pliego_bs_au_au",
  bancoPagoPliego: "banco_pago_pliego_au_au",
  cuentaPagoPliego: "cuenta_pago_pliego_au_au",
  titularPagoPliego: "titular_pago_pliego_au_au",
  horaActoRecepAper: "hora_acto_recep_aper_au_au",
  condicionPlurianual: "condicion_plurianual_au_au",
  viabilidadContratoMarco: "viabilidad_contrato_marco_au_au",
  justificacionContratoMarco: "justificacion_contrato_marco_au_au",
};

export const FASE1_IVA_RATE = 0.16;

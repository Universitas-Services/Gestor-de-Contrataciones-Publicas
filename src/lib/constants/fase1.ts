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
    description:
      "Artículos 11, 12, 13 LCP; 7 RLCP; 17, 22 LCC; 12 NORMAS DE CONTROL INTERNO SUNAI.",
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
      "Agrega en el Régimen Jurídico aplicable al procedimiento de contratación, cualquier otra normativa nacional y sectorial que considere pertinente.",
    description: "Artículos 6.17 LCP; 6 NORMAS DE CONTROL INTERNO SUNAI.",
    placeholder:
      "Ejemplo: Ley xxxxxxxxx, publicado en Gaceta Oficial N° xxxxx Extraordinario / Ordinario, de fecha xx de xx de xxxx.",
    verifyLink: "Verifica las normativas aplicables al procedimiento ya agregadas aquí",
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
    placeholder: "Ejemplo: 08:00am a 12:00pm y 01:00pm a 04:00pm",
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

/** Normativas de referencia mostradas en el modal de verificación (solo lectura UI). */
export const FASE1_NORMATIVAS_PREDEFINIDAS = [
  "Constitución de la República Bolivariana de Venezuela (1999).",
  "Ley Constitucional Contra La Guerra Económica Para La Racionalidad Y Uniformidad En La Adquisición De Bienes, Servicios Y Obras Públicas, publicado en Gaceta Oficial N° 41.318 de fecha 11 de enero de 2018.",
  "Decreto Nº 1399 con Rango, Valor y Fuerza de Ley de Contrataciones Públicas. Gaceta Oficial Extraordinaria N° 6.154 de fecha 19 de noviembre de 2014.",
  "Ley Orgánica de la Contraloría General de la República y del Sistema Nacional de Control Fiscal. Gaceta Oficial Extraordinaria N° 6.013 del 23 de diciembre de 2010.",
  "Ley Orgánica de Procedimientos Administrativos, publicada en Gaceta Oficial N° 2.818 del 1° de julio de 1981.",
  "Decreto N° 1.424 con Rango, Valor y Fuerza de Ley de Reforma de Ley Orgánica de la Administración Pública. Gaceta Oficial Extraordinaria N° 6.147 del 17 de noviembre de 2014.",
  "Decreto con Rango, Valor y Fuerza de Ley contra la Corrupción. Gaceta Oficial Extraordinaria N° 6.699 del 02 de mayo de 2022.",
  "Decreto N° 1423 con Rango, Valor y Fuerza de Ley de Simplificación de Trámites Administrativos. Gaceta Oficial N° 40.549 del 26 de noviembre de 2014.",
  "Decreto con Rango, Valor y Fuerza de Ley Orgánica de Planificación Pública y Popular (G.O. N°. Ext. 6.148 del 18/11/2014).",
  "Decreto N° 2174 con Rango, Valor y Fuerza de Ley Orgánica de la Administración Financiera del Sector Público (LOAFSP). Gaceta Oficial Extraordinaria N° 6.210 extraordinaria del 30 de diciembre de 2015 y sus reglamentos.",
  "Reglamento de la Ley de Contrataciones Públicas, Decreto N° 6.708 de fecha 19 de mayo de 2009 publicada en Gaceta Oficial N° 39.181 del 19 de mayo de 2009.",
  "Decreto N° 1.407, con Rango, Valor y Fuerza de Ley de Reforma Parcial del de Ley Orgánica de Bienes Públicos, publicado en Gaceta Oficial Extraordinario N° 6.155 de fecha 19 de noviembre de 2014.",
  "Decreto Ley Orgánica de Precios Justos, publicado en Gaceta Oficial N° 40.787 de fecha 12 de noviembre de 2015.",
  "Decreto N° 1.402 Ley de las Instituciones del Sector Bancario, publicado en Gaceta Oficial N° 40.557 de fecha martes 8 de diciembre de 2014.",
  "Ley Orgánica de las Comunas, publicada en Gaceta Oficial N° 6.011, el 21 de diciembre de 2010.",
  "Ley Orgánica del Poder Popular, publicada en la Gaceta Oficial Extraordinaria N° 6.812, en fecha 06 de junio de 2024.",
  "Ley Orgánica del Sistema Económico Comunal, publicada en Gaceta Oficial Extraordinario Nº 6.011 de fecha de 21 de diciembre de 2010.",
  "Decreto N° 9.052, mediante el cual se dicta el Decreto con Rango, Valor y Fuerza de Ley que promueve y regula las nuevas formas asociativas conjuntas entre el estado, la iniciativa comunitaria y privada para el desarrollo de la economía nacional, publicado en Gaceta Oficial N° 39.945 de fecha de 15 de junio de 2012.",
  "Ley de Infogobierno (Gaceta Oficial N° 40.274 del 17/10/2013)",
  "Ley sobre Mensaje de Datos y Firmas Electrónicas(DLMDyFE) (Gaceta Oficial N° 37.148 del 28/02/2001)",
  "Decreto N° 1.413 de Reforma del Decreto con Rango, Valor y Fuerza de Ley para la Promoción y Desarrollo de la Pequeña y Mediana Industria y Unidades de Propiedad Social,  Publicado en Gaceta Oficial N° 40.550 de fecha 27 de noviembre de 2014.",
  "Ley Constitucional de Precios acordados, publicado en Gaceta Oficial Extraordinaria N° 6.342 de fecha 22 de noviembre de 2017.",
  "Decreto N° 2.198 de creación del Sistema Centralizado y Estandarizado de compras públicas para la Administración Pública Nacional, publicado en Gaceta Oficial N° 40.836 de fecha de 26 de enero de 2016.",
  "Decreto Nº 8.795 Reglamento parcial Ley Orgánica del Sistema Económico Comunal, publicado en Gaceta Oficial Nº 39.856 de fecha de 02 de febrero de 2012.",
  "Providencia SUNDDE N° 003/2014, mediante la cual se fijan Criterios Contables Generales para la Determinación de Precios Justos, publicada en Gaceta Oficial Nº 40.351 de fecha de 7 de febrero de 2014.",
  "Resolución Mintras N° 9108 sobre Registro Nacional de Empresas y Establecimientos y Solvencia Laboral, publicada en Gaceta Oficial Nº 40.655 de fecha de 7 de mayo de 2015",
  "Providencia SUNDDE N° 070/2015 Modalidades para la Determinación, Fijación y Marcaje de Precios, publicada en Gaceta Oficial Nº 40.775 de fecha de 27 de octubre de 2015.",
  "Providencia Nº 001/2016, mediante la cual se regula el Proceso de Adquisición de Bienes por los Órganos y Entes de la Administración Pública Nacional en el Marco del Sistema Centralizado y Estandarizado de Compras Públicas, publicada en Gaceta Oficial Nº 40.906 de fecha de 18 de mayo de 2016.",
  "Resolución N° 006/2016 de fecha 16 de septiembre de 2016, Órgano Superior del Comando de Abastecimiento Soberano, publicada en la Gaceta Oficial de la República Bolivariana de Venezuela Nº 40.994 de fecha 22 de septiembre de 2016.",
  "Resolución Conjunta de los Ministerios del Poder Popular con competencia en materia de Planificación y de Economía, Finanzas y Comercio Exterior, mediante la cual se fija el valor de la Unidad para el Cálculo Aritmético del Umbral Máximo y Mínimo (UCAU), vigente y publicada en Gaceta Oficial de la República Bolivariana de Venezuela para el momento del inicio del procedimiento de selección de contratistas.",
  "Providencia SUNAI 007/2025 sobre Normas de control interno aplicables a contrataciones públicas, publicada en la Gaceta Oficial de la República Bolivariana de Venezuela Nº 43.158 de fecha 27 de junio de 2025.",
  "Ley Orgánica para la Celeridad y Optimización de Trámites Administrativos, Gaceta Oficial N° 7.018 Extraordinario, de fecha (08) de abril de 2026.",
] as const;

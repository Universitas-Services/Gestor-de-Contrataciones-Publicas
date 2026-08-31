import type { TipoContratacionBackend } from "@/lib/schemas/expedienteSchema";
import type { ActividadesPreviasFormInputValues } from "@/lib/schemas/actividadesPreviasSchema";

export const ACTIVIDADES_PREVIAS_WIZARD_TITLE = "Elaboración de Actividades Previas";

export const ACTIVIDADES_PREVIAS_WIZARD_DESCRIPTION =
  "Complete los datos justificativos, técnicos y estratégicos que sustentan la necesidad de la contratación para generar el documento oficial.";

export const ACTIVIDADES_PREVIAS_STEPS = [
  { id: 1, label: "Identificación y Responsables" },
  { id: 2, label: "Objeto y Justificación" },
  { id: 3, label: "Logística de Ejecución" },
  { id: 4, label: "Promoción Económica" },
] as const;

export const ACTIVIDADES_PREVIAS_STEP_SECTIONS = {
  1: {
    title: "Identificación y responsables",
    description:
      "Designe a la dependencia solicitante y registre las referencias de la Programación Anual de Compras ante el Servicio Nacional de Contrataciones (SNC).",
  },
  2: {
    title: "Objeto y justificación del requerimiento",
    description:
      "Describa el propósito de la contratación, establezca sus ventajas institucionales y su vinculación estratégica.",
  },
  3: {
    title: "Logística y Condiciones de ejecución",
    description:
      "Determine los plazos, certificaciones presupuestarias, ubicación y los requerimientos logísticos especiales para el cumplimiento del contrato.",
  },
  4: {
    title: "Medidas de promoción económica",
    description:
      "Configure los mecanismos de preferencia e incentivos legales destinados a promover la participación local, el Valor Agregado Nacional y las PyMIS.",
  },
} as const;

export const ACTIVIDADES_PREVIAS_INFO_SYNC =
  "Los datos de la Unidad Usuaria y el responsable se han sincronizado automáticamente desde la opción que seleccionó en la fase 0.";

export const ACTIVIDADES_PREVIAS_PLURIANUAL_WARNING =
  "Recuerde reflejar esta condición en el cronograma o en las condiciones del procedimiento.";

export const ACTIVIDADES_PREVIAS_CONTROL_INTERNO_WARNING =
  "Al marcar NO, usted declara que el objeto de esta contratación no se encuentra sujeto a medidas de protección especial para PyMIS o Cooperativas según los planes de desarrollo del Ejecutivo Nacional. El pliego se generará bajo criterios ordinarios de evaluación.";

/** Textos oficiales de preguntas y referencias legales — sin resumir. */
export const ACTIVIDADES_PREVIAS_FIELD_COPY = {
  numReferenciaSncAuAu: {
    label:
      "Indique el número de referencia del requerimiento asignado en la Programación Anual de Compras registrada ante el Servicio Nacional de Contratistas (SNC).",
    legal:
      "Artículos 38.1 LCP; 7 RLCP; 38.5, 91.1.9 LOCGR; 24 LIT.a NORMAS DE CONTROL INTERNO SUNAI.",
  },
  modifRequerimientoSncAuAu: {
    label:
      "¿El requerimiento original registrado ante el SNC ha sido objeto de alguna modificación posterior?",
    legal:
      "Artículos 38.2 LCP; 7 RLCP; 38.5, 91.1.9 LOCGR; 24 LIT.a NORMAS DE CONTROL INTERNO SUNAI.",
  },
  numeroModifRequerimientoSncAuAu: {
    label: "Indique el Número de Referencia de la Modificación registrada ante el SNC.",
    legal:
      "Artículos 38.2 LCP; 7 RLCP; 38.5, 91.1.9 LOCGR; 24 LIT.a NORMAS DE CONTROL INTERNO SUNAI.",
  },
  justificacionNecesidadContratacionAuAu: {
    label:
      "Justifique la necesidad de la contratación, indicando el beneficio institucional esperado y su vinculación directa con las metas del Plan Operativo Anual (POA).",
    legal: "Artículos 7 RLCP; 12 NORMAS DE CONTROL INTERNO SUNAI.",
  },
  justificacionVentajasAuAu: {
    label: "Describa las ventajas técnicas y económicas que justifican esta contratación",
    legal:
      "Ejemplo: mejor tecnología, ahorro de costos o mayor durabilidad. Artículos 11, 12, 13 LCP; 7 RLCP; 17, 22 LCC; 12 NORMAS DE CONTROL INTERNO SUNAI.",
  },
  condicionPlurianualAuAu: {
    label: "¿La contratación es de ejecución plurianual?",
    legal:
      "Artículo 107.2 RLCP; 17, 22, 65 LCC; 38.5, 91.1.9.29 LOCGR; 10 NORMAS DE CONTROL INTERNO SUNAI.",
  },
  proyectoAprobadoAuAu: {
    label: "¿Cuenta con el proyecto correspondiente aprobado por la instancia técnica competente?",
    legal: "Artículos 24, literal k, Normas NORMAS DE CONTROL INTERNO SUNAI; 19 de LOPA.",
  },
  permitePymesCooperativasAuAu: {
    label:
      "¿Es su requerimiento técnico compatible con la capacidad operativa y escala productiva de las PyMES y Cooperativas?",
    legal: "Artículos 11 al 13 de la LCP y 9 al 10 del RLCP.",
  },
  justificacionPermitePymesCooperativasAuAu: {
    label:
      "Indique la justificación del por qué NO se permitirá la participación de PyMES y cooperativas.",
    legal: "Artículos 11 al 13 de la LCP y 9 al 10 del RLCP.",
  },
  viabilidadContratoMarcoAuAu: {
    label:
      "Para esta contratación ¿es viable agruparla en un solo procedimiento o utilizar la figura del contrato marco?",
    legal:
      "Artículo 107.6 RLCP; 17, 22, 65 LCC; 38.5, 91.1.9.29 LOCGR; 11, 24.J NORMAS DE CONTROL INTERNO SUNAI.",
  },
  justificacionContratoMarcoAuAu: {
    label:
      "Deje constancia de la evaluación sobre la viabilidad de agrupar esta contratación o utilizar un contrato marco.",
    legal:
      "Artículo 107.6 RLCP; 17, 22, 65 LCC; 38.5, 91.1.9.29 LOCGR; 11, 24.J NORMAS DE CONTROL INTERNO SUNAI.",
  },
  fecEstudioMercadoAuAu: {
    label:
      "Indique la fecha del estudio de mercado o análisis de costos que sustenta el presupuesto base de esta contratación.",
    legal: 'Artículos 59 LCP y 24 literal "c" de las Normas SUNAI.',
  },
  numCertificacionPresupuestariaAuAu: {
    label:
      "Indique el número de referencia de la Certificación de Disponibilidad Presupuestaria (CDP) que garantiza la suficiencia de fondos para el presente requerimiento.",
    legal:
      "Artículos 74 LCP; 7, 94 RLCP; 38.1.2, 91.1.12 LOCGR; 24 LIT.d NORMAS DE CONTROL INTERNO SUNAI.",
  },
  plazoEjecucionProcedimientoAuAu: {
    label:
      "Indique el plazo de ejecución o tiempo de entrega (en días) correspondiente a este procedimiento.",
    legal:
      "Artículos 78.1 LCP; 17, 18, 22 LCC; 38.1.5, 91.1.9.29 LOCGR; 24 (e) NORMAS CONTROL INTERNO NORMAS DE CONTROL INTERNO SUNAI.",
  },
  lugarLogisticaEjecucionAuAu: {
    label:
      "Indique la ubicación geográfica y dirección exacta para la entrega de los bienes o ejecución del objeto (Estado, Municipio y Dirección), detallando las condiciones de acceso y logística (horarios, restricciones de carga/descarga o permisos especiales) que el oferente deba considerar para su propuesta.",
    legal: 'Artículos: 7 RLCP; 24 literal "e" NORMAS DE CONTROL INTERNO SUNAI.',
  },
  requiereEspecializadoAuAu: {
    label:
      "¿La entrega o ejecución requiere de personal especializado, maquinaria de descarga o instalaciones específicas por parte del Ente?",
    legal: 'Artículos: 7 RLCP; 24 literal "b" NORMAS DE CONTROL INTERNO SUNAI.',
  },
  detalleEspecializadoAuAu: {
    label: "Describa detalladamente el personal, maquinaria o instalaciones necesarias.",
    legal: null,
  },
  requiereMuestrasAuAu: {
    label:
      "¿Se requiere que los oferentes consignen muestras físicas para validar la calidad de los bienes o insumos, de conformidad con la normativa legal vigente para contrataciones públicas?",
    legal: 'Artículos: 66.17 LCP; 24 literal "b" NORMAS DE CONTROL INTERNO SUNAI.',
  },
  detalleProcedimientoMuestrasAuAu: {
    label:
      "Describa detalladamente qué ítems requieren muestras, la cantidad de las mismas y el procedimiento técnico que se utilizará para su evaluación (Ej: pruebas de resistencia, validación de material, encendido, etc.).",
    legal: null,
  },
  activaPromocionEconomicaAuAu: {
    label:
      "¿Desea activar la aplicación de las medidas temporales de promoción del desarrollo económico para favorecer la participación de PyMIS, Cooperativas y Nuevos Emprendimientos en este procedimiento, de conformidad con los Artículos 11 y 12 de la LCP y 9 y 10 del RLCP?",
    legal:
      "Artículos 11, 12 y 13 de la Ley de Contrataciones Públicas; Artículos 9 y 10 del Reglamento de la Ley de Contrataciones Públicas; Norma 34 de las Normas de Control Interno de la SUNAI 2025.",
  },
  requiereVanAuAu: {
    label:
      "¿Se incorporarán los mecanismos de preferencia por Valor Agregado Nacional (VAN) en la matriz de evaluación del procedimiento competitivo?",
    legal:
      "Artículos 13 y 22 LCP; 15 y 16 de la Ley Constitucional contra la Guerra Económica para la Racionalidad y Uniformidad en la Adquisición de Bienes, Servicios y Obras Públicas.",
  },
  puntajeVanAuAu: {
    label:
      "Indique la puntuación máxima (bonificación adicional) que se otorgará al oferente que presente el mayor porcentaje de Valor Agregado Nacional (VAN) en su propuesta.",
    legal:
      "Artículos 13 LCP; 15 de la Ley Constitucional contra la Guerra Económica para la Racionalidad y Uniformidad en la Adquisición de Bienes, Servicios y Obras Públicas. Máximo 10ptos.",
  },
  indPrefLocalAuAu: {
    label:
      "¿Desea otorgar una bonificación de puntaje a los oferentes domiciliados localmente para fomentar el desarrollo económico y social del municipio o estado sede del Ente Contratante?",
    legal:
      "Artículo 22 de la Ley de Contrataciones Públicas (Fomento del desarrollo del entorno local).",
  },
  puntuacionBonoLocalAuAu: {
    label:
      "Indique el puntaje adicional que se otorgará al oferente que certifique estar domiciliado fiscal y comercialmente en el Municipio o Estado sede del Ente Contratante.",
    legal:
      "Artículo 22 de la Ley de Contrataciones Públicas; Norma 24 de las Normas de Control Interno de la SUNAI 2025.",
  },
  indBonoSujetoAuAu: {
    label:
      "¿Desea asignar una puntuación adicional a las pequeñas, medianas industrias, cooperativas y emprendimientos del país para democratizar la adjudicación de contratos públicos?",
    legal: "Artículo 11 de la Ley de Contrataciones Públicas.",
  },
  puntuacionBonoSujetoAuAu: {
    label:
      "Indique el puntaje adicional que se otorgará a los proponentes que acrediten legalmente su condición de Pequeña y Mediana Industria (PyMI), Cooperativa, Empresa de Propiedad Social o Unidad Productiva Familiar.",
    legal:
      "Artículo 11 de la Ley de Contrataciones Públicas; Norma 34 de las Normas de Control Interno de la SUNAI 2025.",
  },
} as const;

export function createActividadesPreviasDefaultValues(
  direccionEnteDefault = ""
): ActividadesPreviasFormInputValues {
  return {
    numReferenciaSncAuAu: "",
    modifRequerimientoSncAuAu: undefined,
    numeroModifRequerimientoSncAuAu: "",
    justificacionNecesidadContratacionAuAu: "",
    justificacionVentajasAuAu: "",
    condicionPlurianualAuAu: undefined,
    proyectoAprobadoAuAu: undefined,
    permitePymesCooperativasAuAu: undefined,
    justificacionPermitePymesCooperativasAuAu: "",
    viabilidadContratoMarcoAuAu: undefined,
    justificacionContratoMarcoAuAu: "",
    fecEstudioMercadoAuAu: "",
    numCertificacionPresupuestariaAuAu: "",
    plazoEjecucionProcedimientoAuAu: "",
    lugarLogisticaEjecucionAuAu: direccionEnteDefault,
    requiereEspecializadoAuAu: undefined,
    detalleEspecializadoAuAu: "",
    requiereMuestrasAuAu: undefined,
    detalleProcedimientoMuestrasAuAu: "",
    activaPromocionEconomicaAuAu: undefined,
    requiereVanAuAu: undefined,
    puntajeVanAuAu: "",
    indPrefLocalAuAu: undefined,
    puntuacionBonoLocalAuAu: "",
    indBonoSujetoAuAu: undefined,
    puntuacionBonoSujetoAuAu: "",
  };
}

export function getActividadesPreviasStepFields(
  step: number,
  values: ActividadesPreviasFormInputValues,
  tipoContratacion: TipoContratacionBackend
): (keyof ActividadesPreviasFormInputValues)[] {
  switch (step) {
    case 1: {
      const fields: (keyof ActividadesPreviasFormInputValues)[] = [
        "numReferenciaSncAuAu",
        "modifRequerimientoSncAuAu",
      ];
      if (values.modifRequerimientoSncAuAu === true) {
        fields.push("numeroModifRequerimientoSncAuAu");
      }
      return fields;
    }
    case 2: {
      const fields: (keyof ActividadesPreviasFormInputValues)[] = [
        "justificacionNecesidadContratacionAuAu",
        "justificacionVentajasAuAu",
        "condicionPlurianualAuAu",
        "permitePymesCooperativasAuAu",
        "viabilidadContratoMarcoAuAu",
      ];
      if (tipoContratacion === "OBRAS") {
        fields.push("proyectoAprobadoAuAu");
      }
      if (values.permitePymesCooperativasAuAu === false) {
        fields.push("justificacionPermitePymesCooperativasAuAu");
      }
      if (values.viabilidadContratoMarcoAuAu === true) {
        fields.push("justificacionContratoMarcoAuAu");
      }
      return fields;
    }
    case 3: {
      const fields: (keyof ActividadesPreviasFormInputValues)[] = [
        "fecEstudioMercadoAuAu",
        "numCertificacionPresupuestariaAuAu",
        "plazoEjecucionProcedimientoAuAu",
        "lugarLogisticaEjecucionAuAu",
        "requiereEspecializadoAuAu",
        "requiereMuestrasAuAu",
      ];
      if (values.requiereEspecializadoAuAu === true) {
        fields.push("detalleEspecializadoAuAu");
      }
      if (values.requiereMuestrasAuAu === true) {
        fields.push("detalleProcedimientoMuestrasAuAu");
      }
      return fields;
    }
    case 4: {
      const fields: (keyof ActividadesPreviasFormInputValues)[] = ["activaPromocionEconomicaAuAu"];
      if (values.activaPromocionEconomicaAuAu === true) {
        fields.push("requiereVanAuAu", "indPrefLocalAuAu", "indBonoSujetoAuAu");
        if (values.requiereVanAuAu === true) fields.push("puntajeVanAuAu");
        if (values.indPrefLocalAuAu === true) fields.push("puntuacionBonoLocalAuAu");
        if (values.indBonoSujetoAuAu === true) fields.push("puntuacionBonoSujetoAuAu");
      }
      return fields;
    }
    default:
      return [];
  }
}

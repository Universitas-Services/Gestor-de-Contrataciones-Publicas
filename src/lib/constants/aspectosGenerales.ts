import type { AspectosGeneralesFormInputValues } from "@/lib/schemas/aspectosGeneralesSchema";
import { MODALIDAD_CRS_OPTIONS } from "@/lib/schemas/aspectosGeneralesSchema";

export const ASPECTOS_GENERALES_WIZARD_TITLE = "Configuración de aspectos generales del pliego";

export const ASPECTOS_GENERALES_WIZARD_DESCRIPTION =
  "Defina el marco normativo, plazos, condiciones de responsabilidad social y régimen de garantías que regirán las reglas del procedimiento.";

export const ASPECTOS_GENERALES_DRAFT_LABEL = "Guardar borrador";
export const ASPECTOS_GENERALES_SUBMIT_LABEL = "Cargar datos iniciales";
export const ASPECTOS_GENERALES_SUBMIT_DISABLED_TOOLTIP =
  "Faltan datos en algunos pasos. Completa todo el recorrido para habilitar esta acción.";

export const ASPECTOS_GENERALES_SUCCESS_TITLE = "¡Aspectos guardados!";
export const ASPECTOS_GENERALES_SUCCESS_DESCRIPTION =
  "Los datos generales del pliego, incluyendo garantías y normativas, han sido registrados";

export const ASPECTOS_GENERALES_STEPS = [
  { id: 1, label: "Régimen legal" },
  { id: 2, label: "Condiciones oferta" },
  { id: 3, label: "Responsabilidad social" },
  { id: 4, label: "Garantías y anticipos" },
] as const;

export const ASPECTOS_GENERALES_STEP_SECTIONS = {
  1: {
    title: "Autorizaciones y régimen legal",
    description:
      "Registre el acto administrativo de inicio, la autoridad competente y las normativas legales complementarias.",
  },
  2: {
    title: "Condiciones de la oferta",
    description:
      "Establezca los parámetros de validez de las manifestaciones de voluntad y las condiciones excepcionales sobre idioma o divisas.",
  },
  3: {
    title: "Responsabilidad Social (CRS)",
    description:
      "Configure el porcentaje, la modalidad de ejecución y los mecanismos de seguimiento para el Compromiso de Responsabilidad Social.",
  },
  4: {
    title: "Garantías y anticipos",
    description:
      "Defina las condiciones financieras del contrato, incluyendo las fianzas de fiel cumplimiento, laborales, pólizas de responsabilidad y otorgamiento de anticipos.",
  },
} as const;

export const ASPECTOS_GENERALES_MODALIDAD_CRS_OPTIONS = MODALIDAD_CRS_OPTIONS.map((label) => ({
  value: label,
  label,
}));

export const ASPECTOS_GENERALES_FIELD_COPY = {
  datosActoAutorizacionInicioAuAu: {
    label:
      "Indique los datos del acto administrativo de autorización de inicio emitido por la Máxima Autoridad (Número y fecha punto de cuenta)",
    legal: "Artículos 18.3 LOPA; 23 NORMAS DE CONTROL INTERNO SUNAI.",
    placeholder: "Ejemplo: 0002-2026 de fecha 02-03-2026",
  },
  diasValidezOfertaAuAu: {
    label:
      "Indique el plazo mínimo de validez que deben mantener las manifestaciones de voluntad y ofertas.",
    legal: "Artículos 66.5, 71 LCP; 18 NORMAS DE CONTROL INTERNO SUNAI.",
  },
  autoridadAclaratoriasAuAu: {
    label:
      "Indique la autoridad competente encargada de responder aclaratorias, modificar el documento y notificar las decisiones durante el procedimiento de contratación.",
    legal: "Artículos 66.8 LCP; 5 NORMAS DE CONTROL INTERNO SUNAI.",
  },
  normativaLegalAuAu: {
    label:
      "Agrega en el Régimen Jurídico aplicable al procedimiento de contratación, cualquier otra normativa nacional y sectorial que considere pertinente.",
    legal: "Artículos 6.17 LCP; 6 NORMAS DE CONTROL INTERNO SUNAI.",
    verifyLink: "Verifica las normativas aplicables al procedimiento ya agregadas aquí",
    placeholder:
      "Ejemplo: Ley xxxxxxxxx, publicado en Gaceta Oficial N° xxxxx Extraordinario / Ordinario, de fecha xx de xx de xxxx.",
  },
  diasVigenciaGarantiaExtAuAu: {
    label:
      "Indique el número de días de vigencia de la garantía de mantenimiento de la oferta después del período de validez de la misma.",
    legal: "Artículos 64 LCP; 19 NORMAS DE CONTROL INTERNO SUNAI.",
  },
  monedaDiferenteAuAu: {
    label:
      "¿Admitirá la presentación de propuestas económicas referenciadas en moneda extranjera, bajo la condición obligatoria de que la evaluación comparativa y los pagos se realicen en Bolívares (Bs.) al tipo de cambio oficial del Banco Central de Venezuela (BCV)?",
    legal: "Artículos 66, Numeral 6 LCP; Artículo 141 del Reglamento de la LCP",
  },
  nomMonedaExtranjeraAuAu: {
    label:
      "Especifique el nombre oficial de la moneda extranjera que se utilizará como referencia (Ejemplo: Dólares de los Estados Unidos de América, Euros)",
    legal: "Artículos 66, Numeral 6 LCP; Artículo 141 del Reglamento de la LCP",
  },
  idiomaDiferenteAuAu: {
    label:
      "Se admitirá la presentación de documentos técnicos o catálogos en idiomas distintos al castellano, bajo la condición obligatoria de adjuntar una traducción fidedigna realizada por el oferente.",
    legal: "Artículo 66 de la LCP.",
  },
  nomIdiomaDiferenteAuAu: {
    label:
      "Especifique el nombre oficial del idioma que permitirá para la presentación de documentos técnicos o catálogos (Ejemplo: Inglés, portugues, francés)",
    legal: "Artículos 66, Numeral 6 LCP; Artículo 141 del Reglamento de la LCP",
  },
  porcentajeResponsabilidadSocialAuAu: {
    label:
      "Indique el porcentaje (%) destinado al Compromiso de Responsabilidad Social (CRS), de conformidad con lo establecido en el artículo 31 de la Ley de Contrataciones Públicas.",
    legal: "Artículos 31 LCP y 34 al 50 (exceptúa al 35) RLCP ; 34 NORMAS DE CONTROL INTERNO SUNAI",
  },
  unidadRespCumplimientoCrsAuAu: {
    label:
      "Indique nombre de la unidad técnica administrativa responsable de dar seguimiento y controlar la ejecución y el cumplimiento del compromiso de responsabilidad social (RS)",
    legal: "Artículos 44 RLCP; 5 NORMAS DE CONTROL INTERNO SUNAI",
  },
  modalidadCrsAuAu: {
    label:
      "Seleccione la modalidad o categoría legal bajo la cual se ejecutará el Compromiso de Responsabilidad Social (CRS) para este procedimiento, de conformidad con las demandas de desarrollo del entorno del Ente.",
    legal:
      "Artículo 6, Numeral 24 de la Ley de Contrataciones Públicas; Artículos 31, 32 de la LCP y 41 del Reglamento de la LCP; Norma 34 de las Normas de Control Interno de la SUNAI.",
  },
  formaCumplimientoCrsAuAu: {
    label:
      "Describa detalladamente el proyecto, metas, alcances o el plan específico mediante el cual el oferente adjudicado dará cumplimiento definitivo a la modalidad de Compromiso de Responsabilidad Social seleccionada.",
    legal:
      "Artículos 30 y 32 de la Ley de Contrataciones Públicas; Artículos 36, 41 y 44 de su Reglamento; Norma 34 de las Normas de Control Interno de la SUNAI.",
  },
  porcentajeMantenimientoOfertaAuAu: {
    label:
      "Indique el porcentaje (%) de la Garantía de Mantenimiento de la Oferta, a los fines de asegurar la seriedad de la oferta y su vigencia hasta la firma del contrato, conforme al Artículo 64 de la LCP",
    legal: "Artículos 64 LCP; 135 RLCP; 19 NORMAS DE CONTROL INTERNO SUNAI.",
  },
  porcentajeFielCumplimientoAuAu: {
    label:
      "Indique el porcentaje (%) de la Garantía de Fiel Cumplimiento (calculado sobre el monto total con IVA), conforme al Art. 123 de la LCP y los criterios de suficiencia de las Normas SUNAI.",
    legal: "Artículos 123 LCP; 19 NORMAS DE CONTROL INTERNO SUNAI.",
  },
  retencionFielCumplimientoAuAu: {
    label:
      "¿Se admitirá la constitución de la Garantía de Fiel Cumplimiento mediante la modalidad de retención (10%) sobre los pagos o valuaciones realizados?",
    legal: "Artículos 123 LCP; 19 NORMAS DE CONTROL INTERNO SUNAI.",
  },
  requiereGarantiaLaboralAuAu: {
    label:
      "¿Se exigirá la Garantía Laboral para asegurar las obligaciones laborales y de seguridad social, conforme al Art. 124 de la LCP?",
    legal: "Artículos 124 LCP; 19 NORMAS DE CONTROL INTERNO SUNAI.",
  },
  porcentajeGarantiaLaboralAuAu: {
    label:
      "Indique el porcentaje (%) de la Garantía Laboral (calculado sobre el costo de la mano de obra), de conformidad con el Art. 124 de la LCP y los criterios de suficiencia de las Normas SUNAI.",
    legal: "Artículos 124 LCP; 19 NORMAS DE CONTROL INTERNO SUNAI.",
  },
  retencionFianzaLaboralAuAu: {
    label:
      "¿Se admitirá la constitución de la Garantía Laboral mediante la modalidad de retención (5%) sobre los pagos o valuaciones realizados?",
    legal: "Artículos 124 LCP; 19 NORMAS DE CONTROL INTERNO SUNAI.",
  },
  polizaResponsabilidadCivilAuAu: {
    label:
      "¿Se exigirá la constitución de una Póliza de Responsabilidad Civil General para cubrir daños a personas, bienes o instalaciones, conforme al Art. 125 de la LCP y el análisis de riesgos de la SUNAI?",
    legal: "Artículos 125 LCP; 19 NORMAS DE CONTROL INTERNO SUNAI.",
  },
  porcentajeResponsabilidadCivilAuAu: {
    label:
      "Indique el porcentaje (%) para determinar la suma asegurada, calculado sobre el monto total estimado (con IVA), según la magnitud del riesgo de la ejecución.",
    legal: "Artículos 125 LCP; 19 NORMAS DE CONTROL INTERNO SUNAI",
  },
  montoResponsabilidadCivilBsAuAu: {
    label:
      "Indique el monto total de la Suma Asegurada (Bs.) que deberá reflejar la póliza para considerarse suficiente ante los riesgos identificados.",
    legal: "Artículos 125 LCP; 19 NORMAS DE CONTROL INTERNO SUNAI",
  },
  anticipoContratoAuAu: {
    label:
      "¿Desea otorgar un Anticipo Contractual (máximo 50%) para facilitar el inicio de la ejecución, conforme al Art. 122 de la LCP y los criterios de control de las Normas SUNAI?",
    legal: "Artículos 122 LCP; 19 NORMAS DE CONTROL INTERNO SUNAI.",
  },
  porcentajeAnticipoAuAu: {
    label:
      "Indique el porcentaje (%) de anticipo que se otorgará sobre el monto total del contrato (sin IVA).",
    legal: "Máximo 50%",
  },
  anticipoEspecialAuAu: {
    label:
      "¿Desea otorgar un Anticipo Especial, conforme al Art. 129 de la LCP y los criterios de control de las Normas SUNAI?",
    legal: "Artículos 129 LCP; 19 NORMAS DE CONTROL INTERNO SUNAI. Máximo 20%.",
  },
  porcentajeAnticipoEspecialAuAu: {
    label:
      "Indique el porcentaje (%) de anticipo que se otorgará sobre el monto total del contrato (sin IVA).",
    legal: "Máximo 20%",
  },
} as const;

export function getAspectosGeneralesFormStorageKey(expedienteId: string): string {
  return `aspectos-generales-form:${expedienteId}`;
}

export function createAspectosGeneralesDefaultValues(): AspectosGeneralesFormInputValues {
  return {
    datosActoAutorizacionInicioAuAu: "",
    diasValidezOfertaAuAu: "",
    autoridadAclaratoriasAuAu: "",
    normativaLegalAuAu: [],
    diasVigenciaGarantiaExtAuAu: "",
    monedaDiferenteAuAu: undefined,
    nomMonedaExtranjeraAuAu: "",
    idiomaDiferenteAuAu: undefined,
    nomIdiomaDiferenteAuAu: "",
    porcentajeResponsabilidadSocialAuAu: "",
    unidadRespCumplimientoCrsAuAu: "",
    modalidadCrsAuAu: "",
    formaCumplimientoCrsAuAu: "",
    porcentajeMantenimientoOfertaAuAu: "",
    porcentajeFielCumplimientoAuAu: "",
    retencionFielCumplimientoAuAu: undefined,
    requiereGarantiaLaboralAuAu: undefined,
    porcentajeGarantiaLaboralAuAu: "",
    retencionFianzaLaboralAuAu: undefined,
    polizaResponsabilidadCivilAuAu: undefined,
    porcentajeResponsabilidadCivilAuAu: "",
    montoResponsabilidadCivilBsAuAu: "",
    anticipoContratoAuAu: undefined,
    porcentajeAnticipoAuAu: "",
    anticipoEspecialAuAu: undefined,
    porcentajeAnticipoEspecialAuAu: "",
  };
}

export type AspectosGeneralesFormStatus = "draft" | "completed";

export interface AspectosGeneralesStoredForm {
  values: AspectosGeneralesFormInputValues;
  currentStep: number;
  status: AspectosGeneralesFormStatus;
}

export function getAspectosGeneralesStepFields(
  step: number,
  values: AspectosGeneralesFormInputValues
): (keyof AspectosGeneralesFormInputValues)[] {
  if (step === 1) {
    return [
      "datosActoAutorizacionInicioAuAu",
      "diasValidezOfertaAuAu",
      "autoridadAclaratoriasAuAu",
      "normativaLegalAuAu",
    ];
  }

  if (step === 2) {
    const fields: (keyof AspectosGeneralesFormInputValues)[] = [
      "diasVigenciaGarantiaExtAuAu",
      "monedaDiferenteAuAu",
      "idiomaDiferenteAuAu",
    ];
    if (values.monedaDiferenteAuAu === true) {
      fields.push("nomMonedaExtranjeraAuAu");
    }
    if (values.idiomaDiferenteAuAu === true) {
      fields.push("nomIdiomaDiferenteAuAu");
    }
    return fields;
  }

  if (step === 3) {
    return [
      "porcentajeResponsabilidadSocialAuAu",
      "unidadRespCumplimientoCrsAuAu",
      "modalidadCrsAuAu",
      "formaCumplimientoCrsAuAu",
    ];
  }

  if (step === 4) {
    const fields: (keyof AspectosGeneralesFormInputValues)[] = [
      "porcentajeMantenimientoOfertaAuAu",
      "porcentajeFielCumplimientoAuAu",
      "retencionFielCumplimientoAuAu",
      "requiereGarantiaLaboralAuAu",
      "polizaResponsabilidadCivilAuAu",
      "anticipoContratoAuAu",
      "anticipoEspecialAuAu",
    ];
    if (values.requiereGarantiaLaboralAuAu === true) {
      fields.push("porcentajeGarantiaLaboralAuAu", "retencionFianzaLaboralAuAu");
    }
    if (values.polizaResponsabilidadCivilAuAu === true) {
      fields.push("porcentajeResponsabilidadCivilAuAu", "montoResponsabilidadCivilBsAuAu");
    }
    if (values.anticipoContratoAuAu === true) {
      fields.push("porcentajeAnticipoAuAu");
    }
    if (values.anticipoEspecialAuAu === true) {
      fields.push("porcentajeAnticipoEspecialAuAu");
    }
    return fields;
  }

  return [];
}

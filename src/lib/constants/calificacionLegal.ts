export type RecaudoSobre = 1 | 2;

export type RecaudoAutoFrom = "requiereVanAuAu" | "requiereGarantiaLaboralAuAu";

export interface RecaudoSubstituteDef {
  id: string;
  pregunta: string;
  basamentoLegal?: string;
  /**
   * Código en /documentos-ejemplo (kebab-case).
   * Por defecto se deriva del `id` camelCase → kebab-case.
   */
  modelCodigo?: string;
}

export interface RecaudoDef {
  id: string;
  sobre: RecaudoSobre;
  titulo: string;
  /**
   * Código en /documentos-ejemplo (Admin UNIVERSITAS, kebab-case).
   * Por defecto: id camelCase convertido a kebab-case
   * (modCartaOfertaAuAu → mod-carta-oferta-au-au).
   */
  modelCodigo?: string;
  substitute?: RecaudoSubstituteDef;
  autoFrom?: RecaudoAutoFrom;
}

export interface RecaudoArchivoMeta {
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  /**
   * URL de previsualización: blob de sesión o URL del endpoint de documentos.
   * Los blob: no persisten tras recargar.
   */
  previewUrl?: string;
  /** Id remoto cuando exista el endpoint de documentos */
  documentId?: string;
}

export interface RecaudoPersonalizadoItem {
  id: string;
  sobre: RecaudoSobre;
  descripcion: string;
  tieneModelo: boolean;
  archivo: RecaudoArchivoMeta | null;
  exigido: boolean;
}

export type CalificacionLegalFormStatus = "draft" | "completed";

export interface CalificacionLegalStoredForm {
  exigidos: Record<string, boolean | undefined>;
  sustitutos: Record<string, boolean | undefined>;
  personalizados: RecaudoPersonalizadoItem[];
  indOtroSobre1: boolean | undefined;
  descOtroSobre1: string;
  modeloOtroSobre1: boolean | undefined;
  archivoOtroSobre1: RecaudoArchivoMeta | null;
  indOtroSobre2: boolean | undefined;
  descOtroSobre2: string;
  modeloOtroSobre2: boolean | undefined;
  archivoOtroSobre2: RecaudoArchivoMeta | null;
  status: CalificacionLegalFormStatus;
}

export const CALIFICACION_LEGAL_WIZARD_TITLE = "Calificación Legal (Contenido de Sobres)";
export const CALIFICACION_LEGAL_BANNER =
  "Atención: La selección de los recaudos correspondientes al Sobre N° 1 definirá los parámetros estrictos para la Calificación Legal y Financiera de los oferentes en este procedimiento.";

export const CALIFICACION_LEGAL_DRAFT_LABEL = "Guardar borrador";
export const CALIFICACION_LEGAL_SUBMIT_LABEL = "Configurar recaudos";
export const CALIFICACION_LEGAL_SUBMIT_DISABLED_HINT =
  "Debe marcar SÍ o NO en todos los recaudos de ambos sobres. No puede dejar ninguna opción sin selección.";

export const CALIFICACION_LEGAL_SUCCESS_TITLE = "Recaudos Configurados";
export const CALIFICACION_LEGAL_SUCCESS_DESCRIPTION =
  "La lista de cotejo y los requisitos de los sobres 1 y 2 han sido generados exitosamente.";

export const CALIFICACION_LEGAL_DESC_MAX = 500;

/**
 * Catálogo de recaudos. El código en Admin/API es el `id` en kebab-case
 * (GET /documentos-ejemplo/mod-carta-oferta-au-au ← modCartaOfertaAuAu).
 */
export const RECAUDOS_CALIFICACION_LEGAL: RecaudoDef[] = [
  {
    id: "modCartaManifestacionVoluntadAuAu",
    sobre: 1,
    titulo: "Carta de Manifestación de Voluntad.",
  },
  {
    id: "modCartaAutorizacionAuAu",
    sobre: 1,
    titulo:
      "Poder debidamente autenticado o Autorización simple a la persona encargada de representar a la empresa durante todo el proceso de contratación.",
  },
  {
    id: "modDocConstitutivoAuAu",
    sobre: 1,
    titulo: "Documento Constitutivo y Estatutario y sus modificaciones debidamente registradas.",
  },
  {
    id: "modCopiaRifVigenteAuAu",
    sobre: 1,
    titulo: "Copia del Registro de Información Fiscal (R.I.F.)",
    substitute: {
      id: "sustitutoDjRifVigenteAuAu",
      pregunta:
        "¿Permite que la Copia del Registro de Información Fiscal (R.I.F.) vigente sea sustituida temporalmente por una Declaración Jurada, en caso de que el proponente acredite que el documento se encuentra en proceso de actualización o trámite ante el SENIAT?",
      basamentoLegal:
        "Artículos 65 de la Ley de Contrataciones Públicas; 61 de su Reglamento; en concordancia con los principios de simplificación de trámites administrativos de la LOPA y las Normas de Control Interno de la SUNAI 2025.",
    },
  },
  {
    id: "modCertificadoRncAuAu",
    sobre: 1,
    titulo:
      "Certificado de Inscripción en el Registro Nacional de Contratistas, con el respectivo reporte de calificación o Planilla Resumen.",
    substitute: {
      id: "sustitutoDjCertificadoRncAuAu",
      pregunta:
        "¿Permite que el Certificado de Inscripción en el Registro Nacional de Contratistas (R.N.C.) vigente, con su reporte de calificación o Planilla Resumen, sea sustituido temporalmente por una Declaración Jurada, siempre y cuando el proponente demuestre documentalmente que el registro se encuentra en proceso de actualización, renovación o trámite ante el S.N.C.?",
      basamentoLegal:
        "Artículos 48, 49, 50 y 65 de la Ley de Contrataciones Públicas; Artículo 61 de su Reglamento; en concordancia con los principios de simplificación de trámites administrativos y la Norma 24 de las Normas de Control Interno de la SUNAI 2025.",
    },
  },
  {
    id: "modSolvenciaLaboralAuAu",
    sobre: 1,
    titulo: "Declaración jurada de Solvencia Laboral.",
  },
  {
    id: "modDeclaracionSociosNoInhabilitadosAuAu",
    sobre: 1,
    titulo:
      "Declaración Jurada de no contar dentro de la conformación y organización de la empresa con personas naturales que participen como socios, miembros o administradores de alguna empresa, sociedad o agrupación que se encuentre inhabilitada.",
  },
  {
    id: "modDeclaracionNoDeudasEnteAuAu",
    sobre: 1,
    titulo:
      "Declaración Jurada de Conocimiento de no poseer Obligaciones Exigibles con el Contratante.",
  },
  {
    id: "modDeclaracionNoImpedimentosLcpAuAu",
    sobre: 1,
    titulo:
      "Declaración Jurada de No Tener Impedimentos para Participar en los Procedimientos Previstos en el Decreto con Rango, Valor y Fuerza de Ley de Contrataciones Públicas.",
  },
  {
    id: "modDeclaracionConocimientoLugarAuAu",
    sobre: 1,
    titulo:
      "Declaración Jurada de Conocimiento del Lugar donde se Realizará la Ejecución del Objeto de la Contratación.",
  },
  {
    id: "modDeclaracionInfoFinancieraAuAu",
    sobre: 1,
    titulo: "Declaración Jurada de Información Financiera.",
  },
  {
    id: "modEvaluacionDesempenoAuAu",
    sobre: 1,
    titulo: "Informe de Evaluación de desempeño en Contrataciones.",
    substitute: {
      id: "sustitutoDjEvalDesempenoAuAu",
      pregunta:
        "¿Permite que el Informe de Evaluación de Desempeño en Contrataciones sea sustituido temporalmente por una Declaración Jurada, en casos donde el proponente declare bajo fe de juramento no haber contratado previamente con el sector público, o que sus evaluaciones previas se encuentren en fase de carga o trámite por parte de otros órganos contratantes?",
      basamentoLegal:
        "Artículos 140 de la Ley de Contrataciones Públicas; 61 de su Reglamento; en concordancia con los principios de simplificación de trámites administrativos y la Norma 24 de las Normas de Control Interno de la SUNAI 2025.",
    },
  },
  {
    id: "modCartaOfertaAuAu",
    sobre: 2,
    titulo: "Carta Oferta.",
  },
  {
    id: "modDeclaracionCapacidadFinancieraAuAu",
    sobre: 2,
    titulo: "Declaración Jurada de Contar con la Capacidad Financiera de Contratación.",
  },
  {
    id: "modDeclaracionCompromisoRespSocialAuAu",
    sobre: 2,
    titulo: "Declaración jurada para el cumplimiento del compromiso de responsabilidad social.",
  },
  {
    id: "modGarantiaMantenimientoOfertaAuAu",
    sobre: 2,
    titulo:
      "Garantía de mantenimiento de la Oferta: Declaración Jurada o Caución a favor del Ente Contratante.",
  },
  {
    id: "modDeclaracionAutocalculoVanAuAu",
    sobre: 2,
    titulo: "Declaración Jurada de Auto cálculo del V.A.N.",
    autoFrom: "requiereVanAuAu",
  },
  {
    id: "modCartaNotificacionesAuAu",
    sobre: 2,
    titulo: "Carta de datos para notificaciones.",
  },
  {
    id: "modGarantiaFielCumplAuAu",
    sobre: 2,
    titulo: "Garantía de Fiel Cumplimiento del Contrato.",
  },
  {
    id: "modFianzaLaboralAuAu",
    sobre: 2,
    titulo: "Fianza Laboral.",
    autoFrom: "requiereGarantiaLaboralAuAu",
  },
];

/**
 * El API exige códigos kebab-case; los `id` de recaudos son camelCase.
 */
export function recaudoIdToDocumentoCodigo(id: string): string {
  return id
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

export function getRecaudoModelCodigo(recaudo: Pick<RecaudoDef, "id" | "modelCodigo">): string {
  return recaudo.modelCodigo ?? recaudoIdToDocumentoCodigo(recaudo.id);
}

export function getSubstituteModelCodigo(
  substitute: Pick<RecaudoSubstituteDef, "id" | "modelCodigo">
): string {
  return substitute.modelCodigo ?? recaudoIdToDocumentoCodigo(substitute.id);
}

export function getRecaudosBySobre(sobre: RecaudoSobre): RecaudoDef[] {
  return RECAUDOS_CALIFICACION_LEGAL.filter((r) => r.sobre === sobre);
}

export function createEmptyCalificacionLegalForm(): CalificacionLegalStoredForm {
  const exigidos: Record<string, boolean | undefined> = {};
  const sustitutos: Record<string, boolean | undefined> = {};

  for (const recaudo of RECAUDOS_CALIFICACION_LEGAL) {
    exigidos[recaudo.id] = undefined;
    if (recaudo.substitute) {
      sustitutos[recaudo.substitute.id] = undefined;
    }
  }

  return {
    exigidos,
    sustitutos,
    personalizados: [],
    indOtroSobre1: undefined,
    descOtroSobre1: "",
    modeloOtroSobre1: undefined,
    archivoOtroSobre1: null,
    indOtroSobre2: undefined,
    descOtroSobre2: "",
    modeloOtroSobre2: undefined,
    archivoOtroSobre2: null,
    status: "draft",
  };
}

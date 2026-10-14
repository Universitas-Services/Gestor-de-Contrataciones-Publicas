import { RECAUDOS_CALIFICACION_LEGAL } from "@/lib/constants/calificacionLegal";
import type {
  CalificacionLegalEvaluacionValues,
  ChecklistSiNo,
  RecaudoCotejoItem,
  RecaudoCotejoRespuesta,
} from "@/types/evaluacionOferente.types";

/** Este cotejo aplica a Concurso Abierto · Acto Único / Apertura Única. */
export const MODALIDAD_EVALUACION_CA_AU = "ACTO_UNICO_APERTURA_UNICA" as const;

export const CALIFICACION_LEGAL_EVAL_TITLE = "Calificación legal (Revisión de sobres)";
export const CALIFICACION_LEGAL_EVAL_SUBTITLE =
  "Utilice la lista de cotejo para verificar si la empresa entregó los recaudos exigidos en el Pliego de Condiciones.";

export const CALIFICACION_LEGAL_JUSTIFICACION_ARTICULOS =
  "Artículos 95 LCP; 18.4 LOPA; 16 Normas SUNAI";

export const CALIFICACION_LEGAL_ALERT_CUMPLE =
  "El oferente consignó de manera oportuna y satisfactoria la totalidad de los recaudos legales de carácter obligatorio y eliminatorio exigidos en el Pliego de Condiciones.";

export const CALIFICACION_LEGAL_ALERT_NO_CUMPLE =
  "El oferente resulta NO CALIFICADO legalmente debido a que omitió consignar alguno de los recaudos de carácter obligatorio y eliminatorio exigidos en el Pliego de Condiciones.";

export const CALIFICACION_LEGAL_JUSTIF_CUMPLE =
  "Indique una breve justificación del porqué cumplió con la calificación legal este oferente.";

export const CALIFICACION_LEGAL_JUSTIF_NO_CUMPLE =
  "Indique una breve justificación del porqué No cumplió con la calificación legal este oferente.";

export const OFERTA_TECNICO_ECONOMICA_ID = "ofertaTecnicoEconomica";
export const VAN_RECAUDO_ID = "modDeclaracionAutocalculoVanAuAu";

export const OBS_MAX_LEN = 500;
export const JUSTIFICACION_MAX_LEN = 1000;

/** Preguntas de cotejo alineadas a la documentación de Fase 2 (no a los títulos del pliego). */
export const PREGUNTA_POR_RECAUDO_ID: Record<string, string> = {
  modCartaManifestacionVoluntadAuAu: "¿Consignó carta de manifestación de voluntad?",
  modCartaAutorizacionAuAu: "¿Consignó carta de autorización?",
  modDocConstitutivoAuAu:
    "¿Consignó documento Constitutivo y Estatutario y sus modificaciones debidamente registradas?",
  modCopiaRifVigenteAuAu: "¿Consignó copia del Registro de Información Fiscal (R.I.F.) vigente?",
  modCertificadoRncAuAu:
    "¿Consignó certificado de Inscripción en el Registro Nacional de Contratistas, con el respectivo reporte de calificación o planilla resumen?",
  modSolvenciaLaboralAuAu:
    "¿Consignó certificado de solvencia laboral o declaración jurada de solvencia laboral?",
  modDeclaracionSociosNoInhabilitadosAuAu:
    "¿Consignó la declaración jurada de conocimiento de no contar dentro de su conformación y organización con personas naturales que participen como socios, miembros o administradores de alguna empresa, sociedad o agrupación que se encuentre inhabilitada?",
  modDeclaracionNoDeudasEnteAuAu:
    "¿Consignó declaración jurada de conocimiento de no poseer obligaciones exigibles con el contratante?",
  modDeclaracionNoImpedimentosLcpAuAu:
    "¿Consignó declaración jurada de no tener impedimentos para participar en los procedimientos previstos en el Decreto con Rango, Valor y Fuerza de Ley de Contrataciones Públicas?",
  modDeclaracionConocimientoLugarAuAu:
    "¿Consignó Declaración Jurada de Conocimiento del Lugar donde se Realizará la Ejecución del Objeto de la Contratación?",
  modDeclaracionInfoFinancieraAuAu: "¿Consignó declaración jurada de información financiera?",
  modEvaluacionDesempenoAuAu: "¿Consignó Informe de Evaluación de Desempeño en Contrataciones?",
  modCartaOfertaAuAu: "¿Presentó carta de oferta?",
  modDeclaracionCapacidadFinancieraAuAu:
    "¿Consignó declaración jurada de contar con la capacidad financiera de contratación?",
  modDeclaracionCompromisoRespSocialAuAu:
    "¿Consignó declaración jurada para el cumplimiento del compromiso de responsabilidad social?",
  modGarantiaMantenimientoOfertaAuAu: "¿Consignó garantía de mantenimiento de la oferta?",
  modDeclaracionAutocalculoVanAuAu:
    "¿Consignó declaración jurada de auto cálculo del V.A.N? (Opcional)",
  modCartaNotificacionesAuAu: "¿Consignó carta de datos para notificaciones?",
  modGarantiaFielCumplAuAu: "¿Consignó garantía de fiel cumplimiento del contrato?",
  modFianzaLaboralAuAu: "¿Consignó Fianza Laboral?",
};

export const OFERTA_TECNICO_ECONOMICA_ITEM: RecaudoCotejoItem = {
  id: OFERTA_TECNICO_ECONOMICA_ID,
  sobre: 2,
  pregunta: "¿Presentó oferta técnico-económica?",
  etiquetaCorta: "Oferta técnico-económica",
  eliminatorio: true,
};

function toCotejoItemFromCatalog(id: string, sobre: 1 | 2, titulo: string): RecaudoCotejoItem {
  return {
    id,
    sobre,
    pregunta: PREGUNTA_POR_RECAUDO_ID[id] ?? `¿Consignó ${titulo.replace(/\.$/, "")}?`,
    etiquetaCorta: titulo.replace(/\.$/, ""),
    eliminatorio: id !== VAN_RECAUDO_ID,
  };
}

export function recaudoCatalogoToCotejoItem(): RecaudoCotejoItem[] {
  return RECAUDOS_CALIFICACION_LEGAL.map((r) => toCotejoItemFromCatalog(r.id, r.sobre, r.titulo));
}

export function emptyRespuesta(): RecaudoCotejoRespuesta {
  return { consignado: undefined, observacion: "" };
}

export function emptyLegalFormValues(
  items: RecaudoCotejoItem[]
): CalificacionLegalEvaluacionValues {
  const map: Record<string, RecaudoCotejoRespuesta> = {};
  for (const item of items) {
    map[item.id] = emptyRespuesta();
  }
  return {
    items: map,
    justificacion: "",
    indVerificadoGarantia: null,
    indVerificadoCrs: null,
    obsVerificadoGarantia: "",
    obsVerificadoCrs: "",
  };
}

export const VERIFICACION_GARANTIA_PREGUNTA =
  "Se verificó que la empresa oferente consignó la garantía de mantenimiento de la oferta.";
export const VERIFICACION_GARANTIA_LEGAL = "Artículos 64 LCP; 19 Normas de Control Interno SUNAI.";
export const VERIFICACION_CRS_PREGUNTA =
  "Se verificó que la empresa oferente presentó el compromiso de responsabilidad social.";
export const VERIFICACION_CRS_LEGAL = "Artículos 66.15 LCP; 5 Normas de Control Interno SUNAI.";

export function itemsBySobre(items: RecaudoCotejoItem[], sobre: 1 | 2): RecaudoCotejoItem[] {
  return items.filter((item) => item.sobre === sobre);
}

/**
 * Dictamen: un NO en cualquier eliminatorio responde false.
 * Null/no mostrado/opcional no cuentan. True solo si todos los eliminatorios visibles son SI.
 */
export function resolveDictamenLegal(
  items: RecaudoCotejoItem[],
  answers: Record<string, { consignado?: ChecklistSiNo } | undefined>,
  sobre?: 1 | 2
): boolean | null {
  const relevant = items.filter(
    (item) => item.eliminatorio && (sobre == null || item.sobre === sobre)
  );
  if (relevant.length === 0) return null;

  let sawNo = false;
  let unanswered = 0;
  for (const item of relevant) {
    const val = answers[item.id]?.consignado;
    if (val === "NO") sawNo = true;
    else if (val !== "SI") unanswered += 1;
  }

  if (sawNo) return false;
  if (unanswered > 0) return null;
  return true;
}

/** Dictamen global: además de los recaudos, las verificaciones de garantía y CRS (Sobre 2) son eliminatorias. */
export function resolveDictamenLegalConVerificaciones(
  items: RecaudoCotejoItem[],
  values: Pick<
    CalificacionLegalEvaluacionValues,
    "items" | "indVerificadoGarantia" | "indVerificadoCrs"
  >
): boolean | null {
  const recaudos = resolveDictamenLegal(items, values.items);
  const verificaciones = [values.indVerificadoGarantia, values.indVerificadoCrs];
  if (recaudos === false || verificaciones.includes(false)) return false;
  if (recaudos === null || verificaciones.includes(null)) return null;
  return true;
}

export function formatMontoOfertaBs(monto: number | null): string {
  if (monto === null || Number.isNaN(monto)) return "—";
  return `${new Intl.NumberFormat("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(monto)} Bs`;
}

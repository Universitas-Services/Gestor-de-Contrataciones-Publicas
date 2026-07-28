import type {
  ChecklistItemDef,
  ChecklistSiNo,
  Sobre1Payload,
  Sobre2ChecklistPayload,
} from "@/types/evaluacionFase3.types";

/** Sección A — Sobre N°1 (13 ítems) — gestión */
export const GESTION_SOBRE1_ITEMS: ChecklistItemDef[] = [
  {
    id: 1,
    texto: "¿Consignó carta de manifestación de voluntad? (Modelo N° 1)",
    field: "cartaManifestacionVoluntad",
    obsField: "obsCartaManifestacionVoluntad",
  },
  {
    id: 2,
    texto: "¿Consignó carta de autorización? (Modelo N° 2)",
    field: "cartaAutorizacion",
    obsField: "obsCartaAutorizacion",
  },
  {
    id: 3,
    texto:
      "¿Consignó documento Constitutivo y Estatutario y sus modificaciones debidamente registradas?",
    field: "docConstitutivo",
    obsField: "obsDocConstitutivo",
  },
  {
    id: 4,
    texto: "¿Consignó copia del Registro de Información Fiscal (R.I.F.) vigente?",
    field: "copiaRifVigente",
    obsField: "obsCopiaRifVigente",
  },
  {
    id: 5,
    texto:
      "¿Consignó certificado de Inscripción en el Registro Nacional de Contratistas, con el respectivo reporte de calificación o planilla resumen?",
    field: "certificadoRnc",
    obsField: "obsCertificadoRnc",
  },
  {
    id: 6,
    texto:
      "¿Consignó certificado de solvencia laboral o declaración jurada de solvencia laboral? (Modelo N° 3)",
    field: "solvenciaLaboral",
    obsField: "obsSolvenciaLaboral",
  },
  {
    id: 7,
    texto:
      "¿Consignó la declaración jurada de conocimiento de no contar dentro de su conformación y organización con personas naturales que participen como socios, miembros o administradores de alguna empresa, sociedad o agrupación que se encuentre inhabilitada? (Modelo N° 4)",
    field: "declaracionSociosNoInhabilitados",
    obsField: "obsDeclaracionSociosNoInhabilitados",
  },
  {
    id: 8,
    texto:
      "¿Consignó declaración jurada de conocimiento de no poseer obligaciones exigibles con el contratante? (Modelo N° 5)",
    field: "declaracionNoDeudas",
    obsField: "obsDeclaracionNoDeudas",
  },
  {
    id: 9,
    texto:
      "¿Consignó declaración jurada de no tener impedimentos para participar en los procedimientos previstos en el Decreto con Rango, Valor y Fuerza de Ley de Contrataciones Públicas? (Modelo N° 6)",
    field: "declaracionNoImpedimentosLcp",
    obsField: "obsDeclaracionNoImpedimentosLcp",
  },
  {
    id: 10,
    texto: "¿Consignó declaración jurada de información financiera? (Modelo N° 7)",
    field: "declaracionInfoFinanciera",
    obsField: "obsDeclaracionInfoFinanciera",
  },
  {
    id: 11,
    texto: "¿Consignó relación de servicios prestados? (Modelo N° 8)",
    field: "relacionServiciosPrestados",
    obsField: "obsRelacionServiciosPrestados",
  },
  {
    id: 12,
    texto: "¿Consignó Informe de Evaluación de desempeño en Contrataciones?",
    field: "evaluacionDesempenio",
    obsField: "obsEvaluacionDesempenio",
  },
  {
    id: 13,
    texto: "¿Consignó referencias comerciales de empresas privadas?",
    field: "referenciasComerciales",
    obsField: "obsReferenciasComerciales",
  },
];

/** Sección B — Sobre N°2 checklist (11 ítems) — gestión */
export const GESTION_SOBRE2_CHECKLIST_ITEMS: ChecklistItemDef[] = [
  {
    id: 1,
    texto: "¿Presentó oferta técnico-económica?",
    field: "ofertaTecnicoEconomica",
    obsField: "obsOfertaTecnicoEconomica",
  },
  {
    id: 2,
    texto: "¿Presentó carta de oferta? (Modelo N° 9)",
    field: "cartaOferta",
    obsField: "obsCartaOferta",
  },
  {
    id: 3,
    texto:
      "¿Consignó declaración jurada de contar con la capacidad financiera de contratación? (Modelo N° 10)",
    field: "declaracionCapacidadFinanciera",
    obsField: "obsDeclaracionCapacidadFinanciera",
  },
  {
    id: 4,
    texto:
      "¿Consignó declaración jurada para el cumplimiento del compromiso de responsabilidad social? (Modelo N° 11)",
    field: "declaracionCompromisoRespSocial",
    obsField: "obsDeclaracionCompromisoRespSocial",
  },
  {
    id: 5,
    texto: "¿Consignó garantía de mantenimiento de la oferta? (Modelo N° 12)",
    field: "garantiaMantenimientoOferta",
    obsField: "obsGarantiaMantenimientoOferta",
  },
  {
    id: 6,
    texto: "¿Consignó declaración jurada de auto cálculo del V.A.N?",
    field: "declaracionAutocalculoVan",
    obsField: "obsDeclaracionAutocalculoVan",
  },
  {
    id: 7,
    texto: "¿Consignó carta de datos para notificaciones?",
    field: "cartaNotificaciones",
    obsField: "obsCartaNotificaciones",
  },
  {
    id: 8,
    texto: "¿Consignó garantía de fiel cumplimiento del contrato?",
    field: "garantiaFielCumpl",
    obsField: "obsGarantiaFielCumpl",
  },
  {
    id: 9,
    texto:
      "¿Consignó carta de compromiso de tiempo de ejecución, disponibilidad y garantía técnica / tiempo de respuesta?",
    field: "cartaCompromiso",
    obsField: "obsCartaCompromiso",
  },
  {
    id: 10,
    texto: "¿Consignó Fianza Laboral? (Si aplica)",
    field: "fianzaLaboral",
    obsField: "obsFianzaLaboral",
  },
  {
    id: 11,
    texto: "¿Consignó experiencia del personal técnico clave? (Si aplica)",
    field: "experienciaPersonalTecnico",
    obsField: "obsExperienciaPersonalTecnico",
  },
];

export const GESTION_SOBRE1_BOOLEAN_FIELDS = GESTION_SOBRE1_ITEMS.map(
  (item) => item.field
) as readonly string[];

export const GESTION_SOBRE2_BOOLEAN_FIELDS = GESTION_SOBRE2_CHECKLIST_ITEMS.map(
  (item) => item.field
) as readonly string[];

export function buildSobre1Payload(
  respuestas: Record<number, ChecklistSiNo>,
  observaciones: Record<number, string>
): Sobre1Payload {
  const get = (id: number) => respuestas[id] === "SI";
  const obs = (id: number) => observaciones[id] || "";

  return {
    cartaManifestacionVoluntad: get(1),
    obsCartaManifestacionVoluntad: obs(1),
    cartaAutorizacion: get(2),
    obsCartaAutorizacion: obs(2),
    docConstitutivo: get(3),
    obsDocConstitutivo: obs(3),
    copiaRifVigente: get(4),
    obsCopiaRifVigente: obs(4),
    certificadoRnc: get(5),
    obsCertificadoRnc: obs(5),
    solvenciaLaboral: get(6),
    obsSolvenciaLaboral: obs(6),
    declaracionSociosNoInhabilitados: get(7),
    obsDeclaracionSociosNoInhabilitados: obs(7),
    declaracionNoDeudas: get(8),
    obsDeclaracionNoDeudas: obs(8),
    declaracionNoImpedimentosLcp: get(9),
    obsDeclaracionNoImpedimentosLcp: obs(9),
    declaracionInfoFinanciera: get(10),
    obsDeclaracionInfoFinanciera: obs(10),
    relacionServiciosPrestados: get(11),
    obsRelacionServiciosPrestados: obs(11),
    evaluacionDesempenio: get(12),
    obsEvaluacionDesempenio: obs(12),
    referenciasComerciales: get(13),
    obsReferenciasComerciales: obs(13),
  };
}

export function buildSobre2ChecklistPayload(
  respuestas: Record<number, ChecklistSiNo>,
  observaciones: Record<number, string>
): Sobre2ChecklistPayload {
  const get = (id: number) => respuestas[id] === "SI";
  const obs = (id: number) => observaciones[id] || "";

  return {
    ofertaTecnicoEconomica: get(1),
    obsOfertaTecnicoEconomica: obs(1),
    cartaOferta: get(2),
    obsCartaOferta: obs(2),
    declaracionCapacidadFinanciera: get(3),
    obsDeclaracionCapacidadFinanciera: obs(3),
    declaracionCompromisoRespSocial: get(4),
    obsDeclaracionCompromisoRespSocial: obs(4),
    garantiaMantenimientoOferta: get(5),
    obsGarantiaMantenimientoOferta: obs(5),
    declaracionAutocalculoVan: get(6),
    obsDeclaracionAutocalculoVan: obs(6),
    cartaNotificaciones: get(7),
    obsCartaNotificaciones: obs(7),
    garantiaFielCumpl: get(8),
    obsGarantiaFielCumpl: obs(8),
    cartaCompromiso: get(9),
    obsCartaCompromiso: obs(9),
    fianzaLaboral: get(10),
    obsFianzaLaboral: obs(10),
    experienciaPersonalTecnico: get(11),
    obsExperienciaPersonalTecnico: obs(11),
  };
}

export function hydrateChecklistFromApi(
  items: ChecklistItemDef[],
  data: Record<string, unknown> | null | undefined
): {
  respuestas: Record<number, ChecklistSiNo>;
  observaciones: Record<number, string>;
  obsAbiertas: Record<number, boolean>;
} {
  const respuestas: Record<number, ChecklistSiNo> = {};
  const observaciones: Record<number, string> = {};
  const obsAbiertas: Record<number, boolean> = {};

  if (!data) return { respuestas, observaciones, obsAbiertas };

  for (const item of items) {
    const value = data[item.field];
    if (value !== null && value !== undefined) {
      respuestas[item.id] = value ? "SI" : "NO";
    }
    const obsValue = data[item.obsField];
    if (typeof obsValue === "string" && obsValue.trim()) {
      observaciones[item.id] = obsValue;
      obsAbiertas[item.id] = true;
    }
  }

  return { respuestas, observaciones, obsAbiertas };
}

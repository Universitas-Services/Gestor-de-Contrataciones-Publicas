import type {
  DocumentoMaestroConfig,
  DocumentoMaestroId,
  Fase1InicialState,
  MicromoduleConfig,
  MicromoduleId,
} from "../types/fase1Inicial.types";

export const FASE1_INICIAL_STORAGE_PREFIX = "fase1-inicial-state";

/**
 * Secuencia de desbloqueo (Fase 1):
 * 1. Solo Actividades Previas disponible → al completar genera documento Actividades Previas
 * 2. Desbloqueo masivo del resto de micromódulos
 * 3. Pliego listo solo si 8 formularios COMPLETADO + especificaciones + presupuesto con ítems
 * 4. Tras generar Pliego → Acta de Inicio y Llamado disponibles
 * 5. Al generar Acta + Llamado → phaseComplete (avance a Fase 2)
 *
 * Ver: utils/fase1UnlockLogic.ts
 */

export const FASE1_INICIAL_MICROMODULES: MicromoduleConfig[] = [
  {
    id: "actividades-previas",
    title: "Actividades Previas",
    description: "Punto de cuenta, autorizaciones y matriz de riesgo.",
    subTab: "preparatoria",
    ctaLabel: "Crear",
    buttonVariant: "solid",
    hasPlaceholderForm: false,
  },
  {
    id: "especificaciones-tecnicas",
    title: "Especificaciones Técnicas",
    description: "Alcance, normativas, y requerimientos de calidad.",
    subTab: "preparatoria",
    ctaLabel: "Cargar",
    buttonVariant: "solid",
    hasPlaceholderForm: false,
  },
  {
    id: "llamado",
    title: "Llamado",
    description: "Logística, horarios, costo y cronograma público.",
    subTab: "preparatoria",
    ctaLabel: "Configurar",
    buttonVariant: "solid",
    hasPlaceholderForm: false,
  },
  {
    id: "aspectos-generales-pliego",
    title: "Aspectos Generales del Pliego",
    description: "Garantías, régimen jurídico y validez de la oferta.",
    subTab: "preparatoria",
    ctaLabel: "Cargar",
    buttonVariant: "solid",
    hasPlaceholderForm: false,
  },
  {
    id: "modelo-contrato",
    title: "Modelo de contrato",
    description: "Estructuración de cláusulas, penalidades y pagos.",
    subTab: "preparatoria",
    ctaLabel: "Crear",
    buttonVariant: "solid",
    hasPlaceholderForm: false,
  },
  {
    id: "presupuesto-base",
    title: "Presupuesto base",
    description: "Partidas presupuestarias y estructura de costos.",
    subTab: "preparatoria",
    ctaLabel: "Cargar",
    buttonVariant: "solid",
    hasPlaceholderForm: false,
  },
  {
    id: "calificacion-legal",
    title: "Calificación Legal",
    description: "Listado de recaudos legales exigidos (Contenido de Sobres 1 y 2).",
    subTab: "configuracion-pliego",
    ctaLabel: "Configurar",
    buttonVariant: "solid",
    hasPlaceholderForm: false,
  },
  {
    id: "calificacion-financiera",
    title: "Calificación Financiera",
    description: "Índices financieros de Pass/Fail (Liquidez, Solvencia).",
    subTab: "configuracion-pliego",
    ctaLabel: "Crear",
    buttonVariant: "solid",
    hasPlaceholderForm: false,
  },
  {
    id: "calificacion-tecnica",
    title: "Calificación Técnica",
    description: "Experiencia, capacidad de equipos y personal técnico (Pass/Fail).",
    subTab: "configuracion-pliego",
    ctaLabel: "Crear",
    buttonVariant: "solid",
    hasPlaceholderForm: false,
  },
  {
    id: "evaluacion-tecnica-economica",
    title: "Evaluación Técnica y Económica",
    description:
      "Matriz de asignación de puntaje combinado (Precio, tiempo de entrega, garantía, etc).",
    subTab: "configuracion-pliego",
    ctaLabel: "Crear",
    buttonVariant: "solid",
    hasPlaceholderForm: false,
  },
];

export const FASE1_INICIAL_DOCUMENTOS: DocumentoMaestroConfig[] = [
  { id: "actividades-previas", label: "Actividades Previas", icon: "check" },
  { id: "pliego", label: "Pliego", icon: "book" },
  { id: "acta-inicio", label: "Acta de Inicio", icon: "file" },
  { id: "llamado", label: "Llamado", icon: "megaphone" },
];

const ALL_MICROMODULE_IDS = FASE1_INICIAL_MICROMODULES.map((m) => m.id);

export function createInitialFase1InicialState(): Fase1InicialState {
  const micromodules = ALL_MICROMODULE_IDS.reduce(
    (acc, id) => {
      acc[id] = id === "actividades-previas" ? "available" : "locked";
      return acc;
    },
    {} as Record<MicromoduleId, Fase1InicialState["micromodules"][MicromoduleId]>
  );

  const documents = FASE1_INICIAL_DOCUMENTOS.reduce(
    (acc, doc) => {
      acc[doc.id] = "locked";
      return acc;
    },
    {} as Record<DocumentoMaestroId, Fase1InicialState["documents"][DocumentoMaestroId]>
  );

  return {
    micromodules,
    documents,
    phaseComplete: false,
  };
}

export function getStorageKey(expedienteId: string): string {
  return `${FASE1_INICIAL_STORAGE_PREFIX}:${expedienteId}`;
}

export function getMicromodulesForSubTab(subTab: "preparatoria" | "configuracion-pliego") {
  return FASE1_INICIAL_MICROMODULES.filter((m) => m.subTab === subTab);
}

import type {
  DocumentoMaestroId,
  DocumentoMaestroStatus,
  Fase1InicialState,
  MicromoduleId,
  MicromoduleStatus,
} from "../types/fase1Inicial.types";

/**
 * 8 micromódulos con formulario estándar.
 * Variables backend: estado_*_au_au ∈ {PENDIENTE | BORRADOR | COMPLETADO}
 */
export const FASE1_FORMULARIOS_ESTANDAR_IDS = [
  "actividades-previas",
  "llamado",
  "aspectos-generales-pliego",
  "modelo-contrato",
  "calificacion-legal",
  "calificacion-financiera",
  "calificacion-tecnica",
  "evaluacion-tecnica-economica",
] as const satisfies readonly MicromoduleId[];

/** Especial: carga de archivo (especificaciones_tecnicas_au_au). */
export const FASE1_ESPECIFICACIONES_ID =
  "especificaciones-tecnicas" as const satisfies MicromoduleId;

/** Especial: tabla de ítems (items_presupuesto_base_au_au). */
export const FASE1_PRESUPUESTO_ID = "presupuesto-base" as const satisfies MicromoduleId;

/** Micromódulos que se desbloquean tras completar Actividades Previas. */
export const FASE1_MICROMODULOS_DESBLOQUEO_MASIVO: readonly MicromoduleId[] = [
  FASE1_ESPECIFICACIONES_ID,
  "llamado",
  "aspectos-generales-pliego",
  "modelo-contrato",
  FASE1_PRESUPUESTO_ID,
  "calificacion-legal",
  "calificacion-financiera",
  "calificacion-tecnica",
  "evaluacion-tecnica-economica",
];

export const MICROMODULE_BACKEND_STATUS_KEY: Partial<Record<MicromoduleId, string>> = {
  "actividades-previas": "estado_actividades_previas_au_au",
  llamado: "estado_llamado_au_au",
  "aspectos-generales-pliego": "estado_aspectos_generales_au_au",
  "modelo-contrato": "estado_modelo_contrato_au_au",
  "calificacion-legal": "estado_calificacion_legal_au_au",
  "calificacion-financiera": "estado_calificacion_financiera_au_au",
  "calificacion-tecnica": "estado_calificacion_tecnica_au_au",
  "evaluacion-tecnica-economica": "estado_evaluacion_tecnica_economica_au_au",
};

/** Mapeo UI → estados de documentación (PENDIENTE / BORRADOR / COMPLETADO). */
export function toBackendFormStatus(
  status: MicromoduleStatus
): "PENDIENTE" | "BORRADOR" | "COMPLETADO" | null {
  if (status === "locked" || status === "available") return "PENDIENTE";
  if (status === "draft") return "BORRADOR";
  if (status === "completed") return "COMPLETADO";
  return null;
}

export function isFormularioEstandarCompletado(status: MicromoduleStatus): boolean {
  return status === "completed";
}

/**
 * Hard gate del Pliego:
 * 8 formularios COMPLETADO + especificaciones cargadas + presupuesto con ítems.
 */
export function canEnablePliego(micromodules: Fase1InicialState["micromodules"]): boolean {
  const formulariosEstandarCompletados = FASE1_FORMULARIOS_ESTANDAR_IDS.every((id) =>
    isFormularioEstandarCompletado(micromodules[id])
  );
  const especificacionesCargadas = micromodules[FASE1_ESPECIFICACIONES_ID] === "completed";
  const presupuestoTieneItems = micromodules[FASE1_PRESUPUESTO_ID] === "completed";

  return formulariosEstandarCompletados && especificacionesCargadas && presupuestoTieneItems;
}

export function getPliegoMissingRequirements(
  micromodules: Fase1InicialState["micromodules"]
): string[] {
  const missing: string[] = [];

  for (const id of FASE1_FORMULARIOS_ESTANDAR_IDS) {
    if (!isFormularioEstandarCompletado(micromodules[id])) {
      missing.push(getMicromoduleLabel(id));
    }
  }

  if (micromodules[FASE1_ESPECIFICACIONES_ID] !== "completed") {
    missing.push("Especificaciones Técnicas (archivo)");
  }

  if (micromodules[FASE1_PRESUPUESTO_ID] !== "completed") {
    missing.push("Presupuesto base (al menos un ítem)");
  }

  return missing;
}

function getMicromoduleLabel(id: MicromoduleId): string {
  const labels: Record<MicromoduleId, string> = {
    "actividades-previas": "Actividades Previas",
    "especificaciones-tecnicas": "Especificaciones Técnicas",
    llamado: "Llamado",
    "aspectos-generales-pliego": "Aspectos Generales del Pliego",
    "modelo-contrato": "Modelo de contrato",
    "presupuesto-base": "Presupuesto base",
    "calificacion-legal": "Calificación Legal",
    "calificacion-financiera": "Calificación Financiera",
    "calificacion-tecnica": "Calificación Técnica",
    "evaluacion-tecnica-economica": "Evaluación Técnica y Económica",
  };
  return labels[id];
}

export function getDocumentUnlockTooltip(
  documentId: DocumentoMaestroId,
  documents: Fase1InicialState["documents"],
  micromodules: Fase1InicialState["micromodules"]
): string | null {
  const status = documents[documentId];
  if (status !== "locked") return null;

  if (documentId === "actividades-previas") {
    return "Complete y guarde el formulario de Actividades Previas para generar este documento.";
  }

  if (documentId === "pliego") {
    const missing = getPliegoMissingRequirements(micromodules);
    if (missing.length === 0) return null;
    if (missing.length <= 3) {
      return `Pendiente: ${missing.join(", ")}.`;
    }
    return `Complete los ${missing.length} micromódulos pendientes (formularios, especificaciones y presupuesto) para habilitar el Pliego.`;
  }

  if (documentId === "acta-inicio" || documentId === "llamado") {
    return "Genere primero el documento Pliego para habilitar Acta de Inicio y Llamado.";
  }

  return "Complete los requisitos previos para habilitar este documento.";
}

/**
 * Aplica la secuencia documental de Fase 1:
 * 1) Actividades Previas → documento generado al completar el form
 * 2) Desbloqueo masivo de micromódulos (fuera de esta función)
 * 3) Pliego ready solo con hard gate
 * 4) Acta + Llamado ready tras generar Pliego
 * 5) phaseComplete al generar Acta + Llamado (+ Pliego)
 */
export function applyFase1DocumentRules(state: Fase1InicialState): Fase1InicialState {
  const next: Fase1InicialState = {
    ...state,
    documents: { ...state.documents },
  };

  const pliegoReady = canEnablePliego(next.micromodules);
  next.documents.pliego = resolvePliegoStatus(next.documents.pliego, pliegoReady);

  const pliegoGenerated = next.documents.pliego === "generated";
  next.documents["acta-inicio"] = resolveConsequentDocStatus(
    next.documents["acta-inicio"],
    pliegoGenerated
  );
  next.documents.llamado = resolveConsequentDocStatus(next.documents.llamado, pliegoGenerated);

  next.phaseComplete =
    next.documents.pliego === "generated" &&
    next.documents["acta-inicio"] === "generated" &&
    next.documents.llamado === "generated";

  return next;
}

function resolvePliegoStatus(
  current: DocumentoMaestroStatus,
  canEnable: boolean
): DocumentoMaestroStatus {
  if (current === "generated") return "generated";
  return canEnable ? "ready" : "locked";
}

function resolveConsequentDocStatus(
  current: DocumentoMaestroStatus,
  pliegoGenerated: boolean
): DocumentoMaestroStatus {
  if (current === "generated") return "generated";
  return pliegoGenerated ? "ready" : "locked";
}

export function unlockMicromodulesAfterActividadesPrevias(
  micromodules: Fase1InicialState["micromodules"]
): Fase1InicialState["micromodules"] {
  const next = { ...micromodules };
  for (const id of FASE1_MICROMODULOS_DESBLOQUEO_MASIVO) {
    if (next[id] === "locked") {
      next[id] = "available";
    }
  }
  return next;
}

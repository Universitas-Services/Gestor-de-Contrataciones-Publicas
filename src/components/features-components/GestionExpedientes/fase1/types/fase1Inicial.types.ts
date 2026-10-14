export type Fase1InicialSubTab = "preparatoria" | "configuracion-pliego";

export type MicromoduleId =
  | "actividades-previas"
  | "especificaciones-tecnicas"
  | "llamado"
  | "aspectos-generales-pliego"
  | "modelo-contrato"
  | "presupuesto-base"
  | "calificacion-legal"
  | "calificacion-financiera"
  | "calificacion-tecnica"
  | "evaluacion-tecnica-economica";

export type DocumentoMaestroId = "actividades-previas" | "pliego" | "acta-inicio" | "llamado";

/**
 * Estados UI del micromódulo.
 * Para formularios estándar (docs): available→PENDIENTE, draft→BORRADOR, completed→COMPLETADO.
 * locked = aún no desbloqueado (antes de Actividades Previas).
 */
export type MicromoduleStatus = "locked" | "available" | "draft" | "completed";

export type DocumentoMaestroStatus = "locked" | "ready" | "generated";

export interface Fase1InicialState {
  micromodules: Record<MicromoduleId, MicromoduleStatus>;
  documents: Record<DocumentoMaestroId, DocumentoMaestroStatus>;
  phaseComplete: boolean;
}

export type MicromoduleButtonVariant = "solid" | "outline";

export interface MicromoduleConfig {
  id: MicromoduleId;
  title: string;
  description: string;
  subTab: Fase1InicialSubTab;
  ctaLabel: string;
  buttonVariant: MicromoduleButtonVariant;
  /** Si true, se abre sheet placeholder; presupuesto se gestiona aparte. */
  hasPlaceholderForm: boolean;
}

export interface DocumentoMaestroConfig {
  id: DocumentoMaestroId;
  label: string;
  icon: "check" | "file" | "book" | "megaphone";
}

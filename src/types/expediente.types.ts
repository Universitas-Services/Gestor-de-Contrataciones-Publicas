/**
 * Tipos para el módulo de Elaboración de Expediente de Selección de Contratista
 */

// ─── Enums / Union Types ────────────────────────────────────────────

export type TipoContratacion = "Bienes" | "Servicios" | "Obras";

export type FaseExpediente = "Fase 1" | "Fase 2" | "Fase 3" | "Fase 4";

export type ModalidadContratacion =
  | "Concurso Abierto Acto Único / Apertura Única"
  | "Contratación Directa"
  | "Consulta de Precios"
  | "Concurso Cerrado";

// ─── Interfaces ─────────────────────────────────────────────────────

export interface Expediente {
  id: string;
  nomenclatura: string;
  objetoContrato: string;
  tipo: TipoContratacion;
  modalidad: ModalidadContratacion;
  progreso: number; // 0-100
  fase: FaseExpediente;
}

// ─── Form Types ─────────────────────────────────────────────────────

export interface DatosBasicosForm {
  objetoProcedimiento: string;
  nomenclatura: string;
  tipoContratacion: TipoContratacion | "";
  montoBs: string;
  montoDivisas: string;
}

export interface AnalisisModalidad {
  objetoProceso: string;
  tipoContratacion: TipoContratacion;
  montoUCAU: number;
  montoBs: number;
  montoDolares: number;
  modalidadSugerida: string;
  baseLegal: string;
}

export interface ConfiguracionActoresForm {
  maximaAutoridad: string;
  comisionContrataciones: string;
  unidadUsuaria: string;
  fechaLlamado: Date | null;
}

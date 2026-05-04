/**
 * Tipos para el módulo de Elaboración de Expediente de Selección de Contratista
 */

// ─── Enums / Union Types (alineados con backend) ────────────────────

export type TipoContratacion = "Bienes" | "Servicios" | "Obras";

export type TipoContratacionBackend = "OBRAS" | "BIENES" | "SERVICIOS";

export type FaseExpediente = "Fase 1" | "Fase 2" | "Fase 3" | "Fase 4";

export type ModalidadContratacion =
  | "Concurso Abierto Acto Único / Apertura Única"
  | "Contratación Directa"
  | "Consulta de Precios"
  | "Concurso Cerrado";

// ─── Mapeo display ↔ backend ────────────────────────────────────────

export const TIPO_CONTRATACION_MAP: Record<TipoContratacionBackend, TipoContratacion> = {
  OBRAS: "Obras",
  BIENES: "Bienes",
  SERVICIOS: "Servicios",
};

// ─── Interfaces ─────────────────────────────────────────────────────

export interface Expediente {
  id: string;
  nomenclatura: string;
  objetoContrato: string;
  tipo: TipoContratacion;
  modalidad: string;
  progreso: number; // 0-100
  fase: FaseExpediente;
}

// ─── Form Types ─────────────────────────────────────────────────────

/** Legacy form type – kept for backward compat, prefer Zod inferred types */
export interface DatosBasicosForm {
  objetoProcedimiento: string;
  nomenclatura: string;
  tipoContratacion: TipoContratacion | "";
  montoBs: string;
  montoDivisas: string;
}

export interface AnalisisModalidad {
  objetoProceso: string;
  tipoContratacion: string;
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

// ─── Actor option types (para los selects del Paso 3) ───────────────

export interface ActorOption {
  value: string;
  label: string;
}
// ─── Phase 2 Participant Types ──────────────────────────────────────

export interface Adquirente {
  id: string;
  fecha: string;
  empresa: string;
  domicilioFiscal: string;
  telefono: string;
  correo: string;
  deposito: string;
}

export interface Oferente {
  id: string;
  nombreEmpresa: string;
  rif: string;
  representanteLegal: string;
  cedula: string;
  registroMercantil: string;
  cantidadSobres?: string;
  montoOferta: string;
}

export interface ProveedorBusqueda {
  id: string;
  rif: string;
  nombre: string;
  nombreRepLegal: string;
  cedulaRepLegal: string;
  datosRegistroMercantil: string;
}

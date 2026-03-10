/**
 * Tipos para el módulo de Entes
 */

// --- Respuesta del GET /entes/{id} ---

export interface EnteResponse {
  id: string;
  universitasId: string;
  nombre: string;
  rif: string;
  siglas: string;
  logoUrl: string | null;
  direccionFiscal: string;
  estado: string;
  municipio: string;
  ciudad: string;
  parroquia: string;
  nombreUnidadAdminFinanciera: string;
  nombreUnidadTecnologia: string;
  nombreUnidadContratante: string;
  organoAdscripcion: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
}

// --- Payload para PATCH /entes/{id} ---

export interface EnteUpdatePayload {
  nombre: string;
  rif: string;
  siglas: string;
  direccionFiscal: string;
  estado: string;
  municipio: string;
  ciudad: string;
  parroquia: string;
  nombreUnidadAdminFinanciera: string;
  nombreUnidadTecnologia: string;
  nombreUnidadContratante: string;
  organoAdscripcion: string;
}

// --- Payload para POST /auth/change-password ---

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

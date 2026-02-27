"use server";

import { getServerToken } from "@/lib/auth/session";

/**
 * Servicio para el módulo de Comisión de Contrataciones
 * "use server" → corre en el servidor, lee la cookie HttpOnly con el JWT
 * Los Client Components (formularios) lo llaman via RPC transparente de Next.js
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// --- Tipos ---

export interface MiembroPayload {
  nombreCompletoMiembro: string;
  cedulaMiembro: string;
  tipoMiembro: string;
  areaRepresentacion: string;
}

export interface ComisionContratacionesPayload {
  denominacionComision: string;
  datosDesignacionComision: string;
  comisionCertificada: boolean;
  miembros: MiembroPayload[];
}

export interface ComisionContratacionesResponse {
  message: string;
}

// --- Endpoints ---

/**
 * POST /comision-contrataciones
 * Crea una comisión y opcionalmente registra sus miembros iniciales.
 * Responses:
 *   201 - Comisión creada exitosamente.
 *   403 - No autorizado.
 */
export const registrarComisionContrataciones = async (
  payload: ComisionContratacionesPayload
): Promise<ComisionContratacionesResponse> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/comision-contrataciones`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.message ?? "Error al registrar la Comisión de Contrataciones");
  }

  return response.json() as Promise<ComisionContratacionesResponse>;
};

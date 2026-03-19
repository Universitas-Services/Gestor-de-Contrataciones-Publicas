"use server";

import { getServerToken } from "@/lib/auth/session";

/**
 * Servicio para el módulo de Unidad Contratante
 * "use server" → corre en el servidor, lee la cookie HttpOnly con el JWT
 * Los Client Components (formularios) lo llaman via RPC transparente de Next.js
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// --- Tipos ---

export interface UnidadContratantePayload {
  nombreUnidadContratante: string;
  nombreResponsableUnidad: string;
  cargoResponsable: string;
}

export interface UnidadContratanteResponse {
  message: string;
}

// --- Endpoints ---

/**
 * POST /unidad-contratante
 * Crea una nueva Unidad Contratante para el Ente actual.
 * Responses:
 *   201 - Unidad creada exitosamente.
 *   403 - No autorizado.
 */
export const registrarUnidadContratante = async (
  payload: UnidadContratantePayload
): Promise<UnidadContratanteResponse> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/unidad-contratante`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.message ?? "Error al registrar la Unidad Contratante");
  }

  return response.json() as Promise<UnidadContratanteResponse>;
};

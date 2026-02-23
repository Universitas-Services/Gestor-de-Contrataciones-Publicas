"use server";

import { getServerToken } from "@/lib/auth/session";

/**
 * Servicio para el módulo de Unidad Usuaria
 * "use server" → corre en el servidor, lee la cookie HttpOnly con el JWT
 * Los Client Components (formularios) lo llaman via RPC transparente de Next.js
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// --- Tipos ---

export interface UnidadUsuariaPayload {
  nombreUnidadUsuaria: string;
  nombreResponsableUnidadUsuaria: string;
  cargoResponsableUnidadUsuaria: string;
}

export interface UnidadUsuariaResponse {
  message: string;
}

// --- Endpoints ---

/**
 * POST /unidad-usuaria
 * Crea una nueva Unidad Usuaria para el Ente actual.
 * Responses:
 *   201 - Unidad creada exitosamente.
 *   403 - No autorizado.
 */
export const registrarUnidadUsuaria = async (
  payload: UnidadUsuariaPayload
): Promise<UnidadUsuariaResponse> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/unidad-usuaria`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.message ?? "Error al registrar la Unidad Usuaria");
  }

  return response.json() as Promise<UnidadUsuariaResponse>;
};

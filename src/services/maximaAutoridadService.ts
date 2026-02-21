"use server";

import { getServerToken } from "@/lib/auth/session";

/**
 * Servicio para el módulo de Máxima Autoridad
 * "use server" → corre en el servidor, lee la cookie HttpOnly con el JWT
 * Los Client Components (formularios) lo llaman via RPC transparente de Next.js
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// --- Tipos ---

export interface MaximaAutoridadPayload {
  nombreCompletoAutoridad: string;
  cedulaAutoridad: string;
  cargoOficialAutoridad: string;
  datosDesignacionAutoridad: string;
  leyesAtribucionesSuscribirAutoridad: string;
  esDelegado: boolean;
  vigente: boolean;
  nombreCompletoDelegado?: string;
  cedulaDelegado?: string;
  cargoOficialDelegado?: string;
  datosDesignacionDelegado?: string;
  leyesAtribucionesSuscribirDelegado?: string;
}

export interface MaximaAutoridadResponse {
  message: string;
}

// --- Endpoints ---

/**
 * POST /maxima-autoridad
 * Registra una nueva Máxima Autoridad para el Ente del usuario actual.
 * Responses:
 *   201 - Autoridad creada exitosamente.
 *   403 - No autorizado.
 */
export const registrarMaximaAutoridad = async (
  payload: MaximaAutoridadPayload
): Promise<MaximaAutoridadResponse> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/maxima-autoridad`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.message ?? "Error al registrar la Máxima Autoridad");
  }

  return response.json() as Promise<MaximaAutoridadResponse>;
};

"use server";

import { getServerToken } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

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

  revalidatePath("/gestion-datos/estructura-organizativa");
  return response.json() as Promise<UnidadContratanteResponse>;
};

/**
 * GET /unidad-contratante/{id}
 * Obtiene los detalles de la Unidad Contratante.
 */
export const obtenerUnidadContratante = async (id: string | number): Promise<any> => {
  const token = await getServerToken();
  const response = await fetch(`${API_URL}/unidad-contratante/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Error al obtener la Unidad Contratante");
  }
  return response.json();
};

/**
 * PATCH /unidad-contratante/{id}
 * Actualiza los datos de la Unidad Contratante.
 */
export const actualizarUnidadContratante = async (
  id: string | number,
  payload: Partial<UnidadContratantePayload>
): Promise<UnidadContratanteResponse> => {
  const token = await getServerToken();
  const response = await fetch(`${API_URL}/unidad-contratante/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.message ?? "Error al actualizar la Unidad Contratante");
  }

  revalidatePath("/gestion-datos/estructura-organizativa");
  return response.json() as Promise<UnidadContratanteResponse>;
};

/**
 * DELETE /unidad-contratante/{id}
 * Elimina (borrado lógico) la Unidad Contratante.
 */
export const eliminarUnidadContratante = async (id: string | number): Promise<void> => {
  const token = await getServerToken();
  const response = await fetch(`${API_URL}/unidad-contratante/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.message ?? "Error al eliminar la Unidad Contratante");
  }

  revalidatePath("/gestion-datos/estructura-organizativa");
};

"use server";

import { getServerToken } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

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

  revalidatePath("/gestion-datos/estructura-organizativa");
  return response.json() as Promise<UnidadUsuariaResponse>;
};

/**
 * GET /unidad-usuaria
 * Lista todas las Unidades Usuarias del Ente actual.
 */
export const listarUnidadesUsuarias = async (): Promise<Record<string, unknown>[]> => {
  const token = await getServerToken();
  const response = await fetch(`${API_URL}/unidad-usuaria`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.message ?? "Error al listar las Unidades Usuarias");
  }
  return response.json();
};

/**
 * GET /unidad-usuaria/{id}
 * Obtiene los detalles de la Unidad Usuaria.
 */
export const obtenerUnidadUsuaria = async (
  id: string | number
): Promise<Record<string, unknown>> => {
  const token = await getServerToken();
  const response = await fetch(`${API_URL}/unidad-usuaria/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Error al obtener la Unidad Usuaria");
  }
  return response.json();
};

/**
 * PATCH /unidad-usuaria/{id}
 * Actualiza los datos de la Unidad Usuaria.
 */
export const actualizarUnidadUsuaria = async (
  id: string | number,
  payload: Partial<UnidadUsuariaPayload>
): Promise<UnidadUsuariaResponse> => {
  const token = await getServerToken();
  const response = await fetch(`${API_URL}/unidad-usuaria/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.message ?? "Error al actualizar la Unidad Usuaria");
  }

  revalidatePath("/gestion-datos/estructura-organizativa");
  return response.json() as Promise<UnidadUsuariaResponse>;
};

/**
 * DELETE /unidad-usuaria/{id}
 * Elimina (borrado lógico) la Unidad Usuaria.
 */
export const eliminarUnidadUsuaria = async (id: string | number): Promise<void> => {
  const token = await getServerToken();
  const response = await fetch(`${API_URL}/unidad-usuaria/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.message ?? "Error al eliminar la Unidad Usuaria");
  }

  revalidatePath("/gestion-datos/estructura-organizativa");
};

"use server";

import { getServerToken } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

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

  revalidatePath("/gestion-datos/estructura-organizativa");
  return response.json() as Promise<MaximaAutoridadResponse>;
};

/**
 * GET /maxima-autoridad
 * Lista todas las Máximas Autoridades del Ente actual.
 */
export const listarMaximasAutoridades = async (): Promise<Record<string, unknown>[]> => {
  const token = await getServerToken();
  const response = await fetch(`${API_URL}/maxima-autoridad`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.message ?? "Error al listar las Máximas Autoridades");
  }
  return response.json();
};

/**
 * GET /maxima-autoridad/{id}
 * Obtiene los detalles de la Máxima Autoridad.
 */
export const obtenerMaximaAutoridad = async (
  id: string | number
): Promise<Record<string, unknown>> => {
  const token = await getServerToken();
  const response = await fetch(`${API_URL}/maxima-autoridad/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Error al obtener la Máxima Autoridad");
  }
  return response.json();
};

/**
 * PATCH /maxima-autoridad/{id}
 * Actualiza los datos de la Máxima Autoridad.
 */
export const actualizarMaximaAutoridad = async (
  id: string | number,
  payload: Partial<MaximaAutoridadPayload>
): Promise<MaximaAutoridadResponse> => {
  const token = await getServerToken();
  const response = await fetch(`${API_URL}/maxima-autoridad/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.message ?? "Error al actualizar la Máxima Autoridad");
  }

  revalidatePath("/gestion-datos/estructura-organizativa");
  return response.json() as Promise<MaximaAutoridadResponse>;
};

/**
 * DELETE /maxima-autoridad/{id}
 * Elimina (borrado lógico) la Máxima Autoridad.
 */
export const eliminarMaximaAutoridad = async (id: string | number): Promise<void> => {
  const token = await getServerToken();
  const response = await fetch(`${API_URL}/maxima-autoridad/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.message ?? "Error al eliminar la Máxima Autoridad");
  }

  revalidatePath("/gestion-datos/estructura-organizativa");
};

/**
 * PATCH /maxima-autoridad/{id}/activar
 * Activa la Máxima Autoridad.
 */
export const activarMaximaAutoridad = async (
  id: string | number
): Promise<MaximaAutoridadResponse> => {
  const token = await getServerToken();
  const response = await fetch(`${API_URL}/maxima-autoridad/${id}/activar`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.message ?? "Error al activar la Máxima Autoridad");
  }

  revalidatePath("/gestion-datos/estructura-organizativa");
  return response.json() as Promise<MaximaAutoridadResponse>;
};

/**
 * PATCH /maxima-autoridad/{id}/desactivar
 * Desactiva la Máxima Autoridad.
 */
export const desactivarMaximaAutoridad = async (
  id: string | number
): Promise<MaximaAutoridadResponse> => {
  const token = await getServerToken();
  const response = await fetch(`${API_URL}/maxima-autoridad/${id}/desactivar`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.message ?? "Error al desactivar la Máxima Autoridad");
  }

  revalidatePath("/gestion-datos/estructura-organizativa");
  return response.json() as Promise<MaximaAutoridadResponse>;
};

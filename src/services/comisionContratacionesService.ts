"use server";

import { getServerToken } from "@/lib/auth/session";
import {
  ComisionContratacionesFormValues,
  MiembroFormValues,
} from "@/lib/schemas/comisionContratacionesSchema";
import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// --- Tipos ---
export interface ComisionContratacionesResponse {
  message?: string;
  id?: number | string; // Idealmente el backend retorna el ID de la comisión creada
  comision?: ComisionContratacionesFormValues; // O tal vez el objeto completo
}

export interface MiembroResponse {
  message?: string;
  id?: number | string;
}

export type GetComisionResponse = ComisionContratacionesFormValues;

// --- Endpoints ---

/**
 * POST /comision-contrataciones
 * Crea una nueva Comisión de Contrataciones (Paso 1).
 */
export const registrarComisionContrataciones = async (
  payload: ComisionContratacionesFormValues
): Promise<ComisionContratacionesResponse> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/comision-contrataciones`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      denominacionComision: payload.denominacionComision,
      datosDesignacionComision: payload.datosDesignacionComision,
      comisionCertificada: payload.comisionCertificada,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Error en registrarComisionContrataciones:", errorData);
    throw new Error(errorData?.message ?? "Error al crear la Comisión de Contrataciones");
  }

  revalidatePath("/gestion-datos/estructura-organizativa");
  return response.json() as Promise<ComisionContratacionesResponse>;
};

/**
 * GET /comision-contrataciones/{id}
 * Obtiene los detalles de la comisión y sus miembros para listar en la tabla (Paso 2).
 */
export const obtenerComisionContrataciones = async (
  id: string | number
): Promise<GetComisionResponse> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/comision-contrataciones/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Error al obtener la Comisión de Contrataciones");
  }

  return response.json() as Promise<GetComisionResponse>;
};

/**
 * POST /comision-contrataciones/{id}/miembros
 * Agrega un nuevo miembro a la comisión existente.
 */
export const registrarMiembroComision = async (
  comisionId: string | number,
  payload: MiembroFormValues
): Promise<MiembroResponse> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/comision-contrataciones/${comisionId}/miembros`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.message ?? "Error al agregar el miembro");
  }

  revalidatePath("/gestion-datos/estructura-organizativa");
  return response.json() as Promise<MiembroResponse>;
};

/**
 * DELETE /comision-contrataciones/miembros/{miembroId}
 * Elimina un miembro específico.
 */
export const eliminarMiembroComision = async (miembroId: string | number): Promise<void> => {
  const token = await getServerToken();

  // Ojo: Si el backend requiere el ID de la comisión en la URL, sería /comision-contrataciones/{comisionId}/miembros/{miembroId}.
  // Según el prompt es `DELETE /comision-contrataciones/miembros/{miembroId}`
  const response = await fetch(`${API_URL}/comision-contrataciones/miembros/${miembroId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.message ?? "Error al eliminar el miembro");
  }

  revalidatePath("/gestion-datos/estructura-organizativa");
};

/**
 * PATCH /comision-contrataciones/{id}
 * Actualiza la comisión. Puede usarse para editar un miembro en la tabla final o sincronizar data.
 */
export const actualizarComisionContrataciones = async (
  comisionId: string | number,
  payload: Partial<ComisionContratacionesFormValues>
): Promise<ComisionContratacionesResponse> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/comision-contrataciones/${comisionId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.message ?? "Error al actualizar la Comisión");
  }

  revalidatePath("/gestion-datos/estructura-organizativa");
  return response.json() as Promise<ComisionContratacionesResponse>;
};

/**
 * DELETE /comision-contrataciones/{id}
 * Elimina (borrado lógico) la Comisión de Contrataciones.
 */
export const eliminarComisionContrataciones = async (id: string | number): Promise<void> => {
  const token = await getServerToken();
  const response = await fetch(`${API_URL}/comision-contrataciones/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.message ?? "Error al eliminar la Comisión");
  }

  revalidatePath("/gestion-datos/estructura-organizativa");
};

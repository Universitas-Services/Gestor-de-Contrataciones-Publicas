"use server";

import { getServerToken } from "@/lib/auth/session";
import type { EnteResponse, EnteUpdatePayload } from "@/types/ente.types";

/**
 * Servicio para el módulo de Entes
 * "use server" → corre en el servidor, lee la cookie HttpOnly con el JWT
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * GET /entes/{id}
 * Obtiene detalles de un Ente específico.
 */
export const obtenerEnte = async (id: string): Promise<EnteResponse> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/entes/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    if (response.status === 404) {
      throw new Error("Ente no encontrado");
    }

    throw new Error(errorData?.message ?? "Error al obtener datos del Ente");
  }

  return response.json() as Promise<EnteResponse>;
};

/**
 * PATCH /entes/{id}
 * Actualiza los datos de un Ente. ADMIN_ENTE solo puede actualizar su propio Ente.
 */
export const actualizarEnte = async (
  id: string,
  payload: EnteUpdatePayload
): Promise<{ message: string }> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/entes/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    if (response.status === 403) {
      throw new Error("No autorizado para actualizar este Ente");
    }

    throw new Error(errorData?.message ?? "Error al actualizar el Ente");
  }

  return { message: "Ente actualizado" };
};

/**
 * PUT /entes/{id}/logo
 * Sube y actualiza el logo de un Ente. Soporta PNG, JPG, WEBP (Max 2MB).
 * El archivo se envía como FormData con la clave "file".
 */
export const actualizarLogoEnte = async (
  id: string,
  formData: FormData
): Promise<{ message: string }> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/entes/${id}/logo`, {
    method: "PUT",
    headers: {
      // NO setear Content-Type manualmente; fetch genera el boundary correcto para multipart/form-data
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.message ?? "Error al actualizar el logo del Ente");
  }

  const text = await response.text();
  return { message: text || "Logo actualizado correctamente" };
};

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
  nombreResponsableUnidadContratante: string;
  cargoResponsable: string;
  cedulaResponsableUnidadContratante: string;
  datosDesignacionUnidadContratante: string;
}

export interface UnidadContratanteResponse {
  message: string;
}

export interface UnidadContratanteRecord extends UnidadContratantePayload {
  id: string;
  enteId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  version: number;
}

// --- Endpoints ---

/**
 * GET — lista Unidades Contratantes del Ente.
 * Usa directorio-actores (fuente consolidada) porque el CRUD de
 * /unidad-contratante no expone un listado estable de opciones.
 */
export const listarUnidadesContratantes = async (): Promise<UnidadContratanteRecord[]> => {
  const token = await getServerToken();
  const response = await fetch(`${API_URL}/directorio-actores?page=1&limit=200`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.message ?? "Error al listar las Unidades Contratantes");
  }

  const json = await response.json();
  const rows = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];

  return rows
    .filter(
      (a: { tipo?: string; estatus?: boolean }) =>
        a.tipo === "UNIDAD_CONTRATANTE" && a.estatus !== false
    )
    .map((a: { id: string | number; nombre?: string }) => ({
      id: String(a.id),
      enteId: "",
      nombreUnidadContratante: a.nombre ?? `Unidad contratante ${a.id}`,
      nombreResponsableUnidad: "",
      nombreResponsableUnidadContratante: "",
      cargoResponsable: "",
      cedulaResponsableUnidadContratante: "",
      datosDesignacionUnidadContratante: "",
      createdAt: "",
      updatedAt: "",
      version: 0,
    }));
};

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

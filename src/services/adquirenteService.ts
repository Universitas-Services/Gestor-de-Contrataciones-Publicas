"use server";

import { getServerToken } from "@/lib/auth/session";
import { revalidateExpedienteList } from "@/lib/utils/expedienteRevalidate";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface RegistrarAdquirentePayload {
  expedienteId: string;
  proveedorId?: string | null;
  fechaAdquisicion: string;
  nombreProveedorAdquiriente: string;
  direccionFiscalProveedorAdquirente: string;
  telefonoProveedorAdquirente: string;
  correoProveedorAdquirente: string;
  datosPagoPliego: string;
}

/**
 * POST /adquiriente-pliego
 * Registra un nuevo adquirente para un expediente.
 */
export const registrarAdquirente = async (payload: RegistrarAdquirentePayload): Promise<any> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/adquiriente-pliego`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      ((errorData as Record<string, unknown>)?.message as string) ??
        "Error al registrar el adquirente"
    );
  }

  revalidateExpedienteList();
  return response.json();
};

/**
 * GET /adquiriente-pliego/expediente/{expedienteId}
 * Lista los adquirentes de un expediente.
 */
export const listarAdquirentes = async (expedienteId: string): Promise<any[]> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/adquiriente-pliego/expediente/${expedienteId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      ((errorData as Record<string, unknown>)?.message as string) ??
        "Error al listar los adquirentes"
    );
  }

  return response.json();
};

/**
 * GET /adquiriente-pliego/{id}
 * Obtiene los detalles de un adquirente
 */
export const obtenerAdquirente = async (id: string): Promise<any> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/adquiriente-pliego/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Error al obtener detalles del adquirente");
  }

  return response.json();
};

/**
 * PATCH /adquiriente-pliego/{id}
 * Actualiza un adquirente existente.
 */
export const editarAdquirente = async (
  id: string,
  payload: Partial<RegistrarAdquirentePayload>
): Promise<any> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/adquiriente-pliego/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      ((errorData as Record<string, unknown>)?.message as string) ?? "Error al editar el adquirente"
    );
  }

  revalidateExpedienteList();
  return response.json();
};

/**
 * DELETE /adquiriente-pliego/{id}
 * Elimina un adquirente.
 */
export const eliminarAdquirente = async (id: string): Promise<void> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/adquiriente-pliego/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      ((errorData as Record<string, unknown>)?.message as string) ??
        "Error al eliminar el adquirente"
    );
  }

  revalidateExpedienteList();
};

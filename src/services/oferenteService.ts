"use server";

import { getServerToken } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface RegistrarOferentePayload {
  expedienteId: string;
  proveedorId?: string | null;
  rifProveedorOferente: string;
  nombreProveedorOferente: string;
  nombreRepLegalOferente: string;
  cedulaRepLegalOferente: string;
  datosRegistroMercantilProveedorOferente: string;
  numeroSobresEntregados: number;
  montoOfertaBs: number;
}

/**
 * POST /ofertas-presentadas
 * Registra una nueva oferta presentada por un oferente para un expediente.
 */
export const registrarOferente = async (payload: RegistrarOferentePayload): Promise<any> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/ofertas-presentadas`, {
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
        "Error al registrar la oferta del oferente"
    );
  }

  revalidatePath("/elaboracion-expediente");
  return response.json();
};

/**
 * GET /ofertas-presentadas/expediente/{expedienteId}
 * Obtiene la lista de ofertas presentadas para un expediente específico.
 */
export const listarOferentes = async (expedienteId: string): Promise<any[]> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/ofertas-presentadas/expediente/${expedienteId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      ((errorData as Record<string, unknown>)?.message as string) ??
        "Error al obtener la lista de oferentes"
    );
  }

  return response.json();
};

/**
 * GET /ofertas-presentadas/{id}
 * Obtiene los detalles de un oferente
 */
export const obtenerOferente = async (id: string): Promise<any> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/ofertas-presentadas/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Error al obtener detalles del oferente");
  }

  return response.json();
};

/**
 * PATCH /ofertas-presentadas/{id}
 * Actualiza un oferente existente.
 */
export const editarOferente = async (
  id: string,
  payload: Partial<RegistrarOferentePayload>
): Promise<any> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/ofertas-presentadas/${id}`, {
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
      ((errorData as Record<string, unknown>)?.message as string) ?? "Error al editar el oferente"
    );
  }

  revalidatePath("/elaboracion-expediente");
  return response.json();
};

/**
 * DELETE /ofertas-presentadas/{id}
 * Elimina un oferente.
 */
export const eliminarOferente = async (id: string): Promise<void> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/ofertas-presentadas/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      ((errorData as Record<string, unknown>)?.message as string) ?? "Error al eliminar el oferente"
    );
  }

  revalidatePath("/elaboracion-expediente");
};

/**
 * POST /evaluacion-fase3/iniciar
 * Inicia la evaluación para un oferente (fase 3).
 */
export const iniciarEvaluacionFase3 = async (payload: { ofertaId: string }): Promise<any> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/evaluacion-fase3/iniciar`, {
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
        "Error al iniciar la evaluación"
    );
  }

  return response.json();
};

/**
 * GET /evaluacion-fase3/expediente/{expedienteId}
 * Obtiene la lista de evaluaciones para un expediente específico.
 */
export const listarEvaluacionesFase3 = async (expedienteId: string): Promise<any[]> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/evaluacion-fase3/expediente/${expedienteId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      ((errorData as Record<string, unknown>)?.message as string) ??
        "Error al obtener la lista de evaluaciones"
    );
  }

  return response.json();
};

/**
 * PATCH /evaluacion-fase3/{evaluacionId}/sobre1
 * Guarda la evaluación del Sobre N°1 (recaudos legales y financieros).
 */
export const evaluarSobre1Fase3 = async (evaluacionId: string, payload: any): Promise<any> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/evaluacion-fase3/${evaluacionId}/sobre1`, {
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
      ((errorData as Record<string, unknown>)?.message as string) ??
        "Error al guardar la evaluación del Sobre N°1"
    );
  }

  return response.json();
};

/**
 * PATCH /evaluacion-fase3/{evaluacionId}/sobre2
 * Guarda la evaluación del Sobre N°2 (oferta técnica y económica) y matriz.
 */
export const evaluarSobre2Fase3 = async (evaluacionId: string, payload: any): Promise<any> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/evaluacion-fase3/${evaluacionId}/sobre2`, {
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
      ((errorData as Record<string, unknown>)?.message as string) ??
        "Error al guardar la evaluación del Sobre N°2"
    );
  }

  return response.json();
};

/**
 * GET /evaluacion-fase3/{evaluacionId}
 * Obtiene el detalle completo de una evaluación específica.
 */
export const obtenerEvaluacionFase3 = async (evaluacionId: string): Promise<any> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/evaluacion-fase3/${evaluacionId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      ((errorData as Record<string, unknown>)?.message as string) ??
        "Error al obtener detalle de la evaluación"
    );
  }

  return response.json();
};

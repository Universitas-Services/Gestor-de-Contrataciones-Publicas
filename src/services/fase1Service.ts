"use server";

import { getServerToken } from "@/lib/auth/session";
import {
  revalidateExpedienteDetail,
  revalidateExpedienteList,
} from "@/lib/utils/expedienteRevalidate";
import { normalizePresupuestoItemsResponse } from "@/lib/utils/fase1Presupuesto";
import type {
  ActualizarPresupuestoItemPayload,
  ActualizarPresupuestoItemResponse,
  CrearOActualizarFase1Payload,
  CrearPresupuestoItemPayload,
  CrearPresupuestoItemResponse,
  FasePreparatoriaDetalleResponse,
  Fase1Response,
  ListarPresupuestoItemsParams,
  ListarPresupuestoItemsResponse,
} from "@/types/fase1.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function handleServerResponse<T>(response: Response, errorMsg: string): Promise<T> {
  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(((json as Record<string, unknown>)?.message as string) ?? errorMsg);
  }

  const payload = json as {
    data?: unknown;
    presupuestoItem?: unknown;
    fasePreparatoria?: unknown;
  };

  if (payload.data) return payload.data as T;
  if (payload.presupuestoItem) return payload.presupuestoItem as T;
  if (payload.fasePreparatoria) return payload.fasePreparatoria as T;

  return json as T;
}

export const crearPresupuestoItem = async (
  expedienteId: string,
  payload: CrearPresupuestoItemPayload
): Promise<CrearPresupuestoItemResponse> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/expedientes/${expedienteId}/presupuesto-items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const result = await handleServerResponse<CrearPresupuestoItemResponse>(
    response,
    "Error al guardar el ítem de presupuesto"
  );

  revalidateExpedienteDetail(expedienteId);
  return result;
};

export const actualizarPresupuestoItem = async (
  itemId: string,
  expedienteId: string,
  payload: ActualizarPresupuestoItemPayload
): Promise<ActualizarPresupuestoItemResponse> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/expedientes/presupuesto-items/${itemId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const result = await handleServerResponse<ActualizarPresupuestoItemResponse>(
    response,
    "Error al actualizar el item de presupuesto"
  );

  revalidateExpedienteDetail(expedienteId);
  return result;
};

export const eliminarPresupuestoItem = async (
  itemId: string,
  expedienteId: string
): Promise<void> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/expedientes/presupuesto-items/${itemId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      ((errorData as Record<string, unknown>)?.message as string) ??
        "Error al eliminar el item de presupuesto"
    );
  }

  revalidateExpedienteDetail(expedienteId);
};

export const listarPresupuestoItems = async (
  expedienteId: string,
  params?: ListarPresupuestoItemsParams
): Promise<ListarPresupuestoItemsResponse> => {
  const token = await getServerToken();

  const searchParams = new URLSearchParams();
  if (params?.page !== undefined) searchParams.set("page", String(params.page));
  if (params?.limit !== undefined) searchParams.set("limit", String(params.limit));
  if (params?.search) searchParams.set("search", params.search);

  const queryString = searchParams.toString();
  const url = `${API_URL}/expedientes/${expedienteId}/presupuesto-items${
    queryString ? `?${queryString}` : ""
  }`;

  const response = await fetch(url, {
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
        "Error al listar los items de presupuesto"
    );
  }

  const json = (await response.json()) as {
    data?: {
      items?: unknown;
      meta?: unknown;
      totales?: unknown;
    };
    items?: unknown;
    meta?: unknown;
    totales?: unknown;
  };

  const payload = (json.data ?? json) as {
    items?: unknown;
    meta?: unknown;
    totales?: unknown;
  };

  return normalizePresupuestoItemsResponse({
    items: Array.isArray(payload.items) ? payload.items : [],
    meta: typeof payload.meta === "object" && payload.meta ? payload.meta : undefined,
    totales: typeof payload.totales === "object" && payload.totales ? payload.totales : undefined,
  });
};

export const obtenerFasePreparatoria = async (
  expedienteId: string
): Promise<FasePreparatoriaDetalleResponse | null> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/fase-preparatoria/${expedienteId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      ((json as Record<string, unknown> | null)?.message as string) ??
        "Error al obtener la fase preparatoria"
    );
  }

  if (!json) {
    return null;
  }

  return json as FasePreparatoriaDetalleResponse;
};

export const guardarFasePreparatoria = async (
  expedienteId: string,
  payload: CrearOActualizarFase1Payload
): Promise<Fase1Response> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/fase-preparatoria/${expedienteId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const result = await handleServerResponse<Fase1Response>(
    response,
    "Error al guardar la fase preparatoria"
  );

  revalidateExpedienteDetail(expedienteId);
  revalidateExpedienteList();
  return result;
};

export const actualizarFasePreparatoria = async (
  expedienteId: string,
  payload: CrearOActualizarFase1Payload
): Promise<Fase1Response> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/fase-preparatoria/${expedienteId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const result = await handleServerResponse<Fase1Response>(
    response,
    "Error al actualizar la fase preparatoria"
  );

  revalidateExpedienteDetail(expedienteId);
  revalidateExpedienteList();
  return result;
};

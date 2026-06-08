"use server";

import { getServerToken } from "@/lib/auth/session";
import type {
  ActualizarDiaNoLaborablePayload,
  CrearDiaNoLaborablePayload,
  CrearDiaNoLaborableResponse,
  CrearDiasBulkPayload,
  CrearDiasBulkResponse,
  CronogramaAlerta,
  DiaNoLaborable,
  DiasNoLaborablesRangoResponse,
  EliminarDiaNoLaborableResponse,
  ListarDiasNoLaborablesResponse,
} from "@/types/cronogramaEnte.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const CRONOGRAMA_ENTE_MAX_PAGE_LIMIT = 100;

async function handleResponse<T>(response: Response, errorMsg: string): Promise<T> {
  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error("No tiene permisos para realizar esta acción.");
    }
    throw new Error(((json as Record<string, unknown>)?.message as string) ?? errorMsg);
  }

  return json as T;
}

export const listarDiasNoLaborables = async (params: {
  page?: number;
  limit?: number;
  anio?: number;
}): Promise<ListarDiasNoLaborablesResponse> => {
  const token = await getServerToken();
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.anio) queryParams.append("anio", params.anio.toString());

  const response = await fetch(`${API_URL}/cronograma-ente?${queryParams.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  return handleResponse(response, "Error al obtener los días no laborables");
};

/** Obtiene todos los registros de un año paginando con el límite máximo del backend. */
export const listarTodosDiasNoLaborablesDelAnio = async (
  anio: number
): Promise<DiaNoLaborable[]> => {
  const all: DiaNoLaborable[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const response = await listarDiasNoLaborables({
      page,
      limit: CRONOGRAMA_ENTE_MAX_PAGE_LIMIT,
      anio,
    });
    all.push(...response.data);
    totalPages = response.meta.totalPages;
    page += 1;
  }

  return all;
};

export const obtenerDiaNoLaborable = async (id: string): Promise<DiaNoLaborable> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/cronograma-ente/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  return handleResponse(response, "Error al obtener el día no laborable");
};

export const crearDiaNoLaborable = async (
  payload: CrearDiaNoLaborablePayload
): Promise<CrearDiaNoLaborableResponse> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/cronograma-ente`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response, "Error al registrar el día no laborable");
};

export const crearDiasNoLaborablesBulk = async (
  payload: CrearDiasBulkPayload
): Promise<CrearDiasBulkResponse> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/cronograma-ente/bulk`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response, "Error al registrar los días no laborables");
};

export const actualizarDiaNoLaborable = async (
  id: string,
  payload: ActualizarDiaNoLaborablePayload
): Promise<DiaNoLaborable> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/cronograma-ente/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response, "Error al actualizar el día no laborable");
};

export const eliminarDiaNoLaborable = async (
  id: string
): Promise<EliminarDiaNoLaborableResponse> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/cronograma-ente/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response, "Error al eliminar el día no laborable");
};

export const consultarDiasNoLaborablesRango = async (params: {
  desde: string;
  hasta: string;
}): Promise<DiasNoLaborablesRangoResponse> => {
  const token = await getServerToken();
  const queryParams = new URLSearchParams({
    desde: params.desde,
    hasta: params.hasta,
  });

  const response = await fetch(
    `${API_URL}/cronograma-ente/dias-no-laborables?${queryParams.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  return handleResponse(response, "Error al consultar días no laborables");
};

export const obtenerAlertasCronograma = async (): Promise<CronogramaAlerta[]> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/cronograma-ente/alertas`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  return handleResponse(response, "Error al obtener alertas del cronograma");
};

export const resolverAlertaCronograma = async (id: string): Promise<CronogramaAlerta> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/cronograma-ente/alertas/${id}/resolver`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response, "Error al resolver la alerta");
};

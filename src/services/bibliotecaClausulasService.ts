"use server";

import { getServerToken } from "@/lib/auth/session";
import type {
  BibliotecaListQuery,
  BibliotecaListResponse,
  ClausulaEnte,
  ClausulaGenerica,
  CreateClausulaEntePayload,
  UpdateClausulaEntePayload,
} from "@/types/bibliotecaLegal.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function parseError(response: Response, fallback: string): Promise<never> {
  const errorData = await response.json().catch(() => ({}));
  const message = (errorData as { message?: string | string[] })?.message ?? fallback;
  throw new Error(Array.isArray(message) ? message.join(", ") : String(message));
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    query.append(key, String(value));
  }
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

/** GET /biblioteca/clausulas-genericas */
export async function listarClausulasGenericas(
  params: BibliotecaListQuery = {}
): Promise<BibliotecaListResponse<ClausulaGenerica>> {
  const token = await getServerToken();
  const qs = buildQuery({
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    search: params.search,
  });

  const response = await fetch(`${API_URL}/biblioteca/clausulas-genericas${qs}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    await parseError(response, "Error al listar las cláusulas genéricas");
  }

  return response.json() as Promise<BibliotecaListResponse<ClausulaGenerica>>;
}

/** GET /entes/{enteId}/clausulas */
export async function listarClausulasEnte(
  enteId: string,
  params: BibliotecaListQuery = {}
): Promise<BibliotecaListResponse<ClausulaEnte>> {
  const token = await getServerToken();
  const qs = buildQuery({
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    search: params.search,
  });

  const response = await fetch(`${API_URL}/entes/${enteId}/clausulas${qs}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    await parseError(response, "Error al listar las cláusulas del ente");
  }

  const json: unknown = await response.json();
  return normalizeListResponse<ClausulaEnte>(json);
}

function normalizeListResponse<T>(json: unknown): BibliotecaListResponse<T> {
  if (Array.isArray(json)) {
    return {
      data: json as T[],
      meta: { total: json.length, page: 1, lastPage: 1 },
    };
  }
  if (json && typeof json === "object" && "data" in json) {
    const obj = json as BibliotecaListResponse<T>;
    const data = Array.isArray(obj.data) ? obj.data : [];
    const meta = obj.meta ?? { total: data.length, page: 1, lastPage: 1 };
    return { data, meta };
  }
  return { data: [], meta: { total: 0, page: 1, lastPage: 1 } };
}

/** GET /entes/{enteId}/clausulas/{id} */
export async function obtenerClausulaEnte(enteId: string, id: string): Promise<ClausulaEnte> {
  const token = await getServerToken();
  const response = await fetch(`${API_URL}/entes/${enteId}/clausulas/${id}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    await parseError(response, "Error al consultar la cláusula del ente");
  }

  return response.json() as Promise<ClausulaEnte>;
}

/** POST /entes/{enteId}/clausulas */
export async function crearClausulaEnte(
  enteId: string,
  payload: CreateClausulaEntePayload
): Promise<ClausulaEnte> {
  const token = await getServerToken();
  const response = await fetch(`${API_URL}/entes/${enteId}/clausulas`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await parseError(response, "Error al crear la cláusula del ente");
  }

  return response.json() as Promise<ClausulaEnte>;
}

/** PATCH /entes/{enteId}/clausulas/{id} */
export async function actualizarClausulaEnte(
  enteId: string,
  id: string,
  payload: UpdateClausulaEntePayload
): Promise<ClausulaEnte> {
  const token = await getServerToken();
  const response = await fetch(`${API_URL}/entes/${enteId}/clausulas/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await parseError(response, "Error al actualizar la cláusula del ente");
  }

  return response.json() as Promise<ClausulaEnte>;
}

/** DELETE /entes/{enteId}/clausulas/{id} */
export async function eliminarClausulaEnte(enteId: string, id: string): Promise<void> {
  const token = await getServerToken();
  const response = await fetch(`${API_URL}/entes/${enteId}/clausulas/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    await parseError(response, "Error al eliminar la cláusula del ente");
  }
}

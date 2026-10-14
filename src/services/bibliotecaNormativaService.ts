"use server";

import { getServerToken } from "@/lib/auth/session";
import type {
  BibliotecaListResponse,
  CreateNormativaEntePayload,
  NormativaEnte,
  NormativaGlobal,
  NormativaGlobalQuery,
  UpdateNormativaEntePayload,
  BibliotecaListQuery,
} from "@/types/bibliotecaLegal.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function parseError(response: Response, fallback: string): Promise<never> {
  const errorData = await response.json().catch(() => ({}));
  const message = (errorData as { message?: string | string[] })?.message ?? fallback;
  throw new Error(Array.isArray(message) ? message.join(", ") : String(message));
}

function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    query.append(key, String(value));
  }
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

/** GET /biblioteca/normativa-global */
export async function listarNormativaGlobal(
  params: NormativaGlobalQuery = {}
): Promise<BibliotecaListResponse<NormativaGlobal>> {
  const token = await getServerToken();
  const qs = buildQuery({
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    search: params.search,
    indActivo: params.indActivo,
  });

  const response = await fetch(`${API_URL}/biblioteca/normativa-global${qs}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    await parseError(response, "Error al listar la normativa global");
  }

  return response.json() as Promise<BibliotecaListResponse<NormativaGlobal>>;
}

/** GET /entes/{enteId}/normativa */
export async function listarNormativaEnte(
  enteId: string,
  params: BibliotecaListQuery = {}
): Promise<BibliotecaListResponse<NormativaEnte>> {
  const token = await getServerToken();
  const qs = buildQuery({
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    search: params.search,
  });

  const response = await fetch(`${API_URL}/entes/${enteId}/normativa${qs}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    await parseError(response, "Error al listar la normativa del ente");
  }

  const json: unknown = await response.json();
  return normalizeListResponse<NormativaEnte>(json);
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

/** GET /entes/{enteId}/normativa/{id} */
export async function obtenerNormativaEnte(enteId: string, id: string): Promise<NormativaEnte> {
  const token = await getServerToken();
  const response = await fetch(`${API_URL}/entes/${enteId}/normativa/${id}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    await parseError(response, "Error al consultar la normativa del ente");
  }

  return response.json() as Promise<NormativaEnte>;
}

/** POST /entes/{enteId}/normativa */
export async function crearNormativaEnte(
  enteId: string,
  payload: CreateNormativaEntePayload
): Promise<NormativaEnte> {
  const token = await getServerToken();
  const response = await fetch(`${API_URL}/entes/${enteId}/normativa`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await parseError(response, "Error al crear la normativa del ente");
  }

  return response.json() as Promise<NormativaEnte>;
}

/** PATCH /entes/{enteId}/normativa/{id} */
export async function actualizarNormativaEnte(
  enteId: string,
  id: string,
  payload: UpdateNormativaEntePayload
): Promise<NormativaEnte> {
  const token = await getServerToken();
  const response = await fetch(`${API_URL}/entes/${enteId}/normativa/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await parseError(response, "Error al actualizar la normativa del ente");
  }

  return response.json() as Promise<NormativaEnte>;
}

/** DELETE /entes/{enteId}/normativa/{id} */
export async function eliminarNormativaEnte(enteId: string, id: string): Promise<void> {
  const token = await getServerToken();
  const response = await fetch(`${API_URL}/entes/${enteId}/normativa/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    await parseError(response, "Error al eliminar la normativa del ente");
  }
}

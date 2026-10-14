"use server";

import { getServerToken } from "@/lib/auth/session";
import type {
  BibliotecaTokensResponse,
  PreviewTokensPayload,
  PreviewTokensResponse,
  TokensEjemploResponse,
  ValidarTokensPayload,
  ValidarTokensResponse,
  PreviewTokensModo,
} from "@/types/bibliotecaLegal.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function parseError(response: Response, fallback: string): Promise<never> {
  const errorData = await response.json().catch(() => ({}));
  const message = (errorData as { message?: string | string[] })?.message ?? fallback;
  throw new Error(Array.isArray(message) ? message.join(", ") : String(message));
}

/** GET /biblioteca/tokens */
export async function listarBibliotecaTokens(): Promise<BibliotecaTokensResponse> {
  const token = await getServerToken();
  const response = await fetch(`${API_URL}/biblioteca/tokens`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    await parseError(response, "Error al obtener el catálogo de tokens");
  }

  return response.json() as Promise<BibliotecaTokensResponse>;
}

/** GET /biblioteca/tokens/ejemplo */
export async function obtenerTokensEjemplo(
  modo: PreviewTokensModo = "ETIQUETA"
): Promise<TokensEjemploResponse> {
  const token = await getServerToken();
  const response = await fetch(
    `${API_URL}/biblioteca/tokens/ejemplo?modo=${encodeURIComponent(modo)}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    await parseError(response, "Error al obtener el ejemplo de tokens");
  }

  return response.json() as Promise<TokensEjemploResponse>;
}

/** POST /biblioteca/tokens/validar */
export async function validarBibliotecaTokens(
  payload: ValidarTokensPayload
): Promise<ValidarTokensResponse> {
  const token = await getServerToken();
  const response = await fetch(`${API_URL}/biblioteca/tokens/validar`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await parseError(response, "Error al validar los tokens de la cláusula");
  }

  return response.json() as Promise<ValidarTokensResponse>;
}

/** POST /biblioteca/tokens/preview */
export async function previewBibliotecaTokens(
  payload: PreviewTokensPayload
): Promise<PreviewTokensResponse> {
  const token = await getServerToken();
  const response = await fetch(`${API_URL}/biblioteca/tokens/preview`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await parseError(response, "Error al previsualizar los tokens");
  }

  return response.json() as Promise<PreviewTokensResponse>;
}

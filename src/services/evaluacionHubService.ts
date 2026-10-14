"use server";

import { getServerToken } from "@/lib/auth/session";
import { EvaluacionHubError } from "@/lib/utils/evaluacionHubError";
import { parseApiErrorPayload } from "@/lib/utils/fase1ApiError";
import type {
  HubEvaluacionResponse,
  HubModuloPatchId,
  HubPatchAction,
} from "@/types/evaluacionOferente.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function throwHubError(response: Response, fallback: string): Promise<never> {
  const json = await response.json().catch(() => ({}));
  const parsed = parseApiErrorPayload(json, fallback);
  throw new EvaluacionHubError(parsed.message, response.status, parsed.errores);
}

function unwrapHub(json: unknown): HubEvaluacionResponse {
  if (!json || typeof json !== "object") {
    throw new EvaluacionHubError("Respuesta inválida del hub de evaluación", 500);
  }
  const maybeWrapped = json as { data?: HubEvaluacionResponse } & HubEvaluacionResponse;
  const hub = maybeWrapped.data ?? maybeWrapped;
  if (!hub.evaluacionId || !hub.plantillaLegal) {
    throw new EvaluacionHubError("Respuesta incompleta del hub de evaluación", 500);
  }
  return hub;
}

/**
 * GET /evaluacion-fase3/{evaluacionId}/hub
 */
export async function obtenerHubEvaluacion(evaluacionId: string): Promise<HubEvaluacionResponse> {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/evaluacion-fase3/${evaluacionId}/hub`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    await throwHubError(response, "No se pudo cargar el hub de evaluación");
  }

  return unwrapHub(await response.json());
}

/**
 * PATCH /evaluacion-fase3/{evaluacionId}/hub/{modulo}
 */
export async function patchHubModulo(
  evaluacionId: string,
  modulo: HubModuloPatchId,
  body: { action: HubPatchAction; form: Record<string, unknown> }
): Promise<HubEvaluacionResponse> {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/evaluacion-fase3/${evaluacionId}/hub/${modulo}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    await throwHubError(response, `No se pudo guardar el módulo ${modulo} de la evaluación`);
  }

  return unwrapHub(await response.json());
}

"use server";

import { revalidatePath } from "next/cache";

import { getServerToken } from "@/lib/auth/session";
import type {
  CrearOActualizarFase1Payload,
  CrearPresupuestoItemPayload,
  CrearPresupuestoItemResponse,
  Fase1Response,
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

  revalidatePath(`/elaboracion-expediente/${expedienteId}`);
  return result;
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

  revalidatePath(`/elaboracion-expediente/${expedienteId}`);
  revalidatePath("/elaboracion-expediente");
  return result;
};

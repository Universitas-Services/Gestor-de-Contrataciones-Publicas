"use server";

import { getServerToken } from "@/lib/auth/session";
import type { DirectorioResponse } from "@/types/directorio.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * GET /directorio-actores
 * Obtiene el listado unificado de Unidades Contratantes, Unidades Usuarias,
 * Máxima Autoridad y Comisiones de Contrataciones del Ente, con paginación.
 */
export const getDirectorioActores = async (params: {
  page?: number;
  limit?: number;
}): Promise<DirectorioResponse> => {
  const token = await getServerToken();
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());

  const response = await fetch(`${API_URL}/directorio-actores?${queryParams.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.message ?? "Error al obtener el directorio de actores");
  }

  return response.json() as Promise<DirectorioResponse>;
};

"use server";

import { getServerToken } from "@/lib/auth/session";

/**
 * Servicio para el módulo de Manuales
 * "use server" → corre en el servidor, lee la cookie HttpOnly con el JWT
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Respuesta del endpoint POST /manuales/generar
 */
export interface ManualResponse {
  id: string;
  url: string;
  fileName: string;
  version: number;
  generatedAt: string;
  tipoManual: string;
  titulo: string;
}

/**
 * POST /manuales/generar
 * Genera un manual DOCX para el Ente del usuario autenticado.
 * No requiere body — el backend detecta el Ente a través del token.
 */
export const generarManual = async (): Promise<ManualResponse> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/manuales/generar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    if (response.status === 403) {
      throw new Error("No autorizado para generar el manual");
    }

    throw new Error(errorData?.message ?? "Error al generar el manual");
  }

  return response.json() as Promise<ManualResponse>;
};

/**
 * GET /manuales/{id}/download
 * Descarga directamente el archivo DOCX del manual.
 * Retorna los bytes del archivo como Uint8Array (las Server Actions no pueden retornar Blob/ArrayBuffer).
 */
export const descargarManual = async (
  id: string
): Promise<{ data: Uint8Array; fileName: string }> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/manuales/${id}/download`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Manual no encontrado");
    }

    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.message ?? "Error al descargar el manual");
  }

  // Extraer nombre del archivo del header Content-Disposition si existe
  const contentDisposition = response.headers.get("Content-Disposition");
  let fileName = "manual.docx";

  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?([^";\n]+)"?/);
    if (match?.[1]) {
      fileName = match[1];
    }
  }

  // Convertir el cuerpo de la respuesta a Uint8Array para poder pasarlo al cliente
  const arrayBuffer = await response.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);

  return { data, fileName };
};

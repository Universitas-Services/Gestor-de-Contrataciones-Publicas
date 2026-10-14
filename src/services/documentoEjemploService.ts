"use server";

import { getServerToken } from "@/lib/auth/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface DocumentoEjemplo {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  orden: number;
  activo: boolean;
  url: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * GET /documentos-ejemplo/{codigo}
 * Obtiene un documento de ejemplo (modelo) por código o UUID.
 */
export async function obtenerDocumentoEjemploPorCodigo(codigo: string): Promise<DocumentoEjemplo> {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/documentos-ejemplo/${encodeURIComponent(codigo)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(
        "Aún no hay un modelo cargado para este recaudo. UNIVERSITAS debe subirlo en Documentos de Ejemplo."
      );
    }
    const data = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(data?.message || "Error al obtener el documento de ejemplo");
  }

  return response.json() as Promise<DocumentoEjemplo>;
}

"use server";

import { getServerToken } from "@/lib/auth/session";

/**
 * Servicio para el Generador de Documentos de Expediente.
 * "use server" → corre en el servidor, lee la cookie HttpOnly con el JWT.
 *
 * Patrón idéntico a manualService.ts:
 *  - preview  → retorna JSON con { urlArchivo }
 *  - download → retorna stream binario como Uint8Array
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ─── Tipos ───────────────────────────────────────────────────────────

export interface DocumentoInfo {
  id: string;
  urlArchivo: string;
  previewUrl: string;
  version: number;
  fechaGeneracion: string;
}

export interface DocumentoStatus {
  tipo: string;
  label: string;
  generado: boolean;
  documento: DocumentoInfo | null;
}

export interface GenerarDocumentoResponse {
  id: string;
  url: string;
  fileName: string;
  tipoDocumento: string;
  generatedAt: string;
}

export interface PreviewResponse {
  previewUrl: string;
  tituloDocumento: string;
  urlArchivo: string;
  tipoDocumento: string;
}

// ─── Endpoints ───────────────────────────────────────────────────────

/**
 * GET /generador-documentos/status-expediente/{expedienteId}
 * Obtiene el estado de todos los documentos de un expediente.
 */
export const obtenerStatusDocumentos = async (expedienteId: string): Promise<DocumentoStatus[]> => {
  const token = await getServerToken();

  const response = await fetch(
    `${API_URL}/generador-documentos/status-expediente/${expedienteId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      (errorData as Record<string, string>)?.message ??
        "Error al obtener el estado de los documentos"
    );
  }

  const json = (await response.json()) as { data: DocumentoStatus[] };
  return json.data;
};

/**
 * POST /generador-documentos/generar/{docEndpoint}/{expedienteId}
 * Genera (o regenera) un documento.
 */
export const generarDocumento = async (
  docEndpoint: string,
  expedienteId: string
): Promise<GenerarDocumentoResponse> => {
  const token = await getServerToken();

  const response = await fetch(
    `${API_URL}/generador-documentos/generar/${docEndpoint}/${expedienteId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      (errorData as Record<string, string>)?.message ??
        `Error al generar el documento: ${docEndpoint}`
    );
  }

  return response.json() as Promise<GenerarDocumentoResponse>;
};

/**
 * GET /generador-documentos/preview/{docEndpoint}/{expedienteId}
 * Retorna JSON con { previewUrl, urlArchivo, tituloManual }.
 * Mismo contrato que GET /manuales/preview.
 */
export const previewDocumento = async (
  docEndpoint: string,
  expedienteId: string
): Promise<PreviewResponse> => {
  const token = await getServerToken();

  const response = await fetch(
    `${API_URL}/generador-documentos/preview/${docEndpoint}/${expedienteId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Documento no encontrado. Debe generarlo primero.");
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      (errorData as Record<string, string>)?.message ??
        `Error al previsualizar el documento: ${docEndpoint}`
    );
  }

  return response.json() as Promise<PreviewResponse>;
};

/**
 * GET /generador-documentos/download/{docEndpoint}/{expedienteId}
 * Descarga el documento DOCX.
 * Mismo contrato que GET /manuales/download → retorna Uint8Array.
 */
export const descargarDocumento = async (
  docEndpoint: string,
  expedienteId: string
): Promise<{ data: Uint8Array; fileName: string }> => {
  const token = await getServerToken();

  const response = await fetch(
    `${API_URL}/generador-documentos/download/${docEndpoint}/${expedienteId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Documento no encontrado. Debe generarlo primero.");
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      (errorData as Record<string, string>)?.message ??
        `Error al descargar el documento: ${docEndpoint}`
    );
  }

  // Extraer nombre del archivo del header Content-Disposition si existe
  const contentDisposition = response.headers.get("Content-Disposition");
  let fileName = `${docEndpoint}.docx`;

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

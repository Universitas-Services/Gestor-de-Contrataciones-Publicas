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
  estaDesactualizado: boolean;
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
 * POST /generador-documentos/generar/lista-cotejo/{expedienteId}/{evaluacionId}
 * Genera el documento Lista de Cotejo para una evaluación específica.
 */
export const generarListaCotejo = async (
  expedienteId: string,
  evaluacionId: string
): Promise<GenerarDocumentoResponse> => {
  const token = await getServerToken();

  const response = await fetch(
    `${API_URL}/generador-documentos/generar/lista-cotejo/${expedienteId}/${evaluacionId}`,
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
      (errorData as Record<string, string>)?.message ?? "Error al generar la lista de cotejo"
    );
  }

  return response.json() as Promise<GenerarDocumentoResponse>;
};

/**
 * POST /generador-documentos/regenerar/{documentoId}
 * Regenera un documento ya existente usando su ID.
 * Solo debe llamarse cuando estaDesactualizado === true.
 */
export const regenerarDocumento = async (
  documentoId: string
): Promise<GenerarDocumentoResponse> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/generador-documentos/regenerar/${documentoId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      (errorData as Record<string, string>)?.message ?? "Error al regenerar el documento"
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

/**
 * GET /generador-documentos/preview/lista-cotejo/evaluacion/{evaluacionId}
 * Preview de Lista de Cotejo por evaluación.
 */
export const previewListaCotejoEvaluacion = async (
  evaluacionId: string
): Promise<PreviewResponse> => {
  const token = await getServerToken();

  const response = await fetch(
    `${API_URL}/generador-documentos/preview/lista-cotejo/evaluacion/${evaluacionId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Lista de cotejo no encontrada. Debe generarla primero.");
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      (errorData as Record<string, string>)?.message ?? "Error al previsualizar la lista de cotejo"
    );
  }

  return response.json() as Promise<PreviewResponse>;
};

/**
 * GET /generador-documentos/download/lista-cotejo/evaluacion/{evaluacionId}
 * Descarga la Lista de Cotejo por evaluación.
 */
export const descargarListaCotejoEvaluacion = async (
  evaluacionId: string
): Promise<{ data: Uint8Array; fileName: string }> => {
  const token = await getServerToken();

  const response = await fetch(
    `${API_URL}/generador-documentos/download/lista-cotejo/evaluacion/${evaluacionId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Lista de cotejo no encontrada. Debe generarla primero.");
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      (errorData as Record<string, string>)?.message ?? "Error al descargar la lista de cotejo"
    );
  }

  const contentDisposition = response.headers.get("Content-Disposition");
  let fileName = "lista-cotejo.docx";

  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?([^";\n]+)"?/);
    if (match?.[1]) {
      fileName = match[1];
    }
  }

  const arrayBuffer = await response.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);

  return { data, fileName };
};

/**
 * POST /generador-documentos/generar/notificaciones-fase4/{expedienteId}
 * Genera las notificaciones masivas de Fase 4 (adjudicado y no adjudicados).
 */
export interface NotificacionFase4Item {
  id: string;
  url: string;
  fileName: string;
  tipoDocumento: string;
  generatedAt: string;
}

export const generarNotificacionesFase4 = async (
  expedienteId: string
): Promise<NotificacionFase4Item[]> => {
  const token = await getServerToken();

  const response = await fetch(
    `${API_URL}/generador-documentos/generar/notificaciones-fase4/${expedienteId}`,
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
        "Error al generar las notificaciones masivas"
    );
  }

  const json = (await response.json()) as { data: NotificacionFase4Item[] };
  return json.data;
};

/**
 * GET /generador-documentos/preview/notificacion/evaluacion/{evaluacionId}
 * Preview de la notificación (adjudicado o no adjudicado) por evaluación.
 */
export const previewNotificacionEvaluacion = async (
  evaluacionId: string
): Promise<PreviewResponse> => {
  const token = await getServerToken();

  const response = await fetch(
    `${API_URL}/generador-documentos/preview/notificacion/evaluacion/${evaluacionId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Notificación no encontrada. Genere primero el acta de adjudicación.");
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      (errorData as Record<string, string>)?.message ?? "Error al previsualizar la notificación"
    );
  }

  return response.json() as Promise<PreviewResponse>;
};

/**
 * GET /generador-documentos/download/notificacion/evaluacion/{evaluacionId}
 * Descarga la notificación (adjudicado o no adjudicado) por evaluación.
 */
export const descargarNotificacionEvaluacion = async (
  evaluacionId: string
): Promise<{ data: Uint8Array; fileName: string }> => {
  const token = await getServerToken();

  const response = await fetch(
    `${API_URL}/generador-documentos/download/notificacion/evaluacion/${evaluacionId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Notificación no encontrada. Genere primero el acta de adjudicación.");
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      (errorData as Record<string, string>)?.message ?? "Error al descargar la notificación"
    );
  }

  const contentDisposition = response.headers.get("Content-Disposition");
  let fileName = "notificacion.docx";

  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?([^";\n]+)"?/);
    if (match?.[1]) {
      fileName = match[1];
    }
  }

  const arrayBuffer = await response.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);

  return { data, fileName };
};

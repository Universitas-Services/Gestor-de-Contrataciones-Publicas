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
 * Respuesta del endpoint GET /manuales/preview
 */
export interface PreviewResponse {
  previewUrl: string;
  tituloManual: string;
  urlArchivo: string;
}

/**
 * GET /manuales/preview
 * Retorna la URL de previsualización del manual (Google Docs Viewer).
 * No requiere parámetros — el backend detecta el Ente a través del token.
 */
export const previewManual = async (): Promise<PreviewResponse> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/manuales/preview`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Este ente no tiene un manual generado");
    }

    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.message ?? "Error al obtener la previsualización");
  }

  return response.json() as Promise<PreviewResponse>;
};

/**
 * GET /manuales/download
 * Descarga el manual DOCX del ente del usuario autenticado.
 * Retorna los bytes del archivo como Uint8Array (las Server Actions no pueden retornar Blob/ArrayBuffer).
 */
export const descargarManual = async (): Promise<{ data: Uint8Array; fileName: string }> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/manuales/download`, {
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

/**
 * Respuesta del endpoint GET /manuales/estado-requisitos
 */
export interface EstadoRequisitosResponse {
  puedeGenerarManual: boolean;
  requisitosFaltantes: string[];
}

/**
 * GET /manuales/estado-requisitos
 * Verifica si el ente del usuario autenticado cumple con todos los requisitos
 * (Máxima Autoridad, Comisión, etc.) para poder generar su manual.
 */
export const consultarEstadoRequisitos = async (): Promise<EstadoRequisitosResponse> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/manuales/estado-requisitos`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.message ?? "Error al consultar el estado de requisitos");
  }

  return response.json() as Promise<EstadoRequisitosResponse>;
};

/**
 * Verifica si el ente del usuario autenticado ya tiene un manual generado.
 * Reutiliza el endpoint de preview: 200 → existe, 404 → no existe.
 */
export const verificarExistenciaManual = async (): Promise<boolean> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/manuales/preview`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 404) {
    return false;
  }

  if (!response.ok) {
    throw new Error("Error al verificar la existencia del manual");
  }

  return true;
};

// ═══════════════════════════════════════════════════════════════════════
// Historial de Manuales
// ═══════════════════════════════════════════════════════════════════════

/**
 * Snapshot de datos del ente al momento de generar el manual
 */
export interface SnapshotDatos {
  nombre: string;
  siglas: string;
  logoUrl: string | null;
  fechaGeneracion: string;
  denominacionComision: string;
  cargoOficialAutoridad: string;
  nombreUnidadTecnologia: string;
  nombreUnidadContratante: string;
  nombreUnidadAdminFinanciera: string;
}

/**
 * Cada item del historial de manuales
 */
export interface HistorialManualItem {
  id: string;
  tipoManual: string;
  tituloManual: string;
  descripcion: string;
  versionDocumento: number;
  urlArchivo: string;
  createdAt: string;
  createdBy: string;
  esVersionVigente: boolean;
  estaDesactualizado: boolean;
  motivoDesactualizacion: string | null;
  snapshotDatos: SnapshotDatos | null;
}

/**
 * Respuesta paginada del historial
 */
export interface HistorialManualesResponse {
  metadata: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  data: HistorialManualItem[];
}

/**
 * GET /manuales/historial?page=&limit=
 * Devuelve el historial completo de todos los manuales generados paginado.
 */
export const obtenerHistorialManuales = async (
  page: number = 1,
  limit: number = 4
): Promise<HistorialManualesResponse> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/manuales/historial?page=${page}&limit=${limit}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.message ?? "Error al obtener el historial de manuales");
  }

  return response.json() as Promise<HistorialManualesResponse>;
};

/**
 * GET /manuales/{manualId}/preview
 * Previsualizar un manual específico del historial.
 */
export const previewManualPorId = async (manualId: string): Promise<PreviewResponse> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/manuales/${manualId}/preview`, {
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
    throw new Error(errorData?.message ?? "Error al obtener la previsualización");
  }

  return response.json() as Promise<PreviewResponse>;
};

/**
 * GET /manuales/{manualId}/download
 * Descargar un manual específico del historial.
 */
export const descargarManualPorId = async (
  manualId: string
): Promise<{ data: Uint8Array; fileName: string }> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/manuales/${manualId}/download`, {
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

  const contentDisposition = response.headers.get("Content-Disposition");
  let fileName = "manual.docx";

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
 * Estado de desactualización del manual vigente
 */
export interface EstadoManualVigente {
  estaDesactualizado: boolean;
  motivoDesactualizacion: string | null;
}

/**
 * Consulta el estado de desactualización del manual vigente.
 * Usa GET /manuales/historial?page=1&limit=1 y extrae del primer item.
 * Retorna null si no hay manuales generados.
 */
export const consultarEstadoManualVigente = async (): Promise<EstadoManualVigente | null> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/manuales/historial?page=1&limit=1`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error("Error al consultar el estado del manual vigente");
  }

  const result = (await response.json()) as HistorialManualesResponse;

  if (!result.data || result.data.length === 0) {
    return null;
  }

  const vigente = result.data[0];
  return {
    estaDesactualizado: vigente.estaDesactualizado,
    motivoDesactualizacion: vigente.motivoDesactualizacion,
  };
};

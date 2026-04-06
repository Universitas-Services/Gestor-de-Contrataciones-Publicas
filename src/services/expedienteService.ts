"use server";

import { getServerToken } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import type {
  DatosBasicosFormValues,
  CronogramaFormValues,
  TipoContratacionBackend,
  ModalidadSeleccion,
} from "@/lib/schemas/expedienteSchema";

/**
 * Servicio para el módulo de Expedientes (Elaboración de Expediente)
 * "use server" → corre en el servidor, lee la cookie HttpOnly con el JWT
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ─── Tipos de Payload / Response ─────────────────────────────────────

export interface BorradorPayload {
  descripcionObjeto: string;
  codigoNomenclatura: string;
  tipoContratacion: TipoContratacionBackend;
  montoEstimadoBs: number;
  montoEstimadoDolar: number;
  valorUcauBase: number;
  modalidadSeleccion: ModalidadSeleccion;
}

/**
 * Payload para PATCH /expedientes/{id}
 * Todos los campos son opcionales (patch parcial o completo)
 */
export interface EditarExpedientePayload {
  descripcionObjeto?: string;
  codigoNomenclatura?: string;
  tipoContratacion?: TipoContratacionBackend;
  montoEstimadoBs?: number;
  montoEstimadoDolar?: number;
  valorUcauBase?: number;
  modalidadSeleccion?: ModalidadSeleccion;
  autoridadId?: string;
  comisionId?: string;
  unidadUsuariaId?: string;
  autoridadFirmaComoDelegado?: boolean;
  fechaLlamadoParticipar?: string;
}

// ─── Sub-types del GET /expedientes/{id} ──────────────────────────

export interface CronogramaData {
  id: string;
  expedienteId: string;
  fechaLlamadoParticipar: string;
  fechaInicioDisponibilidadPliego: string;
  fechaFinDisponibilidadPliego: string;
  fechaSolicitudAclaratorias: string;
  fechaRespuestaAclaratorias: string;
  fechaModificacionPliego: string;
  fechaActoRecepcionAperturaSobres: string;
  fechaLimiteEvaluacion: string;
  fechaLimiteAdjudicacion: string;
  fechaLimiteNotificacion: string;
  fechaLimiteGarantias: string;
  fechaLimiteFirmaContrato: string;
}

export interface MiembroComision {
  id: string;
  nombreCompletoMiembro: string;
  cedulaMiembro: string;
  tipoMiembro: string;
  areaRepresentacion: string;
}

export interface ComisionData {
  id: string;
  denominacionComision: string;
  datosDesignacionComision: string;
  comisionCertificada: boolean;
  activa: boolean;
  miembros: MiembroComision[];
}

export interface UnidadUsuariaData {
  id: string;
  nombreUnidadUsuaria: string;
  nombreResponsableUnidadUsuaria: string;
  cargoResponsableUnidadUsuaria: string;
  activa: boolean;
}

export interface AutoridadData {
  id: string;
  nombreCompletoAutoridad: string;
  cedulaAutoridad: string;
  cargoOficialAutoridad: string;
  esDelegado: boolean;
  vigente: boolean;
  nombreCompletoDelegado?: string;
  cargoOficialDelegado?: string;
}

export interface ModalidadData {
  id: string;
  tipoContratacion: string;
  montoEstimadoBs: string;
  montoEstimadoDolar: string;
  valorUcauBase: string;
  modalidadSeleccion: string;
}

export interface ExpedienteResponse {
  id: string;
  descripcionObjeto: string;
  codigoNomenclatura: string;
  estatusProceso: string;
  autoridadFirmaComoDelegado: boolean;
  createdAt: string;
  updatedAt: string;
  modalidad?: ModalidadData;
  comision?: ComisionData;
  unidadUsuaria?: UnidadUsuariaData;
  autoridad?: AutoridadData;
  cronograma?: CronogramaData;
  [key: string]: unknown;
}

export interface ExpedienteListItem {
  id: string;
  codigoNomenclatura: string;
  descripcionObjeto: string;
  estatusProceso: string;
  modalidad?: {
    tipoContratacion: string;
    modalidadSeleccion: string;
    [key: string]: unknown;
  };
  progreso?: number;
  fase?: string;
  [key: string]: unknown;
}

export interface ExpedienteListResponse {
  data: ExpedienteListItem[];
  message: string;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─── Helper interno ───────────────────────────────────────────────────

async function handleResponse<T>(response: Response, errorMsg: string): Promise<T> {
  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(((json as Record<string, unknown>)?.message as string) ?? errorMsg);
  }

  // DEBUG: ver la estructura real del backend
  console.log("[expedienteService] raw response:", JSON.stringify(json).slice(0, 500));

  // Extraer el objeto de datos buscando el id en distintos niveles posibles
  const data = json as {
    id?: unknown;
    data?: { id?: unknown; expediente?: { id?: unknown } };
    expediente?: { id?: unknown };
  };
  const nested = data?.id
    ? data // { id, ... }
    : data?.data?.id
      ? data.data // { data: { id, ... } }
      : data?.data?.expediente?.id
        ? data.data.expediente // { data: { expediente: { id, ... } } }
        : data?.expediente?.id
          ? data.expediente // { expediente: { id, ... } }
          : data?.data
            ? data.data // { data: {...} } fallback
            : data; // objeto directo

  return nested as T;
}

// ─── Endpoints ───────────────────────────────────────────────────────

/**
 * POST /expedientes/borrador
 * Paso 2 "Confirmar": Crear Expediente en estado Borrador.
 */
export const crearExpedienteBorrador = async (
  formData: DatosBasicosFormValues,
  valorUcauBase: number
): Promise<ExpedienteResponse> => {
  const token = await getServerToken();

  const payload: BorradorPayload = {
    descripcionObjeto: formData.descripcionObjeto,
    codigoNomenclatura: formData.codigoNomenclatura,
    tipoContratacion: formData.tipoContratacion,
    montoEstimadoBs: formData.montoEstimadoBs,
    montoEstimadoDolar: formData.montoEstimadoDolar,
    valorUcauBase,
    modalidadSeleccion: "LICITACION_PUBLICA",
  };

  const response = await fetch(`${API_URL}/expedientes/borrador`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<ExpedienteResponse>(response, "Error al crear el expediente borrador");
};

/**
 * PATCH /expedientes/{id}
 * Edición General: se usa en cada transición del wizard después de crear el borrador.
 * - Paso 3 "Anterior": payload con datos del paso 1 (sin actores)
 * - Paso 3 "Crear Cronograma": payload completo (paso 1 + actores + fecha)
 */
export const editarExpediente = async (
  id: string,
  payload: EditarExpedientePayload
): Promise<ExpedienteResponse> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/expedientes/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<ExpedienteResponse>(response, "Error al actualizar el expediente");
};

/**
 * PUT /expedientes/{id}/cronograma
 * Paso 4 "Validar y Guardar Cronograma": persiste las fechas definitivas.
 */
export const guardarCronograma = async (
  id: string,
  payload: CronogramaFormValues
): Promise<ExpedienteResponse> => {
  const token = await getServerToken();

  // Validate and strip extra properties like id, createdAt, etc. that the backend rejects.
  const {
    fechaLlamadoParticipar,
    fechaInicioDisponibilidadPliego,
    fechaFinDisponibilidadPliego,
    fechaSolicitudAclaratorias,
    fechaRespuestaAclaratorias,
    fechaModificacionPliego,
    fechaActoRecepcionAperturaSobres,
    fechaLimiteEvaluacion,
    fechaLimiteAdjudicacion,
    fechaLimiteNotificacion,
    fechaLimiteGarantias,
    fechaLimiteFirmaContrato,
  } = payload as any;

  const validPayload = {
    fechaLlamadoParticipar,
    fechaInicioDisponibilidadPliego,
    fechaFinDisponibilidadPliego,
    fechaSolicitudAclaratorias,
    fechaRespuestaAclaratorias,
    fechaModificacionPliego,
    fechaActoRecepcionAperturaSobres,
    fechaLimiteEvaluacion,
    fechaLimiteAdjudicacion,
    fechaLimiteNotificacion,
    fechaLimiteGarantias,
    fechaLimiteFirmaContrato,
  };

  const response = await fetch(`${API_URL}/expedientes/${id}/cronograma`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(validPayload),
  });

  const result = await handleResponse<ExpedienteResponse>(
    response,
    "Error al guardar el cronograma"
  );
  revalidatePath("/elaboracion-expediente");
  return result;
};

/**
 * GET /expedientes
 * Panel: Obtener listado de expedientes con paginación y filtros.
 */
export const obtenerExpedientes = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  tipoContratacion?: string;
  estado?: string;
}): Promise<ExpedienteListResponse> => {
  const token = await getServerToken();

  const searchParams = new URLSearchParams();
  if (params?.page !== undefined) searchParams.set("page", String(params.page));
  if (params?.limit !== undefined) searchParams.set("limit", String(params.limit));
  if (params?.search) searchParams.set("search", params.search);
  if (params?.tipoContratacion) searchParams.set("tipoContratacion", params.tipoContratacion);
  if (params?.estado) searchParams.set("estado", params.estado);

  const queryString = searchParams.toString();
  const url = `${API_URL}/expedientes${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      ((errorData as Record<string, unknown>)?.message as string) ??
        "Error al obtener los expedientes"
    );
  }

  return response.json() as Promise<ExpedienteListResponse>;
};

/**
 * GET /expedientes/{id}
 * Detalle de un expediente.
 */
export const obtenerExpediente = async (id: string): Promise<ExpedienteResponse> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/expedientes/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  return handleResponse<ExpedienteResponse>(response, "Error al obtener el expediente");
};

/**
 * DELETE /expedientes/{id}
 * Panel: Eliminar expediente.
 */
export const eliminarExpediente = async (id: string): Promise<void> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/expedientes/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      ((errorData as Record<string, unknown>)?.message as string) ??
        "Error al eliminar el expediente"
    );
  }

  revalidatePath("/elaboracion-expediente");
};

"use server";

import { getServerToken } from "@/lib/auth/session";
import { parseAdjudicacionApiResponse } from "@/lib/utils/adjudicacionMapper";
import { parseContratoFormalizadoApiResponse } from "@/lib/utils/contratoMapper";
import type {
  DatosBasicosFormValues,
  CronogramaFormValues,
  TipoContratacionBackend,
  ModalidadSeleccion,
} from "@/lib/schemas/expedienteSchema";
import {
  revalidateExpedienteDetail,
  revalidateExpedienteList,
} from "@/lib/utils/expedienteRevalidate";

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

export interface UnidadContratanteData {
  id: string;
  nombreUnidadContratante?: string;
  nombreResponsableUnidadContratante?: string;
  cargoResponsableUnidadContratante?: string;
  activa?: boolean;
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
  unidadContratante?: UnidadContratanteData;
  unidadContratanteId?: string;
  autoridad?: AutoridadData;
  cronograma?: CronogramaData;
  /** Contratación Directa */
  numeralCausalProcedenciaCd?: string;
  causalProcedenciaCd?: string;
  /** Concurso Cerrado / Consulta Precios / ME (si el GET los expone) */
  causalProcedenciaCc?: string;
  causalProcedenciaCp?: string;
  causalProcedenciaMe?: string;
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
  valorUcauBase?: number,
  montoDolar?: number
): Promise<ExpedienteResponse> => {
  const token = await getServerToken();

  const payload: BorradorPayload = {
    descripcionObjeto: formData.descripcionObjeto,
    codigoNomenclatura: formData.codigoNomenclatura,
    tipoContratacion: formData.tipoContratacion,
    montoEstimadoBs: formData.montoEstimadoBs,
    montoEstimadoDolar: montoDolar ?? 0,
    valorUcauBase: valorUcauBase ?? 0,
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

/** Campos comunes de borrador multimodal (sin modalidadSeleccion forzada). */
export interface BorradorMultimodalBase {
  descripcionObjeto: string;
  codigoNomenclatura: string;
  tipoContratacion: TipoContratacionBackend;
  montoEstimadoBs: number;
  montoEstimadoDolar: number;
  valorUcauBase: number;
}

export type BorradorConcursoCerradoPayload = BorradorMultimodalBase;

export interface BorradorConsultaPreciosPayload extends BorradorMultimodalBase {
  unidadContratanteId: string;
}

export interface BorradorContratacionDirectaPayload extends BorradorMultimodalBase {
  numeralCausalProcedenciaCd: string;
  causalProcedenciaCd: string;
  unidadContratanteId: string;
}

export type BorradorModalidadExcluidaPayload = BorradorMultimodalBase;

async function postBorradorModalidad(
  path: string,
  payload: Record<string, unknown>,
  errorMsg: string
): Promise<ExpedienteResponse> {
  const token = await getServerToken();
  const response = await fetch(`${API_URL}/expedientes/borrador/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return handleResponse<ExpedienteResponse>(response, errorMsg);
}

/** POST /expedientes/borrador/concurso-cerrado */
export const crearBorradorConcursoCerrado = async (
  payload: BorradorConcursoCerradoPayload
): Promise<ExpedienteResponse> =>
  postBorradorModalidad(
    "concurso-cerrado",
    payload as unknown as Record<string, unknown>,
    "Error al crear el borrador de Concurso Cerrado"
  );

/** POST /expedientes/borrador/consulta-precios */
export const crearBorradorConsultaPrecios = async (
  payload: BorradorConsultaPreciosPayload
): Promise<ExpedienteResponse> =>
  postBorradorModalidad(
    "consulta-precios",
    payload as unknown as Record<string, unknown>,
    "Error al crear el borrador de Consulta de Precios"
  );

/** POST /expedientes/borrador/contratacion-directa */
export const crearBorradorContratacionDirecta = async (
  payload: BorradorContratacionDirectaPayload
): Promise<ExpedienteResponse> =>
  postBorradorModalidad(
    "contratacion-directa",
    payload as unknown as Record<string, unknown>,
    "Error al crear el borrador de Contratación Directa"
  );

/** POST /expedientes/borrador/modalidad-excluida */
export const crearBorradorModalidadExcluida = async (
  payload: BorradorModalidadExcluidaPayload
): Promise<ExpedienteResponse> =>
  postBorradorModalidad(
    "modalidad-excluida",
    payload as unknown as Record<string, unknown>,
    "Error al crear el borrador de Modalidad Excluida"
  );

// ─── Generar cronograma (solo propone fechas; no persiste) ────────────

export type CronogramaGeneradoApi = Record<string, string>;

async function postGenerarCronograma(
  path: string | null,
  payload: Record<string, unknown>,
  errorMsg: string
): Promise<CronogramaGeneradoApi> {
  const token = await getServerToken();
  const url = path
    ? `${API_URL}/expedientes/generar-cronograma/${path}`
    : `${API_URL}/expedientes/generar-cronograma`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(((json as Record<string, unknown>)?.message as string) ?? errorMsg);
  }

  const root = json as { data?: CronogramaGeneradoApi } & CronogramaGeneradoApi;
  if (root.data && typeof root.data === "object") {
    return root.data;
  }
  return root;
}

/** POST /expedientes/generar-cronograma/concurso-cerrado */
export const generarCronogramaConcursoCerrado = async (payload: {
  tipoContratacion: TipoContratacionBackend;
  fechaEnvioInvitacion: string;
}): Promise<CronogramaGeneradoApi> =>
  postGenerarCronograma(
    "concurso-cerrado",
    payload,
    "Error al generar cronograma de Concurso Cerrado"
  );

/** POST /expedientes/generar-cronograma/consulta-precios */
export const generarCronogramaConsultaPrecios = async (payload: {
  tipoContratacion: TipoContratacionBackend;
  fechaEnvioInvitacion: string;
}): Promise<CronogramaGeneradoApi> =>
  postGenerarCronograma(
    "consulta-precios",
    payload,
    "Error al generar cronograma de Consulta de Precios"
  );

/** POST /expedientes/generar-cronograma/contratacion-directa */
export const generarCronogramaContratacionDirecta = async (payload: {
  fechaEnvioInvitacion: string;
}): Promise<CronogramaGeneradoApi> =>
  postGenerarCronograma(
    "contratacion-directa",
    payload,
    "Error al generar cronograma de Contratación Directa"
  );

/** POST /expedientes/generar-cronograma/modalidad-excluida */
export const generarCronogramaModalidadExcluida = async (payload: {
  fechaInicioProcedimiento: string;
}): Promise<CronogramaGeneradoApi> =>
  postGenerarCronograma(
    "modalidad-excluida",
    payload,
    "Error al generar cronograma de Modalidad Excluida"
  );

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

  /**
   * Normaliza cualquier string de fecha a "YYYY-MM-DD".
   * Acepta "2024-05-15", "2024-05-15T00:00:00.000Z", "2024-05-15T04:00:00.000Z", etc.
   * Si el valor es undefined/null/vacío lanza un error descriptivo.
   */
  const toDateOnly = (value: unknown, fieldName: string): string => {
    if (!value || typeof value !== "string") {
      throw new Error(`Fecha inválida o ausente en el campo "${fieldName}": ${value}`);
    }
    const dateOnly = value.split("T")[0]; // "YYYY-MM-DD"
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
      throw new Error(`Formato de fecha incorrecto en "${fieldName}": ${value}`);
    }
    return dateOnly;
  };

  // Strip extra fields (id, expedienteId, createdAt…) y normalizar fechas a YYYY-MM-DD
  const raw = payload as unknown as Record<string, unknown>;

  const validPayload = {
    fechaLlamadoParticipar: toDateOnly(raw.fechaLlamadoParticipar, "fechaLlamadoParticipar"),
    fechaInicioDisponibilidadPliego: toDateOnly(
      raw.fechaInicioDisponibilidadPliego,
      "fechaInicioDisponibilidadPliego"
    ),
    fechaFinDisponibilidadPliego: toDateOnly(
      raw.fechaFinDisponibilidadPliego,
      "fechaFinDisponibilidadPliego"
    ),
    fechaSolicitudAclaratorias: toDateOnly(
      raw.fechaSolicitudAclaratorias,
      "fechaSolicitudAclaratorias"
    ),
    fechaRespuestaAclaratorias: toDateOnly(
      raw.fechaRespuestaAclaratorias,
      "fechaRespuestaAclaratorias"
    ),
    fechaModificacionPliego: toDateOnly(raw.fechaModificacionPliego, "fechaModificacionPliego"),
    fechaActoRecepcionAperturaSobres: toDateOnly(
      raw.fechaActoRecepcionAperturaSobres,
      "fechaActoRecepcionAperturaSobres"
    ),
    fechaLimiteEvaluacion: toDateOnly(raw.fechaLimiteEvaluacion, "fechaLimiteEvaluacion"),
    fechaLimiteAdjudicacion: toDateOnly(raw.fechaLimiteAdjudicacion, "fechaLimiteAdjudicacion"),
    fechaLimiteNotificacion: toDateOnly(raw.fechaLimiteNotificacion, "fechaLimiteNotificacion"),
    fechaLimiteGarantias: toDateOnly(raw.fechaLimiteGarantias, "fechaLimiteGarantias"),
    fechaLimiteFirmaContrato: toDateOnly(raw.fechaLimiteFirmaContrato, "fechaLimiteFirmaContrato"),
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
  revalidateExpedienteList();
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
  if (params?.tipoContratacion) searchParams.set("tipo", params.tipoContratacion);
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

  revalidateExpedienteList();
};

// ─── Adjudicación (Fase 4) ───────────────────────────────────────────

export interface AdjudicacionPayload {
  montoAdjudicadoBs: number;
  partidaPresupuestariaGasto: string;
  montoCrsBs: number;
  referenciaRecomendacion: string;
}

export interface AdjudicacionResponse extends AdjudicacionPayload {
  id?: string;
  expedienteId?: string;
}

/**
 * GET /expedientes/{expedienteId}/adjudicacion
 */
export const obtenerAdjudicacion = async (
  expedienteId: string
): Promise<AdjudicacionResponse | null> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/expedientes/${expedienteId}/adjudicacion`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      ((errorData as Record<string, unknown>)?.message as string) ??
        "Error al obtener la adjudicación"
    );
  }

  const json = await response.json();
  return parseAdjudicacionApiResponse(json);
};

/**
 * POST /expedientes/{expedienteId}/adjudicacion
 */
export const crearAdjudicacion = async (
  expedienteId: string,
  payload: AdjudicacionPayload
): Promise<AdjudicacionResponse> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/expedientes/${expedienteId}/adjudicacion`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      ((errorData as Record<string, unknown>)?.message as string) ??
        "Error al guardar la adjudicación"
    );
  }

  const json = await response.json();
  const parsed = parseAdjudicacionApiResponse(json);
  if (!parsed) {
    return payload;
  }

  revalidateExpedienteDetail(expedienteId);
  return parsed;
};

/**
 * PATCH /expedientes/{expedienteId}/adjudicacion
 * Edita los datos de una adjudicación existente.
 */
export const editarAdjudicacion = async (
  expedienteId: string,
  payload: AdjudicacionPayload
): Promise<AdjudicacionResponse> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/expedientes/${expedienteId}/adjudicacion`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      ((errorData as Record<string, unknown>)?.message as string) ??
        "Error al actualizar la adjudicación"
    );
  }

  const json = await response.json();
  const parsed = parseAdjudicacionApiResponse(json);
  if (!parsed) return payload;

  revalidateExpedienteDetail(expedienteId);
  return parsed;
};

// ─── Contrato formalizado (Fase 4) ───────────────────────────────────

export interface ContratoFormalizadoPayload {
  fechaInicioVigencia: string;
  fechaFinVigencia: string;
  montoContratoBs: number;
  plazoEjecucionDias: number;
  plazoGarantiaCalidadFuncionamiento: string;
  nombreSupervisor: string;
  cedulaSupervisor: string;
  cargoSupervisor: string;
  criterioAceptacionContrato: string;
  plazoConsignacionFacturas: number;
  montoFielCumplimientoBs: number;
  requiereGarantiaLaboral: boolean;
  porcentajeGarantiaLaboral: number;
  montoGarantiaLaboralBs: number;
  polizaResponsabilidadCivil: boolean;
  porcentajeResponsabilidadCivil: number;
  montoResponsabilidadCivilBs: number;
  anticipoContrato: boolean;
  formaCumplimientoCrs: string;
  unidadRespCumplimientoCrs: string;
  porcentajeMultaDiaria: number;
  baseCalculoMultaDiaria: number;
  plazoRegularizarIncumplimiento: string;
  porcentajeProcedimientoRescision: number;
  formulaAjustePrecios: string;
  evaluacionDesempeno: string;
  garantiaPostEjecucion: string;
  lugarTribunal: string;
}

export interface ContratoFormalizadoResponse extends ContratoFormalizadoPayload {
  id?: string;
  expedienteId?: string;
}

/**
 * GET /expedientes/{expedienteId}/contrato-formalizado
 */
export const obtenerContratoFormalizado = async (
  expedienteId: string
): Promise<ContratoFormalizadoResponse | null> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/expedientes/${expedienteId}/contrato-formalizado`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      ((errorData as Record<string, unknown>)?.message as string) ??
        "Error al obtener el contrato formalizado"
    );
  }

  const json = await response.json();
  return parseContratoFormalizadoApiResponse(json);
};

/**
 * POST /expedientes/{expedienteId}/contrato-formalizado
 */
export const guardarContratoFormalizado = async (
  expedienteId: string,
  payload: ContratoFormalizadoPayload
): Promise<ContratoFormalizadoResponse> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/expedientes/${expedienteId}/contrato-formalizado`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      ((errorData as Record<string, unknown>)?.message as string) ??
        "Error al guardar el contrato formalizado"
    );
  }

  const json = await response.json();
  const parsed = parseContratoFormalizadoApiResponse(json);
  if (!parsed) {
    return { ...payload, expedienteId };
  }

  revalidateExpedienteDetail(expedienteId);
  revalidateExpedienteDetail(expedienteId, "contrato");
  return parsed;
};

/**
 * PATCH /expedientes/{expedienteId}/contrato-formalizado
 * Edita los datos de un contrato formalizado existente.
 */
export const editarContratoFormalizado = async (
  expedienteId: string,
  payload: ContratoFormalizadoPayload
): Promise<ContratoFormalizadoResponse> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/expedientes/${expedienteId}/contrato-formalizado`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      ((errorData as Record<string, unknown>)?.message as string) ??
        "Error al actualizar el contrato formalizado"
    );
  }

  const json = await response.json();
  const parsed = parseContratoFormalizadoApiResponse(json);
  if (!parsed) return { ...payload, expedienteId };

  revalidateExpedienteDetail(expedienteId);
  revalidateExpedienteDetail(expedienteId, "contrato");
  return parsed;
};

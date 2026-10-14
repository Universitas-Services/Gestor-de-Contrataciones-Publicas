"use server";

import { getServerToken } from "@/lib/auth/session";
import { parseApiErrorResponse } from "@/lib/utils/fase1ApiError";
import {
  revalidateExpedienteDetail,
  revalidateExpedienteList,
} from "@/lib/utils/expedienteRevalidate";
import type {
  ActividadesPreviasApiResponse,
  AspectosGeneralesApiResponse,
  CalificacionFinancieraApiResponse,
  CalificacionLegalApiResponse,
  CalificacionTecnicaApiResponse,
  EvaluacionTecnicaEconomicaApiResponse,
  EspecificacionesTecnicasApiResponse,
  FasePreparatoriaProgresoResponse,
  LlamadoApiResponse,
  MicromoduloApiSlug,
  ModeloContratoApiResponse,
  SubirModeloRecaudoResponse,
} from "@/types/fase1Micromodulos.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function fasePreparatoriaBase(expedienteId: string): string {
  return `${API_URL}/expedientes/${expedienteId}/fase-preparatoria`;
}

async function handleJsonResponse<T>(response: Response, errorMsg: string): Promise<T> {
  if (!response.ok) {
    throw await parseApiErrorResponse(response, errorMsg);
  }

  const json = await response.json().catch(() => ({}));
  // Envelope Nest: { message, data: { modulo, estado, datos } }
  // No confundir con el campo `datos` del micromódulo (payload de negocio).
  if (
    json &&
    typeof json === "object" &&
    "data" in json &&
    (json as { data: unknown }).data !== null &&
    (json as { data: unknown }).data !== undefined &&
    typeof (json as { data: unknown }).data === "object"
  ) {
    return (json as { data: T }).data;
  }
  return json as T;
}

async function handleMutationResponse(response: Response, errorMsg: string): Promise<void> {
  if (!response.ok) {
    throw await parseApiErrorResponse(response, errorMsg);
  }
}

export async function obtenerProgresoFasePreparatoria(
  expedienteId: string
): Promise<FasePreparatoriaProgresoResponse> {
  const token = await getServerToken();

  const response = await fetch(`${fasePreparatoriaBase(expedienteId)}/progreso`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  return handleJsonResponse<FasePreparatoriaProgresoResponse>(
    response,
    "Error al obtener el progreso de la fase preparatoria"
  );
}

export async function obtenerMicromodulo<T>(
  expedienteId: string,
  modulo: MicromoduloApiSlug
): Promise<T> {
  const token = await getServerToken();

  const response = await fetch(`${fasePreparatoriaBase(expedienteId)}/${modulo}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  return handleJsonResponse<T>(response, `Error al obtener el micromódulo ${modulo}`);
}

export async function guardarBorradorMicromodulo(
  expedienteId: string,
  modulo: MicromoduloApiSlug,
  payload: Record<string, unknown>
): Promise<void> {
  const token = await getServerToken();

  if (process.env.NODE_ENV === "development") {
    console.log(`[PUT ${modulo}]`, {
      expedienteId,
      keys: Object.keys(payload),
      payload,
    });
  }

  const response = await fetch(`${fasePreparatoriaBase(expedienteId)}/${modulo}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  await handleMutationResponse(response, `Error al guardar borrador de ${modulo}`);
  revalidateExpedienteDetail(expedienteId);
}

export async function completarMicromodulo(
  expedienteId: string,
  modulo: MicromoduloApiSlug,
  payload?: Record<string, unknown>
): Promise<void> {
  const token = await getServerToken();

  const hasPayload = Boolean(payload && Object.keys(payload).length > 0);
  const response = await fetch(`${fasePreparatoriaBase(expedienteId)}/${modulo}/completar`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      ...(hasPayload ? { "Content-Type": "application/json" } : {}),
    },
    body: hasPayload ? JSON.stringify(payload) : undefined,
  });

  await handleMutationResponse(response, `No se puede completar ${modulo}`);
  revalidateExpedienteDetail(expedienteId);
  revalidateExpedienteList();
}

export async function reabrirMicromodulo(
  expedienteId: string,
  modulo: MicromoduloApiSlug
): Promise<void> {
  const token = await getServerToken();

  const response = await fetch(`${fasePreparatoriaBase(expedienteId)}/${modulo}/reabrir`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  await handleMutationResponse(response, `Error al reabrir ${modulo}`);
  revalidateExpedienteDetail(expedienteId);
}

export async function obtenerActividadesPrevias(expedienteId: string) {
  const result = await obtenerMicromodulo<ActividadesPreviasApiResponse>(
    expedienteId,
    "actividades-previas"
  );
  if (process.env.NODE_ENV === "development") {
    const r = result as Record<string, unknown>;
    console.log("[GET actividades-previas]", {
      keys: Object.keys(r),
      estado: r.estado,
      datosType: r.datos === null ? "null" : typeof r.datos,
      datosKeys:
        r.datos && typeof r.datos === "object" && !Array.isArray(r.datos)
          ? Object.keys(r.datos as object).slice(0, 8)
          : undefined,
    });
  }
  return result;
}

export async function obtenerLlamado(expedienteId: string) {
  const result = await obtenerMicromodulo<LlamadoApiResponse>(expedienteId, "llamado");
  if (process.env.NODE_ENV === "development") {
    const r = result as Record<string, unknown>;
    console.log("[GET llamado]", {
      keys: Object.keys(r),
      estado: r.estado,
      datosType: r.datos === null ? "null" : typeof r.datos,
      datosKeys:
        r.datos && typeof r.datos === "object" && !Array.isArray(r.datos)
          ? Object.keys(r.datos as object).slice(0, 8)
          : undefined,
    });
  }
  return result;
}

export async function obtenerAspectosGenerales(expedienteId: string) {
  const result = await obtenerMicromodulo<AspectosGeneralesApiResponse>(
    expedienteId,
    "aspectos-generales"
  );
  if (process.env.NODE_ENV === "development") {
    const r = result as Record<string, unknown>;
    console.log("[GET aspectos-generales]", {
      keys: Object.keys(r),
      estado: r.estado,
      datosType: r.datos === null ? "null" : typeof r.datos,
      datosKeys:
        r.datos && typeof r.datos === "object" && !Array.isArray(r.datos)
          ? Object.keys(r.datos as object).slice(0, 10)
          : undefined,
    });
  }
  return result;
}

export async function obtenerModeloContrato(expedienteId: string) {
  const result = await obtenerMicromodulo<ModeloContratoApiResponse>(
    expedienteId,
    "modelo-contrato"
  );
  if (process.env.NODE_ENV === "development") {
    const r = result as Record<string, unknown>;
    const datos = r.datos;
    const datosObj =
      datos && typeof datos === "object" && !Array.isArray(datos)
        ? (datos as Record<string, unknown>)
        : null;
    console.log("[GET modelo-contrato]", {
      keys: Object.keys(r),
      estado: r.estado,
      datosType: datos === null ? "null" : typeof datos,
      datosKeys: datosObj ? Object.keys(datosObj).slice(0, 8) : undefined,
      hasClauses: Boolean(
        datosObj &&
        (Array.isArray(datosObj.clauses) ||
          (datosObj.data &&
            typeof datosObj.data === "object" &&
            Array.isArray((datosObj.data as { clauses?: unknown }).clauses)))
      ),
    });
  }
  return result;
}

export async function obtenerCalificacionLegal(expedienteId: string) {
  const result = await obtenerMicromodulo<CalificacionLegalApiResponse>(
    expedienteId,
    "calificacion-legal"
  );
  if (process.env.NODE_ENV === "development") {
    const r = result as Record<string, unknown>;
    const datos = r.datos;
    const datosObj =
      datos && typeof datos === "object" && !Array.isArray(datos)
        ? (datos as Record<string, unknown>)
        : null;
    const inner =
      datosObj?.data && typeof datosObj.data === "object" && !Array.isArray(datosObj.data)
        ? (datosObj.data as Record<string, unknown>)
        : datosObj;
    console.log("[GET calificacion-legal]", {
      keys: Object.keys(r),
      estado: r.estado,
      datosType: datos === null ? "null" : typeof datos,
      datosKeys: datosObj ? Object.keys(datosObj).slice(0, 8) : undefined,
      hasExigidos: Boolean(inner && typeof inner.exigidos === "object"),
      personalizadosCount: Array.isArray(inner?.personalizados)
        ? inner.personalizados.length
        : undefined,
    });
  }
  return result;
}

export async function obtenerCalificacionFinanciera(expedienteId: string) {
  const result = await obtenerMicromodulo<CalificacionFinancieraApiResponse>(
    expedienteId,
    "calificacion-financiera"
  );
  if (process.env.NODE_ENV === "development") {
    const r = result as Record<string, unknown>;
    const datos = r.datos;
    const datosObj =
      datos && typeof datos === "object" && !Array.isArray(datos)
        ? (datos as Record<string, unknown>)
        : null;
    const inner =
      datosObj?.data && typeof datosObj.data === "object" && !Array.isArray(datosObj.data)
        ? (datosObj.data as Record<string, unknown>)
        : datosObj;
    console.log("[GET calificacion-financiera]", {
      keys: Object.keys(r),
      estado: r.estado,
      datosType: datos === null ? "null" : typeof datos,
      datosKeys: datosObj ? Object.keys(datosObj).slice(0, 10) : undefined,
      criteriosActivos: inner
        ? {
            descapital: inner.criterioCalifFinanDescapital,
            solvencia: inner.criterioCalifFinanSolvencia,
            rotacion: inner.criterioCalifFinanRotacion,
            rendimiento: inner.criterioCalifFinanRendimiento,
            rentabilidad: inner.criterioCalifFinanRentabilidad,
            endeudamiento: inner.criterioCalifFinanEndeudamiento,
          }
        : undefined,
      puntuacionMinima: inner?.puntuacionMinimaCalifFinanciera,
    });
  }
  return result;
}

export async function obtenerCalificacionTecnica(expedienteId: string) {
  const result = await obtenerMicromodulo<CalificacionTecnicaApiResponse>(
    expedienteId,
    "calificacion-tecnica"
  );
  if (process.env.NODE_ENV === "development") {
    const r = result as Record<string, unknown>;
    const datos = r.datos;
    const datosObj =
      datos && typeof datos === "object" && !Array.isArray(datos)
        ? (datos as Record<string, unknown>)
        : null;
    const inner =
      datosObj?.data && typeof datosObj.data === "object" && !Array.isArray(datosObj.data)
        ? (datosObj.data as Record<string, unknown>)
        : datosObj;
    console.log("[GET calificacion-tecnica]", {
      keys: Object.keys(r),
      estado: r.estado,
      datosType: datos === null ? "null" : typeof datos,
      datosKeys: datosObj ? Object.keys(datosObj).slice(0, 8) : undefined,
      criteriosCount: Array.isArray(inner?.criterios) ? inner.criterios.length : undefined,
      puntuacionMinima: inner?.puntuacionMinimaCalifTecnica,
    });
  }
  return result;
}

export async function obtenerEvaluacionTecnicaEconomica(expedienteId: string) {
  const result = await obtenerMicromodulo<EvaluacionTecnicaEconomicaApiResponse>(
    expedienteId,
    "evaluacion-tecnica-economica"
  );
  if (process.env.NODE_ENV === "development") {
    const r = result as Record<string, unknown>;
    const datos = r.datos;
    const datosObj =
      datos && typeof datos === "object" && !Array.isArray(datos)
        ? (datos as Record<string, unknown>)
        : null;
    const inner =
      datosObj?.data && typeof datosObj.data === "object" && !Array.isArray(datosObj.data)
        ? (datosObj.data as Record<string, unknown>)
        : datosObj;
    const tecnica =
      inner?.tecnica && typeof inner.tecnica === "object"
        ? (inner.tecnica as Record<string, unknown>)
        : null;
    const economica =
      inner?.economica && typeof inner.economica === "object"
        ? (inner.economica as Record<string, unknown>)
        : null;
    console.log("[GET evaluacion-tecnica-economica]", {
      keys: Object.keys(r),
      estado: r.estado,
      datosKeys: datosObj ? Object.keys(datosObj).slice(0, 8) : undefined,
      criteriosTecnicos: Array.isArray(tecnica?.criterios) ? tecnica.criterios.length : undefined,
      criteriosEconomicos: Array.isArray(economica?.criterios)
        ? economica.criterios.length
        : undefined,
      puntuacionMinimaTecnica: tecnica?.puntuacionMinima,
      puntuacionMinimaEconomica: economica?.puntuacionMinima,
    });
  }
  return result;
}

export async function obtenerEspecificacionesTecnicas(
  expedienteId: string
): Promise<EspecificacionesTecnicasApiResponse | null> {
  const token = await getServerToken();

  const response = await fetch(`${fasePreparatoriaBase(expedienteId)}/especificaciones-tecnicas`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (response.status === 404) return null;

  return handleJsonResponse<EspecificacionesTecnicasApiResponse>(
    response,
    "Error al obtener especificaciones técnicas"
  );
}

export async function subirEspecificacionesTecnicas(
  expedienteId: string,
  formData: FormData
): Promise<EspecificacionesTecnicasApiResponse> {
  const token = await getServerToken();

  const response = await fetch(`${fasePreparatoriaBase(expedienteId)}/especificaciones-tecnicas`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const result = await handleJsonResponse<EspecificacionesTecnicasApiResponse>(
    response,
    "Error al subir especificaciones técnicas"
  );

  revalidateExpedienteDetail(expedienteId);
  return result;
}

export async function eliminarEspecificacionesTecnicas(expedienteId: string): Promise<void> {
  const token = await getServerToken();

  const response = await fetch(`${fasePreparatoriaBase(expedienteId)}/especificaciones-tecnicas`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  await handleMutationResponse(response, "Error al eliminar especificaciones técnicas");
  revalidateExpedienteDetail(expedienteId);
}

export async function subirModeloRecaudoLegal(
  expedienteId: string,
  formData: FormData
): Promise<SubirModeloRecaudoResponse> {
  const token = await getServerToken();

  const response = await fetch(`${fasePreparatoriaBase(expedienteId)}/calificacion-legal/modelos`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const result = await handleJsonResponse<SubirModeloRecaudoResponse>(
    response,
    "Error al subir el modelo de recaudo"
  );

  revalidateExpedienteDetail(expedienteId);
  return result;
}

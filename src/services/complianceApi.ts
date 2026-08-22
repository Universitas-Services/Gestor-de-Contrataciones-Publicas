import type {
  CrearSesionRequest,
  DictamenJuridico,
  DocumentoAnalizado,
  ListarSesionesParams,
  MensajeResponse,
  SesionCompliance,
  SesionesListaResponse,
  TipoDocumento,
} from "@/types/compliance.types";

const API_BASE =
  process.env.NEXT_PUBLIC_COMPLIANCE_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const data = await res.json();
      detail = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail ?? data);
    } catch {
      /* ignore */
    }
    throw new Error(detail || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function listarSesiones(params: ListarSesionesParams = {}) {
  const qs = new URLSearchParams();
  if (params.page != null) qs.set("page", String(params.page));
  if (params.page_size != null) qs.set("page_size", String(params.page_size));
  if (params.q?.trim()) qs.set("q", params.q.trim());
  if (params.modalidad) qs.set("modalidad", params.modalidad);
  if (params.tipo_contratacion) qs.set("tipo_contratacion", params.tipo_contratacion);
  if (params.estado) qs.set("estado", params.estado);
  const query = qs.toString();
  return api<SesionesListaResponse>(`/api/sesiones/${query ? `?${query}` : ""}`);
}

export function crearSesion(body: CrearSesionRequest = {}) {
  return api<{ sesion: SesionCompliance; mensaje: string }>("/api/sesiones/", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function obtenerSesion(id: string) {
  return api<SesionCompliance>(`/api/sesiones/${id}`);
}

export function enviarMensaje(id: string, mensaje: string) {
  return api<MensajeResponse>(`/api/sesiones/${id}/mensaje`, {
    method: "POST",
    body: JSON.stringify({ mensaje }),
  });
}

export function solicitarRevisionJuridica(
  id: string,
  body: {
    mensaje?: string;
    documento_ids?: string[];
    forzar_final?: boolean;
  } = {}
) {
  return api<{
    sesion: SesionCompliance;
    dictamen: DictamenJuridico;
    respuesta: string;
  }>(`/api/sesiones/${id}/juridico`, {
    method: "POST",
    body: JSON.stringify({
      mensaje:
        body.mensaje ||
        "Emite una revisión jurídica del expediente con los documentos y respuestas disponibles hasta ahora.",
      documento_ids: body.documento_ids ?? null,
      forzar_final: body.forzar_final ?? false,
    }),
  });
}

export async function subirDocumento(sesionId: string, tipo: TipoDocumento, archivo: File) {
  const form = new FormData();
  form.append("archivo", archivo);
  form.append("tipo_documento", tipo);
  const res = await fetch(
    `${API_BASE}/api/sesiones/${sesionId}/documentos?tipo_documento=${encodeURIComponent(tipo)}`,
    { method: "POST", body: form }
  );
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const data = await res.json();
      detail = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail ?? data);
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  return res.json() as Promise<{
    documento: DocumentoAnalizado;
    mensaje: string;
    slots_pendientes: TipoDocumento[];
  }>;
}

async function descargarBlob(path: string, filename: string) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const data = await res.json();
      detail = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail ?? data);
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function descargarInformeDocumento(
  sesionId: string,
  docId: string,
  formato: "pdf" | "docx"
) {
  return descargarBlob(
    `/api/sesiones/${sesionId}/documentos/${docId}/informe.${formato}`,
    `informe_doc_${docId.slice(0, 8)}.${formato}`
  );
}

export function descargarDictamenJuridico(
  sesionId: string,
  dictamenId: string,
  formato: "pdf" | "docx"
) {
  return descargarBlob(
    `/api/sesiones/${sesionId}/juridico/${dictamenId}/informe.${formato}`,
    `dictamen_juridico.${formato}`
  );
}

/**
 * Corre revisión jurídica (parcial/final) y descarga PDF o DOCX del dictamen.
 */
export async function revisionJuridicaYDescargar(
  sesionId: string,
  formato: "pdf" | "docx",
  body: {
    mensaje?: string;
    documento_ids?: string[];
    forzar_final?: boolean;
  } = {}
) {
  const res = await solicitarRevisionJuridica(sesionId, body);
  await descargarDictamenJuridico(sesionId, res.dictamen.id, formato);
  return res;
}

export { API_BASE };

import { createActividadesPreviasDefaultValues } from "@/lib/constants/actividadesPrevias";
import { createAspectosGeneralesDefaultValues } from "@/lib/constants/aspectosGenerales";
import {
  createDefaultCalificacionFinancieraValues,
  type CalificacionFinancieraFormValues,
  type TresRangosValues,
} from "@/lib/constants/calificacionFinanciera";
import {
  createEmptyCalificacionLegalForm,
  type CalificacionLegalStoredForm,
  type RecaudoArchivoMeta,
  type RecaudoPersonalizadoItem,
} from "@/lib/constants/calificacionLegal";
import {
  createDefaultCalificacionTecnicaValues,
  createId,
  type CalificacionTecnicaFormValues,
  type CriterioTecnico,
  type RangoTecnico,
} from "@/lib/constants/calificacionTecnica";
import {
  createDefaultEvaluacionTecnicaEconomicaValues,
  type CriterioEvalEconomica,
  type CriterioEvalTecnica,
  type EvaluacionTecnicaEconomicaFormValues,
  type RangoEvalEconomica,
  type RangoEvalTecnica,
} from "@/lib/constants/evaluacionTecnicaEconomica";
import { createLlamadoPublicoDefaultValues } from "@/lib/constants/llamadoPublico";
import type { ClausulaEnModelo } from "@/lib/constants/modeloContrato";
import type { EspecificacionesTecnicasStoredMeta } from "@/lib/constants/especificacionesTecnicas";
import { clausulaOrdinalApiValue, parseClausulaOrdinalOrder } from "@/lib/utils/clausulaOrdinales";
import {
  formatNumeroCuentaDisplay,
  numeroCuentaDigitsOnly,
  type CuentaBancariaEnte,
} from "@/lib/constants/cuentasBancariasEnte";
import type { ActividadesPreviasFormInputValues } from "@/lib/schemas/actividadesPreviasSchema";
import type { AspectosGeneralesFormInputValues } from "@/lib/schemas/aspectosGeneralesSchema";
import type { LlamadoPublicoFormInputValues } from "@/lib/schemas/llamadoPublicoSchema";
import type {
  DocumentoMaestroId,
  DocumentoMaestroStatus,
  Fase1InicialState,
  MicromoduleId,
  MicromoduleStatus,
} from "@/components/features-components/GestionExpedientes/fase1/types/fase1Inicial.types";
import { createInitialFase1InicialState } from "@/components/features-components/GestionExpedientes/fase1/constants/fase1Inicial.constants";
import type {
  CalificacionFinancieraApiData,
  CalificacionFinancieraRangosApi,
  CalificacionLegalApiData,
  CalificacionTecnicaApiData,
  CriterioTecnicoApi,
  CriterioTecnicoRangoApi,
  CuentaBancariaEnteApi,
  CrearCuentaBancariaEntePayload,
  EspecificacionesTecnicasApiResponse,
  EvaluacionTecnicaEconomicaApiData,
  EstadoDocumentoApi,
  EstadoMicromoduloApi,
  FasePreparatoriaProgresoResponse,
  MicromoduloApiSlug,
  MicromoduloProgresoApiKey,
  ModeloContratoApiData,
} from "@/types/fase1Micromodulos.types";

const UI_TO_API_MICROMODULO: Partial<Record<MicromoduleId, MicromoduloApiSlug>> = {
  "aspectos-generales-pliego": "aspectos-generales",
};

const API_TO_UI_MICROMODULO: Record<string, MicromoduleId> = {
  "actividades-previas": "actividades-previas",
  llamado: "llamado",
  "aspectos-generales": "aspectos-generales-pliego",
  "modelo-contrato": "modelo-contrato",
  "calificacion-legal": "calificacion-legal",
  "calificacion-financiera": "calificacion-financiera",
  "calificacion-tecnica": "calificacion-tecnica",
  "evaluacion-tecnica-economica": "evaluacion-tecnica-economica",
  "especificaciones-tecnicas": "especificaciones-tecnicas",
  "presupuesto-base": "presupuesto-base",
};

export function micormoduloIdToApiSlug(id: MicromoduleId): MicromoduloApiSlug | null {
  if (id === "especificaciones-tecnicas" || id === "presupuesto-base") return null;
  return (UI_TO_API_MICROMODULO[id] ?? id) as MicromoduloApiSlug;
}

function toFormString(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

function toOptionalNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;

  const raw = String(value).trim();
  // US / ISO: "888.88" o "52.55" (un solo punto decimal, sin miles)
  if (/^\d+(\.\d+)?$/.test(raw)) {
    const num = Number(raw);
    return Number.isFinite(num) ? num : undefined;
  }
  // Formato VE: miles con punto, decimal con coma ("1.500,50" → 1500.5)
  const normalized = raw.replace(/\./g, "").replace(",", ".");
  const num = Number(normalized);
  return Number.isFinite(num) ? num : undefined;
}

function mapMicromoduleStatus(
  apiStatus: EstadoMicromoduloApi,
  moduleId: MicromoduleId,
  actividadesPreviasStatus: EstadoMicromoduloApi
): MicromoduleStatus {
  if (moduleId !== "actividades-previas" && actividadesPreviasStatus !== "COMPLETADO") {
    return "locked";
  }
  if (apiStatus === "COMPLETADO") return "completed";
  if (apiStatus === "BORRADOR") return "draft";
  return "available";
}

function mapDocumentStatus(apiStatus: EstadoDocumentoApi): DocumentoMaestroStatus {
  if (apiStatus === "GENERADO") return "generated";
  if (apiStatus === "DISPONIBLE" || apiStatus === "DESACTUALIZADO") return "ready";
  return "locked";
}

export function mapProgresoToFase1State(
  progreso: FasePreparatoriaProgresoResponse
): Fase1InicialState {
  const base = createInitialFase1InicialState();
  const apStatus =
    progreso.micromodulos["actividades-previas"] ?? ("PENDIENTE" as EstadoMicromoduloApi);

  for (const [apiKey, apiStatus] of Object.entries(progreso.micromodulos) as [
    MicromoduloProgresoApiKey,
    EstadoMicromoduloApi,
  ][]) {
    const uiId = API_TO_UI_MICROMODULO[apiKey];
    if (!uiId) continue;
    base.micromodules[uiId] = mapMicromoduleStatus(apiStatus, uiId, apStatus);
  }

  for (const [docId, docStatus] of Object.entries(progreso.documentos) as [
    DocumentoMaestroId,
    EstadoDocumentoApi,
  ][]) {
    base.documents[docId] = mapDocumentStatus(docStatus);
  }

  base.phaseComplete = progreso.phaseComplete;
  return base;
}

const ACTIVIDADES_NUMERIC_FIELDS = [
  "plazoEjecucionProcedimientoAuAu",
  "puntajeVanAuAu",
  "puntuacionBonoLocalAuAu",
  "puntuacionBonoSujetoAuAu",
  "porcentajeGarantiaLaboralAuAu",
  "porcentajeResponsabilidadCivilAuAu",
  "montoResponsabilidadCivilBsAuAu",
  "porcentajeAnticipoAuAu",
] as const;

const ASPECTOS_NUMERIC_FIELDS = [
  "diasValidezOfertaAuAu",
  "diasVigenciaGarantiaExtAuAu",
  "porcentajeResponsabilidadSocialAuAu",
  "porcentajeMantenimientoOfertaAuAu",
  "porcentajeFielCumplimientoAuAu",
  "porcentajeAnticipoEspecialAuAu",
] as const;

/** UI (*AuAu / Llamado*) → API (Swagger). */
const LLAMADO_UI_TO_API: Record<string, string> = {
  objetivosEspecificosLlamado1AuAu: "objetivosEspecificos1",
  objetivosEspecificosLlamado2AuAu: "objetivosEspecificos2",
  objetivosEspecificosLlamado3AuAu: "objetivosEspecificos3",
  direccionRetiroPliegoAuAu: "direccionRetiroPliego",
  horarioRetiroPliegoAuAu: "horarioRetiroPliego",
  pliegoCostoAuAu: "pliegoCosto",
  costoPliegoBsAuAu: "costoPliegoBs",
  bancoPagoPliegoAuAu: "bancoPagoPliego",
  cuentaPagoPliegoAuAu: "cuentaPagoPliego",
  titularPagoPliegoAuAu: "titularPagoPliego",
  rifPagoPliegoAuAu: "rifPagoPliego",
  horaActoRecepAperAuAu: "horaActoRecepAper",
};

const LLAMADO_API_TO_UI: Record<string, keyof LlamadoPublicoFormInputValues> = {
  objetivosEspecificos1: "objetivosEspecificosLlamado1AuAu",
  objetivosEspecificos2: "objetivosEspecificosLlamado2AuAu",
  objetivosEspecificos3: "objetivosEspecificosLlamado3AuAu",
  direccionRetiroPliego: "direccionRetiroPliegoAuAu",
  horarioRetiroPliego: "horarioRetiroPliegoAuAu",
  pliegoCosto: "pliegoCostoAuAu",
  costoPliegoBs: "costoPliegoBsAuAu",
  bancoPagoPliego: "bancoPagoPliegoAuAu",
  cuentaPagoPliego: "cuentaPagoPliegoAuAu",
  titularPagoPliego: "titularPagoPliegoAuAu",
  rifPagoPliego: "rifPagoPliegoAuAu",
  horaActoRecepAper: "horaActoRecepAperAuAu",
  // aliases por si el GET aún trae AuAu / legacy
  objetivosEspecificosLlamado1: "objetivosEspecificosLlamado1AuAu",
  objetivosEspecificosLlamado2: "objetivosEspecificosLlamado2AuAu",
  objetivosEspecificosLlamado3: "objetivosEspecificosLlamado3AuAu",
};

/** API de micromódulos planos: sin sufijo AuAu. UI del formulario: con AuAu. */
function stripAuAuSuffix(key: string): string {
  return key.endsWith("AuAu") ? key.slice(0, -4) : key;
}

function withAuAuSuffix(key: string): string {
  return key.endsWith("AuAu") ? key : `${key}AuAu`;
}

function compactFlatPayload(
  values: Record<string, unknown>,
  numericKeys: readonly string[]
): Record<string, unknown> {
  const numeric = new Set(numericKeys);
  const payload: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(values)) {
    if (value === undefined || value === null || value === "") continue;

    const apiKey = stripAuAuSuffix(key);

    if (numeric.has(key)) {
      const num = toOptionalNumber(value);
      if (num === undefined) continue;
      payload[apiKey] = num;
      continue;
    }

    payload[apiKey] = value;
  }

  return payload;
}

function stripMetaFields(record: Record<string, unknown>): Record<string, unknown> {
  const skip = new Set([
    "estado",
    "id",
    "expedienteId",
    "fasePreparatoriaId",
    "createdAt",
    "updatedAt",
    "deletedAt",
    "createdBy",
    "updatedBy",
    "version",
    "modulo",
    "etiqueta",
    "data",
    "datos",
  ]);
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    if (!skip.has(key)) out[key] = value;
  }
  return out;
}

function coerceObjectRecord(value: unknown): Record<string, unknown> | null {
  if (value === null || value === undefined) return null;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return null;
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return null;
    }
    return null;
  }

  if (typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return null;
}

function looksLikeMicromoduloWrapper(record: Record<string, unknown>): boolean {
  return (
    typeof record.estado === "string" ||
    typeof record.modulo === "string" ||
    typeof record.etiqueta === "string"
  );
}

/**
 * GET micromódulo: `{ modulo, etiqueta, estado, datos: { ...campos } }`.
 * Tolera envelope Nest `{ message, data }`, legacy `data`, JSON stringificado o campos en raíz.
 */
export function getMicromoduloDatos(
  response: Record<string, unknown> | null | undefined
): Record<string, unknown> {
  if (!response) return {};

  // Envelope Nest: { message?, data: { estado, datos } }
  const envelopeData = coerceObjectRecord(response.data);
  if (
    envelopeData &&
    response.datos === undefined &&
    (response.message !== undefined || looksLikeMicromoduloWrapper(envelopeData))
  ) {
    const fromEnvelopeDatos = coerceObjectRecord(envelopeData.datos);
    if (fromEnvelopeDatos) return fromEnvelopeDatos;

    if (looksLikeMicromoduloWrapper(envelopeData)) {
      const nestedData = coerceObjectRecord(envelopeData.data);
      if (nestedData && !looksLikeMicromoduloWrapper(nestedData)) return nestedData;
      return stripMetaFields(envelopeData);
    }

    return envelopeData;
  }

  const fromDatos = coerceObjectRecord(response.datos);
  if (fromDatos) {
    if (looksLikeMicromoduloWrapper(fromDatos)) {
      const deeper = coerceObjectRecord(fromDatos.datos) ?? coerceObjectRecord(fromDatos.data);
      if (deeper) return deeper;
    }
    return fromDatos;
  }

  if (envelopeData) {
    if (looksLikeMicromoduloWrapper(envelopeData)) {
      const deeper =
        coerceObjectRecord(envelopeData.datos) ?? coerceObjectRecord(envelopeData.data);
      if (deeper) return deeper;
      return stripMetaFields(envelopeData);
    }
    return envelopeData;
  }

  return stripMetaFields(response);
}

/**
 * Para micromódulos JSONB cuyo PUT envía `{ data: {...} }`.
 * GET suele devolver `datos: { data: {...} }` o `datos: {...}` directo.
 */
export function getMicromoduloJsonbPayload(
  response: Record<string, unknown> | null | undefined
): Record<string, unknown> | undefined {
  const datos = getMicromoduloDatos(response);
  if (Object.keys(datos).length === 0) return undefined;

  const inner = coerceObjectRecord(datos.data);
  if (inner && !looksLikeMicromoduloWrapper(inner)) {
    return inner;
  }

  return datos;
}

function extractFlatMicromoduloFields(response: Record<string, unknown>): Record<string, unknown> {
  const fromDatos = getMicromoduloDatos(response);
  const top = stripMetaFields(response);
  // Preferir `datos`; completar con raíz por si algún campo viene afuera.
  return { ...top, ...fromDatos };
}

/** Aliases API (snake_case / legacy) → clave API camelCase sin AuAu. */
const ACTIVIDADES_API_KEY_ALIASES: Record<string, string> = {
  justificacion_contrato_marco_au_au: "justificacionContratoMarco",
  justificacionContratoMarcoAuAu: "justificacionContratoMarco",
};

/** API → clave sin AuAu usada por el formulario (luego se añade AuAu). */
const ASPECTOS_API_KEY_ALIASES: Record<string, string> = {
  // API: diasVigenciaGarantiaExtension ↔ UI: diasVigenciaGarantiaExtAuAu
  diasVigenciaGarantiaExtension: "diasVigenciaGarantiaExt",
  diasVigenciaGarantiaExtAuAu: "diasVigenciaGarantiaExt",
};

/** UI → API cuando el strip AuAu no coincide con Swagger. */
const ASPECTOS_UI_TO_API_OVERRIDES: Record<string, string> = {
  diasVigenciaGarantiaExtAuAu: "diasVigenciaGarantiaExtension",
};

function normalizeApiFieldKey(rawKey: string): string {
  return ACTIVIDADES_API_KEY_ALIASES[rawKey] ?? ASPECTOS_API_KEY_ALIASES[rawKey] ?? rawKey;
}

function normalizeDateForInput(value: unknown): string {
  const raw = toFormString(value);
  if (!raw) return "";
  const match = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  return match?.[1] ?? raw;
}

function mapFlatFieldsFromApi(
  response: Record<string, unknown>,
  defaults: Record<string, unknown>,
  numericKeys: readonly string[],
  dateKeys: readonly string[] = []
): Record<string, unknown> {
  const fields = extractFlatMicromoduloFields(response);
  const merged = { ...defaults };
  const numeric = new Set(numericKeys);
  const dates = new Set(dateKeys);

  for (const [rawKey, value] of Object.entries(fields)) {
    if (value === undefined || value === null) continue;

    const apiKey = normalizeApiFieldKey(rawKey);
    const uiKey = withAuAuSuffix(apiKey);
    if (!(uiKey in merged) && !(apiKey in merged) && !(rawKey in merged)) continue;

    const targetKey = uiKey in merged ? uiKey : apiKey in merged ? apiKey : rawKey;

    if (dates.has(targetKey) || dates.has(apiKey) || /^(fec|fecha)/i.test(apiKey)) {
      merged[targetKey] = normalizeDateForInput(value);
    } else if (numeric.has(targetKey)) {
      merged[targetKey] = toFormString(value);
    } else if (Array.isArray(value)) {
      merged[targetKey] = value;
    } else if (typeof value === "boolean") {
      merged[targetKey] = value;
    } else {
      merged[targetKey] = toFormString(value);
    }
  }

  return merged;
}

/** Puntajes de promoción: enteros en UI (evita "10.00" → dígitos mal interpretados). */
function toIntegerScoreFormString(value: unknown): string {
  const num = toOptionalNumber(value);
  if (num === undefined) return "";
  const truncated = Math.trunc(num);
  if (!Number.isFinite(truncated) || truncated <= 0) return "";
  return String(truncated);
}

export function actividadesPreviasFromApi(
  response: Record<string, unknown>,
  direccionEnteDefault = ""
): ActividadesPreviasFormInputValues {
  const defaults = createActividadesPreviasDefaultValues(direccionEnteDefault);
  const mapped = mapFlatFieldsFromApi(
    response,
    defaults as unknown as Record<string, unknown>,
    ACTIVIDADES_NUMERIC_FIELDS,
    ["fecEstudioMercadoAuAu"]
  ) as ActividadesPreviasFormInputValues;

  const integerScoreKeys = [
    "puntajeVanAuAu",
    "puntuacionBonoLocalAuAu",
    "puntuacionBonoSujetoAuAu",
  ] as const;
  for (const key of integerScoreKeys) {
    const raw = mapped[key];
    if (raw === undefined || raw === null || raw === "") continue;
    mapped[key] = toIntegerScoreFormString(raw);
  }

  // Decimal fields (LocalizedDecimalInput VE format: "XX,XX").
  const decimalKeys = [
    "porcentajeGarantiaLaboralAuAu",
    "porcentajeResponsabilidadCivilAuAu",
    "montoResponsabilidadCivilBsAuAu",
    "porcentajeAnticipoAuAu",
  ] as const;
  for (const key of decimalKeys) {
    const raw = mapped[key];
    if (raw === undefined || raw === null || raw === "") continue;
    const num = toOptionalNumber(raw);
    if (num === undefined) continue;
    mapped[key] = num.toFixed(2).replace(".", ",");
  }

  return mapped;
}

export function actividadesPreviasToApi(
  values: ActividadesPreviasFormInputValues
): Record<string, unknown> {
  const sanitized: ActividadesPreviasFormInputValues = { ...values };

  // Promoción: no enviar subcampos inconsistentes con los flags.
  if (sanitized.activaPromocionEconomicaAuAu !== true) {
    sanitized.requiereVanAuAu = undefined;
    sanitized.puntajeVanAuAu = "";
    sanitized.indPrefLocalAuAu = undefined;
    sanitized.puntuacionBonoLocalAuAu = "";
    sanitized.indBonoSujetoAuAu = undefined;
    sanitized.puntuacionBonoSujetoAuAu = "";
  } else {
    if (sanitized.requiereVanAuAu !== true) sanitized.puntajeVanAuAu = "";
    if (sanitized.indPrefLocalAuAu !== true) sanitized.puntuacionBonoLocalAuAu = "";
    if (sanitized.indBonoSujetoAuAu !== true) sanitized.puntuacionBonoSujetoAuAu = "";
  }

  // Garantías/anticipo: limpiar subcampos condicionales.
  if (sanitized.requiereGarantiaLaboralAuAu !== true) {
    sanitized.porcentajeGarantiaLaboralAuAu = "";
    sanitized.retencionFianzaLaboralAuAu = undefined;
  }
  if (sanitized.polizaResponsabilidadCivilAuAu !== true) {
    sanitized.porcentajeResponsabilidadCivilAuAu = "";
    sanitized.montoResponsabilidadCivilBsAuAu = "";
  }
  if (sanitized.anticipoContratoAuAu !== true) {
    sanitized.porcentajeAnticipoAuAu = "";
  }

  return compactFlatPayload(
    sanitized as unknown as Record<string, unknown>,
    ACTIVIDADES_NUMERIC_FIELDS
  );
}

export function llamadoFromApi(
  response: Record<string, unknown>,
  direccionEnteDefault = ""
): LlamadoPublicoFormInputValues {
  const defaults = createLlamadoPublicoDefaultValues(direccionEnteDefault);
  const fields = extractFlatMicromoduloFields(response);
  const merged = { ...defaults };

  for (const [rawKey, value] of Object.entries(fields)) {
    if (value === undefined || value === null) continue;

    const uiKey =
      LLAMADO_API_TO_UI[rawKey] ??
      (rawKey.endsWith("AuAu")
        ? (rawKey as keyof LlamadoPublicoFormInputValues)
        : LLAMADO_API_TO_UI[stripAuAuSuffix(rawKey)]);

    if (!uiKey || !(uiKey in merged)) continue;

    if (uiKey === "costoPliegoBsAuAu") {
      merged.costoPliegoBsAuAu = toFormString(value);
    } else if (uiKey === "pliegoCostoAuAu") {
      merged.pliegoCostoAuAu = Boolean(value);
    } else if (uiKey === "cuentaPagoPliegoAuAu" && typeof value === "string") {
      merged.cuentaPagoPliegoAuAu = formatNumeroCuentaDisplay(value);
    } else if (typeof value === "boolean") {
      (merged as Record<string, unknown>)[uiKey] = value;
    } else {
      (merged as Record<string, unknown>)[uiKey] = toFormString(value);
    }
  }

  // Legacy: pliegoGratuito (invertido respecto a pliegoCosto).
  if (fields.pliegoCosto === undefined && fields.pliegoGratuito !== undefined) {
    merged.pliegoCostoAuAu = fields.pliegoGratuito === false;
  }

  return merged;
}

export function llamadoToApi(values: LlamadoPublicoFormInputValues): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  for (const [uiKey, value] of Object.entries(values as unknown as Record<string, unknown>)) {
    if (value === undefined || value === null || value === "") continue;

    const apiKey = LLAMADO_UI_TO_API[uiKey];
    if (!apiKey) continue;

    if (uiKey === "costoPliegoBsAuAu") {
      const num = toOptionalNumber(value);
      if (num === undefined) continue;
      payload[apiKey] = num;
      continue;
    }

    if (uiKey === "cuentaPagoPliegoAuAu" && typeof value === "string") {
      // Swagger del Llamado usa formato ####-####-##-##########
      payload[apiKey] = formatNumeroCuentaDisplay(value);
      continue;
    }

    payload[apiKey] = value;
  }

  return payload;
}

export function aspectosGeneralesFromApi(
  response: Record<string, unknown>
): AspectosGeneralesFormInputValues {
  const defaults = createAspectosGeneralesDefaultValues();
  const merged = mapFlatFieldsFromApi(
    response,
    defaults as unknown as Record<string, unknown>,
    ASPECTOS_NUMERIC_FIELDS
  ) as AspectosGeneralesFormInputValues;

  const fields = extractFlatMicromoduloFields(response);
  merged.normativaLegalAuAu = normalizeNormativaLegalList(
    fields.normativaLegal ?? fields.normativaLegalAuAu ?? merged.normativaLegalAuAu
  );

  // LocalizedDecimalInput (VE): enteros como "44"; decimales como "2,50".
  const integerKeys = new Set(["diasValidezOfertaAuAu", "diasVigenciaGarantiaExtAuAu"]);

  for (const key of ASPECTOS_NUMERIC_FIELDS) {
    const current = merged[key];
    if (current === undefined || current === null || current === "") continue;
    const num = toOptionalNumber(current);
    if (num === undefined) continue;

    if (integerKeys.has(key)) {
      merged[key] = String(Math.trunc(num));
    } else {
      // fractionDigits=2 por defecto en LocalizedDecimalInput
      merged[key] = num.toFixed(2).replace(".", ",");
    }
  }

  return merged;
}

/**
 * Normaliza normativa legal a `string[]` limpio.
 * Tolera string JSON, arrays anidados y dobles serializaciones de BD.
 */
export function normalizeNormativaLegalList(value: unknown): string[] {
  const collected: string[] = [];

  const walk = (item: unknown, depth: number) => {
    if (depth > 5 || item === null || item === undefined) return;

    if (Array.isArray(item)) {
      for (const el of item) walk(el, depth + 1);
      return;
    }

    if (typeof item !== "string") return;

    const trimmed = item.trim();
    if (!trimmed) return;

    const looksJson =
      (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
      (trimmed.startsWith('"') && trimmed.endsWith('"'));

    if (looksJson) {
      try {
        walk(JSON.parse(trimmed) as unknown, depth + 1);
        return;
      } catch {
        // texto plano que casualmente empieza con [ o "
      }
    }

    collected.push(trimmed);
  };

  walk(value, 0);

  const seen = new Set<string>();
  return collected.filter((entry) => {
    const key = entry.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function aspectosGeneralesToApi(
  values: AspectosGeneralesFormInputValues
): Record<string, unknown> {
  const numeric = new Set<string>(ASPECTOS_NUMERIC_FIELDS);
  const payload: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(values as unknown as Record<string, unknown>)) {
    if (value === undefined || value === null || value === "") continue;

    if (key === "normativaLegalAuAu") {
      const list = normalizeNormativaLegalList(value);
      if (list.length > 0) payload.normativaLegal = list;
      continue;
    }

    const apiKey = ASPECTOS_UI_TO_API_OVERRIDES[key] ?? stripAuAuSuffix(key);

    if (numeric.has(key)) {
      const num = toOptionalNumber(value);
      if (num === undefined) continue;
      payload[apiKey] = num;
      continue;
    }

    payload[apiKey] = value;
  }

  return payload;
}

function mapRangosFromApi(
  rangos?: CalificacionFinancieraRangosApi,
  fallback?: TresRangosValues
): TresRangosValues {
  const base = fallback ?? {
    rangoMaximo: 0,
    puntajeMaximo: null,
    rangoMedioDesde: 0,
    rangoMedioHasta: 0,
    puntajeMedio: null,
    rangoMinimo: 0,
    puntajeMinimo: null,
  };
  if (!rangos) return base;

  return {
    rangoMaximo: rangos.rangoMaximo ?? base.rangoMaximo,
    puntajeMaximo: rangos.puntajeMaximo ?? base.puntajeMaximo,
    rangoMedioDesde: rangos.rangoMedioDesde ?? base.rangoMedioDesde,
    rangoMedioHasta: rangos.rangoMedioHasta ?? base.rangoMedioHasta,
    puntajeMedio: rangos.puntajeMedio ?? base.puntajeMedio,
    rangoMinimo: rangos.rangoMinimo ?? base.rangoMinimo,
    puntajeMinimo: rangos.puntajeMinimo ?? base.puntajeMinimo,
  };
}

function mapRangosToApi(rangos: TresRangosValues): CalificacionFinancieraRangosApi {
  return {
    rangoMaximo: rangos.rangoMaximo,
    puntajeMaximo: rangos.puntajeMaximo,
    rangoMedioDesde: rangos.rangoMedioDesde,
    rangoMedioHasta: rangos.rangoMedioHasta,
    puntajeMedio: rangos.puntajeMedio,
    rangoMinimo: rangos.rangoMinimo,
    puntajeMinimo: rangos.puntajeMinimo,
  };
}

export function calificacionFinancieraFromApi(
  data?: CalificacionFinancieraApiData | Record<string, unknown>
): CalificacionFinancieraFormValues {
  const defaults = createDefaultCalificacionFinancieraValues();
  if (!data || typeof data !== "object") return defaults;

  const d = data as CalificacionFinancieraApiData;

  return {
    criterioCalifFinanDescapitalAuAu: d.criterioCalifFinanDescapital,
    puntajeMaximoDescapitalAuAu: d.puntajeMaximoDescapital ?? null,
    criterioCalifFinanSolvenciaAuAu: d.criterioCalifFinanSolvencia,
    solvencia: mapRangosFromApi(d.rangosSolvencia, defaults.solvencia),
    criterioCalifFinanRotacionAuAu: d.criterioCalifFinanRotacion,
    rotacion: mapRangosFromApi(d.rangosRotacion, defaults.rotacion),
    criterioCalifFinanRendimientoAuAu: d.criterioCalifFinanRendimiento,
    rendimiento: mapRangosFromApi(d.rangosRendimiento, defaults.rendimiento),
    criterioCalifFinanRentabilidadAuAu: d.criterioCalifFinanRentabilidad,
    rentabilidad: mapRangosFromApi(d.rangosRentabilidad, defaults.rentabilidad),
    criterioCalifFinanEndeudamientoAuAu: d.criterioCalifFinanEndeudamiento,
    endeudamiento: mapRangosFromApi(d.rangosEndeudamiento, defaults.endeudamiento),
    puntuacionMinimaCalifFinancieraAuAu:
      d.puntuacionMinimaCalifFinanciera ?? defaults.puntuacionMinimaCalifFinancieraAuAu,
  };
}

export function calificacionFinancieraFromResponse(
  response: Record<string, unknown> | null | undefined
): CalificacionFinancieraFormValues {
  return calificacionFinancieraFromApi(
    getMicromoduloJsonbPayload(response) as CalificacionFinancieraApiData | undefined
  );
}

export function calificacionFinancieraToApi(values: CalificacionFinancieraFormValues): {
  data: CalificacionFinancieraApiData;
} {
  const data: CalificacionFinancieraApiData = {
    criterioCalifFinanDescapital: values.criterioCalifFinanDescapitalAuAu ?? false,
    criterioCalifFinanSolvencia: values.criterioCalifFinanSolvenciaAuAu ?? false,
    criterioCalifFinanRotacion: values.criterioCalifFinanRotacionAuAu ?? false,
    criterioCalifFinanRendimiento: values.criterioCalifFinanRendimientoAuAu ?? false,
    criterioCalifFinanRentabilidad: values.criterioCalifFinanRentabilidadAuAu ?? false,
    criterioCalifFinanEndeudamiento: values.criterioCalifFinanEndeudamientoAuAu ?? false,
    puntuacionMinimaCalifFinanciera: values.puntuacionMinimaCalifFinancieraAuAu,
  };

  if (values.criterioCalifFinanDescapitalAuAu === true) {
    data.puntajeMaximoDescapital = values.puntajeMaximoDescapitalAuAu;
  }
  if (values.criterioCalifFinanSolvenciaAuAu === true) {
    data.rangosSolvencia = mapRangosToApi(values.solvencia);
  }
  if (values.criterioCalifFinanRotacionAuAu === true) {
    data.rangosRotacion = mapRangosToApi(values.rotacion);
  }
  if (values.criterioCalifFinanRendimientoAuAu === true) {
    data.rangosRendimiento = mapRangosToApi(values.rendimiento);
  }
  if (values.criterioCalifFinanRentabilidadAuAu === true) {
    data.rangosRentabilidad = mapRangosToApi(values.rentabilidad);
  }
  if (values.criterioCalifFinanEndeudamientoAuAu === true) {
    data.rangosEndeudamiento = mapRangosToApi(values.endeudamiento);
  }

  return { data };
}

function mapRangoTecnicoFromApi(rango: CriterioTecnicoRangoApi, index: number): RangoTecnico {
  return {
    id: rango.id ?? createId(),
    rangoCriterioCalificacionTecnicaAuAu:
      rango.rangoCriterioCalificacionTecnicaAuAu ?? rango.descripcion ?? "",
    puntuacionRangoCriterioCalificacionTecnicaAuAu:
      rango.puntuacionRangoCriterioCalificacionTecnicaAuAu ?? rango.puntaje ?? 0,
  };
}

function mapCriterioTecnicoFromApi(criterio: CriterioTecnicoApi, index: number): CriterioTecnico {
  return {
    id: criterio.id ?? createId(),
    criterioCalificacionTecnicaAuAu:
      criterio.criterioCalificacionTecnicaAuAu ?? criterio.nombre ?? "",
    puntuacionCriterioCalificacionTecnicaAuAu:
      criterio.puntuacionCriterioCalificacionTecnicaAuAu ?? criterio.puntuacion ?? 0,
    descCriterioCalificacionTecnicaAuAu:
      criterio.descCriterioCalificacionTecnicaAuAu ?? criterio.descripcion ?? "",
    rangos: (criterio.rangos ?? []).map(mapRangoTecnicoFromApi),
  };
}

export function calificacionTecnicaFromApi(
  data?: CalificacionTecnicaApiData | Record<string, unknown>
): CalificacionTecnicaFormValues {
  const defaults = createDefaultCalificacionTecnicaValues();
  if (!data || typeof data !== "object") return defaults;

  const d = data as CalificacionTecnicaApiData;

  return {
    criterios: (d.criterios ?? []).map(mapCriterioTecnicoFromApi),
    puntuacionMinimaCalifTecnicaAuAu:
      d.puntuacionMinimaCalifTecnica ??
      d.puntuacionMinimaCalifTecnicaAuAu ??
      defaults.puntuacionMinimaCalifTecnicaAuAu,
  };
}

export function calificacionTecnicaFromResponse(
  response: Record<string, unknown> | null | undefined
): CalificacionTecnicaFormValues {
  return calificacionTecnicaFromApi(
    getMicromoduloJsonbPayload(response) as CalificacionTecnicaApiData | undefined
  );
}

export function calificacionTecnicaToApi(values: CalificacionTecnicaFormValues): {
  data: CalificacionTecnicaApiData;
} {
  return {
    data: {
      criterios: values.criterios.map((c) => {
        const item: CriterioTecnicoApi = {
          id: c.id,
          nombre: c.criterioCalificacionTecnicaAuAu,
          puntuacion: c.puntuacionCriterioCalificacionTecnicaAuAu,
          descripcion: c.descCriterioCalificacionTecnicaAuAu,
          rangos: c.rangos.map((r) => {
            const rango: CriterioTecnicoRangoApi = {
              descripcion: r.rangoCriterioCalificacionTecnicaAuAu,
              puntaje: r.puntuacionRangoCriterioCalificacionTecnicaAuAu,
            };
            if (r.id && !r.id.startsWith("rango-")) rango.id = r.id;
            return rango;
          }),
        };
        return item;
      }),
      puntuacionMinimaCalifTecnica: values.puntuacionMinimaCalifTecnicaAuAu,
    },
  };
}

function mapEvalRangoTecnicaFromApi(
  rango: Record<string, unknown>,
  index: number
): RangoEvalTecnica {
  return {
    id: (rango.id as string) ?? createId(),
    rangoCriterioEvaluacionTecnicaAuAu:
      (rango.rangoCriterioEvaluacionTecnicaAuAu as string) ?? (rango.descripcion as string) ?? "",
    puntuacionRangoCriterioEvaluacionTecnicaAuAu:
      (rango.puntuacionRangoCriterioEvaluacionTecnicaAuAu as number) ??
      (rango.puntaje as number) ??
      0,
  };
}

function mapEvalCriterioTecnicaFromApi(
  criterio: Record<string, unknown>,
  index: number
): CriterioEvalTecnica {
  return {
    id: (criterio.id as string) ?? createId(),
    criterioEvaluacionTecnicaAuAu:
      (criterio.criterioEvaluacionTecnicaAuAu as string) ?? (criterio.nombre as string) ?? "",
    puntuacionCriterioEvaluacionTecnicaAuAu:
      (criterio.puntuacionCriterioEvaluacionTecnicaAuAu as number) ??
      (criterio.puntuacion as number) ??
      0,
    descCriterioEvaluacionTecnicaAuAu:
      (criterio.descCriterioEvaluacionTecnicaAuAu as string) ??
      (criterio.descripcion as string) ??
      "",
    rangos: ((criterio.rangos as Record<string, unknown>[]) ?? []).map(mapEvalRangoTecnicaFromApi),
  };
}

function mapEvalRangoEconomicaFromApi(
  rango: Record<string, unknown>,
  index: number
): RangoEvalEconomica {
  return {
    id: (rango.id as string) ?? createId(),
    rangoCriterioEvaluacionEconomicaAuAu:
      (rango.rangoCriterioEvaluacionEconomicaAuAu as string) ?? (rango.descripcion as string) ?? "",
    puntuacionRangoCriterioEvaluacionEconomicaAuAu:
      (rango.puntuacionRangoCriterioEvaluacionEconomicaAuAu as number) ??
      (rango.puntaje as number) ??
      0,
  };
}

function mapEvalCriterioEconomicaFromApi(
  criterio: Record<string, unknown>,
  index: number
): CriterioEvalEconomica {
  return {
    id: (criterio.id as string) ?? createId(),
    criterioEvaluacionEconomicaAuAu:
      (criterio.criterioEvaluacionEconomicaAuAu as string) ?? (criterio.nombre as string) ?? "",
    puntuacionCriterioEvaluacionEconomicaAuAu:
      (criterio.puntuacionCriterioEvaluacionEconomicaAuAu as number) ??
      (criterio.puntuacion as number) ??
      0,
    descCriterioEvaluacionEconomicaAuAu:
      (criterio.descCriterioEvaluacionEconomicaAuAu as string) ??
      (criterio.descripcion as string) ??
      "",
    rangos: ((criterio.rangos as Record<string, unknown>[]) ?? []).map(
      mapEvalRangoEconomicaFromApi
    ),
  };
}

export function evaluacionTecnicaEconomicaFromApi(
  data?: EvaluacionTecnicaEconomicaApiData | Record<string, unknown>
): EvaluacionTecnicaEconomicaFormValues {
  const defaults = createDefaultEvaluacionTecnicaEconomicaValues();
  if (!data || typeof data !== "object") return defaults;

  const d = data as EvaluacionTecnicaEconomicaApiData;
  const tecnica = (d.tecnica ?? {}) as Record<string, unknown>;
  const economica = (d.economica ?? {}) as Record<string, unknown>;

  return {
    criteriosTecnicos: ((tecnica.criterios as Record<string, unknown>[]) ?? []).map(
      mapEvalCriterioTecnicaFromApi
    ),
    puntuacionMinimaEvaluacionTecnicaAuAu:
      (tecnica.puntuacionMinima as number) ??
      (tecnica.puntuacionMinimaEvaluacionTecnicaAuAu as number) ??
      defaults.puntuacionMinimaEvaluacionTecnicaAuAu,
    criteriosEconomicos: ((economica.criterios as Record<string, unknown>[]) ?? []).map(
      mapEvalCriterioEconomicaFromApi
    ),
    puntuacionMinimaEvaluacionEconomicaAuAu:
      (economica.puntuacionMinima as number) ??
      (economica.puntuacionMinimaEvaluacionEconomicaAuAu as number) ??
      defaults.puntuacionMinimaEvaluacionEconomicaAuAu,
  };
}

export function evaluacionTecnicaEconomicaFromResponse(
  response: Record<string, unknown> | null | undefined
): EvaluacionTecnicaEconomicaFormValues {
  return evaluacionTecnicaEconomicaFromApi(
    getMicromoduloJsonbPayload(response) as EvaluacionTecnicaEconomicaApiData | undefined
  );
}

export function evaluacionTecnicaEconomicaToApi(values: EvaluacionTecnicaEconomicaFormValues): {
  data: EvaluacionTecnicaEconomicaApiData;
} {
  return {
    data: {
      tecnica: {
        criterios: values.criteriosTecnicos.map((c) => ({
          id: c.id,
          nombre: c.criterioEvaluacionTecnicaAuAu,
          puntuacion: c.puntuacionCriterioEvaluacionTecnicaAuAu,
          descripcion: c.descCriterioEvaluacionTecnicaAuAu,
          rangos: c.rangos.map((r) => {
            const rango: Record<string, unknown> = {
              descripcion: r.rangoCriterioEvaluacionTecnicaAuAu,
              puntaje: r.puntuacionRangoCriterioEvaluacionTecnicaAuAu,
            };
            if (r.id) rango.id = r.id;
            return rango;
          }),
        })),
        puntuacionMinima: values.puntuacionMinimaEvaluacionTecnicaAuAu,
      },
      economica: {
        criterios: values.criteriosEconomicos.map((c) => ({
          id: c.id,
          nombre: c.criterioEvaluacionEconomicaAuAu,
          puntuacion: c.puntuacionCriterioEvaluacionEconomicaAuAu,
          descripcion: c.descCriterioEvaluacionEconomicaAuAu,
          rangos: c.rangos.map((r) => {
            const rango: Record<string, unknown> = {
              descripcion: r.rangoCriterioEvaluacionEconomicaAuAu,
              puntaje: r.puntuacionRangoCriterioEvaluacionEconomicaAuAu,
            };
            if (r.id) rango.id = r.id;
            return rango;
          }),
        })),
        puntuacionMinima: values.puntuacionMinimaEvaluacionEconomicaAuAu,
      },
    },
  };
}

function archivoFromUrl(url: string, fileName = "modelo.pdf"): RecaudoArchivoMeta {
  return {
    fileName,
    fileSize: 0,
    mimeType: "application/pdf",
    uploadedAt: new Date().toISOString(),
    previewUrl: url,
  };
}

function compactBooleanMap(
  map: Record<string, boolean | undefined> | null | undefined
): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  if (!map || typeof map !== "object") return out;
  for (const [key, value] of Object.entries(map)) {
    if (value === true || value === false) out[key] = value;
  }
  return out;
}

function parseBooleanMap(value: unknown): Record<string, boolean> {
  if (!value) return {};
  if (typeof value === "string") {
    try {
      return parseBooleanMap(JSON.parse(value) as unknown);
    } catch {
      return {};
    }
  }
  if (typeof value !== "object" || Array.isArray(value)) return {};
  return compactBooleanMap(value as Record<string, boolean | undefined>);
}

function parsePersonalizadosLegal(value: unknown): RecaudoPersonalizadoItem[] {
  let raw: unknown = value;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw) as unknown;
    } catch {
      return [];
    }
  }
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item, index) => {
      if (!item || typeof item !== "object") return null;
      const p = item as Record<string, unknown>;
      const id = typeof p.id === "string" && p.id ? p.id : `personalizado-${index + 1}`;
      const sobre = p.sobre === 2 ? 2 : 1;
      const descripcion = typeof p.descripcion === "string" ? p.descripcion : "";
      if (!descripcion.trim()) return null;
      const archivoModeloUrl =
        typeof p.archivoModeloUrl === "string" && p.archivoModeloUrl.startsWith("http")
          ? p.archivoModeloUrl
          : undefined;

      return {
        id,
        sobre: sobre as 1 | 2,
        descripcion,
        tieneModelo: p.tieneModelo === true,
        exigido: p.exigido !== false,
        archivo: archivoModeloUrl ? archivoFromUrl(archivoModeloUrl) : null,
      } satisfies RecaudoPersonalizadoItem;
    })
    .filter((item): item is RecaudoPersonalizadoItem => item !== null);
}

function unwrapCalificacionLegalPayload(
  data?: CalificacionLegalApiData | Record<string, unknown> | null
): Record<string, unknown> | null {
  if (!data) return null;
  let payload = data as Record<string, unknown>;

  if (typeof payload.data === "string") {
    const parsed = coerceObjectRecord(payload.data);
    if (parsed) payload = parsed;
  } else if (
    payload.data &&
    typeof payload.data === "object" &&
    !Array.isArray(payload.data) &&
    payload.exigidos === undefined &&
    payload.sustitutos === undefined &&
    payload.personalizados === undefined
  ) {
    payload = payload.data as Record<string, unknown>;
  }

  return payload;
}

export function calificacionLegalFromApi(
  data?: CalificacionLegalApiData | Record<string, unknown> | null
): CalificacionLegalStoredForm {
  const base = createEmptyCalificacionLegalForm();
  const payload = unwrapCalificacionLegalPayload(data);
  if (!payload) return base;

  const exigidosApi = parseBooleanMap(payload.exigidos);
  const sustitutosApi = parseBooleanMap(payload.sustitutos);

  return {
    ...base,
    exigidos: { ...base.exigidos, ...exigidosApi },
    sustitutos: { ...base.sustitutos, ...sustitutosApi },
    personalizados: parsePersonalizadosLegal(payload.personalizados),
    // Los personalizados ya vienen en la lista; no dejar la pregunta pendiente.
    indOtroSobre1: false,
    indOtroSobre2: false,
    status: "draft",
  };
}

/** Extrae el payload desde GET `{ modulo, estado, datos }`. */
export function calificacionLegalFromResponse(
  response: Record<string, unknown> | null | undefined
): CalificacionLegalStoredForm {
  return calificacionLegalFromApi(getMicromoduloJsonbPayload(response));
}

export function calificacionLegalToApi(form: CalificacionLegalStoredForm): {
  data: CalificacionLegalApiData;
} {
  const personalizados = form.personalizados.map((p) => {
    const item: NonNullable<CalificacionLegalApiData["personalizados"]>[number] = {
      id: p.id,
      sobre: p.sobre,
      descripcion: p.descripcion,
      exigido: p.exigido,
      tieneModelo: p.tieneModelo,
    };
    if (p.tieneModelo && p.archivo?.previewUrl?.startsWith("http")) {
      item.archivoModeloUrl = p.archivo.previewUrl;
    }
    return item;
  });

  return {
    data: {
      exigidos: compactBooleanMap(form.exigidos),
      sustitutos: compactBooleanMap(form.sustitutos),
      personalizados,
    },
  };
}

export function modeloContratoFromApi(
  data?: ModeloContratoApiData | Record<string, unknown> | null
): ClausulaEnModelo[] {
  if (!data) return [];

  let payload = data as Record<string, unknown>;

  // Tolera envoltorio extra { data: { clauses } } o JSON stringificado.
  if (typeof payload.data === "string") {
    const parsed = coerceObjectRecord(payload.data);
    if (parsed) payload = parsed;
  } else if (
    payload.data &&
    typeof payload.data === "object" &&
    !Array.isArray(payload.data) &&
    payload.clauses === undefined
  ) {
    payload = payload.data as Record<string, unknown>;
  }

  let rawClauses: unknown = payload.clauses;
  if (typeof rawClauses === "string") {
    try {
      rawClauses = JSON.parse(rawClauses) as unknown;
    } catch {
      return [];
    }
  }

  if (!Array.isArray(rawClauses) || rawClauses.length === 0) return [];

  return rawClauses.map((raw, index) => {
    const clause = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
    const instanceId =
      typeof clause.instanceId === "string" && clause.instanceId
        ? clause.instanceId
        : `clause-${index + 1}`;
    const kind = clause.kind === "facultativa" ? "facultativa" : "preceptiva";
    const origen =
      clause.origen === "biblioteca" || clause.origen === "custom" || clause.origen === "generica"
        ? clause.origen
        : "custom";

    return {
      id: typeof clause.id === "string" && clause.id ? clause.id : instanceId,
      instanceId,
      order: parseClausulaOrdinalOrder(clause.order, index + 1),
      titulo: typeof clause.titulo === "string" ? clause.titulo : "",
      cuerpoHtml: typeof clause.cuerpoHtml === "string" ? clause.cuerpoHtml : "",
      kind,
      origen,
      codigo: typeof clause.codigo === "string" ? clause.codigo : undefined,
      basamentoLegal: typeof clause.basamentoLegal === "string" ? clause.basamentoLegal : undefined,
      variablesSugeridas: Array.isArray(clause.variablesSugeridas)
        ? clause.variablesSugeridas.filter((v): v is string => typeof v === "string")
        : undefined,
    };
  });
}

/** Extrae cláusulas desde el GET `{ modulo, estado, datos }`. */
export function modeloContratoClausesFromResponse(
  response: Record<string, unknown> | null | undefined
): ClausulaEnModelo[] {
  return modeloContratoFromApi(getMicromoduloJsonbPayload(response));
}

export function modeloContratoToApi(clauses: ClausulaEnModelo[]): { data: ModeloContratoApiData } {
  const sorted = [...clauses].sort((a, b) => a.order - b.order);

  return {
    data: {
      clauses: sorted.map((c, index) => {
        const item: NonNullable<ModeloContratoApiData["clauses"]>[number] = {
          instanceId: c.instanceId,
          order: clausulaOrdinalApiValue(index + 1),
          titulo: c.titulo,
          cuerpoHtml: c.cuerpoHtml,
          kind: c.kind,
          origen: c.origen,
        };
        if (c.id) item.id = c.id;
        if (c.codigo) item.codigo = c.codigo;
        if (c.basamentoLegal) item.basamentoLegal = c.basamentoLegal;
        if (c.variablesSugeridas?.length) item.variablesSugeridas = c.variablesSugeridas;
        return item;
      }),
    },
  };
}

export function especificacionesTecnicasFromApi(
  response: EspecificacionesTecnicasApiResponse | null | undefined
): EspecificacionesTecnicasStoredMeta | null {
  if (!response) return null;

  const archivo = response.archivo ?? null;
  const fileName =
    archivo?.fileName ?? archivo?.nombreArchivo ?? response.fileName ?? response.nombreArchivo;
  const url = archivo?.url ?? archivo?.archivoUrl ?? response.url ?? response.archivoUrl;
  const mimeType = archivo?.mimeType ?? response.mimeType ?? "application/octet-stream";
  const fileSize =
    archivo?.sizeBytes ?? archivo?.tamanoBytes ?? response.sizeBytes ?? response.tamanoBytes ?? 0;
  const uploadedAt =
    archivo?.uploadedAt ??
    archivo?.createdAt ??
    response.uploadedAt ??
    response.createdAt ??
    new Date().toISOString();

  if (!fileName && !url) return null;

  return {
    fileName: fileName ?? "documento",
    fileSize,
    mimeType,
    uploadedAt,
    url,
  };
}

export function cuentaBancariaFormToApi(
  values: Pick<
    CuentaBancariaEnte,
    | "bancoPagoPliego"
    | "cuentaPagoPliego"
    | "titularPagoPliego"
    | "rifPagoPliego"
    | "tipoCuentaPagoPliego"
  >
): CrearCuentaBancariaEntePayload {
  return {
    bancoPago: values.bancoPagoPliego,
    numeroCuenta: numeroCuentaDigitsOnly(values.cuentaPagoPliego),
    titularPago: values.titularPagoPliego,
    rifPago: values.rifPagoPliego,
    tipoCuenta: values.tipoCuentaPagoPliego,
  };
}

export function cuentaBancariaFromApi(api: CuentaBancariaEnteApi): CuentaBancariaEnte {
  const legacy = api as CuentaBancariaEnteApi & {
    bancoPagoPliego?: string;
    cuentaPagoPliego?: string;
    titularPagoPliego?: string;
    rifPagoPliego?: string;
    tipoCuentaPagoPliego?: string;
  };

  const tipoRaw = api.tipoCuenta ?? legacy.tipoCuentaPagoPliego ?? "corriente";

  const rawCuenta = api.numeroCuenta ?? legacy.cuentaPagoPliego ?? "";

  return {
    id: api.id,
    bancoPagoPliego: api.bancoPago ?? legacy.bancoPagoPliego ?? "",
    cuentaPagoPliego: formatNumeroCuentaDisplay(rawCuenta),
    titularPagoPliego: api.titularPago ?? legacy.titularPagoPliego ?? "",
    rifPagoPliego: api.rifPago ?? legacy.rifPagoPliego ?? "",
    tipoCuentaPagoPliego: tipoRaw === "ahorro" ? "ahorro" : "corriente",
    createdAt: api.createdAt ?? new Date().toISOString(),
  };
}

export function isMicromoduloCompletado(estado?: EstadoMicromoduloApi): boolean {
  return estado === "COMPLETADO";
}

export async function ensureMicromoduloEditable(
  expedienteId: string,
  modulo: MicromoduloApiSlug,
  estado?: EstadoMicromoduloApi
): Promise<void> {
  if (estado === "COMPLETADO") {
    const { reabrirMicromodulo } = await import("@/services/fase1MicromodulosService");
    await reabrirMicromodulo(expedienteId, modulo);
  }
}

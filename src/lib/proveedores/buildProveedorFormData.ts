import type { NuevoProveedorFormValues } from "@/lib/schemas/nuevoProveedorSchema";
import {
  DOC_KEYS_BY_PERSONA,
  TIPO_PERSONA,
  extractCedulaDigits,
  extractCedulaWithPrefix,
  isTipoPersona,
  mapFormaJuridicaToApi,
} from "./proveedor.constants";

export type ProveedorDocumentoLocal = {
  tipoDoc: string;
  file: File;
  observaciones?: string;
};

export type BuildProveedorFormDataInput = {
  values: NuevoProveedorFormValues;
  documentos: ProveedorDocumentoLocal[];
  obsMap: Record<string, string>;
  mode: "create" | "edit";
  initialValues?: NuevoProveedorFormValues;
  initialObsMap?: Record<string, string>;
};

function hasText(value?: string | null): value is string {
  return Boolean(value && String(value).trim());
}

function appendIfPresent(formData: FormData, key: string, value?: string | null) {
  if (!hasText(value)) return;
  formData.append(key, String(value).trim());
}

function appendBooleanIfSet(formData: FormData, key: string, siNo?: "Si" | "No") {
  if (siNo === undefined) return;
  formData.append(key, siNo === "Si" ? "true" : "false");
}

function normalizeScalar(value?: string): string {
  return (value ?? "").trim();
}

function valuesDiffer(current?: string, initial?: string): boolean {
  return normalizeScalar(current) !== normalizeScalar(initial);
}

function obsDiffer(
  docKey: string,
  obsMap: Record<string, string>,
  initialObsMap?: Record<string, string>
): boolean {
  const current = normalizeScalar(obsMap[docKey]);
  const initial = normalizeScalar(initialObsMap?.[docKey]);
  return current !== initial;
}

function formatFechaIso(value?: string): string | undefined {
  if (!hasText(value)) return undefined;
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return trimmed;
  return parsed.toISOString().slice(0, 10);
}

function appendScalarField(
  formData: FormData,
  key: string,
  value: string | undefined,
  mode: "create" | "edit",
  initialValue?: string
) {
  if (mode === "edit") {
    if (!valuesDiffer(value, initialValue)) return;
    if (!hasText(value)) return;
    formData.append(key, value.trim());
    return;
  }
  appendIfPresent(formData, key, value);
}

function appendBooleanField(
  formData: FormData,
  key: string,
  siNo: "Si" | "No" | undefined,
  mode: "create" | "edit",
  initialSiNo?: "Si" | "No"
) {
  if (mode === "edit") {
    if (siNo === initialSiNo || siNo === undefined) return;
    appendBooleanIfSet(formData, key, siNo);
    return;
  }
  appendBooleanIfSet(formData, key, siNo);
}

function appendDocuments(
  formData: FormData,
  tipoPersona: string,
  documentos: ProveedorDocumentoLocal[],
  obsMap: Record<string, string>,
  mode: "create" | "edit",
  initialObsMap?: Record<string, string>
) {
  if (!isTipoPersona(tipoPersona)) return;

  const docKeys = DOC_KEYS_BY_PERSONA[tipoPersona];
  const docsByKey = new Map(documentos.map((d) => [d.tipoDoc, d]));

  for (const docKey of docKeys) {
    const file = docsByKey.get(docKey)?.file;
    const obsText = normalizeScalar(obsMap[docKey]);

    if (file) {
      formData.append(docKey, file);
    }

    if (mode === "create") {
      if (obsText) {
        formData.append(`obs_${docKey}`, obsText);
      }
    } else if (obsDiffer(docKey, obsMap, initialObsMap) && obsText) {
      formData.append(`obs_${docKey}`, obsText);
    }
  }
}

function appendRequiredCreate(
  formData: FormData,
  values: NuevoProveedorFormValues,
  isJuridica: boolean,
  isNatural: boolean,
  isOrgano: boolean
) {
  formData.append("correo", values.correo);
  formData.append("nombre", values.nombre);
  formData.append("rif", values.rif);
  formData.append("tipoPersona", values.tipoPersona);

  if (isJuridica && hasText(values.formaJuridica)) {
    formData.append("tipoEntidadJuridica", mapFormaJuridicaToApi(values.formaJuridica));
  }

  if (isNatural) {
    const cedulaConPrefijo = extractCedulaWithPrefix(values.cedulaNatural);
    if (cedulaConPrefijo) {
      formData.append("cedulaNaturalProveedor", cedulaConPrefijo);
    }
  }

  if (isOrgano) {
    appendIfPresent(formData, "nombreAutoridadProveedor", values.nombreAutoridad);
    const cedulaAutoridad = extractCedulaWithPrefix(values.cedulaAutoridad);
    if (cedulaAutoridad) {
      formData.append("cedulaAutoridadProveedor", cedulaAutoridad);
    }
  }
}

function appendOptionalScalars(
  formData: FormData,
  values: NuevoProveedorFormValues,
  mode: "create" | "edit",
  initial?: NuevoProveedorFormValues,
  flags?: { isJuridica: boolean; isNatural: boolean; isOrgano: boolean }
) {
  const isJuridica = flags?.isJuridica ?? false;
  const isNatural = flags?.isNatural ?? false;
  const isOrgano = flags?.isOrgano ?? false;

  const scalarFields: Array<{
    key: string;
    value?: string;
    initial?: string;
    applies: boolean;
    transform?: (v: string) => string;
  }> = [
    { key: "estado", value: values.estado, initial: initial?.estado, applies: true },
    { key: "municipio", value: values.municipio, initial: initial?.municipio, applies: true },
    { key: "parroquia", value: values.parroquia, initial: initial?.parroquia, applies: true },
    {
      key: "direccionFiscal",
      value: values.direccionFiscal,
      initial: initial?.direccionFiscal,
      applies: true,
    },
    { key: "telefono", value: values.telefono, initial: initial?.telefono, applies: true },
    {
      key: "actividadComercial",
      value: values.actividadPrincipal,
      initial: initial?.actividadPrincipal,
      applies: !isOrgano,
    },
    {
      key: "areaEspecialidad",
      value: values.areaEspecialidad,
      initial: initial?.areaEspecialidad,
      applies: true,
    },
    {
      key: "nivelContratacion",
      value: values.nivelContratacion,
      initial: initial?.nivelContratacion,
      applies: true,
    },
    {
      key: "anosExperiencia",
      value: values.anosExperiencia,
      initial: initial?.anosExperiencia,
      applies: !isOrgano,
    },
    {
      key: "datosRegistroMercantil",
      value: values.datosRegistroMercantil,
      initial: initial?.datosRegistroMercantil,
      applies: isJuridica,
    },
    {
      key: "nombreRepLegal",
      value: values.representanteNombre,
      initial: initial?.representanteNombre,
      applies: isJuridica,
    },
    {
      key: "cedulaRepLegal",
      value: isJuridica ? extractCedulaWithPrefix(values.representanteCedula) : undefined,
      initial: isJuridica ? extractCedulaWithPrefix(initial?.representanteCedula) : undefined,
      applies: isJuridica,
    },
    {
      key: "fechaEstadoFinanciero",
      value: formatFechaIso(values.fechaEstadoFinanciero),
      initial: formatFechaIso(initial?.fechaEstadoFinanciero),
      applies: isJuridica,
    },
    {
      key: "patrimonioReportado",
      value: values.patrimonioNeto,
      initial: initial?.patrimonioNeto,
      applies: isJuridica,
    },
    {
      key: "datosDesignacionAutoridadProveedor",
      value: values.datosDesignacionAutoridad,
      initial: initial?.datosDesignacionAutoridad,
      applies: isOrgano,
    },
  ];

  for (const field of scalarFields) {
    if (!field.applies) continue;
    appendScalarField(formData, field.key, field.value, mode, field.initial);
  }

  if (isJuridica || isNatural) {
    appendBooleanField(formData, "registroRnc", values.rnc, mode, initial?.rnc);
    appendBooleanField(formData, "islrProveedor", values.islr, mode, initial?.islr);
  }

  if (mode === "edit" && isJuridica && valuesDiffer(values.formaJuridica, initial?.formaJuridica)) {
    if (hasText(values.formaJuridica)) {
      formData.append("tipoEntidadJuridica", mapFormaJuridicaToApi(values.formaJuridica));
    }
  }

  if (mode === "edit" && isNatural) {
    const cedula = extractCedulaWithPrefix(values.cedulaNatural);
    const initialCedula = extractCedulaWithPrefix(initial?.cedulaNatural);
    if (cedula && cedula !== initialCedula) {
      formData.append("cedulaNaturalProveedor", cedula);
    }
  }

  if (mode === "edit" && isOrgano) {
    if (valuesDiffer(values.nombreAutoridad, initial?.nombreAutoridad)) {
      appendIfPresent(formData, "nombreAutoridadProveedor", values.nombreAutoridad);
    }
    const cedula = extractCedulaWithPrefix(values.cedulaAutoridad);
    const initialCedula = extractCedulaWithPrefix(initial?.cedulaAutoridad);
    if (cedula && cedula !== initialCedula) {
      formData.append("cedulaAutoridadProveedor", cedula);
    }
  }
}

export function buildProveedorFormData({
  values,
  documentos,
  obsMap,
  mode,
  initialValues,
  initialObsMap,
}: BuildProveedorFormDataInput): FormData {
  const formData = new FormData();
  const tipoPersona = values.tipoPersona;
  const isJuridica = tipoPersona === TIPO_PERSONA.JURIDICA;
  const isNatural = tipoPersona === TIPO_PERSONA.NATURAL;
  const isOrgano = tipoPersona === TIPO_PERSONA.ORGANO_ENTE_PUBLICO;
  const flags = { isJuridica, isNatural, isOrgano };

  if (mode === "create") {
    appendRequiredCreate(formData, values, isJuridica, isNatural, isOrgano);
    appendOptionalScalars(formData, values, mode, undefined, flags);
    appendDocuments(formData, tipoPersona, documentos, obsMap, mode);
    return formData;
  }

  // PATCH: solo campos modificados + archivos nuevos
  const coreFields: Array<keyof NuevoProveedorFormValues> = [
    "correo",
    "nombre",
    "rif",
    "tipoPersona",
  ];

  for (const field of coreFields) {
    const current = values[field] as string | undefined;
    const initial = initialValues?.[field] as string | undefined;
    if (valuesDiffer(current, initial) && hasText(current)) {
      formData.append(field, current.trim());
    }
  }

  appendOptionalScalars(formData, values, mode, initialValues, flags);
  appendDocuments(formData, tipoPersona, documentos, obsMap, mode, initialObsMap);

  return formData;
}

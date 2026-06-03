export type ProveedorDocKey =
  | "doc_acta_constitutiva"
  | "doc_rif"
  | "doc_cedula"
  | "doc_rnc"
  | "doc_solvencia_laboral"
  | "doc_licencia_municipal"
  | "doc_islr"
  | "doc_curriculum"
  | "doc_titulo"
  | "doc_resolucion"
  | "doc_gaceta";

export const TIPO_PERSONA = {
  JURIDICA: "JURIDICA",
  NATURAL: "NATURAL",
  ORGANO_ENTE_PUBLICO: "ORGANO_ENTE_PUBLICO",
} as const;

export type TipoPersona = (typeof TIPO_PERSONA)[keyof typeof TIPO_PERSONA];

/** Claves doc_* que aplican por tipo de persona (subset del wizard). */
export const DOC_KEYS_BY_PERSONA: Record<TipoPersona, readonly ProveedorDocKey[]> = {
  [TIPO_PERSONA.JURIDICA]: [
    "doc_acta_constitutiva",
    "doc_rif",
    "doc_cedula",
    "doc_rnc",
    "doc_solvencia_laboral",
    "doc_licencia_municipal",
    "doc_islr",
  ],
  [TIPO_PERSONA.NATURAL]: [
    "doc_rif",
    "doc_cedula",
    "doc_rnc",
    "doc_curriculum",
    "doc_titulo",
    "doc_islr",
  ],
  [TIPO_PERSONA.ORGANO_ENTE_PUBLICO]: ["doc_rif", "doc_cedula", "doc_resolucion", "doc_gaceta"],
};

export const TIPO_PERSONA_LABELS: Record<string, string> = {
  [TIPO_PERSONA.JURIDICA]: "Persona Jurídica",
  [TIPO_PERSONA.NATURAL]: "Persona Natural",
  [TIPO_PERSONA.ORGANO_ENTE_PUBLICO]: "Órganos y Entes de la Administración Pública",
  /** Compatibilidad con registros antiguos del API */
  ADMINISTRACION_PUBLICA: "Órganos y Entes de la Administración Pública",
};

export const FORMA_JURIDICA_LABELS: Record<string, string> = {
  COMPANIA_ANONIMA: "Compañía Anónima (C.A)",
  ASOCIACION_CIVIL: "Asociación Civil",
  SRL: "Sociedades de Responsabilidad Limitada (S.R.L.)",
  FUNDACION: "Fundaciones",
  COOPERATIVA: "Cooperativas",
  PYME: "Pymes",
  SOCIEDAD_CIVIL: "Sociedad Civil",
};

export function getTipoPersonaFromRifPrefix(prefix: string): TipoPersona | "" {
  if (prefix === "J") return TIPO_PERSONA.JURIDICA;
  if (prefix === "G") return TIPO_PERSONA.ORGANO_ENTE_PUBLICO;
  if (prefix === "V") return TIPO_PERSONA.NATURAL;
  return "";
}

/** Normaliza tipoPersona del API (legacy → valor actual). */
export function normalizeTipoPersonaFromApi(value?: string): string {
  if (!value) return "";
  if (value === "ADMINISTRACION_PUBLICA") return TIPO_PERSONA.ORGANO_ENTE_PUBLICO;
  return value;
}

export function normalizeFormaJuridica(val: string): string {
  if (!val) return "";
  const v = val.toUpperCase();
  if (v === "COOPERATIVA") return "COOPERATIVA";
  if (v === "PYME") return "PYME";
  if (v === "COMPANIA_ANONIMA" || v === "C.A." || v === "C.A" || v.includes("ANONIMA"))
    return "COMPANIA_ANONIMA";
  if (v === "ASOCIACION_CIVIL") return "ASOCIACION_CIVIL";
  if (v === "SOCIEDAD_CIVIL") return "SOCIEDAD_CIVIL";
  if (v === "SRL" || v.includes("LIMITADA")) return "SRL";
  if (v === "FUNDACION") return "FUNDACION";
  return val;
}

/** Extrae solo dígitos de una cédula (V-12345678 → 12345678). */
export function extractCedulaDigits(cedula?: string): string {
  if (!cedula?.trim()) return "";
  const digits = cedula.replace(/\D/g, "");
  return digits || "";
}

/**
 * Extrae la cédula conservando la letra prefija (V o E).
 * Formatos aceptados: "V-12345678", "V12345678", "12345678" (defaultTipo aplica si no hay letra).
 * Devuelve "V-12345678" o "E-12345678".
 */
export function extractCedulaWithPrefix(cedula?: string, defaultTipo: "V" | "E" = "V"): string {
  if (!cedula?.trim()) return "";
  const str = cedula.trim();
  // Si ya viene en formato X-digitos, lo devolvemos normalizado
  const withDash = /^([VvEe])-?(\d+)$/.exec(str.replace(/[^VvEe\d-]/g, ""));
  if (withDash) {
    return `${withDash[1].toUpperCase()}-${withDash[2]}`;
  }
  // Solo dígitos: usamos el defaultTipo
  const digits = str.replace(/\D/g, "");
  if (!digits) return "";
  return `${defaultTipo}-${digits}`;
}

/** Formatea cédula numérica del API para UI (12345678 → V-12345678). */
export function formatCedulaFromApi(value?: string | number | null, defaultTipo = "V"): string {
  if (value === null || value === undefined || value === "") return "";
  const str = String(value).trim();
  if (str.includes("-")) return str;
  const digits = str.replace(/\D/g, "");
  if (!digits) return "";
  return `${defaultTipo}-${digits}`;
}

/** Mapea tipoDocumento del GET al doc_* del formulario si difiere. */
export function normalizeDocKeyFromApi(tipo?: string): string {
  if (!tipo) return "";
  const t = tipo.trim();
  if (t.startsWith("doc_")) return t;
  const legacyMap: Record<string, ProveedorDocKey> = {
    REGISTRO_MERCANTIL: "doc_acta_constitutiva",
    RIF: "doc_rif",
    CEDULA: "doc_cedula",
    RNC: "doc_rnc",
    CERTIFICADO_SOLVENCIA_LABORAL: "doc_solvencia_laboral",
    LICENCIA_MUNICIPAL: "doc_licencia_municipal",
    ISLR: "doc_islr",
    CURRICULUM: "doc_curriculum",
    TITULO_UNIVERSITARIO: "doc_titulo",
    RESOLUCION_DESIGNACION: "doc_resolucion",
    GACETA_CREACION: "doc_gaceta",
  };
  return legacyMap[t] ?? `doc_${t.toLowerCase()}`;
}

export function isTipoPersona(value: string): value is TipoPersona {
  return (
    value === TIPO_PERSONA.JURIDICA ||
    value === TIPO_PERSONA.NATURAL ||
    value === TIPO_PERSONA.ORGANO_ENTE_PUBLICO
  );
}

/** Envía enum al API (underscores; el backend acepta COMPANIA_ANONIMA). */
export function mapFormaJuridicaToApi(value: string): string {
  return value.trim();
}

export function mapFormaJuridicaFromApi(value: string): string {
  return normalizeFormaJuridica(value);
}

const ORDINALES_ES = [
  "PRIMERA",
  "SEGUNDA",
  "TERCERA",
  "CUARTA",
  "QUINTA",
  "SEXTA",
  "SÉPTIMA",
  "OCTAVA",
  "NOVENA",
  "DÉCIMA",
  "DÉCIMA PRIMERA",
  "DÉCIMA SEGUNDA",
  "DÉCIMA TERCERA",
  "DÉCIMA CUARTA",
  "DÉCIMA QUINTA",
  "DÉCIMA SEXTA",
  "DÉCIMA SÉPTIMA",
  "DÉCIMA OCTAVA",
  "DÉCIMA NOVENA",
  "VIGÉSIMA",
] as const;

function normalizeOrdinalKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

const ORDINALES_LOOKUP = new Map(
  ORDINALES_ES.map((label, index) => [normalizeOrdinalKey(label), index + 1])
);

/** Convierte índice 1-based a ordinal español (PRIMERA, SEGUNDA, …). */
export function clausulaOrdinalLabel(orderOneBased: number): string {
  if (orderOneBased < 1) return "";
  if (orderOneBased <= ORDINALES_ES.length) {
    return ORDINALES_ES[orderOneBased - 1];
  }
  return `${orderOneBased}ª`;
}

/**
 * Valor de `order` para persistir en API / documento:
 * "primera", "segunda", "tercera", … (femenino, minúsculas).
 */
export function clausulaOrdinalApiValue(orderOneBased: number): string {
  if (orderOneBased < 1) return "";
  if (orderOneBased <= ORDINALES_ES.length) {
    return normalizeOrdinalKey(ORDINALES_ES[orderOneBased - 1]);
  }
  return `${orderOneBased}a`;
}

/**
 * Interpreta `order` desde API (número legacy o texto ordinal) a índice 1-based.
 */
export function parseClausulaOrdinalOrder(value: unknown, fallbackOneBased: number): number {
  if (typeof value === "number" && Number.isFinite(value) && value >= 1) {
    return Math.floor(value);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return fallbackOneBased;

    const asNumber = Number(trimmed);
    if (Number.isFinite(asNumber) && asNumber >= 1) {
      return Math.floor(asNumber);
    }

    const fromLookup = ORDINALES_LOOKUP.get(normalizeOrdinalKey(trimmed));
    if (fromLookup !== undefined) return fromLookup;

    const match = trimmed.match(/^(\d+)\s*ª?$/i);
    if (match) {
      const n = Number(match[1]);
      if (Number.isFinite(n) && n >= 1) return Math.floor(n);
    }
  }

  return fallbackOneBased;
}

export function formatClausulaHeading(orderOneBased: number, titulo: string): string {
  const ordinal = clausulaOrdinalLabel(orderOneBased);
  return `CLÁUSULA ${ordinal}: ${titulo}`;
}

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

/** Convierte índice 1-based a ordinal español (PRIMERA, SEGUNDA, …). */
export function clausulaOrdinalLabel(orderOneBased: number): string {
  if (orderOneBased < 1) return "";
  if (orderOneBased <= ORDINALES_ES.length) {
    return ORDINALES_ES[orderOneBased - 1];
  }
  return `${orderOneBased}ª`;
}

export function formatClausulaHeading(orderOneBased: number, titulo: string): string {
  const ordinal = clausulaOrdinalLabel(orderOneBased);
  return `CLÁUSULA ${ordinal}: ${titulo}`;
}

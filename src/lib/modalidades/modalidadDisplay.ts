/**
 * Etiquetas UI para códigos de modalidad que vienen del backend.
 * CD puede llegar como CONTRATACION_DIRECTA (UI) o ADJUDICACION_DIRECTA (API).
 */

const MODALIDAD_LABELS: Record<string, string> = {
  LICITACION_PUBLICA: "Concurso Abierto, Acto Único Apertura Única",
  CONCURSO_ABIERTO: "Concurso Abierto",
  CONCURSO_CERRADO: "Concurso Cerrado",
  CONSULTA_PRECIOS: "Consulta de Precios",
  CONTRATACION_DIRECTA: "Contratación Directa",
  ADJUDICACION_DIRECTA: "Contratación Directa",
  MODALIDADES_EXCLUIDAS: "Modalidades Excluidas",
  LICITACION_PUBLICA_ACTO_UNICO: "Concurso Abierto, Acto Único / Apertura Única",
};

export function getModalidadDisplayLabel(code?: string | null): string {
  if (!code) return "—";
  return MODALIDAD_LABELS[code] ?? code;
}

export function isContratacionDirecta(code?: string | null): boolean {
  return code === "CONTRATACION_DIRECTA" || code === "ADJUDICACION_DIRECTA";
}

export function isConcursoAbierto(code?: string | null): boolean {
  return (
    code === "LICITACION_PUBLICA" ||
    code === "CONCURSO_ABIERTO" ||
    code === "LICITACION_PUBLICA_ACTO_UNICO"
  );
}

export function isConcursoCerrado(code?: string | null): boolean {
  return code === "CONCURSO_CERRADO";
}

export function isConsultaPrecios(code?: string | null): boolean {
  return code === "CONSULTA_PRECIOS";
}

export function isModalidadExcluida(code?: string | null): boolean {
  return code === "MODALIDADES_EXCLUIDAS";
}

/** Label de la fecha ancla en Fase 0 según modalidad (mockup). */
export function getFechaAnclaLabel(code?: string | null): string {
  if (isContratacionDirecta(code)) return "Fecha de Solicitud";
  if (isConcursoCerrado(code) || isConsultaPrecios(code)) return "Fecha de Invitación";
  if (isModalidadExcluida(code)) return "Inicio de Procedimiento";
  return "Fecha del llamado";
}

/** True si la modalidad usa bloque de causal legal (CC/CP/CD/ME). */
export function muestraBloqueCausal(code?: string | null): boolean {
  return (
    isConcursoCerrado(code) ||
    isConsultaPrecios(code) ||
    isContratacionDirecta(code) ||
    isModalidadExcluida(code)
  );
}

/** True si la modalidad muestra Unidad Contratante (CP/CD). */
export function muestraUnidadContratante(code?: string | null): boolean {
  return isConsultaPrecios(code) || isContratacionDirecta(code);
}

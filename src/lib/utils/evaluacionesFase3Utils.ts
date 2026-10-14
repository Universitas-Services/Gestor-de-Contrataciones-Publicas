export interface ParticipanteEvaluacion {
  id: string;
  ofertaId: string;
  nombreEmpresa: string;
  representanteLegal: string;
  rif: string;
  oferenteCalificado: boolean | null;
  prelacion: string | null;
  montoOfertaBs: number | null;
  /** Puntaje final con bonos (para ordenar elegibles). */
  puntuacionFinalConBonos: number | null;
  /** Flag del hub de adjudicación (Gestión Fase 3). */
  puedeAdjudicar?: boolean;
  /** True si Sobre 1 (lista de cotejo) ya tiene respuestas guardadas */
  listaCotejoCompletada: boolean;
}

export type EstadoEvaluacionUi = "pendiente" | "en_evaluacion" | "evaluado" | "descalificado";

export function resolveEstadoEvaluacionUi(p: ParticipanteEvaluacion): EstadoEvaluacionUi {
  if (p.oferenteCalificado === true) return "evaluado";
  if (p.oferenteCalificado === false) return "descalificado";
  if (p.listaCotejoCompletada) return "en_evaluacion";
  return "pendiente";
}

/** Campos booleanos de las 13 preguntas de Sobre 1 (gestión ampliado) */
const SOBRE1_QUESTION_FIELDS = [
  "cartaManifestacionVoluntad",
  "cartaAutorizacion",
  "docConstitutivo",
  "copiaRifVigente",
  "certificadoRnc",
  "solvenciaLaboral",
  "declaracionSociosNoInhabilitados",
  "declaracionNoDeudas",
  "declaracionNoImpedimentosLcp",
  "declaracionInfoFinanciera",
  "relacionServiciosPrestados",
  "evaluacionDesempenio",
  "referenciasComerciales",
] as const;

/** Campos booleanos del checklist Sobre 2 (11 ítems — gestión) */
const SOBRE2_CHECKLIST_FIELDS = [
  "ofertaTecnicoEconomica",
  "cartaOferta",
  "declaracionCapacidadFinanciera",
  "declaracionCompromisoRespSocial",
  "garantiaMantenimientoOferta",
  "declaracionAutocalculoVan",
  "cartaNotificaciones",
  "garantiaFielCumpl",
  "cartaCompromiso",
  "fianzaLaboral",
  "experienciaPersonalTecnico",
] as const;

export function isSobre1Completado(sobre1: unknown): boolean {
  if (!sobre1 || typeof sobre1 !== "object") return false;
  const data = sobre1 as Record<string, unknown>;
  return SOBRE1_QUESTION_FIELDS.some((field) => data[field] !== null && data[field] !== undefined);
}

export function isSobre2ChecklistCompletado(sobre2: unknown): boolean {
  if (!sobre2 || typeof sobre2 !== "object") return false;
  const data = sobre2 as Record<string, unknown>;
  return SOBRE2_CHECKLIST_FIELDS.some((field) => data[field] !== null && data[field] !== undefined);
}

/** Lista de cotejo completa en gestión = Sobre 1 + checklist Sobre 2 */
export function isListaCotejoCompletada(sobre1: unknown, sobre2: unknown): boolean {
  return isSobre1Completado(sobre1) && isSobre2ChecklistCompletado(sobre2);
}

export const PRELACION_ORDER = [
  "primera opción",
  "segunda opción",
  "tercera opción",
  "cuarta opción",
  "quinta opción",
  "sexta opción",
  "séptima opción",
  "octava opción",
  "novena opción",
  "décima opción",
  "undécima opción",
  "duodécima opción",
  "decimotercera opción",
  "decimocuarta opción",
  "decimoquinta opción",
] as const;

/** "primera opción" → "Primera Opción" */
export function formatPrelacionLabel(indexZeroBased: number): string {
  const base = PRELACION_ORDER[indexZeroBased];
  if (!base) return `${indexZeroBased + 1}ª Opción`;
  return base
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function parsePuntajeFinal(item: Record<string, unknown>): number | null {
  const raw =
    item.puntuacionFinalConBonos ??
    item.puntuacion_final_con_bonos_au_au ??
    item.puntuacionFinal ??
    item.puntuacion_final;
  if (raw === null || raw === undefined || raw === "") return null;
  const n = Number(raw);
  return Number.isNaN(n) ? null : n;
}

export function parseEvaluacionesResponse(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) {
    return raw as Record<string, unknown>[];
  }
  if (raw && typeof raw === "object") {
    const rawObj = raw as Record<string, unknown>;
    if (Array.isArray(rawObj.data)) {
      return rawObj.data as Record<string, unknown>[];
    }
    if (Array.isArray(rawObj.evaluaciones)) {
      return rawObj.evaluaciones as Record<string, unknown>[];
    }
  }
  return [];
}

export function mapToParticipanteEvaluacion(item: Record<string, unknown>): ParticipanteEvaluacion {
  const sobre2 =
    item.sobre2 && typeof item.sobre2 === "object"
      ? (item.sobre2 as Record<string, unknown>)
      : null;
  const oferta =
    item.oferta && typeof item.oferta === "object"
      ? (item.oferta as Record<string, unknown>)
      : null;

  const montoRaw =
    item.montoOfertaBs ??
    item.montoOferta ??
    sobre2?.montoOfertaBs ??
    oferta?.montoOfertaBs ??
    oferta?.montoOferta;
  const montoOfertaBs =
    montoRaw !== null && montoRaw !== undefined && montoRaw !== "" ? Number(montoRaw) : null;

  const prelacionRaw =
    item.posicionPrelacionEfectiva ??
    item.posicion_prelacion_efectiva ??
    item.posicionPrelacion ??
    item.posicion_prelacion;
  return {
    id: String(item.id ?? ""),
    ofertaId: String(item.ofertaId ?? oferta?.id ?? ""),
    nombreEmpresa: String(item.nombreProveedorEvaluado ?? oferta?.nombreProveedorOferente ?? "—"),
    representanteLegal: String(
      item.nombreRepLegalEvaluado ?? oferta?.nombreRepLegalOferente ?? "—"
    ),
    rif: String(item.rifProveedorEvaluado ?? oferta?.rifProveedorOferente ?? "—"),
    oferenteCalificado:
      item.oferenteCalificado === true ? true : item.oferenteCalificado === false ? false : null,
    prelacion: prelacionRaw != null ? String(prelacionRaw) : null,
    montoOfertaBs: montoOfertaBs !== null && !Number.isNaN(montoOfertaBs) ? montoOfertaBs : null,
    puntuacionFinalConBonos: parsePuntajeFinal(item),
    listaCotejoCompletada: isListaCotejoCompletada(item.sobre1, item.sobre2),
  };
}

function getPrelacionIndex(prelacion: string | null): number {
  if (!prelacion) return -1;
  return PRELACION_ORDER.findIndex((p) => p === prelacion.toLowerCase());
}

export function sortByPrelacion(participantes: ParticipanteEvaluacion[]): ParticipanteEvaluacion[] {
  return [...participantes].sort((a, b) => {
    const idxA = getPrelacionIndex(a.prelacion);
    const idxB = getPrelacionIndex(b.prelacion);

    if (idxA === -1 && idxB === -1) return 0;
    if (idxA === -1) return 1;
    if (idxB === -1) return -1;

    return idxA - idxB;
  });
}

/**
 * Orden para la tabla de gestión Fase 2:
 * 1) Elegibles (calificados) por la prelación que envía el API (empates densos se respetan).
 * 2) Pendientes / En evaluación.
 * 3) Descalificados al final (prelación N/A).
 */
export function sortParticipantesParaTabla(
  participantes: ParticipanteEvaluacion[]
): ParticipanteEvaluacion[] {
  const elegibles = participantes.filter((p) => p.oferenteCalificado === true);
  const pendientes = participantes.filter((p) => p.oferenteCalificado === null);
  const descalificados = participantes.filter((p) => p.oferenteCalificado === false);

  const elegiblesConPrelacion = [...elegibles].sort((a, b) => {
    const idxA = getPrelacionIndex(a.prelacion);
    const idxB = getPrelacionIndex(b.prelacion);
    if (idxA !== -1 && idxB !== -1 && idxA !== idxB) return idxA - idxB;
    if (idxA !== -1 && idxB === -1) return -1;
    if (idxA === -1 && idxB !== -1) return 1;
    const scoreA = a.puntuacionFinalConBonos ?? -Infinity;
    const scoreB = b.puntuacionFinalConBonos ?? -Infinity;
    return scoreB - scoreA;
  });

  const pendientesOrdenados = [...pendientes].sort((a, b) => {
    if (a.listaCotejoCompletada === b.listaCotejoCompletada) return 0;
    return a.listaCotejoCompletada ? -1 : 1;
  });

  const descalificadosSinPrelacion = descalificados.map((p) => ({
    ...p,
    prelacion: null as string | null,
  }));

  return [...elegiblesConPrelacion, ...pendientesOrdenados, ...descalificadosSinPrelacion];
}

/** Label de prelación para UI: backend/cliente, "—", o "N/A" si descalificado. */
export function displayPrelacionLabel(p: ParticipanteEvaluacion): string {
  if (p.oferenteCalificado === false) return "N/A";
  if (p.oferenteCalificado !== true) return "—";
  if (!p.prelacion) return "—";
  const idx = getPrelacionIndex(p.prelacion);
  if (idx !== -1) return formatPrelacionLabel(idx);
  return p.prelacion;
}

export function getOferenteAdjudicado(
  participantes: ParticipanteEvaluacion[]
): ParticipanteEvaluacion | null {
  const primeraOpcion = participantes.find((p) => p.prelacion?.toLowerCase() === "primera opción");
  if (primeraOpcion) return primeraOpcion;

  const evaluados = sortByPrelacion(participantes.filter((p) => p.oferenteCalificado === true));
  if (evaluados.length > 0) return evaluados[0];

  return sortByPrelacion(participantes)[0] ?? null;
}

export function formatMoneyBs(value: string | number | undefined | null): string {
  if (value == null || value === "") return "—";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(num)) return "—";
  return num.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function isPrimeraOpcion(prelacion: string | null): boolean {
  return prelacion?.toLowerCase() === "primera opción";
}

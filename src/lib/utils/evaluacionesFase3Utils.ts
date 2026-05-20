export interface ParticipanteEvaluacion {
  id: string;
  ofertaId: string;
  nombreEmpresa: string;
  representanteLegal: string;
  rif: string;
  oferenteCalificado: boolean | null;
  prelacion: string | null;
  montoOfertaBs: number | null;
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

  const montoRaw = item.montoOfertaBs ?? sobre2?.montoOfertaBs;
  const montoOfertaBs =
    montoRaw !== null && montoRaw !== undefined && montoRaw !== "" ? Number(montoRaw) : null;

  return {
    id: String(item.id ?? ""),
    ofertaId: String(item.ofertaId ?? ""),
    nombreEmpresa: String(item.nombreProveedorEvaluado ?? "—"),
    representanteLegal: String(item.nombreRepLegalEvaluado ?? "—"),
    rif: String(item.rifProveedorEvaluado ?? "—"),
    oferenteCalificado:
      item.oferenteCalificado === true ? true : item.oferenteCalificado === false ? false : null,
    prelacion: item.posicionPrelacion != null ? String(item.posicionPrelacion) : null,
    montoOfertaBs: montoOfertaBs !== null && !Number.isNaN(montoOfertaBs) ? montoOfertaBs : null,
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

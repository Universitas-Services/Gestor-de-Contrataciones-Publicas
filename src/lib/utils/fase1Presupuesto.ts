import type {
  CrearPresupuestoItemResponse,
  ListarPresupuestoItemsResponse,
  PresupuestoItemApiRecord,
  PresupuestoItemRecord,
  PresupuestoItemsMeta,
  PresupuestoItemsTotals,
} from "@/types/fase1.types";

interface PresupuestoItemSource {
  id?: string;
  descripcionItem?: string;
  codigoPartida?: string;
  unidadMedida?: string;
  cantidadRequerida?: unknown;
  precioUnitarioEstimado?: unknown;
  totalItem?: unknown;
  totalItems?: unknown;
}

interface PresupuestoItemsApiResponse {
  items?: PresupuestoItemApiRecord[];
  meta?: Partial<PresupuestoItemsMeta>;
  totales?: Partial<PresupuestoItemsTotals>;
}

export function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && !Number.isNaN(value)) return value;

  if (typeof value === "string" && value.trim()) {
    const raw = value.trim();
    const normalized =
      raw.includes(".") && raw.includes(",")
        ? raw.replace(/\./g, "").replace(",", ".")
        : raw.includes(",")
          ? raw.replace(",", ".")
          : raw;
    const parsed = Number(normalized);

    if (!Number.isNaN(parsed)) return parsed;
  }

  return fallback;
}

export function normalizePresupuestoItemRecord(
  source: PresupuestoItemSource,
  fallback: Partial<PresupuestoItemRecord> = {}
): PresupuestoItemRecord {
  const cantidadRequerida = toNumber(source.cantidadRequerida, fallback.cantidadRequerida ?? 0);
  const precioUnitarioEstimado = toNumber(
    source.precioUnitarioEstimado,
    fallback.precioUnitarioEstimado ?? 0
  );
  const totalItems = toNumber(
    source.totalItems ?? source.totalItem,
    fallback.totalItems ?? cantidadRequerida * precioUnitarioEstimado
  );

  return {
    id: source.id ?? fallback.id ?? crypto.randomUUID(),
    descripcionItem: source.descripcionItem ?? fallback.descripcionItem ?? "",
    codigoPartida: source.codigoPartida ?? fallback.codigoPartida ?? "",
    unidadMedida: source.unidadMedida ?? fallback.unidadMedida ?? "",
    cantidadRequerida,
    precioUnitarioEstimado,
    totalItems,
  };
}

export function normalizeCrearPresupuestoItemResponse(
  source: CrearPresupuestoItemResponse,
  fallback: Partial<PresupuestoItemRecord> = {}
): PresupuestoItemRecord {
  return normalizePresupuestoItemRecord(source, fallback);
}

function normalizePresupuestoItemsMeta(meta?: Partial<PresupuestoItemsMeta>): PresupuestoItemsMeta {
  return {
    total: toNumber(meta?.total, 0),
    page: Math.max(1, toNumber(meta?.page, 1)),
    lastPage: Math.max(1, toNumber(meta?.lastPage, 1)),
  };
}

function normalizePresupuestoItemsTotals(
  totales?: Partial<PresupuestoItemsTotals>
): PresupuestoItemsTotals {
  return {
    subtotal: toNumber(totales?.subtotal, 0),
    porcentajeIvaAplicado: toNumber(totales?.porcentajeIvaAplicado, 0),
    montoIva: toNumber(totales?.montoIva, 0),
    montoTotal: toNumber(totales?.montoTotal, 0),
  };
}

export function normalizePresupuestoItemsResponse(
  payload: PresupuestoItemsApiResponse
): ListarPresupuestoItemsResponse {
  return {
    items: (payload.items ?? []).map((item) => normalizePresupuestoItemRecord(item)),
    meta: normalizePresupuestoItemsMeta(payload.meta),
    totales: normalizePresupuestoItemsTotals(payload.totales),
  };
}

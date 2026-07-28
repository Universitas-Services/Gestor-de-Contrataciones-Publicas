export type UnidadMedidaFamily =
  | "conteo"
  | "masa"
  | "longitud"
  | "volumen"
  | "tiempo"
  | "superficie"
  | "otro";

export interface UnidadMedidaDef {
  value: string;
  label: string;
  family: UnidadMedidaFamily;
  allowDecimals: boolean;
}

export const UNIDAD_MEDIDA_FAMILY_LABELS: Record<UnidadMedidaFamily, string> = {
  conteo: "Conteo / piezas",
  masa: "Masa",
  longitud: "Longitud",
  volumen: "Volumen",
  tiempo: "Tiempo",
  superficie: "Superficie",
  otro: "Otros",
};

/** Catálogo curado para pliego / presupuesto (gestión). */
export const UNIDADES_MEDIDA_CATALOGO: UnidadMedidaDef[] = [
  // Conteo — enteros
  { value: "Unidad", label: "Unidad", family: "conteo", allowDecimals: false },
  { value: "Pieza", label: "Pieza", family: "conteo", allowDecimals: false },
  { value: "Par", label: "Par", family: "conteo", allowDecimals: false },
  { value: "Juego", label: "Juego", family: "conteo", allowDecimals: false },
  { value: "Paquete", label: "Paquete", family: "conteo", allowDecimals: false },
  { value: "Caja", label: "Caja", family: "conteo", allowDecimals: false },
  { value: "Lote", label: "Lote", family: "conteo", allowDecimals: false },
  { value: "Resma", label: "Resma", family: "conteo", allowDecimals: false },
  { value: "Docena", label: "Docena", family: "conteo", allowDecimals: false },
  { value: "Global", label: "Global", family: "conteo", allowDecimals: false },
  { value: "Servicio", label: "Servicio", family: "conteo", allowDecimals: false },

  // Masa — decimales
  { value: "Kg", label: "Kilogramo (Kg)", family: "masa", allowDecimals: true },
  { value: "G", label: "Gramo (g)", family: "masa", allowDecimals: true },
  { value: "Ton", label: "Tonelada (Ton)", family: "masa", allowDecimals: true },

  // Longitud — decimales
  { value: "Mts", label: "Metro (Mts)", family: "longitud", allowDecimals: true },
  { value: "Cm", label: "Centímetro (cm)", family: "longitud", allowDecimals: true },
  { value: "Mm", label: "Milímetro (mm)", family: "longitud", allowDecimals: true },
  { value: "Km", label: "Kilómetro (Km)", family: "longitud", allowDecimals: true },

  // Volumen — decimales
  { value: "Litro", label: "Litro (L)", family: "volumen", allowDecimals: true },
  { value: "Ml", label: "Mililitro (ml)", family: "volumen", allowDecimals: true },
  { value: "M3", label: "Metro cúbico (m³)", family: "volumen", allowDecimals: true },
  { value: "Galon", label: "Galón", family: "volumen", allowDecimals: true },

  // Superficie — decimales
  { value: "M2", label: "Metro cuadrado (m²)", family: "superficie", allowDecimals: true },
  { value: "Ha", label: "Hectárea (Ha)", family: "superficie", allowDecimals: true },

  // Tiempo — horas/minutos con decimales; días/meses enteros
  { value: "Hora", label: "Hora", family: "tiempo", allowDecimals: true },
  { value: "Horas", label: "Horas", family: "tiempo", allowDecimals: true },
  { value: "Minuto", label: "Minuto", family: "tiempo", allowDecimals: true },
  { value: "Dia", label: "Día", family: "tiempo", allowDecimals: false },
  { value: "Semana", label: "Semana", family: "tiempo", allowDecimals: false },
  { value: "Mes", label: "Mes", family: "tiempo", allowDecimals: false },
  { value: "Ano", label: "Año", family: "tiempo", allowDecimals: false },
];

const byValue = new Map(UNIDADES_MEDIDA_CATALOGO.map((u) => [u.value.toLowerCase(), u] as const));

export function getUnidadMedidaMeta(value: string | null | undefined): UnidadMedidaDef | null {
  if (!value?.trim()) return null;
  return byValue.get(value.trim().toLowerCase()) ?? null;
}

/** Custom (no está en catálogo) → admite decimales. */
export function unidadAllowsDecimals(value: string | null | undefined): boolean {
  const meta = getUnidadMedidaMeta(value);
  if (!meta) return true;
  return meta.allowDecimals;
}

export function normalizeCantidadForUnidad(cantidadFormatted: string, unidad: string): string {
  if (unidadAllowsDecimals(unidad)) return cantidadFormatted;
  const digits = cantidadFormatted.replace(/\D/g, "");
  if (!digits) return "";
  // LocalizedDecimalInput with 2 digits stores as "10,00" → take integer part
  const normalized = cantidadFormatted.trim().replace(/\./g, "").replace(",", ".");
  const n = Number(normalized);
  if (!Number.isFinite(n) || n <= 0) return "";
  return String(Math.floor(n));
}

export function filterUnidadesMedida(query: string): UnidadMedidaDef[] {
  const q = query.trim().toLowerCase();
  if (!q) return UNIDADES_MEDIDA_CATALOGO;
  return UNIDADES_MEDIDA_CATALOGO.filter(
    (u) =>
      u.value.toLowerCase().includes(q) ||
      u.label.toLowerCase().includes(q) ||
      UNIDAD_MEDIDA_FAMILY_LABELS[u.family].toLowerCase().includes(q)
  );
}

export function groupUnidadesByFamily(
  units: UnidadMedidaDef[]
): { family: UnidadMedidaFamily; label: string; items: UnidadMedidaDef[] }[] {
  const order: UnidadMedidaFamily[] = [
    "conteo",
    "masa",
    "longitud",
    "volumen",
    "superficie",
    "tiempo",
    "otro",
  ];
  return order
    .map((family) => ({
      family,
      label: UNIDAD_MEDIDA_FAMILY_LABELS[family],
      items: units.filter((u) => u.family === family),
    }))
    .filter((g) => g.items.length > 0);
}

import type {
  DiaNoLaborableRango,
  DiasNoLaborablesRangoResponse,
} from "@/types/cronogramaEnte.types";

export function formatIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseIsoDate(iso: string): Date {
  const normalized = iso.split("T")[0];
  const [y, m, d] = normalized.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function isWeekend(date: Date): boolean {
  const dow = date.getDay();
  return dow === 0 || dow === 6;
}

export function isFeriadoEnte(date: Date, feriados: Set<string>): boolean {
  return feriados.has(formatIsoDate(date));
}

export function isNonWorkingDay(date: Date, feriados?: Set<string>): boolean {
  if (isWeekend(date)) return true;
  if (feriados && feriados.size > 0) {
    return isFeriadoEnte(date, feriados);
  }
  return false;
}

export function ensureWorkingDay(date: Date, feriados?: Set<string>): Date {
  const res = new Date(date);
  while (isNonWorkingDay(res, feriados)) {
    res.setDate(res.getDate() + 1);
  }
  return res;
}

export function addWorkingDays(date: Date, days: number, feriados?: Set<string>): Date {
  const result = new Date(date);
  let added = 0;
  const direction = days >= 0 ? 1 : -1;
  const absDays = Math.abs(days);

  while (added < absDays) {
    result.setDate(result.getDate() + direction);
    if (!isNonWorkingDay(result, feriados)) added++;
  }

  return result;
}

export function countWorkingDays(from: Date, to: Date, feriados?: Set<string>): number {
  let count = 0;
  const cur = new Date(from);
  while (cur <= to) {
    if (!isNonWorkingDay(cur, feriados)) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

export function buildNonWorkingDaysFromRango(response: DiasNoLaborablesRangoResponse): Set<string> {
  const set = new Set<string>(response.finesDeSemana);
  response.diasNoLaborables.forEach((dia) => set.add(dia.fecha.split("T")[0]));
  return set;
}

export function buildFeriadoDescriptionsFromRango(
  response: DiasNoLaborablesRangoResponse
): Map<string, string> {
  const map = new Map<string, string>();
  response.diasNoLaborables.forEach((dia) => {
    map.set(dia.fecha.split("T")[0], dia.descripcion);
  });
  return map;
}

export interface DiaNoLaborableCalendarSource {
  id?: string;
  esRecurrente: boolean;
  fecha: string | null;
  fechaRecurrente: string | null;
  descripcion: string;
}

export function mergeDiasNoLaborablesById(
  ...groups: DiaNoLaborableCalendarSource[][]
): DiaNoLaborableCalendarSource[] {
  const map = new Map<string, DiaNoLaborableCalendarSource>();
  groups.flat().forEach((dia) => {
    const key =
      dia.id ?? `${dia.esRecurrente}-${dia.fecha ?? dia.fechaRecurrente}-${dia.descripcion}`;
    map.set(key, dia);
  });
  return Array.from(map.values());
}

/** Expande un registro CRUD a fechas concretas dentro de un año. */
export function expandDiaNoLaborableToYear(
  dia: DiaNoLaborableCalendarSource,
  year: number
): { fecha: string; descripcion: string }[] {
  if (dia.esRecurrente && dia.fechaRecurrente) {
    const [monthRaw, dayRaw] = dia.fechaRecurrente.split("-");
    const month = monthRaw.padStart(2, "0");
    const day = dayRaw.padStart(2, "0");
    return [{ fecha: `${year}-${month}-${day}`, descripcion: dia.descripcion }];
  }

  if (dia.fecha) {
    const iso = dia.fecha.split("T")[0];
    if (iso.startsWith(`${year}-`)) {
      return [{ fecha: iso, descripcion: dia.descripcion }];
    }
  }

  return [];
}

/**
 * Construye el overlay del calendario de configuración combinando:
 * - días del endpoint de rango
 * - registros del CRUD (incluye recurrentes expandidos por año)
 */
export function buildFeriadoCalendarOverlay(
  year: number,
  diasRegistrados: DiaNoLaborableCalendarSource[],
  rangoDias: DiaNoLaborableRango[] = []
): { dates: Set<string>; descriptions: Map<string, string> } {
  const dates = new Set<string>();
  const descriptions = new Map<string, string>();

  const add = (fecha: string, descripcion: string) => {
    if (!fecha.startsWith(`${year}-`)) return;
    dates.add(fecha);
    if (!descriptions.has(fecha)) {
      descriptions.set(fecha, descripcion);
    }
  };

  rangoDias.forEach((dia) => {
    if (dia.fecha) add(dia.fecha.split("T")[0], dia.descripcion);
  });

  diasRegistrados.forEach((dia) => {
    expandDiaNoLaborableToYear(dia, year).forEach(({ fecha, descripcion }) => {
      add(fecha, descripcion);
    });
  });

  return { dates, descriptions };
}

export function formatDiaNoLaborableDisplay(dia: {
  esRecurrente: boolean;
  fecha: string | null;
  fechaRecurrente: string | null;
}): string {
  if (dia.esRecurrente && dia.fechaRecurrente) {
    const [month, day] = dia.fechaRecurrente.split("-");
    return `Cada año — ${day}/${month}`;
  }

  if (dia.fecha) {
    const normalized = dia.fecha.split("T")[0];
    const [y, m, d] = normalized.split("-");
    return `${d}/${m}/${y}`;
  }

  return "—";
}

export function getYearRangeForCronograma(fechasIso: string[]): { desde: string; hasta: string } {
  const validDates = fechasIso
    .map((f) => f?.split("T")[0])
    .filter(Boolean)
    .map(parseIsoDate);

  const today = new Date();
  const baseYear = validDates.length > 0 ? validDates[0].getFullYear() : today.getFullYear();

  const minDate =
    validDates.length > 0
      ? new Date(Math.min(...validDates.map((d) => d.getTime())))
      : new Date(baseYear, 0, 1);
  const maxDate =
    validDates.length > 0
      ? new Date(Math.max(...validDates.map((d) => d.getTime())))
      : new Date(baseYear, 11, 31);

  const desde = formatIsoDate(new Date(minDate.getFullYear(), 0, 1));
  const hasta = formatIsoDate(new Date(maxDate.getFullYear(), 11, 31));

  return { desde, hasta };
}

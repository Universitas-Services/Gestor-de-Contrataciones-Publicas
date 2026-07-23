import type { IEvent } from "./types";
import {
  formatIsoDate,
  isNonWorkingDay,
  isWeekend,
  parseIsoDate,
} from "@/lib/utils/diasNoLaborablesUtils";

export { parseIsoDate as parseDate };

function isNonWorkingDayDate(d: Date, nonWorkingDays?: Set<string>): boolean {
  return isNonWorkingDay(d, nonWorkingDays);
}

function isWeekendOnly(d: Date, nonWorkingDays?: Set<string>): boolean {
  return isWeekend(d) && !isFeriadoOnly(d, nonWorkingDays);
}

function isFeriadoOnly(d: Date, nonWorkingDays?: Set<string>): boolean {
  if (!nonWorkingDays || nonWorkingDays.size === 0) return false;
  return nonWorkingDays.has(formatIsoDate(d)) && !isWeekend(d);
}

/**
 * Get all events that overlap a given calendar day.
 * Multi-day events are NOT returned for non-working days.
 */
export function getEventsForDay(
  events: IEvent[],
  day: Date,
  nonWorkingDays?: Set<string>
): IEvent[] {
  const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0, 0);
  const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59, 999);

  return events.filter((ev) => {
    const evStart = parseIsoDate(ev.startDate);
    const evEnd = parseIsoDate(ev.endDate);

    if (!(evStart <= dayEnd && evEnd >= dayStart)) return false;

    const isMultiDay = ev.startDate !== ev.endDate;
    if (isMultiDay && isNonWorkingDayDate(day, nonWorkingDays)) return false;

    return true;
  });
}

/** True if this day is the START date of the event */
export function isEventStart(event: IEvent, day: Date): boolean {
  const evStart = parseIsoDate(event.startDate);
  return (
    evStart.getFullYear() === day.getFullYear() &&
    evStart.getMonth() === day.getMonth() &&
    evStart.getDate() === day.getDate()
  );
}

/** True if this day is the END date of the event */
export function isEventEnd(event: IEvent, day: Date): boolean {
  const evEnd = parseIsoDate(event.endDate);
  return (
    evEnd.getFullYear() === day.getFullYear() &&
    evEnd.getMonth() === day.getMonth() &&
    evEnd.getDate() === day.getDate()
  );
}

export function isResumingAfterNonWorkingDay(
  event: IEvent,
  day: Date,
  nonWorkingDays?: Set<string>
): boolean {
  if (isEventStart(event, day)) return false;
  const prev = new Date(day);
  prev.setDate(prev.getDate() - 1);
  return isNonWorkingDayDate(prev, nonWorkingDays);
}

/** @deprecated Use isResumingAfterNonWorkingDay */
export function isResumingAfterWeekend(
  event: IEvent,
  day: Date,
  nonWorkingDays?: Set<string>
): boolean {
  return isResumingAfterNonWorkingDay(event, day, nonWorkingDays);
}

export function isPausingBeforeNonWorkingDay(
  event: IEvent,
  day: Date,
  nonWorkingDays?: Set<string>
): boolean {
  if (isEventEnd(event, day)) return false;
  const next = new Date(day);
  next.setDate(next.getDate() + 1);
  return isNonWorkingDayDate(next, nonWorkingDays);
}

/** @deprecated Use isPausingBeforeNonWorkingDay */
export function isPausingBeforeWeekend(
  event: IEvent,
  day: Date,
  nonWorkingDays?: Set<string>
): boolean {
  return isPausingBeforeNonWorkingDay(event, day, nonWorkingDays);
}

export function getDayNonWorkingInfo(
  day: Date,
  nonWorkingDays?: Set<string>,
  feriadoDescriptions?: Map<string, string>
): { isNonWorking: boolean; isWeekend: boolean; isFeriado: boolean; tooltip?: string } {
  const iso = formatIsoDate(day);
  const weekend = isWeekend(day);
  const feriado = isFeriadoOnly(day, nonWorkingDays);
  const nonWorking = isNonWorkingDayDate(day, nonWorkingDays);

  let tooltip: string | undefined;
  if (feriado) {
    tooltip = feriadoDescriptions?.get(iso) ?? "Día no laborable del ente";
  } else if (weekend) {
    tooltip = "Sábado y domingo no son días hábiles";
  }

  return { isNonWorking: nonWorking, isWeekend: weekend, isFeriado: feriado, tooltip };
}

/** "Marzo 2026" */
export function formatMonthYear(date: Date, locale = "es-VE"): string {
  return date.toLocaleDateString(locale, { month: "long", year: "numeric" });
}

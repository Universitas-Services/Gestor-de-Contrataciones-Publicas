import type { IEvent } from "./types";

/** Parse a "YYYY-MM-DD" string as local midnight (no timezone shift) */
export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

function isWeekendDate(d: Date): boolean {
  const dow = d.getDay();
  return dow === 0 || dow === 6;
}

/**
 * Get all events that overlap a given calendar day.
 * Multi-day events are NOT returned for weekend days (Sat/Sun).
 */
export function getEventsForDay(events: IEvent[], day: Date): IEvent[] {
  const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0, 0);
  const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59, 999);

  return events.filter((ev) => {
    const evStart = parseDate(ev.startDate);
    const evEnd = parseDate(ev.endDate);

    // Check overlap
    if (!(evStart <= dayEnd && evEnd >= dayStart)) return false;

    // For multi-day events: skip rendering on weekends
    const isMultiDay = ev.startDate !== ev.endDate;
    if (isMultiDay && isWeekendDate(day)) return false;

    return true;
  });
}

/** True if this day is the START date of the event */
export function isEventStart(event: IEvent, day: Date): boolean {
  const evStart = parseDate(event.startDate);
  return (
    evStart.getFullYear() === day.getFullYear() &&
    evStart.getMonth() === day.getMonth() &&
    evStart.getDate() === day.getDate()
  );
}

/** True if this day is the END date of the event */
export function isEventEnd(event: IEvent, day: Date): boolean {
  const evEnd = parseDate(event.endDate);
  return (
    evEnd.getFullYear() === day.getFullYear() &&
    evEnd.getMonth() === day.getMonth() &&
    evEnd.getDate() === day.getDate()
  );
}

/**
 * For a multi-day event on a given day, is the PREVIOUS day a weekend (or before the event)?
 * If yes → this cell is "resuming" the bar after Sat/Sun → show left start styling, but no text.
 */
export function isResumingAfterWeekend(event: IEvent, day: Date): boolean {
  if (isEventStart(event, day)) return false; // actual start already handled
  const prev = new Date(day);
  prev.setDate(prev.getDate() - 1);
  return isWeekendDate(prev);
}

/**
 * For a multi-day event on a given day, is the NEXT day a weekend or after the event?
 * If yes → this cell is the last visible bar segment before the weekend break.
 */
export function isPausingBeforeWeekend(event: IEvent, day: Date): boolean {
  if (isEventEnd(event, day)) return false; // actual end already handled
  const next = new Date(day);
  next.setDate(next.getDate() + 1);
  return isWeekendDate(next);
}

/** "Marzo 2026" */
export function formatMonthYear(date: Date, locale = "es-VE"): string {
  return date.toLocaleDateString(locale, { month: "long", year: "numeric" });
}

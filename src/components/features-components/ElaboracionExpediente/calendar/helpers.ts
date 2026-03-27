import type { IEvent, EventColor } from "./types";

/** Map from color name to Tailwind/CSS classes */
export const EVENT_COLOR_CLASSES: Record<EventColor, { bg: string; text: string; border: string }> =
  {
    blue: {
      bg: "bg-tipo-bienes-bg",
      text: "text-tipo-bienes",
      border: "border-tipo-bienes-border",
    },
    red: {
      bg: "bg-tipo-obras-bg",
      text: "text-tipo-obras",
      border: "border-tipo-obras-border",
    },
    gray: {
      bg: "bg-tipo-servicios-bg",
      text: "text-tipo-servicios",
      border: "border-tipo-servicios-border",
    },
    green: {
      bg: "bg-success-bg",
      text: "text-success-text",
      border: "border-success/30",
    },
    orange: {
      bg: "bg-vencido-bg",
      text: "text-vencido",
      border: "border-vencido-border",
    },
    yellow: {
      bg: "bg-pendiente-bg",
      text: "text-pendiente",
      border: "border-pendiente-border",
    },
    purple: {
      bg: "bg-[oklch(0.92_0.04_280)]",
      text: "text-[oklch(0.45_0.18_275)]",
      border: "border-[oklch(0.7_0.12_275)]",
    },
  };

/**
 * Get all events that should appear on a given day
 * (covers single-day and multi-day events)
 */
export function getEventsForDay(events: IEvent[], day: Date): IEvent[] {
  return events.filter((ev) => {
    const start = new Date(ev.startDate);
    const end = new Date(ev.endDate);
    // Normalize to midnight
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    const d = new Date(day);
    d.setHours(12, 0, 0, 0);
    return d >= start && d <= end;
  });
}

/**
 * Returns true if the given date is the first day the event appears
 * in the calendar grid (used to only render the chip on the first day)
 */
export function isEventStart(event: IEvent, day: Date): boolean {
  const start = new Date(event.startDate);
  start.setHours(0, 0, 0, 0);
  const d = new Date(day);
  d.setHours(0, 0, 0, 0);
  return start.getTime() === d.getTime();
}

/** Format: "Marzo 2026" */
export function formatMonthYear(date: Date, locale = "es-VE"): string {
  return date.toLocaleDateString(locale, { month: "long", year: "numeric" });
}

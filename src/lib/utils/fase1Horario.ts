export type HorarioPeriodo = "am" | "pm";

export interface HorarioTimeSlot {
  /** Formato HH:mm (ej. 08:00) */
  time: string;
  period: HorarioPeriodo | "";
}

export interface HorarioRetiroParts {
  start1: HorarioTimeSlot;
  end1: HorarioTimeSlot;
  start2: HorarioTimeSlot;
  end2: HorarioTimeSlot;
}

export const EMPTY_HORARIO_SLOT: HorarioTimeSlot = {
  time: "",
  period: "",
};

export const EMPTY_HORARIO_PARTS: HorarioRetiroParts = {
  start1: { ...EMPTY_HORARIO_SLOT },
  end1: { ...EMPTY_HORARIO_SLOT },
  start2: { ...EMPTY_HORARIO_SLOT },
  end2: { ...EMPTY_HORARIO_SLOT },
};

const MINUTES = ["00", "15", "30", "45"] as const;

export const HORARIO_TIME_OPTIONS = Array.from({ length: 12 }, (_, index) => {
  const hour = String(index + 1).padStart(2, "0");
  return MINUTES.map((minute) => `${hour}:${minute}`);
}).flat();

export const HORARIO_PERIOD_OPTIONS: Array<{ value: HorarioPeriodo; label: string }> = [
  { value: "am", label: "am" },
  { value: "pm", label: "pm" },
];

const TIME_TOKEN_REGEX = /(\d{1,2}):(\d{2})\s*(am|pm|m)\b/gi;

function normalizePeriod(raw: string): HorarioPeriodo | "" {
  const value = raw.trim().toLowerCase();
  if (value === "am") return "am";
  // "m" (mediodía legacy) se trata como pm
  if (value === "pm" || value === "m") return "pm";
  return "";
}

export function isHorarioSlotComplete(slot: HorarioTimeSlot): boolean {
  return Boolean(slot.time && slot.period);
}

export function formatHorarioSlot(slot: HorarioTimeSlot): string {
  if (!isHorarioSlotComplete(slot)) return "";
  return `${slot.time}${slot.period}`;
}

export function formatHorarioRetiroPliego(parts: HorarioRetiroParts): string {
  const tramo1 =
    isHorarioSlotComplete(parts.start1) && isHorarioSlotComplete(parts.end1)
      ? `${formatHorarioSlot(parts.start1)} a ${formatHorarioSlot(parts.end1)}`
      : "";

  const tramo2 =
    isHorarioSlotComplete(parts.start2) && isHorarioSlotComplete(parts.end2)
      ? `${formatHorarioSlot(parts.start2)} a ${formatHorarioSlot(parts.end2)}`
      : "";

  if (tramo1 && tramo2) return `${tramo1} y ${tramo2}`;
  return "";
}

export function previewHorarioRetiroPliego(parts: HorarioRetiroParts): string {
  const tramo1 =
    isHorarioSlotComplete(parts.start1) && isHorarioSlotComplete(parts.end1)
      ? `${formatHorarioSlot(parts.start1)} a ${formatHorarioSlot(parts.end1)}`
      : "";

  const tramo2 =
    isHorarioSlotComplete(parts.start2) && isHorarioSlotComplete(parts.end2)
      ? `${formatHorarioSlot(parts.start2)} a ${formatHorarioSlot(parts.end2)}`
      : "";

  if (tramo1 && tramo2) return `${tramo1} y ${tramo2}`;
  if (tramo1) return tramo1;
  if (tramo2) return tramo2;
  return "";
}

function tokenToSlot(hourRaw: string, minuteRaw: string, periodRaw: string): HorarioTimeSlot {
  const hourNum = Number(hourRaw);
  const hour =
    Number.isFinite(hourNum) && hourNum >= 1 && hourNum <= 12
      ? String(hourNum).padStart(2, "0")
      : "";
  const minute = minuteRaw.padStart(2, "0");
  const time = hour ? `${hour}:${minute}` : "";
  const normalizedTime = HORARIO_TIME_OPTIONS.includes(time) ? time : time;

  return {
    time: normalizedTime,
    period: normalizePeriod(periodRaw),
  };
}

export function formatHoraActoRecepAper(slot: HorarioTimeSlot): string {
  if (!isHorarioSlotComplete(slot)) return "";
  return `${slot.time} ${slot.period.toUpperCase()}`;
}

export function parseHoraActoRecepAper(value: string | undefined | null): HorarioTimeSlot {
  if (!value?.trim()) return { ...EMPTY_HORARIO_SLOT };

  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(am|pm|m)\b/i);
  if (!match) return { ...EMPTY_HORARIO_SLOT };

  return tokenToSlot(match[1] ?? "", match[2] ?? "", match[3] ?? "");
}

export function parseHorarioRetiroPliego(value: string | undefined | null): HorarioRetiroParts {
  if (!value?.trim()) {
    return {
      start1: { ...EMPTY_HORARIO_SLOT },
      end1: { ...EMPTY_HORARIO_SLOT },
      start2: { ...EMPTY_HORARIO_SLOT },
      end2: { ...EMPTY_HORARIO_SLOT },
    };
  }

  const matches = [...value.matchAll(TIME_TOKEN_REGEX)];
  const slots = matches.map((match) => tokenToSlot(match[1] ?? "", match[2] ?? "", match[3] ?? ""));

  return {
    start1: slots[0] ?? { ...EMPTY_HORARIO_SLOT },
    end1: slots[1] ?? { ...EMPTY_HORARIO_SLOT },
    start2: slots[2] ?? { ...EMPTY_HORARIO_SLOT },
    end2: slots[3] ?? { ...EMPTY_HORARIO_SLOT },
  };
}

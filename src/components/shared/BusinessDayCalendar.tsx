"use client";

import * as React from "react";
import type { DayButton } from "react-day-picker";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { formatIsoDate, isNonWorkingDay, isWeekend } from "@/lib/utils/diasNoLaborablesUtils";

function isFeriadoWeekday(
  date: Date,
  nonWorkingDays?: Set<string>,
  feriadoDescriptions?: Map<string, string>
): boolean {
  if (isWeekend(date)) return false;
  const iso = formatIsoDate(date);
  if (feriadoDescriptions?.has(iso)) return true;
  return Boolean(nonWorkingDays?.has(iso));
}

function getDisabledDayTooltip(
  date: Date,
  feriadoDescriptions?: Map<string, string>
): string | undefined {
  const iso = formatIsoDate(date);
  if (!isWeekend(date) && feriadoDescriptions?.has(iso)) {
    return feriadoDescriptions.get(iso) ?? "Día no laborable del ente";
  }
  if (isWeekend(date)) {
    return "Sábado y domingo no son días hábiles";
  }
  if (!isWeekend(date)) {
    return feriadoDescriptions?.get(iso) ?? "Día no laborable del ente";
  }
  return undefined;
}

type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;

export type BusinessDayCalendarProps = DistributiveOmit<
  React.ComponentProps<typeof Calendar>,
  "disabled" | "modifiers" | "modifiersClassNames" | "components"
> & {
  nonWorkingDays?: Set<string>;
  feriadoDescriptions?: Map<string, string>;
  /** Fechas adicionales a deshabilitar (además de fines de semana/feriados). */
  isDateDisabled?: (date: Date) => boolean;
  /** Tooltip para fechas deshabilitadas por `isDateDisabled` (tiene prioridad). */
  getExtraDisabledTooltip?: (date: Date) => string | undefined;
};

export function BusinessDayCalendar({
  nonWorkingDays,
  feriadoDescriptions,
  isDateDisabled,
  getExtraDisabledTooltip,
  classNames,
  ...props
}: BusinessDayCalendarProps) {
  const DayButtonWithTooltip = React.useCallback(
    (buttonProps: React.ComponentProps<typeof DayButton>) => {
      const { day, modifiers, className, ...rest } = buttonProps;
      const isExtraDisabled = Boolean(isDateDisabled?.(day.date));
      const tooltip = isExtraDisabled
        ? (getExtraDisabledTooltip?.(day.date) ??
          "No se pueden elegir fechas anteriores al acta de inicio")
        : getDisabledDayTooltip(day.date, feriadoDescriptions);
      const showTooltip = Boolean(
        tooltip && (modifiers.disabled || modifiers.feriado || modifiers.weekend)
      );

      const button = (
        <CalendarDayButton
          day={day}
          modifiers={modifiers}
          className={cn(
            modifiers.feriado &&
              !isExtraDisabled &&
              "!bg-cal-feriado-ente-bg !text-cal-feriado-ente hover:!bg-cal-feriado-ente-bg opacity-100",
            modifiers.weekend &&
              !modifiers.feriado &&
              !isExtraDisabled &&
              "!bg-cal-weekend-bg !text-muted-foreground hover:!bg-cal-weekend-bg opacity-100",
            className
          )}
          {...rest}
        />
      );

      if (!showTooltip) return button;

      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex w-full [&_button]:w-full">{button}</span>
          </TooltipTrigger>
          <TooltipContent side="top">{tooltip}</TooltipContent>
        </Tooltip>
      );
    },
    [feriadoDescriptions, getExtraDisabledTooltip, isDateDisabled]
  );

  return (
    <Calendar
      disabled={(date) => isNonWorkingDay(date, nonWorkingDays) || Boolean(isDateDisabled?.(date))}
      modifiers={{
        feriado: (date) => isFeriadoWeekday(date, nonWorkingDays, feriadoDescriptions),
        weekend: (date) => isWeekend(date),
      }}
      classNames={{
        disabled: "opacity-100",
        ...classNames,
      }}
      components={{ DayButton: DayButtonWithTooltip }}
      {...props}
    />
  );
}

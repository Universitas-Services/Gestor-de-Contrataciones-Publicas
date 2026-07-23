"use client";

import React from "react";
import { isSameMonth, isToday, differenceInDays } from "date-fns";
import type { IEvent } from "./types";
import {
  getDayNonWorkingInfo,
  getEventsForDay,
  isEventStart,
  isEventEnd,
  isResumingAfterNonWorkingDay,
  isPausingBeforeNonWorkingDay,
} from "./helpers";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { EventChip } from "./EventChip";

interface CalendarCellProps {
  day: Date;
  currentMonth: Date;
  events: IEvent[];
  nonWorkingDays?: Set<string>;
  feriadoDescriptions?: Map<string, string>;
  onEventDrop?: (eventId: string, diffInDays: number) => void;
}

export function CalendarCell({
  day,
  currentMonth,
  events,
  nonWorkingDays,
  feriadoDescriptions,
  onEventDrop,
}: CalendarCellProps) {
  const inCurrentMonth = isSameMonth(day, currentMonth);
  const today = isToday(day);
  const { isNonWorking, isWeekend, isFeriado, tooltip } = getDayNonWorkingInfo(
    day,
    nonWorkingDays,
    feriadoDescriptions
  );
  const dayEvents = getEventsForDay(events, day, nonWorkingDays);

  let cellBg = inCurrentMonth ? "bg-white" : "bg-slate-50/50";
  if (isFeriado) cellBg = inCurrentMonth ? "bg-cal-feriado-ente-bg" : "bg-cal-feriado-ente-bg/60";
  else if (isWeekend) cellBg = inCurrentMonth ? "bg-cal-weekend-bg" : "bg-cal-weekend-bg/60";

  const numClass = today
    ? "bg-navy text-white"
    : isNonWorking
      ? isFeriado
        ? "text-cal-feriado-ente"
        : "text-slate-400"
      : inCurrentMonth
        ? "text-heading-dark"
        : "text-slate-300";

  const cellClassName = `
        min-h-[110px] border-b border-r border-slate-200 transition-colors overflow-visible
        ${cellBg}
        ${isNonWorking ? "cursor-not-allowed select-none" : "hover:bg-slate-100/30"}
      `;

  const dragHandlers = {
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => {
      if (!isNonWorking) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      }
    },
    onDrop: (e: React.DragEvent<HTMLDivElement>) => {
      if (isNonWorking || !onEventDrop) return;
      e.preventDefault();
      try {
        const data = e.dataTransfer.getData("application/json");
        if (!data) return;
        const payload = JSON.parse(data);
        if (payload.eventId && payload.draggedFromDate) {
          const dragDate = new Date(payload.draggedFromDate);
          const diff = differenceInDays(day, dragDate);
          if (diff !== 0) {
            onEventDrop(payload.eventId, diff);
          }
        }
      } catch (error) {
        console.error("Failed to parse event drop payload", error);
      }
    },
  };

  const cellBody = (
    <>
      <div className="relative z-10 flex justify-end pr-1 pt-0.5 mb-1">
        <span
          className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${numClass}`}
        >
          {day.getDate()}
        </span>
      </div>

      <div className="flex flex-col gap-[2px] overflow-visible">
        {dayEvents.map((event) => (
          <EventChip
            key={event.id}
            event={event}
            day={day}
            isStart={isEventStart(event, day)}
            isEnd={isEventEnd(event, day)}
            isResuming={isResumingAfterNonWorkingDay(event, day, nonWorkingDays)}
            isPausing={isPausingBeforeNonWorkingDay(event, day, nonWorkingDays)}
          />
        ))}
      </div>
    </>
  );

  if (isFeriado && tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cellClassName} {...dragHandlers}>
            {cellBody}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">{tooltip}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className={cellClassName} {...dragHandlers}>
      {cellBody}
    </div>
  );
}

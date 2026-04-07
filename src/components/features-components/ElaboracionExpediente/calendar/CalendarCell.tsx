"use client";

import React from "react";
import { isSameMonth, isToday, differenceInDays } from "date-fns";
import type { IEvent } from "./types";
import {
  getEventsForDay,
  isEventStart,
  isEventEnd,
  isResumingAfterWeekend,
  isPausingBeforeWeekend,
} from "./helpers";
import { EventChip } from "./EventChip";

interface CalendarCellProps {
  day: Date;
  currentMonth: Date;
  events: IEvent[];
  onEventDrop?: (eventId: string, diffInDays: number) => void;
}

function isWeekend(d: Date): boolean {
  const dow = d.getDay();
  return dow === 0 || dow === 6;
}

export function CalendarCell({ day, currentMonth, events, onEventDrop }: CalendarCellProps) {
  const inCurrentMonth = isSameMonth(day, currentMonth);
  const today = isToday(day);
  const weekend = isWeekend(day);
  const dayEvents = getEventsForDay(events, day);

  // Cell background
  let cellBg = inCurrentMonth ? "bg-white" : "bg-slate-50/50";
  if (weekend) cellBg = inCurrentMonth ? "bg-slate-100" : "bg-slate-100/60";

  // Day number color
  const numClass = today
    ? "bg-navy text-white"
    : weekend
      ? "text-slate-400"
      : inCurrentMonth
        ? "text-heading-dark"
        : "text-slate-300";

  return (
    <div
      className={`
        min-h-[110px] border-b border-r border-slate-200 transition-colors overflow-visible
        ${cellBg}
        ${weekend ? "cursor-not-allowed select-none" : "hover:bg-slate-100/30"}
      `}
      title={weekend ? "Sábado y domingo no son días hábiles" : undefined}
      onDragOver={(e) => {
        if (!weekend) {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
        }
      }}
      onDrop={(e) => {
        if (weekend || !onEventDrop) return;
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
      }}
    >
      {/* Day number — top right */}
      <div className="relative z-10 flex justify-end pr-1 pt-0.5 mb-1">
        <span
          className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${numClass}`}
        >
          {day.getDate()}
        </span>
      </div>

      {/* Event bars — overflow:visible so continuation bars bleed across cell border */}
      <div className="flex flex-col gap-[2px] overflow-visible">
        {dayEvents.map((event) => (
          <EventChip
            key={event.id}
            event={event}
            day={day}
            isStart={isEventStart(event, day)}
            isEnd={isEventEnd(event, day)}
            isResuming={isResumingAfterWeekend(event, day)}
            isPausing={isPausingBeforeWeekend(event, day)}
          />
        ))}
      </div>
    </div>
  );
}

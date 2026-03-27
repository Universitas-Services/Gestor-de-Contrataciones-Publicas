"use client";

import React from "react";
import { isSameMonth, isToday } from "date-fns";
import type { IEvent } from "./types";
import { getEventsForDay, isEventStart } from "./helpers";
import { EventChip } from "./EventChip";

interface CalendarCellProps {
  day: Date;
  currentMonth: Date;
  events: IEvent[];
}

const MAX_VISIBLE_EVENTS = 3;

export function CalendarCell({ day, currentMonth, events }: CalendarCellProps) {
  const isCurrentMonth = isSameMonth(day, currentMonth);
  const isCurrentDay = isToday(day);
  const dayEvents = getEventsForDay(events, day);
  const visibleEvents = dayEvents.slice(0, MAX_VISIBLE_EVENTS);
  const hiddenCount = dayEvents.length - MAX_VISIBLE_EVENTS;

  return (
    <div
      className={`min-h-[100px] p-1 border-b border-r border-slate-200 transition-colors ${
        isCurrentMonth ? "bg-white" : "bg-slate-50/60"
      }`}
    >
      {/* Day number */}
      <div className="flex justify-end mb-1 pr-1 pt-0.5">
        <span
          className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
            isCurrentDay
              ? "bg-navy text-white"
              : isCurrentMonth
                ? "text-heading-dark"
                : "text-slate-400"
          }`}
        >
          {day.getDate()}
        </span>
      </div>

      {/* Event chips */}
      <div className="space-y-0.5">
        {visibleEvents.map((event) => (
          <EventChip key={event.id} event={event} continuation={!isEventStart(event, day)} />
        ))}
        {hiddenCount > 0 && (
          <p className="text-[10px] text-slate-400 font-medium pl-1">+{hiddenCount} más</p>
        )}
      </div>
    </div>
  );
}

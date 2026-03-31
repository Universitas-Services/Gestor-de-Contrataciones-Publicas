"use client";

import React from "react";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import type { IEvent } from "./types";
import { CalendarCell } from "./CalendarCell";

const DAY_HEADERS = ["DOMINGO", "LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"];

interface CalendarGridProps {
  currentMonth: Date;
  events: IEvent[];
  onEventDrop?: (eventId: string, diffInDays: number) => void;
}

export function CalendarGrid({ currentMonth, events, onEventDrop }: CalendarGridProps) {
  // Build the full grid: from start of the first week to end of the last week of the month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  return (
    <div className="w-full rounded-b-lg border border-slate-200 border-t-0 overflow-visible">
      {/* Day-of-week header row */}
      <div className="grid grid-cols-7 bg-heading-dark">
        {DAY_HEADERS.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-[11px] font-bold text-white tracking-wide"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid — overflow:visible so event bars can bleed across cell borders */}
      <div className="grid grid-cols-7 overflow-visible">
        {days.map((day, idx) => (
          <CalendarCell
            key={idx}
            day={day}
            currentMonth={currentMonth}
            events={events}
            onEventDrop={onEventDrop}
          />
        ))}
      </div>
    </div>
  );
}

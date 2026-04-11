"use client";

import React, { useState } from "react";
import { addMonths, subMonths } from "date-fns";
import type { IEvent } from "./types";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarGrid } from "./CalendarGrid";

interface ProcedureCalendarProps {
  events: IEvent[];
  /** Starting month to display. Defaults to current month. */
  initialMonth?: Date;
  onEventDrop?: (eventId: string, diffInDays: number) => void;
}

export function ProcedureCalendar({ events, initialMonth, onEventDrop }: ProcedureCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(initialMonth ?? new Date());

  const handlePrevMonth = () => setCurrentMonth((m) => subMonths(m, 1));
  const handleNextMonth = () => setCurrentMonth((m) => addMonths(m, 1));

  return (
    <div className="w-full rounded-xl overflow-hidden shadow-sm border border-slate-200">
      <div className="w-full overflow-x-auto pb-4">
        <div className="min-w-[768px]">
          <CalendarHeader
            currentMonth={currentMonth}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
          />
          <CalendarGrid currentMonth={currentMonth} events={events} onEventDrop={onEventDrop} />
        </div>
      </div>
    </div>
  );
}

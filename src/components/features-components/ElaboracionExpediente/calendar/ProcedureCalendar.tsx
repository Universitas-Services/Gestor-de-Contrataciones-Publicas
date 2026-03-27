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
}

export function ProcedureCalendar({ events, initialMonth }: ProcedureCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(initialMonth ?? new Date());

  const handlePrevMonth = () => setCurrentMonth((m) => subMonths(m, 1));
  const handleNextMonth = () => setCurrentMonth((m) => addMonths(m, 1));

  return (
    <div className="w-full rounded-xl overflow-hidden shadow-sm">
      <CalendarHeader
        currentMonth={currentMonth}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
      />
      <CalendarGrid currentMonth={currentMonth} events={events} />
    </div>
  );
}

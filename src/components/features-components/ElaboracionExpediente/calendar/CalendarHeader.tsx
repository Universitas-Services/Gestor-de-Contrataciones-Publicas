"use client";

import React from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMonthYear } from "./helpers";

interface CalendarHeaderProps {
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export function CalendarHeader({ currentMonth, onPrevMonth, onNextMonth }: CalendarHeaderProps) {
  const monthYearLabel = formatMonthYear(currentMonth);
  // Capitalize first letter ("marzo 2026" → "Marzo 2026")
  const displayLabel = monthYearLabel.charAt(0).toUpperCase() + monthYearLabel.slice(1);

  return (
    <div className="flex items-center justify-between mb-0 py-3 px-1 border border-slate-200 rounded-t-lg bg-white">
      {/* Left: icon + title */}
      <div className="flex items-center gap-2">
        <CalendarDays className="w-5 h-5 text-heading-dark" />
        <h3 className="text-base font-bold text-heading-dark">Cronograma</h3>
      </div>

      {/* Right: view icon + month nav */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onPrevMonth}
            className="h-8 w-8 text-slate-500 hover:text-heading-dark hover:bg-slate-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold text-heading-dark min-w-[100px] text-center">
            {displayLabel}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onNextMonth}
            className="h-8 w-8 text-slate-500 hover:text-heading-dark hover:bg-slate-100"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

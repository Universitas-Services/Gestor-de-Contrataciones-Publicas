"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, MousePointerClick, SquareCheckBig } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatIsoDate, isNonWorkingDay, isWeekend } from "@/lib/utils/diasNoLaborablesUtils";

interface FeriadosCalendarProps {
  feriadoDates: Set<string>;
  feriadoDescriptions: Map<string, string>;
  selectedYear: number;
  bulkMode: boolean;
  selectedDates: Set<string>;
  onBulkModeChange: (enabled: boolean) => void;
  onToggleSelect: (dateIso: string) => void;
  onClearSelection: () => void;
  onOpenBulkDialog: () => void;
  onDayClick: (dateIso: string) => void;
}

const DAY_HEADERS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function getInitialMonth(selectedYear: number): Date {
  const now = new Date();
  if (selectedYear === now.getFullYear()) {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  return new Date(selectedYear, 0, 1);
}

function isSelectableDay(day: Date, inMonth: boolean, feriadoDates: Set<string>): boolean {
  if (!inMonth) return false;
  if (isWeekend(day)) return false;
  if (feriadoDates.has(formatIsoDate(day))) return false;
  return true;
}

export function FeriadosCalendar({
  feriadoDates,
  feriadoDescriptions,
  selectedYear,
  bulkMode,
  selectedDates,
  onBulkModeChange,
  onToggleSelect,
  onClearSelection,
  onOpenBulkDialog,
  onDayClick,
}: FeriadosCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => getInitialMonth(selectedYear));

  useEffect(() => {
    setCurrentMonth(getInitialMonth(selectedYear));
  }, [selectedYear]);

  const goToPreviousMonth = () => {
    setCurrentMonth((month) => {
      const next = subMonths(month, 1);
      if (next.getFullYear() < selectedYear) return month;
      return next;
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth((month) => {
      const next = addMonths(month, 1);
      if (next.getFullYear() > selectedYear) return month;
      return next;
    });
  };

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [currentMonth]);

  const handleDayClick = (day: Date, iso: string, selectable: boolean) => {
    if (bulkMode) {
      if (selectable) onToggleSelect(iso);
      return;
    }
    onDayClick(iso);
  };

  return (
    <div className="rounded-xl border border-border-light overflow-hidden bg-white">
      <div className="flex flex-col gap-3 px-4 py-3 border-b border-border-light bg-muted/30 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between gap-2 sm:justify-start">
          <Button type="button" variant="ghost" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="font-semibold text-heading-dark capitalize min-w-[140px] text-center">
            {format(currentMonth, "MMMM yyyy", { locale: es })}
          </h3>
          <Button type="button" variant="ghost" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Button
          type="button"
          variant={bulkMode ? "default" : "outline"}
          size="sm"
          className={bulkMode ? "bg-navy hover:bg-navy-hover" : ""}
          onClick={() => onBulkModeChange(!bulkMode)}
        >
          {bulkMode ? (
            <>
              <SquareCheckBig className="h-4 w-4 mr-2" />
              Selección múltiple activa
            </>
          ) : (
            <>
              <MousePointerClick className="h-4 w-4 mr-2" />
              Selección múltiple
            </>
          )}
        </Button>
      </div>

      {bulkMode && (
        <div className="px-4 py-2 border-b border-border-light bg-cal-bulk-selected-bg/50 text-xs text-text-muted-dark">
          Haga clic en días hábiles sin feriado para agregarlos al lote. Los fines de semana y
          feriados ya registrados no son seleccionables.
        </div>
      )}

      <div className="grid grid-cols-7 border-b border-border-light bg-heading-dark">
        {DAY_HEADERS.map((day) => (
          <div key={day} className="py-2 text-center text-[11px] font-bold text-white">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day) => {
          const iso = formatIsoDate(day);
          const inMonth = isSameMonth(day, currentMonth);
          const weekend = isWeekend(day);
          const isFeriado = feriadoDates.has(iso);
          const isSelected = selectedDates.has(iso);
          const selectable = isSelectableDay(day, inMonth, feriadoDates);
          const nonWorking = isNonWorkingDay(day, feriadoDates);

          let cellClass = inMonth ? "bg-white" : "bg-muted/20";
          if (isSelected)
            cellClass = "bg-cal-bulk-selected-bg ring-2 ring-inset ring-cal-bulk-selected-border";
          else if (isFeriado) cellClass = "bg-cal-feriado-ente-bg";
          else if (weekend) cellClass = "bg-cal-weekend-bg";

          const tooltip = isFeriado
            ? (feriadoDescriptions.get(iso) ?? "Día no laborable del ente")
            : weekend
              ? "Fin de semana"
              : bulkMode && !selectable
                ? "No seleccionable"
                : bulkMode
                  ? "Clic para seleccionar"
                  : undefined;

          return (
            <button
              key={iso}
              type="button"
              title={tooltip}
              disabled={bulkMode && !selectable && !isSelected}
              onClick={() => handleDayClick(day, iso, selectable || isSelected)}
              className={`min-h-[72px] border-b border-r border-border-light p-1 text-left transition-colors ${
                bulkMode && selectable ? "hover:bg-cal-bulk-selected-bg/70 cursor-pointer" : ""
              } ${bulkMode && !selectable && !isSelected ? "cursor-not-allowed opacity-60" : ""} ${
                !bulkMode ? "hover:opacity-90" : ""
              } ${cellClass} ${!inMonth ? "opacity-50" : ""}`}
            >
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                  isToday(day)
                    ? "bg-navy text-white"
                    : isSelected
                      ? "bg-cal-bulk-selected-border text-white"
                      : nonWorking
                        ? "text-muted-foreground"
                        : "text-heading-dark"
                } ${isFeriado && !isSelected ? "text-cal-feriado-ente" : ""}`}
              >
                {day.getDate()}
              </span>
            </button>
          );
        })}
      </div>

      {bulkMode && selectedDates.size > 0 && (
        <div className="flex flex-col gap-3 border-t border-border-light px-4 py-3 sm:flex-row sm:items-center sm:justify-between bg-cal-bulk-selected-bg/40">
          <Badge variant="outline" className="w-fit border-cal-bulk-selected-border">
            {selectedDates.size} día{selectedDates.size === 1 ? "" : "s"} seleccionado
            {selectedDates.size === 1 ? "" : "s"}
          </Badge>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClearSelection}>
              Limpiar
            </Button>
            <Button
              type="button"
              size="sm"
              className="bg-navy hover:bg-navy-hover"
              onClick={onOpenBulkDialog}
            >
              Registrar seleccionados
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-4 px-4 py-3 border-t border-border-light text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-cal-weekend-bg border border-border-light" />
          Fin de semana
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-cal-feriado-ente-bg border border-cal-feriado-ente" />
          Feriado del ente
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-cal-bulk-selected-bg border border-cal-bulk-selected-border" />
          Seleccionado
        </div>
      </div>
    </div>
  );
}

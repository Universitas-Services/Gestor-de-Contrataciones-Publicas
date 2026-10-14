"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface OpenDatePickerFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

/** Datepicker con selector de mes/año; permite cualquier día del calendario. */
export function OpenDatePickerField({
  value,
  onChange,
  disabled = false,
  placeholder = "Seleccione una fecha",
  className,
}: OpenDatePickerFieldProps) {
  const selectedDate = value ? new Date(`${value}T00:00:00`) : undefined;
  const currentYear = new Date().getFullYear();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-10 w-full justify-between border-slate-300 bg-white px-3 text-left text-sm font-normal shadow-none",
            !value ? "text-slate-400" : "text-slate-700",
            className
          )}
        >
          {value ? format(selectedDate!, "dd/MM/yyyy", { locale: es }) : placeholder}
          <CalendarIcon className="h-4 w-4 shrink-0 text-slate-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          captionLayout="dropdown"
          fromYear={currentYear - 20}
          toYear={currentYear + 1}
          selected={selectedDate}
          onSelect={(date) => {
            if (date) onChange(format(date, "yyyy-MM-dd"));
          }}
          locale={es}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

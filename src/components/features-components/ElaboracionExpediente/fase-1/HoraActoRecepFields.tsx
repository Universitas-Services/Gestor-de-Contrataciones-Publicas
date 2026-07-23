"use client";

import { useState } from "react";
import { Clock } from "lucide-react";

import {
  formatHoraActoRecepAper,
  HORARIO_PERIOD_OPTIONS,
  HORARIO_TIME_OPTIONS,
  parseHoraActoRecepAper,
  type HorarioPeriodo,
  type HorarioTimeSlot,
} from "@/lib/utils/fase1Horario";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HoraActoRecepFieldsProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}

const timeTriggerClass =
  "h-[32px] min-w-[88px] rounded-md border-slate-300 bg-white px-2 text-[11px] font-medium text-slate-600 shadow-none focus-visible:ring-[2px]";
const periodTriggerClass =
  "h-[32px] min-w-[64px] rounded-md border-slate-300 bg-white px-2 text-[11px] font-medium text-slate-600 shadow-none focus-visible:ring-[2px]";

export function HoraActoRecepFields({ value, onChange, onBlur }: HoraActoRecepFieldsProps) {
  const [slot, setSlot] = useState<HorarioTimeSlot>(() => parseHoraActoRecepAper(value));
  const [syncedValue, setSyncedValue] = useState(value);

  if (value !== syncedValue) {
    setSyncedValue(value);
    const formatted = formatHoraActoRecepAper(slot);
    if (value !== formatted && (value || formatted)) {
      setSlot(parseHoraActoRecepAper(value));
    }
  }

  const updateSlot = (next: HorarioTimeSlot) => {
    setSlot(next);
    onChange(formatHoraActoRecepAper(next));
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-8 w-8 shrink-0 border-slate-300 text-slate-500"
        tabIndex={-1}
        aria-hidden
      >
        <Clock className="h-4 w-4" />
      </Button>

      <Select
        value={slot.time || undefined}
        onValueChange={(time) => updateSlot({ ...slot, time })}
      >
        <SelectTrigger className={timeTriggerClass} onBlur={onBlur}>
          <SelectValue placeholder="HH:mm" />
        </SelectTrigger>
        <SelectContent>
          {HORARIO_TIME_OPTIONS.map((time) => (
            <SelectItem key={time} value={time}>
              {time}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={slot.period || undefined}
        onValueChange={(period) => updateSlot({ ...slot, period: period as HorarioPeriodo })}
      >
        <SelectTrigger className={periodTriggerClass} onBlur={onBlur}>
          <SelectValue placeholder="AM/PM" />
        </SelectTrigger>
        <SelectContent>
          {HORARIO_PERIOD_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label.toUpperCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

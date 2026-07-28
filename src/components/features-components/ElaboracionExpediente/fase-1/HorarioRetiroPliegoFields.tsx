"use client";

import { useEffect, useState } from "react";

import {
  formatHorarioRetiroPliego,
  HORARIO_PERIOD_OPTIONS,
  HORARIO_TIME_OPTIONS,
  parseHorarioRetiroPliego,
  previewHorarioRetiroPliego,
  type HorarioPeriodo,
  type HorarioRetiroParts,
  type HorarioTimeSlot,
} from "@/lib/utils/fase1Horario";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HorarioRetiroPliegoFieldsProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}

const timeTriggerClass =
  "h-[32px] min-w-[72px] rounded-md border-slate-300 bg-white px-2 text-[11px] font-medium text-slate-600 shadow-none focus-visible:ring-[2px]";
const periodTriggerClass =
  "h-[32px] min-w-[56px] rounded-md border-slate-300 bg-white px-2 text-[11px] font-medium text-slate-600 shadow-none focus-visible:ring-[2px]";

function TimeSlotSelects({
  slot,
  onChange,
  onBlur,
  ariaLabel,
}: {
  slot: HorarioTimeSlot;
  onChange: (next: HorarioTimeSlot) => void;
  onBlur?: () => void;
  ariaLabel: string;
}) {
  return (
    <div className="flex items-center gap-1" role="group" aria-label={ariaLabel}>
      <Select value={slot.time || undefined} onValueChange={(time) => onChange({ ...slot, time })}>
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
        onValueChange={(period) => onChange({ ...slot, period: period as HorarioPeriodo })}
      >
        <SelectTrigger className={periodTriggerClass} onBlur={onBlur}>
          <SelectValue placeholder="—" />
        </SelectTrigger>
        <SelectContent>
          {HORARIO_PERIOD_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function HorarioRetiroPliegoFields({
  value,
  onChange,
  onBlur,
}: HorarioRetiroPliegoFieldsProps) {
  const [parts, setParts] = useState<HorarioRetiroParts>(() => parseHorarioRetiroPliego(value));

  useEffect(() => {
    setParts(parseHorarioRetiroPliego(value));
  }, [value]);

  const handleSlotChange = (key: keyof HorarioRetiroParts, nextSlot: HorarioTimeSlot) => {
    const next = { ...parts, [key]: nextSlot };
    setParts(next);
    onChange(formatHorarioRetiroPliego(next));
  };

  const preview = previewHorarioRetiroPliego(parts);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <TimeSlotSelects
          slot={parts.start1}
          onChange={(slot) => handleSlotChange("start1", slot)}
          onBlur={onBlur}
          ariaLabel="Inicio tramo 1"
        />
        <span className="text-[11px] font-semibold text-slate-500">a</span>
        <TimeSlotSelects
          slot={parts.end1}
          onChange={(slot) => handleSlotChange("end1", slot)}
          onBlur={onBlur}
          ariaLabel="Fin tramo 1"
        />
        <span className="text-[11px] font-semibold text-slate-500">y</span>
        <TimeSlotSelects
          slot={parts.start2}
          onChange={(slot) => handleSlotChange("start2", slot)}
          onBlur={onBlur}
          ariaLabel="Inicio tramo 2"
        />
        <span className="text-[11px] font-semibold text-slate-500">a</span>
        <TimeSlotSelects
          slot={parts.end2}
          onChange={(slot) => handleSlotChange("end2", slot)}
          onBlur={onBlur}
          ariaLabel="Fin tramo 2"
        />
      </div>
      {preview ? (
        <p className="text-[10px] font-medium text-slate-500">{preview}</p>
      ) : (
        <p className="text-[10px] italic text-slate-400">
          Complete ambos tramos (ej. 08:00am a 12:00pm y 01:00pm a 04:00pm)
        </p>
      )}
    </div>
  );
}

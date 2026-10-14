"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** Solo dígitos; entero positivo (≥ 1). Opcionalmente acota al máximo. */
export function normalizePuntajeEnteroInput(value: string, max?: number): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";

  const num = Number(digits);
  if (!Number.isFinite(num) || num < 1) return "";
  if (max !== undefined && num > max) return String(max);

  return String(num);
}

interface PuntajeEnteroInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  /** Tope opcional (p. ej. 10 para VAN). */
  max?: number;
}

export function PuntajeEnteroInput({
  value,
  onChange,
  disabled = false,
  className,
  placeholder = "Ej: 5",
  max,
}: PuntajeEnteroInputProps) {
  return (
    <Input
      value={value ?? ""}
      disabled={disabled}
      inputMode="numeric"
      min={1}
      max={max}
      placeholder={placeholder}
      className={cn(className)}
      onChange={(event) => {
        onChange(normalizePuntajeEnteroInput(event.target.value, max));
      }}
      onBlur={() => {
        if (!value) return;
        onChange(normalizePuntajeEnteroInput(value, max));
      }}
    />
  );
}

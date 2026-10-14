"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function normalizeVanPuntajeInput(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";

  const num = Number(digits);
  if (num > 10) return "10";
  if (num < 1) return "";

  return String(num);
}

interface VanPuntajeInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export function VanPuntajeInput({
  value,
  onChange,
  disabled = false,
  className,
  placeholder = "Ej: 5",
}: VanPuntajeInputProps) {
  return (
    <Input
      value={value ?? ""}
      disabled={disabled}
      inputMode="numeric"
      min={1}
      max={10}
      placeholder={placeholder}
      className={cn(className)}
      onChange={(event) => {
        onChange(normalizeVanPuntajeInput(event.target.value));
      }}
      onBlur={() => {
        if (!value) return;
        onChange(normalizeVanPuntajeInput(value));
      }}
    />
  );
}

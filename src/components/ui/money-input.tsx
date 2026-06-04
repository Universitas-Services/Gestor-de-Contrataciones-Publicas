"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type MoneyInputProps = Omit<React.ComponentProps<"input">, "value"> & {
  value?: string | number;
  onValueChange?: (cleanValue: string, formattedValue: string) => void;
};

function extractDigits(value: string | number | undefined): string {
  if (value === undefined || value === null) return "";
  return String(value).replace(/\D/g, "");
}

function formatFromDigits(digits: string): { formatted: string; clean: string } {
  if (!digits) return { formatted: "", clean: "" };

  const normalized = digits.replace(/^0+/, "") || "0";
  const padded = normalized.padStart(3, "0");
  const integerPart = padded.slice(0, -2).replace(/^0+/, "") || "0";
  const decimalPart = padded.slice(-2);

  const integerFormatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const formatted = `${integerFormatted},${decimalPart}`;
  const clean = `${integerPart},${decimalPart}`;

  return { formatted, clean };
}

const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ className, value, onChange, onFocus, onValueChange, ...props }, forwardedRef) => {
    const innerRef = React.useRef<HTMLInputElement>(null);
    const [displayValue, setDisplayValue] = React.useState(
      () => formatFromDigits(extractDigits(value)).formatted
    );

    React.useImperativeHandle(forwardedRef, () => innerRef.current as HTMLInputElement);

    React.useEffect(() => {
      const { formatted } = formatFromDigits(extractDigits(value));
      setDisplayValue(formatted);
    }, [value]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const digits = extractDigits(event.target.value);
      const { formatted, clean } = formatFromDigits(digits);

      setDisplayValue(formatted);
      onValueChange?.(clean, formatted);
      onChange?.(event);
    };

    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
      requestAnimationFrame(() => {
        const target = innerRef.current;
        if (!target) return;
        const end = target.value.length;
        target.setSelectionRange(end, end);
      });
      onFocus?.(event);
    };

    return (
      <input
        ref={innerRef}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input h-9 w-full min-w-0 rounded-sm border bg-white px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className
        )}
        {...props}
      />
    );
  }
);

MoneyInput.displayName = "MoneyInput";

export { MoneyInput };

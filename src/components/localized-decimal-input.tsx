"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type LocalizedDecimalInputProps = Omit<
  React.ComponentProps<"input">,
  "value" | "defaultValue" | "onChange"
> & {
  fractionDigits?: number;
  outputMode?: "formatted" | "raw";
  value?: string | number;
  onValueChange?: (formattedValue: string) => void;
};

function extractDigits(value: string | number | undefined, fractionDigits: number) {
  if (value === undefined || value === null) return "0";

  if (typeof value === "number") {
    return value.toFixed(fractionDigits).replace(/\D/g, "");
  }

  const digits = value.replace(/\D/g, "");
  return digits || "0";
}

function formatFromDigits(digits: string, fractionDigits: number) {
  const normalized = digits.replace(/^0+/, "") || "0";
  const padded = normalized.padStart(Math.max(1, fractionDigits + 1), "0");
  const integerPart =
    (fractionDigits === 0 ? padded : padded.slice(0, -fractionDigits)).replace(/^0+/, "") || "0";
  const integerFormatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  if (fractionDigits === 0) {
    return {
      formatted: integerFormatted,
      raw: integerPart,
    };
  }

  const decimalPart = padded.slice(-fractionDigits);

  return {
    formatted: `${integerFormatted},${decimalPart}`,
    raw: `${integerPart},${decimalPart}`,
  };
}

const LocalizedDecimalInput = React.forwardRef<HTMLInputElement, LocalizedDecimalInputProps>(
  (
    {
      className,
      value,
      fractionDigits = 2,
      outputMode = "formatted",
      onBlur,
      onFocus,
      onClick,
      onKeyDown,
      onPaste,
      onValueChange,
      ...props
    },
    ref
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [displayValue, setDisplayValue] = React.useState(
      () => formatFromDigits(extractDigits(value, fractionDigits), fractionDigits).formatted
    );

    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    React.useEffect(() => {
      setDisplayValue(
        formatFromDigits(extractDigits(value, fractionDigits), fractionDigits).formatted
      );
    }, [fractionDigits, value]);

    const moveCaretToEnd = React.useCallback(() => {
      requestAnimationFrame(() => {
        const input = inputRef.current;
        if (!input) return;
        const end = input.value.length;
        input.setSelectionRange(end, end);
      });
    }, []);

    const commitDigits = React.useCallback(
      (digits: string) => {
        const { formatted, raw } = formatFromDigits(digits, fractionDigits);
        setDisplayValue(formatted);
        onValueChange?.(outputMode === "raw" ? raw : formatted);
        moveCaretToEnd();
      },
      [fractionDigits, moveCaretToEnd, onValueChange, outputMode]
    );

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      commitDigits(extractDigits(event.target.value, fractionDigits));
    };

    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
      moveCaretToEnd();
      onFocus?.(event);
    };

    const handleClick = (event: React.MouseEvent<HTMLInputElement>) => {
      moveCaretToEnd();
      onClick?.(event);
    };

    const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
      onPaste?.(event);
      if (event.defaultPrevented || props.readOnly || props.disabled) return;

      event.preventDefault();
      commitDigits(extractDigits(event.clipboardData.getData("text"), fractionDigits));
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight" || event.key === "Home") {
        event.preventDefault();
        moveCaretToEnd();
      }

      onKeyDown?.(event);
    };

    return (
      <input
        {...props}
        ref={inputRef}
        type="text"
        data-slot="input"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        onBlur={onBlur}
        onFocus={handleFocus}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input h-9 w-full min-w-0 rounded-sm border bg-white px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className
        )}
      />
    );
  }
);

LocalizedDecimalInput.displayName = "LocalizedDecimalInput";

export { LocalizedDecimalInput };

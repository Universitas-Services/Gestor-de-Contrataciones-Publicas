"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type BankAccountInputProps = {
  value?: string;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onValueChange?: (value: string) => void;
  segmentLengths?: number[];
  separator?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  name?: string;
};

function extractDigits(value: string | undefined) {
  return (value ?? "").replace(/\D/g, "");
}

function splitValueIntoSegments(
  value: string | undefined,
  segmentLengths: number[],
  separator: string
) {
  if (value?.includes(separator)) {
    const rawSegments = value.split(separator);

    return segmentLengths.map((length, index) =>
      (rawSegments[index] ?? "").replace(/\D/g, "").slice(0, length)
    );
  }

  const digits = extractDigits(value);
  const segments: string[] = [];
  let cursor = 0;

  for (const length of segmentLengths) {
    segments.push(digits.slice(cursor, cursor + length));
    cursor += length;
  }

  return segments;
}

function joinSegments(segments: string[], separator: string) {
  if (segments.every((segment) => segment.length === 0)) {
    return "";
  }

  return segments.join(separator);
}

function focusInputAt(
  refs: React.RefObject<Array<HTMLInputElement | null>>,
  index: number,
  placeAtEnd = false
) {
  const target = refs.current[index];
  if (!target) return;

  target.focus();

  const caretPosition = placeAtEnd ? target.value.length : 0;
  requestAnimationFrame(() => {
    target.setSelectionRange(caretPosition, caretPosition);
  });
}

function setCaretPosition(
  refs: React.RefObject<Array<HTMLInputElement | null>>,
  index: number,
  position: number
) {
  const target = refs.current[index];
  if (!target) return;

  target.focus();

  requestAnimationFrame(() => {
    target.setSelectionRange(position, position);
  });
}

const DEFAULT_SEGMENT_LENGTHS = [4, 4, 2, 10];

const BankAccountInput = React.forwardRef<HTMLInputElement, BankAccountInputProps>(
  (
    {
      value,
      onBlur,
      onValueChange,
      segmentLengths = DEFAULT_SEGMENT_LENGTHS,
      separator = "-",
      className,
      inputClassName,
      disabled = false,
      name,
    },
    forwardedRef
  ) => {
    const inputRefs = React.useRef<Array<HTMLInputElement | null>>([]);
    const [segments, setSegments] = React.useState(() =>
      splitValueIntoSegments(value, segmentLengths, separator)
    );

    React.useImperativeHandle(forwardedRef, () => inputRefs.current[0] as HTMLInputElement, []);

    React.useEffect(() => {
      setSegments(splitValueIntoSegments(value, segmentLengths, separator));
    }, [segmentLengths, separator, value]);

    const updateSegments = React.useCallback(
      (nextSegments: string[]) => {
        setSegments(nextSegments);
        onValueChange?.(joinSegments(nextSegments, separator));
      },
      [onValueChange, separator]
    );

    const handleChange = (index: number, rawValue: string) => {
      const digits = rawValue.replace(/\D/g, "");
      const nextSegments = [...segments];
      nextSegments[index] = digits.slice(0, segmentLengths[index]);

      updateSegments(nextSegments);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
      if (/^\d$/.test(event.key)) {
        const selectionStart = event.currentTarget.selectionStart ?? 0;
        const selectionEnd = event.currentTarget.selectionEnd ?? selectionStart;
        const currentSegment = segments[index] ?? "";
        const maxLength = segmentLengths[index];
        const hasSelection = selectionStart !== selectionEnd;

        if (currentSegment.length >= maxLength && !hasSelection && selectionStart < maxLength) {
          event.preventDefault();

          const nextSegments = [...segments];
          nextSegments[index] = [
            currentSegment.slice(0, selectionStart),
            event.key,
            currentSegment.slice(selectionStart + 1),
          ].join("");

          updateSegments(nextSegments);
          setCaretPosition(inputRefs, index, Math.min(selectionStart + 1, maxLength));
          return;
        }
      }

      if (event.key === "Tab") {
        return;
      }

      if (event.key === "Backspace" && segments[index].length === 0 && index > 0) {
        event.preventDefault();
        focusInputAt(inputRefs, index - 1, true);
      }

      if (
        event.key === "ArrowLeft" &&
        (event.currentTarget.selectionStart ?? 0) === 0 &&
        index > 0
      ) {
        event.preventDefault();
        focusInputAt(inputRefs, index - 1, true);
      }

      if (
        event.key === "ArrowRight" &&
        (event.currentTarget.selectionStart ?? 0) === event.currentTarget.value.length &&
        index < segmentLengths.length - 1
      ) {
        event.preventDefault();
        focusInputAt(inputRefs, index + 1);
      }
    };

    const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>, index: number) => {
      event.preventDefault();

      const digits = event.clipboardData.getData("text").replace(/\D/g, "");
      if (!digits) return;

      const nextSegments = [...segments];
      let remaining = digits;

      for (let currentIndex = index; currentIndex < segmentLengths.length; currentIndex += 1) {
        const segmentLength = segmentLengths[currentIndex];
        nextSegments[currentIndex] = remaining.slice(0, segmentLength);
        remaining = remaining.slice(segmentLength);
        if (!remaining) break;
      }

      updateSegments(nextSegments);

      const nextFocusIndex = nextSegments.findIndex(
        (segment, currentIndex) => segment.length < segmentLengths[currentIndex]
      );

      focusInputAt(
        inputRefs,
        nextFocusIndex === -1 ? segmentLengths.length - 1 : nextFocusIndex,
        nextFocusIndex === -1
      );
    };

    return (
      <div className={cn("flex flex-wrap items-center gap-2", className)}>
        {segmentLengths.map((segmentLength, index) => (
          <React.Fragment key={`${segmentLength}-${index}`}>
            <input
              ref={(node) => {
                inputRefs.current[index] = node;
              }}
              name={index === 0 ? name : undefined}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              disabled={disabled}
              maxLength={segmentLength}
              value={segments[index] ?? ""}
              onChange={(event) => handleChange(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              onPaste={(event) => handlePaste(event, index)}
              onBlur={onBlur}
              className={cn(
                "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input h-9 min-w-0 rounded-sm border bg-white px-3 py-1 text-center text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                inputClassName
              )}
              style={{
                width: `${Math.max(72, segmentLength * 13)}px`,
              }}
            />

            {index < segmentLengths.length - 1 ? (
              <span className="text-[12px] font-semibold text-slate-500">{separator}</span>
            ) : null}
          </React.Fragment>
        ))}
      </div>
    );
  }
);

BankAccountInput.displayName = "BankAccountInput";

export { BankAccountInput };

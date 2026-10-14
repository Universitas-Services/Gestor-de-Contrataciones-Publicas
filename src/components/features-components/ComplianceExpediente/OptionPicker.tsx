"use client";

import { Button } from "@/components/ui/button";

export interface OptionItem {
  value: string;
  label: string;
  hint?: string;
}

interface Props {
  title: string;
  options: OptionItem[];
  disabled?: boolean;
  onSelect: (value: string) => void;
}

export function OptionPicker({ title, options, disabled, onSelect }: Props) {
  return (
    <div className="self-start w-full max-w-[min(720px,92%)] space-y-2">
      <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
        {title}
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((opt) => (
          <Button
            key={opt.value}
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={() => onSelect(opt.value)}
            className="h-auto min-h-11 flex-col items-start gap-0.5 whitespace-normal border-border-light px-3 py-2.5 text-left font-normal hover:border-navy hover:bg-slate-bg"
          >
            <span className="text-sm font-medium text-heading-dark">{opt.label}</span>
            {opt.hint ? (
              <span className="text-[11px] leading-snug text-muted-foreground">{opt.hint}</span>
            ) : null}
          </Button>
        ))}
      </div>
    </div>
  );
}

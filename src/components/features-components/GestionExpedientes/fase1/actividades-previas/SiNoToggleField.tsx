"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SiNoToggleFieldProps {
  value: boolean | undefined;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
}

export function SiNoToggleField({
  value,
  onChange,
  disabled = false,
  className,
  buttonClassName,
}: SiNoToggleFieldProps) {
  const baseButtonClass =
    "h-10 flex-1 rounded-lg border text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className={cn("flex gap-3", className)}>
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        className={cn(
          baseButtonClass,
          buttonClassName,
          value === true
            ? "!border-navy !bg-navy !text-white hover:!bg-navy-hover hover:!text-white"
            : "!border-slate-300 !bg-white !text-slate-500 hover:!border-slate-400 hover:!text-slate-700"
        )}
        onClick={() => onChange(true)}
      >
        SÍ
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        className={cn(
          baseButtonClass,
          buttonClassName,
          value === false
            ? "!border-navy !bg-navy !text-white hover:!bg-navy-hover hover:!text-white"
            : "!border-slate-300 !bg-white !text-slate-500 hover:!border-slate-400 hover:!text-slate-700"
        )}
        onClick={() => onChange(false)}
      >
        NO
      </Button>
    </div>
  );
}

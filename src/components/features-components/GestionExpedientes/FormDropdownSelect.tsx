"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface FormDropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
  className?: string;
}

export interface FormDropdownSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  options: FormDropdownOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  matchTriggerWidth?: boolean;
  "aria-label"?: string;
  "aria-invalid"?: boolean;
}

/**
 * Desplegable de formulario basado en DropdownMenu (Shadcn),
 * alineado con el patrón usado en formularios del ente (prefijo, RIF, etc.).
 */
export function FormDropdownSelect({
  value,
  onValueChange,
  options,
  placeholder = "Selecciona una opción",
  disabled = false,
  className,
  triggerClassName,
  contentClassName,
  matchTriggerWidth = true,
  "aria-label": ariaLabel,
  "aria-invalid": ariaInvalid,
}: FormDropdownSelectProps) {
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const [menuWidth, setMenuWidth] = React.useState<number | undefined>(undefined);
  const selected = options.find((o) => o.value === value && !o.disabled);

  const syncWidth = () => {
    if (matchTriggerWidth && triggerRef.current) {
      setMenuWidth(triggerRef.current.offsetWidth);
    }
  };

  return (
    <div className={cn("w-full min-w-0", className)}>
      <DropdownMenu
        onOpenChange={(open) => {
          if (open) syncWidth();
        }}
      >
        <DropdownMenuTrigger asChild disabled={disabled}>
          <Button
            ref={triggerRef}
            type="button"
            variant="outline"
            disabled={disabled}
            aria-label={ariaLabel}
            aria-invalid={ariaInvalid}
            className={cn(
              "h-11 w-full justify-between border-slate-300 bg-white font-normal font-inter text-sm shadow-none",
              "hover:bg-white hover:text-heading-dark",
              "focus-visible:ring-1 focus-visible:ring-color-boton-2/30",
              !selected && "text-slate-400",
              selected && "text-slate-600",
              triggerClassName
            )}
          >
            <span className="truncate text-left">{selected?.label ?? placeholder}</span>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          style={menuWidth ? { width: menuWidth } : undefined}
          className={cn("max-h-72 overflow-y-auto", contentClassName)}
        >
          {options.length === 0 ? (
            <DropdownMenuItem disabled className="font-inter text-slate-400">
              Sin opciones disponibles
            </DropdownMenuItem>
          ) : (
            options.map((opt) => (
              <Tooltip key={opt.value} delayDuration={200}>
                <TooltipTrigger asChild>
                  <DropdownMenuItem
                    disabled={opt.disabled}
                    className={cn(
                      "font-inter cursor-pointer",
                      opt.value === value && "bg-accent",
                      opt.className
                    )}
                    onClick={() => {
                      if (!opt.disabled) onValueChange(opt.value);
                    }}
                  >
                    <span className="flex-1 truncate">{opt.label}</span>
                    {opt.value === value && <Check className="h-4 w-4 shrink-0 text-navy" />}
                  </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  sideOffset={6}
                  className="max-w-sm text-left text-balance z-[100]"
                >
                  {opt.label}
                </TooltipContent>
              </Tooltip>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

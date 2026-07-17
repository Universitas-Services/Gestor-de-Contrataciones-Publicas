"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoneyInput } from "@/components/ui/money-input";
import { cn } from "@/lib/utils";
import type { MonedaEntrada } from "@/lib/schemas/gestionExpedienteSchema";

export interface CurrencyMoneyInputProps {
  moneda: MonedaEntrada;
  onMonedaChange: (moneda: MonedaEntrada) => void;
  value?: number | null;
  onValueChange: (value: number | null, formatted: string) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
  "aria-invalid"?: boolean;
}

function parseCleanToNumber(clean: string): number | null {
  if (!clean) return null;
  const n = Number.parseFloat(clean.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

/**
 * Dropdown de moneda ($ | Bs.) acoplado a MoneyInput, estilo prefijo RIF.
 * Ambos controles usan la misma altura (h-11).
 */
export function CurrencyMoneyInput({
  moneda,
  onMonedaChange,
  value,
  onValueChange,
  disabled = false,
  className,
  id,
  "aria-invalid": ariaInvalid,
}: CurrencyMoneyInputProps) {
  const monedaLabel = moneda === "USD" ? "$" : "Bs.";

  return (
    <div className={cn("flex items-stretch w-full h-11", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={disabled}>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            aria-label="Moneda"
            className={cn(
              "w-[72px] h-11 min-h-11 max-h-11 rounded-r-none border-r-0 border-slate-300 bg-white font-medium shrink-0 shadow-none",
              "hover:bg-white justify-between px-2",
              "focus-visible:ring-1 focus-visible:ring-color-boton-2/30"
            )}
          >
            {monedaLabel}
            <ChevronDown className="h-3.5 w-3.5 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[72px] min-w-[72px]">
          <DropdownMenuItem onClick={() => onMonedaChange("USD")}>$</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onMonedaChange("BS")}>Bs.</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <MoneyInput
        id={id}
        disabled={disabled}
        aria-invalid={ariaInvalid}
        value={typeof value === "number" ? value.toFixed(2) : ""}
        onValueChange={(clean, formatted) => {
          onValueChange(parseCleanToNumber(clean), formatted);
        }}
        placeholder="0,00"
        className={cn(
          "h-11 min-h-11 max-h-11 rounded-l-none border-slate-300 flex-1 shadow-none",
          "focus-visible:ring-1 focus-visible:ring-color-boton-2/30"
        )}
      />
    </div>
  );
}

"use client";

import { useMemo, useRef, useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  filterUnidadesMedida,
  getUnidadMedidaMeta,
  groupUnidadesByFamily,
} from "@/lib/constants/unidadMedida";
import { cn } from "@/lib/utils";

interface UnidadMedidaComboboxProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  /** Clases del trigger (altura/tipografía del form padre). */
  triggerClassName?: string;
}

export function UnidadMedidaCombobox({
  value,
  onChange,
  disabled = false,
  placeholder = "Buscar o escribir unidad...",
  className,
  triggerClassName,
}: UnidadMedidaComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => filterUnidadesMedida(query), [query]);
  const grouped = useMemo(() => groupUnidadesByFamily(filtered), [filtered]);
  const meta = getUnidadMedidaMeta(value);
  const displayLabel = meta?.label ?? (value || placeholder);

  const queryTrim = query.trim();
  const exactMatch = filtered.some(
    (u) =>
      u.value.toLowerCase() === queryTrim.toLowerCase() ||
      u.label.toLowerCase() === queryTrim.toLowerCase()
  );
  const canCreateCustom = queryTrim.length > 0 && !exactMatch;

  const handleOpenChange = (next: boolean) => {
    if (disabled) return;
    setOpen(next);
    if (next) {
      setQuery("");
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  };

  const selectValue = (next: string) => {
    onChange(next);
    setOpen(false);
    setQuery("");
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          role="combobox"
          aria-expanded={open}
          className={cn(
            "h-10 w-full justify-between border-slate-300 bg-white px-3 font-medium text-slate-700 shadow-none hover:bg-white",
            !value && "text-slate-400 italic",
            triggerClassName,
            className
          )}
        >
          <span className="truncate text-left text-sm">{displayLabel}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="border-b border-border p-2">
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="h-9"
            onKeyDown={(e) => {
              if (e.key === "Enter" && canCreateCustom) {
                e.preventDefault();
                selectValue(queryTrim.slice(0, 50));
              }
            }}
          />
        </div>
        <div className="max-h-64 overflow-y-auto p-1">
          {canCreateCustom ? (
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-[12px] text-navy hover:bg-muted"
              onClick={() => selectValue(queryTrim.slice(0, 50))}
            >
              <Plus className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">
                Usar &quot;{queryTrim.slice(0, 50)}&quot; (personalizada)
              </span>
            </button>
          ) : null}

          {grouped.length === 0 && !canCreateCustom ? (
            <p className="px-2 py-3 text-center text-[12px] italic text-muted-foreground">
              Sin resultados
            </p>
          ) : null}

          {grouped.map((group) => (
            <div key={group.family} className="mb-1">
              <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                {group.label}
              </p>
              {group.items.map((item) => {
                const selected = value.toLowerCase() === item.value.toLowerCase();
                return (
                  <button
                    key={item.value}
                    type="button"
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-[12px] hover:bg-muted",
                      selected && "bg-muted font-semibold"
                    )}
                    onClick={() => selectValue(item.value)}
                  >
                    <span className="truncate">{item.label}</span>
                    {selected ? <Check className="h-3.5 w-3.5 shrink-0 text-navy" /> : null}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

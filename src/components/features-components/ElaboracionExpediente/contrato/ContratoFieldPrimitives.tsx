"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { MoneyInput } from "@/components/ui/money-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import type { ContratoFormValues } from "@/lib/schemas/contratoSchema";
import {
  CONTRATO_INPUT_CLASS,
  CONTRATO_TEXTAREA_CLASS,
  sanitizeMontoInput,
  sanitizePercentInput,
} from "./contratoFormHelpers";

const CONTRATO_CALENDAR_FROM_YEAR = 2000;
const CONTRATO_CALENDAR_TO_YEAR = new Date().getFullYear() + 20;

interface FieldBaseProps {
  name: FieldPath<ContratoFormValues>;
  control: Control<ContratoFormValues>;
  label: string;
  legal?: string;
  readOnly?: boolean;
}

export function ContratoTextField({
  name,
  control,
  label,
  legal,
  readOnly,
  placeholder,
  maxLength,
}: FieldBaseProps & { placeholder?: string; maxLength?: number }) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-1">
          <FormLabel className="text-base font-bold text-color-titulos">{label}</FormLabel>
          {legal ? <p className="text-sm text-slate-500 italic">{legal}</p> : null}
          <FormControl>
            <Input
              {...field}
              value={field.value ?? ""}
              disabled={readOnly}
              placeholder={placeholder}
              maxLength={maxLength}
              className={CONTRATO_INPUT_CLASS}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function ContratoTextareaField({
  name,
  control,
  label,
  legal,
  readOnly,
  maxLength,
}: FieldBaseProps & { maxLength?: number }) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-1">
          <FormLabel className="text-base font-bold text-color-titulos">{label}</FormLabel>
          {legal ? <p className="text-sm text-slate-500 italic">{legal}</p> : null}
          <FormControl>
            <Textarea
              {...field}
              value={field.value ?? ""}
              disabled={readOnly}
              maxLength={maxLength}
              className={CONTRATO_TEXTAREA_CLASS}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function ContratoPorcentajeField({
  name,
  control,
  label,
  legal,
  readOnly,
  placeholder = "0",
}: FieldBaseProps & { placeholder?: string }) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-1">
          <FormLabel className="text-base font-bold text-color-titulos">{label}</FormLabel>
          {legal ? <p className="text-sm text-slate-500 italic">{legal}</p> : null}
          <FormControl>
            <Input
              {...field}
              value={field.value ?? ""}
              disabled={readOnly}
              inputMode="decimal"
              autoComplete="off"
              placeholder={placeholder}
              className={`${CONTRATO_INPUT_CLASS} max-w-[200px]`}
              onChange={(e) => field.onChange(sanitizePercentInput(e.target.value))}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function ContratoMontoField({
  name,
  control,
  label,
  legal,
  readOnly,
  placeholder,
}: FieldBaseProps & { placeholder?: string }) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-1">
          <FormLabel className="text-base font-bold text-color-titulos">{label}</FormLabel>
          {legal ? <p className="text-sm text-slate-500 italic">{legal}</p> : null}
          <FormControl>
            <MoneyInput
              name={field.name}
              value={field.value ?? ""}
              onValueChange={(cleanValue) => field.onChange(cleanValue)}
              onBlur={field.onBlur}
              disabled={readOnly}
              placeholder={placeholder}
              className={CONTRATO_INPUT_CLASS}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function ContratoCedulaField({ name, control, label, legal, readOnly }: FieldBaseProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const val = field.value || "";
        const prefix = val.startsWith("E-") ? "E" : "V";
        const numberPart = val.replace(/^[EV]-?/, "");

        const handlePrefixChange = (newPrefix: string) => {
          field.onChange(`${newPrefix}-${numberPart}`);
        };

        return (
          <FormItem className="space-y-1">
            <FormLabel className="text-base font-bold text-color-titulos">{label}</FormLabel>
            {legal ? <p className="text-sm text-slate-500 italic">{legal}</p> : null}
            <FormControl>
              <div className="flex items-center gap-2">
                <Select value={prefix} onValueChange={handlePrefixChange} disabled={readOnly}>
                  <SelectTrigger className="w-[70px] h-11 border border-slate-300 bg-white text-[13px] font-medium text-slate-500 shadow-none focus:ring-0">
                    <SelectValue placeholder="V" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="V">V-</SelectItem>
                    <SelectItem value="E">E-</SelectItem>
                  </SelectContent>
                </Select>
                <InputOTP
                  maxLength={8}
                  value={numberPart}
                  onChange={(val) => {
                    const cleanNum = val.replace(/\D/g, "");
                    field.onChange(`${prefix}-${cleanNum}`);
                  }}
                  disabled={readOnly}
                >
                  <InputOTPGroup>
                    <InputOTPSlot
                      index={0}
                      className="border-r-0 shadow-none h-11 w-10 text-[13px] font-medium text-slate-500"
                    />
                    <InputOTPSlot
                      index={1}
                      className="border-r-0 shadow-none h-11 w-10 text-[13px] font-medium text-slate-500"
                    />
                    <InputOTPSlot
                      index={2}
                      className="border-r-0 shadow-none h-11 w-10 text-[13px] font-medium text-slate-500"
                    />
                    <InputOTPSlot
                      index={3}
                      className="border-r-0 shadow-none h-11 w-10 text-[13px] font-medium text-slate-500"
                    />
                    <InputOTPSlot
                      index={4}
                      className="border-r-0 shadow-none h-11 w-10 text-[13px] font-medium text-slate-500"
                    />
                    <InputOTPSlot
                      index={5}
                      className="border-r-0 shadow-none h-11 w-10 text-[13px] font-medium text-slate-500"
                    />
                    <InputOTPSlot
                      index={6}
                      className="border-r-0 shadow-none h-11 w-10 text-[13px] font-medium text-slate-500"
                    />
                    <InputOTPSlot
                      index={7}
                      className="rounded-r-md border-r shadow-none h-11 w-10 text-[13px] font-medium text-slate-500"
                    />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

export function ContratoDateField({ name, control, label, legal, readOnly }: FieldBaseProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col space-y-1">
          <FormLabel className="text-base font-bold text-color-titulos">{label}</FormLabel>
          {legal ? <p className="text-sm text-slate-500 italic">{legal}</p> : null}
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  type="button"
                  variant="outline"
                  disabled={readOnly}
                  className={cn(
                    "w-full max-w-xl h-11 pl-3 text-left font-normal border-slate-300 bg-white",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {field.value ? (
                    format(new Date(field.value), "PPP", { locale: es })
                  ) : (
                    <span>Seleccionar fecha</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                captionLayout="dropdown"
                fromYear={CONTRATO_CALENDAR_FROM_YEAR}
                toYear={CONTRATO_CALENDAR_TO_YEAR}
                selected={field.value ? new Date(field.value) : undefined}
                onSelect={(date) => field.onChange(date?.toISOString() ?? "")}
                disabled={(date) => date < new Date(`${CONTRATO_CALENDAR_FROM_YEAR}-01-01`)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function isSiNoSelected(value: unknown): value is "SI" | "NO" {
  return value === "SI" || value === "NO";
}

interface ContratoSiNoFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  pregunta: string;
  referencia: string;
  readOnly?: boolean;
  children?: React.ReactNode;
}

export function ContratoSiNoField({
  name,
  control,
  pregunta,
  referencia,
  readOnly,
  children,
}: ContratoSiNoFieldProps<ContratoFormValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-3">
          <div>
            <p className="text-base font-bold text-color-titulos leading-snug">{pregunta}</p>
            <p className="text-sm text-slate-500 italic mt-0.5">{referencia}</p>
          </div>
          <div className="flex items-center gap-2">
            {(["SI", "NO"] as const).map((opt) => {
              const isSelected = isSiNoSelected(field.value) && field.value === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  disabled={readOnly}
                  onClick={() => field.onChange(opt)}
                  aria-pressed={isSelected}
                  className={`min-w-[52px] h-11 rounded-md text-sm font-bold border transition-colors ${
                    isSelected
                      ? "bg-navy text-white border-navy"
                      : "bg-white text-slate-400 border-slate-200 hover:border-slate-300 hover:text-slate-500"
                  } ${readOnly ? "cursor-not-allowed opacity-60" : ""}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {children}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

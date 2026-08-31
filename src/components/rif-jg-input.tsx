"use client";

import * as React from "react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { MinusIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type RifJgLetter = "J" | "G";

type RifJgInputProps = {
  value?: string;
  onValueChange?: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  name?: string;
  className?: string;
};

function parseRif(value: string | undefined): {
  tipo: RifJgLetter;
  cuerpo: string;
  verificador: string;
} {
  const raw = (value ?? "").trim().toUpperCase();
  const match = raw.match(/^([JG])-?(\d{0,8})-?(\d?)$/);
  if (!match) {
    return { tipo: "J", cuerpo: "", verificador: "" };
  }
  return {
    tipo: match[1] as RifJgLetter,
    cuerpo: match[2] ?? "",
    verificador: match[3] ?? "",
  };
}

function composeRif(tipo: RifJgLetter, cuerpo: string, verificador: string): string {
  if (!cuerpo && !verificador) {
    return tipo ? `${tipo}-` : "";
  }
  if (!verificador) {
    return `${tipo}-${cuerpo}`;
  }
  return `${tipo}-${cuerpo}-${verificador}`;
}

/**
 * RIF con prefijo J | G + 8 dígitos + verificador (estilo registro de proveedores / completar ente).
 */
export const RifJgInput = React.forwardRef<HTMLDivElement, RifJgInputProps>(function RifJgInput(
  { value, onValueChange, onBlur, disabled, name, className },
  ref
) {
  const parsed = parseRif(value);
  const [tipo, setTipo] = React.useState<RifJgLetter>(parsed.tipo);
  const [cuerpo, setCuerpo] = React.useState(parsed.cuerpo);
  const [verificador, setVerificador] = React.useState(parsed.verificador);
  const verificadorRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const next = parseRif(value);
    setTipo(next.tipo);
    setCuerpo(next.cuerpo);
    setVerificador(next.verificador);
  }, [value]);

  const emit = (nextTipo: RifJgLetter, nextCuerpo: string, nextVerificador: string) => {
    onValueChange?.(composeRif(nextTipo, nextCuerpo, nextVerificador));
  };

  return (
    <div
      ref={ref}
      className={cn("flex flex-wrap items-center gap-2", className)}
      data-name={name}
      onBlur={onBlur}
    >
      <Select
        value={tipo}
        onValueChange={(val) => {
          const next = val as RifJgLetter;
          setTipo(next);
          emit(next, cuerpo, verificador);
        }}
        disabled={disabled}
      >
        <SelectTrigger className="h-10 w-[70px] rounded-md border-border bg-card text-[13px] font-medium text-foreground shadow-none focus:ring-[2px]">
          <SelectValue placeholder="J" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="J">J</SelectItem>
          <SelectItem value="G">G</SelectItem>
        </SelectContent>
      </Select>

      <InputOTP
        maxLength={8}
        value={cuerpo}
        disabled={disabled}
        pattern={REGEXP_ONLY_DIGITS}
        onChange={(val) => {
          setCuerpo(val);
          emit(tipo, val, verificador);
          if (val.length === 8) {
            verificadorRef.current?.focus();
          }
        }}
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} className="h-10 border-r-0 shadow-none" />
          <InputOTPSlot index={1} className="h-10 border-r-0 shadow-none" />
          <InputOTPSlot index={2} className="h-10 border-r-0 shadow-none" />
          <InputOTPSlot index={3} className="h-10 border-r-0 shadow-none" />
          <InputOTPSlot index={4} className="h-10 border-r-0 shadow-none" />
          <InputOTPSlot index={5} className="h-10 border-r-0 shadow-none" />
          <InputOTPSlot index={6} className="h-10 border-r-0 shadow-none" />
          <InputOTPSlot index={7} className="h-10 rounded-r-md border-r shadow-none" />
        </InputOTPGroup>
      </InputOTP>

      <div className="flex items-center px-1 text-muted-foreground">
        <MinusIcon className="h-4 w-4" />
      </div>

      <InputOTP
        ref={verificadorRef}
        maxLength={1}
        value={verificador}
        disabled={disabled}
        pattern={REGEXP_ONLY_DIGITS}
        onChange={(val) => {
          setVerificador(val);
          emit(tipo, cuerpo, val);
        }}
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} className="h-10 rounded-md border-l shadow-none" />
        </InputOTPGroup>
      </InputOTP>
    </div>
  );
});

"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type Resolver } from "react-hook-form";

import { BankAccountInput } from "@/components/bank-account-input";
import { RifJgInput } from "@/components/rif-jg-input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BANCO_PAGO_PLIEGO_MAX,
  CUENTA_BANCARIA_FIELD_COPY,
  CUENTAS_BANCARIAS_MODAL_TITLE,
  CUENTAS_BANCARIAS_SAVE_LABEL,
  TIPO_CUENTA_OPTIONS,
  TITULAR_PAGO_PLIEGO_MAX,
  createEmptyCuentaBancariaFormValues,
  type CuentaBancariaEnteFormValues,
} from "@/lib/constants/cuentasBancariasEnte";
import {
  cuentaBancariaEnteFormSchema,
  type CuentaBancariaEnteFormSchemaValues,
} from "@/lib/schemas/cuentasBancariasEnteSchema";

const labelClass = "text-[12px] font-bold leading-snug text-slate-700";
const hintClass = "text-[10px] italic leading-snug text-slate-500";
const inputClass =
  "h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 shadow-none placeholder:text-[11px] placeholder:italic placeholder:text-slate-400 focus:outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

function FieldBlock({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className={labelClass}>{label}</label>
      {hint ? <p className={hintClass}>{hint}</p> : null}
      {children}
      {error ? <p className="text-[11px] font-medium text-destructive">{error}</p> : null}
    </div>
  );
}

export interface CuentaBancariaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CuentaBancariaEnteFormSchemaValues) => Promise<void> | void;
  isSubmitting?: boolean;
  initialValues?: CuentaBancariaEnteFormValues;
}

export function CuentaBancariaModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  initialValues,
}: CuentaBancariaModalProps) {
  const defaults = useMemo(
    () => initialValues ?? createEmptyCuentaBancariaFormValues(),
    [initialValues]
  );

  const form = useForm<CuentaBancariaEnteFormSchemaValues>({
    resolver: zodResolver(
      cuentaBancariaEnteFormSchema
    ) as Resolver<CuentaBancariaEnteFormSchemaValues>,
    defaultValues: defaults,
    mode: "onSubmit",
  });

  useEffect(() => {
    if (!open) return;
    form.reset(initialValues ?? createEmptyCuentaBancariaFormValues());
  }, [open, initialValues, form]);

  const handleOpenChange = (next: boolean) => {
    if (isSubmitting) return;
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-color-titulos">
            {CUENTAS_BANCARIAS_MODAL_TITLE}
          </DialogTitle>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(async (values) => {
            await onSubmit(values);
          })}
        >
          <FieldBlock
            label={CUENTA_BANCARIA_FIELD_COPY.bancoPagoPliego.label}
            hint={CUENTA_BANCARIA_FIELD_COPY.bancoPagoPliego.example}
            error={form.formState.errors.bancoPagoPliego?.message}
          >
            <input
              {...form.register("bancoPagoPliego")}
              maxLength={BANCO_PAGO_PLIEGO_MAX}
              disabled={isSubmitting}
              placeholder="Banco de Venezuela"
              className={inputClass}
            />
          </FieldBlock>

          <FieldBlock
            label={CUENTA_BANCARIA_FIELD_COPY.tipoCuentaPagoPliego.label}
            hint={CUENTA_BANCARIA_FIELD_COPY.tipoCuentaPagoPliego.example}
            error={form.formState.errors.tipoCuentaPagoPliego?.message}
          >
            <Controller
              control={form.control}
              name="tipoCuentaPagoPliego"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                  <SelectTrigger className="h-9 w-full border-slate-300 bg-white">
                    <SelectValue placeholder="Seleccione tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPO_CUENTA_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FieldBlock>

          <FieldBlock
            label={CUENTA_BANCARIA_FIELD_COPY.cuentaPagoPliego.label}
            hint={CUENTA_BANCARIA_FIELD_COPY.cuentaPagoPliego.example}
            error={form.formState.errors.cuentaPagoPliego?.message}
          >
            <Controller
              control={form.control}
              name="cuentaPagoPliego"
              render={({ field }) => (
                <BankAccountInput
                  name={field.name}
                  ref={field.ref}
                  value={field.value}
                  onBlur={field.onBlur}
                  onValueChange={field.onChange}
                  disabled={isSubmitting}
                  inputClassName={inputClass}
                />
              )}
            />
          </FieldBlock>

          <FieldBlock
            label={CUENTA_BANCARIA_FIELD_COPY.titularPagoPliego.label}
            hint={CUENTA_BANCARIA_FIELD_COPY.titularPagoPliego.example}
            error={form.formState.errors.titularPagoPliego?.message}
          >
            <input
              {...form.register("titularPagoPliego")}
              maxLength={TITULAR_PAGO_PLIEGO_MAX}
              disabled={isSubmitting}
              placeholder="Gobernación del Estado Lara"
              className={inputClass}
            />
          </FieldBlock>

          <FieldBlock
            label={CUENTA_BANCARIA_FIELD_COPY.rifPagoPliego.label}
            hint={CUENTA_BANCARIA_FIELD_COPY.rifPagoPliego.example}
            error={form.formState.errors.rifPagoPliego?.message}
          >
            <Controller
              control={form.control}
              name="rifPagoPliego"
              render={({ field }) => (
                <RifJgInput
                  value={field.value}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                  disabled={isSubmitting}
                  name={field.name}
                />
              )}
            />
          </FieldBlock>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-navy text-white hover:bg-navy-hover"
            >
              {isSubmitting ? "Guardando…" : CUENTAS_BANCARIAS_SAVE_LABEL}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

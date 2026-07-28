"use client";

import { useEffect, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Plus, X } from "lucide-react";
import { Controller, useForm, useWatch, type Resolver } from "react-hook-form";

import { UnidadMedidaCombobox } from "@/components/features-components/GestionExpedientes/fase1/UnidadMedidaCombobox";
import { LocalizedDecimalInput } from "@/components/localized-decimal-input";
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
import { FASE1_FIELD_COPY } from "@/lib/constants/fase1";
import { normalizeCantidadForUnidad, unidadAllowsDecimals } from "@/lib/constants/unidadMedida";
import {
  productoItemSchema,
  type ProductoItemFormInputValues,
  type ProductoItemFormValues,
} from "@/lib/schemas/fase1Schema";

const UNIDAD_MEDIDA_OPTIONS = ["Unidad", "Kg", "Mts", "Horas"] as const;

const DEFAULT_FORM_VALUES: ProductoItemFormInputValues = {
  descripcionItem: "",
  codigoPartida: "",
  unidadMedida: "Unidad",
  cantidadRequerida: "",
  precioUnitarioEstimado: "",
};

export interface ProductoItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProductoItemFormValues) => Promise<void> | void;
  mode?: "create" | "edit";
  initialValues?: ProductoItemFormInputValues;
  submitLabel?: string;
  isSubmitting?: boolean;
  /** Gestión: combobox + cantidad según unidad. Elaboración: Select fijo. */
  enableUnidadMedidaAvanzada?: boolean;
}

const labelClass = "text-[13px] font-bold text-slate-700";
const inputClass =
  "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 shadow-none placeholder:text-sm placeholder:italic placeholder:text-slate-400 focus:outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

function FieldBlock({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className ? `space-y-1.5 ${className}` : "space-y-1.5"}>
      <label className={labelClass}>{label}</label>
      {children}
      {error ? <p className="text-[11px] font-medium text-destructive">{error}</p> : null}
    </div>
  );
}

export function ProductoItemModal({
  open,
  onOpenChange,
  onSubmit,
  mode = "create",
  initialValues,
  submitLabel,
  isSubmitting = false,
  enableUnidadMedidaAvanzada = false,
}: ProductoItemModalProps) {
  const form = useForm<ProductoItemFormInputValues>({
    resolver: zodResolver(productoItemSchema) as unknown as Resolver<ProductoItemFormInputValues>,
    defaultValues: DEFAULT_FORM_VALUES,
    mode: "onSubmit",
  });

  const {
    reset,
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = form;

  const unidadMedida = useWatch({ control, name: "unidadMedida" });
  const allowDecimals = !enableUnidadMedidaAvanzada || unidadAllowsDecimals(unidadMedida);

  useEffect(() => {
    if (!open) return;
    reset(mode === "edit" ? (initialValues ?? DEFAULT_FORM_VALUES) : DEFAULT_FORM_VALUES);
  }, [initialValues, mode, open, reset]);

  useEffect(() => {
    if (!enableUnidadMedidaAvanzada || !open) return;
    const current = form.getValues("cantidadRequerida");
    if (!current || allowDecimals) return;
    const normalized = normalizeCantidadForUnidad(String(current), unidadMedida ?? "");
    if (normalized !== String(current)) {
      setValue("cantidadRequerida", normalized, { shouldValidate: false });
    }
  }, [allowDecimals, enableUnidadMedidaAvanzada, form, open, setValue, unidadMedida]);

  const onSubmitForm = async (values: ProductoItemFormInputValues) => {
    const next = { ...values };
    if (enableUnidadMedidaAvanzada && !unidadAllowsDecimals(next.unidadMedida)) {
      next.cantidadRequerida = normalizeCantidadForUnidad(
        String(next.cantidadRequerida ?? ""),
        next.unidadMedida
      );
    }
    await onSubmit(next as unknown as ProductoItemFormValues);
  };

  const title = mode === "edit" ? "Editar ítem del presupuesto" : "Añadir ítem al presupuesto";
  const actionLabel = submitLabel ?? (mode === "edit" ? "Guardar cambios" : "Guardar Ítem");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="gap-0 overflow-hidden border-0 bg-white p-0 shadow-xl sm:max-w-xl"
      >
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 bg-navy px-5 py-4 text-left">
          <DialogTitle className="flex items-center gap-2.5 font-inter text-base font-bold text-white">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
              <Plus className="h-4 w-4 text-white" strokeWidth={2.5} />
            </span>
            {title}
          </DialogTitle>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-md p-1 text-white/90 transition-opacity hover:bg-white/10 hover:text-white"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </DialogHeader>

        <form className="space-y-4 px-5 py-5" onSubmit={handleSubmit(onSubmitForm)}>
          <FieldBlock
            label={FASE1_FIELD_COPY.descripcionItem.label}
            error={errors.descripcionItem?.message}
          >
            <input
              type="text"
              className={inputClass}
              placeholder="Ej. Archivo metálico de 4 gavetas"
              {...register("descripcionItem")}
            />
          </FieldBlock>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FieldBlock
              label={FASE1_FIELD_COPY.codigoPartida.label}
              error={errors.codigoPartida?.message}
            >
              <input
                type="text"
                className={inputClass}
                placeholder="Ej. 401-01-01-002"
                {...register("codigoPartida")}
              />
            </FieldBlock>

            <FieldBlock
              label={FASE1_FIELD_COPY.unidadMedida.label}
              error={errors.unidadMedida?.message}
            >
              <Controller
                control={control}
                name="unidadMedida"
                render={({ field }) =>
                  enableUnidadMedidaAvanzada ? (
                    <UnidadMedidaCombobox
                      value={field.value}
                      onChange={field.onChange}
                      triggerClassName={inputClass}
                    />
                  ) : (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={`${inputClass} w-full`}>
                        <SelectValue placeholder="Unidad" />
                      </SelectTrigger>
                      <SelectContent>
                        {UNIDAD_MEDIDA_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )
                }
              />
            </FieldBlock>

            <FieldBlock
              label={FASE1_FIELD_COPY.cantidadRequerida.label}
              error={errors.cantidadRequerida?.message}
            >
              <Controller
                control={control}
                name="cantidadRequerida"
                render={({ field }) => (
                  <LocalizedDecimalInput
                    name={field.name}
                    ref={field.ref}
                    value={field.value}
                    onBlur={field.onBlur}
                    onValueChange={field.onChange}
                    fractionDigits={allowDecimals ? 2 : 0}
                    placeholder={allowDecimals ? "Ej. 10,50" : "Ej. 10"}
                    className={inputClass}
                  />
                )}
              />
            </FieldBlock>

            <FieldBlock
              label="Precio Unitario Estimado (Bs)"
              error={errors.precioUnitarioEstimado?.message}
            >
              <Controller
                control={control}
                name="precioUnitarioEstimado"
                render={({ field }) => (
                  <LocalizedDecimalInput
                    name={field.name}
                    ref={field.ref}
                    value={field.value}
                    onBlur={field.onBlur}
                    onValueChange={field.onChange}
                    placeholder="Ej. 1.500,00"
                    className={inputClass}
                  />
                )}
              />
            </FieldBlock>
          </div>

          <DialogFooter className="gap-2 border-t border-slate-100 pt-4 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
              className="border-slate-300 bg-white font-inter text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-navy font-inter text-white hover:bg-navy-hover"
            >
              {isSubmitting ? (
                "Guardando..."
              ) : (
                <>
                  {actionLabel}
                  <Check className="ml-1.5 h-4 w-4" />
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

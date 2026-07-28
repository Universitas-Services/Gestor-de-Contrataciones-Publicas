"use client";

import { useEffect, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, PlusCircle } from "lucide-react";
import { Controller, useForm, useWatch, type Resolver } from "react-hook-form";

import { UnidadMedidaCombobox } from "@/components/features-components/GestionExpedientes/fase1/UnidadMedidaCombobox";
import { LocalizedDecimalInput } from "@/components/localized-decimal-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface ProductoItemInlineFormProps {
  onSubmit: (data: ProductoItemFormValues) => Promise<void> | void;
  isSubmitting?: boolean;
  enableUnidadMedidaAvanzada?: boolean;
}

const inputClass =
  "h-8 w-full rounded-md border-slate-300 bg-white text-[11px] font-medium text-slate-700 shadow-none placeholder:text-[11px] placeholder:italic placeholder:text-slate-400 focus-visible:ring-[2px]";
const errorClass = "text-[10px] font-medium leading-tight text-destructive";

function FieldSlot({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`flex flex-col ${className ?? ""}`}>
      <div className="mb-1 flex min-h-[32px] items-end">
        <label className="block text-[11px] font-semibold leading-tight text-slate-600">
          {label}
        </label>
      </div>
      {children}
      <div className="mt-0.5 min-h-[28px]">
        {error ? <p className={errorClass}>{error}</p> : null}
      </div>
    </div>
  );
}

export function ProductoItemInlineForm({
  onSubmit,
  isSubmitting = false,
  enableUnidadMedidaAvanzada = false,
}: ProductoItemInlineFormProps) {
  const form = useForm<ProductoItemFormInputValues>({
    resolver: zodResolver(productoItemSchema) as unknown as Resolver<ProductoItemFormInputValues>,
    defaultValues: DEFAULT_FORM_VALUES,
    mode: "onSubmit",
  });

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = form;

  const unidadMedida = useWatch({ control, name: "unidadMedida" });
  const allowDecimals = !enableUnidadMedidaAvanzada || unidadAllowsDecimals(unidadMedida);

  useEffect(() => {
    if (!enableUnidadMedidaAvanzada) return;
    const current = form.getValues("cantidadRequerida");
    if (!current || allowDecimals) return;
    const normalized = normalizeCantidadForUnidad(String(current), unidadMedida ?? "");
    if (normalized !== String(current)) {
      setValue("cantidadRequerida", normalized, { shouldValidate: false });
    }
  }, [allowDecimals, enableUnidadMedidaAvanzada, form, setValue, unidadMedida]);

  const onSubmitForm = async (values: ProductoItemFormInputValues) => {
    const next = { ...values };
    if (enableUnidadMedidaAvanzada && !unidadAllowsDecimals(next.unidadMedida)) {
      next.cantidadRequerida = normalizeCantidadForUnidad(
        String(next.cantidadRequerida ?? ""),
        next.unidadMedida
      );
    }
    await onSubmit(next as unknown as ProductoItemFormValues);
    reset(DEFAULT_FORM_VALUES);
  };

  return (
    <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h3 className="mb-3 flex items-center gap-1.5 text-[13px] font-bold text-color-titulos">
        <PlusCircle className="h-4 w-4" />
        Añadir Nuevo Ítem
      </h3>

      <div className="space-y-1">
        <div className="grid grid-cols-1 items-start gap-3 md:grid-cols-6">
          <FieldSlot
            className="md:col-span-2"
            label={FASE1_FIELD_COPY.descripcionItem.label}
            error={errors.descripcionItem?.message}
          >
            <Input
              {...register("descripcionItem")}
              placeholder="Ej. Estación de trabajo Tipo A - Ergonómica"
              className={inputClass}
            />
          </FieldSlot>

          <FieldSlot
            label={FASE1_FIELD_COPY.codigoPartida.label}
            error={errors.codigoPartida?.message}
          >
            <Input
              {...register("codigoPartida")}
              placeholder="Ej. 401-01-01-00"
              className={inputClass}
            />
          </FieldSlot>

          <FieldSlot
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
          </FieldSlot>

          <FieldSlot
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
                  placeholder={allowDecimals ? "Ej: 1,50" : "Ej: 1"}
                  className={inputClass}
                />
              )}
            />
          </FieldSlot>

          <FieldSlot label="Precio unitario (Bs.)" error={errors.precioUnitarioEstimado?.message}>
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
                  placeholder="Ej: 10.000,00"
                  className={inputClass}
                />
              )}
            />
          </FieldSlot>
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            size="sm"
            disabled={isSubmitting}
            onClick={handleSubmit(onSubmitForm)}
            className="cursor-pointer gap-1.5 bg-navy text-[11px] font-semibold text-white hover:bg-navy-hover"
          >
            {isSubmitting ? "Guardando..." : "Guardar Ítem"}
            {!isSubmitting ? <Check className="h-3.5 w-3.5" /> : null}
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { X } from "lucide-react";

import { FASE1_FIELD_COPY } from "@/lib/constants/fase1";
import {
  productoItemSchema,
  type ProductoItemFormInputValues,
  type ProductoItemFormValues,
} from "@/lib/schemas/fase1Schema";
import { LocalizedDecimalInput } from "@/components/localized-decimal-input";

const DEFAULT_FORM_VALUES: ProductoItemFormInputValues = {
  descripcionItem: "",
  codigoPartida: "",
  unidadMedida: "",
  cantidadRequerida: "0,00",
  precioUnitarioEstimado: "0,00",
};

export interface ProductoItemSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProductoItemFormValues) => Promise<void> | void;
  mode?: "create" | "edit";
  initialValues?: ProductoItemFormInputValues;
  submitLabel?: string;
  isSubmitting?: boolean;
}

const compactLabelClass = "font-bold text-color-titulos text-[11px] leading-snug";
const compactDescriptionClass = "text-[10px] text-muted-foreground italic leading-relaxed";
const compactInputClass =
  "h-[32px] w-full rounded-md border border-slate-300 bg-white px-3 text-[11px] font-medium text-slate-600 shadow-none placeholder:text-[11px] placeholder:italic placeholder:font-medium placeholder:text-slate-500/60 focus:outline-none focus:ring-2 focus:ring-ring/50";
const compactSectionTitleClass = "text-[17px] font-bold text-color-titulos";
const compactSectionDescriptionClass = "text-[12px] text-muted-foreground italic leading-relaxed";
const compactMessageClass = "text-[11px]";

function FieldBlock({
  label,
  description,
  error,
  children,
}: {
  label: string;
  description: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className={compactLabelClass}>{label}</label>
      <p className={compactDescriptionClass}>{description}</p>
      {children}
      {error ? (
        <p className={`font-medium text-destructive ${compactMessageClass}`}>{error}</p>
      ) : null}
    </div>
  );
}

export function ProductoItemSheet({
  open,
  onOpenChange,
  onSubmit,
  mode = "create",
  initialValues,
  submitLabel = "Guardar item",
  isSubmitting = false,
}: ProductoItemSheetProps) {
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
    formState: { errors },
  } = form;

  useEffect(() => {
    if (open) {
      reset(mode === "edit" ? (initialValues ?? DEFAULT_FORM_VALUES) : DEFAULT_FORM_VALUES);
    }
  }, [initialValues, mode, open, reset]);

  useEffect(() => {
    if (typeof window === "undefined" || !open) return;

    const { body, documentElement } = document;
    const scrollY = window.scrollY;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;

    const previousBodyStyles = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
    };

    const previousDocumentStyles = {
      overflow: documentElement.style.overflow,
    };

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";

    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    documentElement.style.overflow = "hidden";

    return () => {
      body.style.position = previousBodyStyles.position;
      body.style.top = previousBodyStyles.top;
      body.style.left = previousBodyStyles.left;
      body.style.right = previousBodyStyles.right;
      body.style.width = previousBodyStyles.width;
      body.style.overflow = previousBodyStyles.overflow;
      body.style.paddingRight = previousBodyStyles.paddingRight;
      documentElement.style.overflow = previousDocumentStyles.overflow;

      window.scrollTo(0, scrollY);
    };
  }, [open]);

  useEffect(() => {
    if (typeof window === "undefined" || !open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onOpenChange, open]);

  const onSubmitForm = async (values: ProductoItemFormInputValues) => {
    await onSubmit(values as unknown as ProductoItemFormValues);
  };

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 transition-opacity"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-md md:max-w-[450px]">
        <div
          className="flex h-full flex-col border-l bg-white shadow-lg animate-in slide-in-from-right duration-300"
          role="dialog"
          aria-modal="true"
          aria-label="Presupuesto base"
        >
          <div className="relative shrink-0 border-b border-slate-100 p-8 pb-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Cerrar</span>
            </button>
            <h2 className="text-left text-2xl font-extrabold text-color-titulos">
              {mode === "edit" ? "Editar item" : "Registrar item"}
            </h2>
            <p className="text-left text-sm font-medium italic text-slate-500">
              {mode === "edit"
                ? "Actualice la informacion del producto seleccionado dentro del presupuesto base."
                : "Registre los datos del item para construir el presupuesto base del procedimiento."}
            </p>
          </div>

          <div className="px-8 pb-2 pt-6">
            <h3 className={compactSectionTitleClass}>Estructura del presupuesto base</h3>
            <p className={`mt-1 ${compactSectionDescriptionClass}`}>Articulos 59 y 60 LCP.</p>
          </div>

          <div className="flex-1 overflow-y-auto px-8 py-4">
            <form
              id="producto-item-form"
              className="space-y-6 pb-4"
              onSubmit={handleSubmit(onSubmitForm)}
            >
              <FieldBlock
                label={FASE1_FIELD_COPY.descripcionItem.label}
                description={FASE1_FIELD_COPY.descripcionItem.description}
                error={errors.descripcionItem?.message}
              >
                <input type="text" className={compactInputClass} {...register("descripcionItem")} />
              </FieldBlock>

              <FieldBlock
                label={FASE1_FIELD_COPY.codigoPartida.label}
                description={FASE1_FIELD_COPY.codigoPartida.description}
                error={errors.codigoPartida?.message}
              >
                <input type="text" className={compactInputClass} {...register("codigoPartida")} />
              </FieldBlock>

              <FieldBlock
                label={FASE1_FIELD_COPY.unidadMedida.label}
                description={FASE1_FIELD_COPY.unidadMedida.description}
                error={errors.unidadMedida?.message}
              >
                <input type="text" className={compactInputClass} {...register("unidadMedida")} />
              </FieldBlock>

              <FieldBlock
                label={FASE1_FIELD_COPY.cantidadRequerida.label}
                description={FASE1_FIELD_COPY.cantidadRequerida.description}
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
                      className={compactInputClass}
                    />
                  )}
                />
              </FieldBlock>

              <FieldBlock
                label={FASE1_FIELD_COPY.precioUnitarioEstimado.label}
                description={FASE1_FIELD_COPY.precioUnitarioEstimado.description}
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
                      className={compactInputClass}
                    />
                  )}
                />
              </FieldBlock>
            </form>
          </div>

          <div className="mt-auto shrink-0 border-t border-slate-100 bg-slate-50/50 p-8 pb-10 pt-6">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="cursor-pointer inline-flex h-8 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="producto-item-form"
                disabled={isSubmitting}
                className="cursor-pointer inline-flex h-8 items-center justify-center rounded-md bg-navy px-4 text-[11px] font-semibold text-white hover:bg-navy-hover disabled:opacity-50"
              >
                {isSubmitting ? "Guardando..." : submitLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

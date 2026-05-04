"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
import { X } from "lucide-react";

import { FASE1_FIELD_COPY } from "@/lib/constants/fase1";
import {
  productoItemSchema,
  type ProductoItemFormInputValues,
  type ProductoItemFormValues,
} from "@/lib/schemas/fase1Schema";

const DEFAULT_FORM_VALUES: ProductoItemFormInputValues = {
  descripcionItem: "",
  codigoPartida: "",
  unidadMedida: "",
  cantidadRequerida: "",
  precioUnitarioEstimado: "",
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

export function ProductoItemSheet({
  open,
  onOpenChange,
  onSubmit,
  mode = "create",
  initialValues,
  submitLabel = "Guardar Item",
  isSubmitting = false,
}: ProductoItemSheetProps) {
  const form = useForm<ProductoItemFormInputValues>({
    resolver: zodResolver(productoItemSchema) as unknown as Resolver<ProductoItemFormInputValues>,
    defaultValues: DEFAULT_FORM_VALUES,
    mode: "onSubmit",
  });

  const {
    reset,
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

      <div className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-md md:max-w-[430px]">
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
            <h2 className="text-left text-2xl font-bold text-heading-dark">Presupuesto base</h2>
            <p className="mt-1.5 text-left text-sm font-medium italic text-slate-500">
              {mode === "edit"
                ? "Actualice la informacion del producto seleccionado dentro del presupuesto base."
                : "Complete la informacion tecnica, financiera y legal para generar automaticamente el Acta de Inicio, el Pliego de Condiciones y el Llamado a Participar."}
            </p>
          </div>

          <div className="shrink-0 px-8 pb-2 pt-6">
            <h3 className="text-base font-bold text-[#215ea8]">Estructura del presupuesto base</h3>
            <p className="mt-1 text-xs italic text-slate-500">Articulos 59, 60 LCP.</p>
          </div>

          <div className="flex-1 overflow-y-auto px-8 py-4">
            <form
              id="producto-item-form"
              className="space-y-6 pb-4"
              onSubmit={handleSubmit(onSubmitForm)}
            >
              <div className="space-y-2">
                <label className="block text-base font-bold text-heading-dark">
                  {FASE1_FIELD_COPY.descripcionItem.label}
                </label>
                <p className="text-sm italic text-slate-500">
                  {FASE1_FIELD_COPY.descripcionItem.description}
                </p>
                <input
                  type="text"
                  className="flex h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  {...register("descripcionItem")}
                />
                {errors.descripcionItem && (
                  <p className="text-sm font-medium text-red-500">
                    {errors.descripcionItem.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-base font-bold text-heading-dark">
                  {FASE1_FIELD_COPY.codigoPartida.label}
                </label>
                <p className="text-sm italic text-slate-500">
                  {FASE1_FIELD_COPY.codigoPartida.description}
                </p>
                <input
                  type="text"
                  className="flex h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  {...register("codigoPartida")}
                />
                {errors.codigoPartida && (
                  <p className="text-sm font-medium text-red-500">{errors.codigoPartida.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-base font-bold text-heading-dark">
                  {FASE1_FIELD_COPY.unidadMedida.label}
                </label>
                <p className="text-sm italic text-slate-500">
                  {FASE1_FIELD_COPY.unidadMedida.description}
                </p>
                <input
                  type="text"
                  className="flex h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  {...register("unidadMedida")}
                />
                {errors.unidadMedida && (
                  <p className="text-sm font-medium text-red-500">{errors.unidadMedida.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-base font-bold text-heading-dark">
                  {FASE1_FIELD_COPY.cantidadRequerida.label}
                </label>
                <p className="text-sm italic text-slate-500">
                  {FASE1_FIELD_COPY.cantidadRequerida.description}
                </p>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="flex h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  {...register("cantidadRequerida")}
                />
                {errors.cantidadRequerida && (
                  <p className="text-sm font-medium text-red-500">
                    {errors.cantidadRequerida.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-base font-bold text-heading-dark">
                  {FASE1_FIELD_COPY.precioUnitarioEstimado.label}
                </label>
                <p className="text-sm italic text-slate-500">
                  {FASE1_FIELD_COPY.precioUnitarioEstimado.description}
                </p>
                <input
                  inputMode="decimal"
                  className="flex h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  {...register("precioUnitarioEstimado")}
                />
                {errors.precioUnitarioEstimado && (
                  <p className="text-sm font-medium text-red-500">
                    {errors.precioUnitarioEstimado.message}
                  </p>
                )}
              </div>
            </form>
          </div>

          <div className="mt-auto shrink-0 border-t border-slate-100 bg-slate-50/50 p-8 pb-10 pt-6">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="producto-item-form"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-md bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-[#1a4b86] disabled:opacity-50"
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

"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
import { X } from "lucide-react";

import { FASE1_FIELD_COPY } from "@/lib/constants/fase1";
import {
  productoItemSchema,
  type ProductoItemFormInputValues,
  type ProductoItemFormValues,
} from "@/lib/schemas/fase1Schema";

export interface ProductoItemSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProductoItemFormValues) => Promise<void> | void;
  isSubmitting?: boolean;
}

export function ProductoItemSheet({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: ProductoItemSheetProps) {
  const form = useForm<ProductoItemFormInputValues>({
    resolver: zodResolver(productoItemSchema) as unknown as Resolver<ProductoItemFormInputValues>,
    defaultValues: {
      descripcionItem: "",
      codigoPartida: "",
      unidadMedida: "",
      cantidadRequerida: "",
      precioUnitarioEstimado: "",
    },
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
      reset({
        descripcionItem: "",
        codigoPartida: "",
        unidadMedida: "",
        cantidadRequerida: "",
        precioUnitarioEstimado: "",
      });
    }
  }, [open, reset]);

  const onSubmitForm = async (values: ProductoItemFormInputValues) => {
    // Nota: Aunque el tipo sea InputValues, el zodResolver ya lo transformó a ProductoItemFormValues
    await onSubmit(values as unknown as ProductoItemFormValues);
  };

  if (!open) return null;

  return (
    <>
      {/* Overlay oscuro de fondo */}
      <div
        className="fixed inset-0 z-50 bg-black/50 transition-opacity"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      {/* Contenedor del panel lateral (Sheet manual) */}
      <div
        className="fixed inset-y-0 right-0 z-50 w-full border-l bg-white p-0 overflow-y-auto sm:max-w-md md:max-w-[430px] shadow-lg animate-in slide-in-from-right duration-300"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex h-full flex-col">
          <div className="relative border-b border-slate-100 p-8 pb-4">
            <button
              onClick={() => onOpenChange(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Cerrar</span>
            </button>
            <h2 className="text-left text-2xl font-bold text-heading-dark">Presupuesto base</h2>
            <p className="mt-1.5 text-left text-sm font-medium italic text-slate-500">
              Complete la información técnica, financiera y legal para generar automáticamente el
              Acta de Inicio, el Pliego de Condiciones y el Llamado a Participar.
            </p>
          </div>

          <div className="px-8 pt-6 pb-2">
            <h3 className="text-base font-bold text-[#215ea8]">Estructura del presupuesto base</h3>
            <p className="mt-1 text-xs italic text-slate-500">Artículos 59, 60 LCP.</p>
          </div>

          <div className="flex-1 px-8 py-4">
            <form
              id="producto-item-form"
              className="space-y-6"
              onSubmit={handleSubmit(onSubmitForm)}
            >
              {/* Descripcion */}
              <div className="space-y-2">
                <label className="text-base font-bold text-heading-dark block">
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

              {/* Codigo Partida */}
              <div className="space-y-2">
                <label className="text-base font-bold text-heading-dark block">
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

              {/* Unidad Medida */}
              <div className="space-y-2">
                <label className="text-base font-bold text-heading-dark block">
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

              {/* Cantidad Requerida */}
              <div className="space-y-2">
                <label className="text-base font-bold text-heading-dark block">
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

              {/* Precio Unitario */}
              <div className="space-y-2">
                <label className="text-base font-bold text-heading-dark block">
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

          <div className="mt-auto flex justify-end gap-3 border-t border-slate-100 bg-slate-50/50 p-8 pb-10 pt-6">
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
              {isSubmitting ? "Guardando..." : "Guardar Item"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

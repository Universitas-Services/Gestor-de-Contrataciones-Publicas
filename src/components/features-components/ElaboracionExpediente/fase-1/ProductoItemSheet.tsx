"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";

import { FASE1_FIELD_COPY } from "@/lib/constants/fase1";
import {
  productoItemSchema,
  type ProductoItemFormInputValues,
  type ProductoItemFormValues,
} from "@/lib/schemas/fase1Schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

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
    mode: "onChange",
  });

  useEffect(() => {
    if (open) {
      form.reset({
        descripcionItem: "",
        codigoPartida: "",
        unidadMedida: "",
        cantidadRequerida: "",
        precioUnitarioEstimado: "",
      });
    }
  }, [form, open]);

  const handleSubmit = async (values: ProductoItemFormInputValues) => {
    const parsedValues = productoItemSchema.parse(values);
    await onSubmit(parsedValues);
    onOpenChange(false);
  };

  return (
    <Sheet modal={false} open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full border-l bg-white p-0 overflow-y-auto sm:max-w-md md:max-w-[430px]"
      >
        <div className="flex h-full flex-col">
          <SheetHeader className="border-b border-slate-100 p-8 pb-4">
            <SheetTitle className="text-left text-2xl font-bold text-heading-dark">
              Presupuesto base
            </SheetTitle>
            <SheetDescription className="text-left text-sm font-medium italic text-slate-500">
              Complete la información técnica, financiera y legal para generar automáticamente el
              Acta de Inicio, el Pliego de Condiciones y el Llamado a Participar.
            </SheetDescription>
          </SheetHeader>

          <div className="px-8 pt-6 pb-2">
            <h3 className="text-base font-bold text-[#215ea8]">Estructura del presupuesto base</h3>
            <p className="mt-1 text-xs italic text-slate-500">Artículos 59, 60 LCP.</p>
          </div>

          <div className="flex-1 px-8 py-4">
            <Form {...form}>
              <form
                id="producto-item-form"
                className="space-y-6"
                onSubmit={form.handleSubmit(handleSubmit)}
              >
                <FormField
                  control={form.control}
                  name="descripcionItem"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-bold text-heading-dark">
                        {FASE1_FIELD_COPY.descripcionItem.label}
                      </FormLabel>
                      <FormDescription className="text-sm italic text-slate-500">
                        {FASE1_FIELD_COPY.descripcionItem.description}
                      </FormDescription>
                      <FormControl>
                        <Input {...field} className="h-11 rounded-md border-slate-300 bg-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="codigoPartida"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-bold text-heading-dark">
                        {FASE1_FIELD_COPY.codigoPartida.label}
                      </FormLabel>
                      <FormDescription className="text-sm italic text-slate-500">
                        {FASE1_FIELD_COPY.codigoPartida.description}
                      </FormDescription>
                      <FormControl>
                        <Input {...field} className="h-11 rounded-md border-slate-300 bg-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unidadMedida"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-bold text-heading-dark">
                        {FASE1_FIELD_COPY.unidadMedida.label}
                      </FormLabel>
                      <FormDescription className="text-sm italic text-slate-500">
                        {FASE1_FIELD_COPY.unidadMedida.description}
                      </FormDescription>
                      <FormControl>
                        <Input {...field} className="h-11 rounded-md border-slate-300 bg-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cantidadRequerida"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-bold text-heading-dark">
                        {FASE1_FIELD_COPY.cantidadRequerida.label}
                      </FormLabel>
                      <FormDescription className="text-sm italic text-slate-500">
                        {FASE1_FIELD_COPY.cantidadRequerida.description}
                      </FormDescription>
                      <FormControl>
                        <Input
                          value={field.value ?? ""}
                          type="number"
                          min="0"
                          step="0.01"
                          onChange={(event) => field.onChange(event.target.value)}
                          className="h-11 rounded-md border-slate-300 bg-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="precioUnitarioEstimado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-bold text-heading-dark">
                        {FASE1_FIELD_COPY.precioUnitarioEstimado.label}
                      </FormLabel>
                      <FormDescription className="text-sm italic text-slate-500">
                        {FASE1_FIELD_COPY.precioUnitarioEstimado.description}
                      </FormDescription>
                      <FormControl>
                        <Input
                          value={field.value ?? ""}
                          inputMode="decimal"
                          onChange={(event) => field.onChange(event.target.value)}
                          className="h-11 rounded-md border-slate-300 bg-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>

          <div className="mt-auto flex justify-end gap-3 border-t border-slate-100 bg-slate-50/50 p-8 pb-10 pt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              form="producto-item-form"
              disabled={isSubmitting}
              className="bg-navy text-white hover:bg-navy-hover"
            >
              {isSubmitting ? "Guardando..." : "Guardar Item"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

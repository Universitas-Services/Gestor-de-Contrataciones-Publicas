"use client";

import React from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { TIPOS_CONTRATACION_OPTIONS } from "@/lib/schemas/expedienteSchema";
import type { DatosBasicosFormValues } from "@/lib/schemas/expedienteSchema";

interface DatosBasicosStepProps {
  form: UseFormReturn<DatosBasicosFormValues>;
  onNext: (data: DatosBasicosFormValues) => void;
  isLoading?: boolean;
}

export function DatosBasicosStep({ form, onNext, isLoading = false }: DatosBasicosStepProps) {
  const handleNext = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      onNext(form.getValues());
    }
  };

  return (
    <Form {...form}>
      <form
        onKeyDown={(e) => {
          if (e.key === "Enter") e.preventDefault();
        }}
        className="space-y-0"
      >
        {/* Objeto del procedimiento */}
        <div className="mb-8">
          <FormField
            control={form.control}
            name="descripcionObjeto"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-heading-dark font-bold font-inter text-base">
                  Describa el objeto del procedimiento de contratación.
                </FormLabel>
                <p className="text-slate-500 italic text-sm mt-0.5 mb-2 font-inter">
                  Artículo 107.1 RLCP; 38 (1 al 5 primer párrafo), 91.9 LOCGR; 23 NORMAS DE CONTROL
                  INTERNO SUNAI.
                </p>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ""}
                    className="h-11 bg-white border-slate-300 rounded-md focus-visible:ring-1 focus-visible:ring-color-boton-2/30 w-full md:w-2/3 lg:w-1/2"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Nomenclatura */}
        <div className="mb-8">
          <FormField
            control={form.control}
            name="codigoNomenclatura"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-heading-dark font-bold font-inter text-base">
                  Indique el número o nomenclatura del procedimiento de contratación.
                </FormLabel>
                <p className="text-slate-500 italic text-sm mt-0.5 mb-2 font-inter">
                  Artículos 107.1 RLCP; 23 NORMAS DE CONTROL INTERNO SUNAI.
                </p>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ""}
                    className="h-11 bg-white border-slate-300 rounded-md focus-visible:ring-1 focus-visible:ring-color-boton-2/30 w-full md:w-2/3 lg:w-1/2"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Tipo de contratación */}
        <div className="mb-8">
          <FormField
            control={form.control}
            name="tipoContratacion"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-heading-dark font-bold font-inter text-base">
                  Seleccione el tipo de contratación
                </FormLabel>
                <p className="text-slate-500 italic text-sm mt-0.5 mb-2 font-inter">
                  Requisito de la plataforma para aplicar las reglas de la modalidad y plazos.
                </p>
                <Select onValueChange={field.onChange} value={field.value || undefined}>
                  <FormControl>
                    <SelectTrigger className="w-[200px] h-9 bg-white border-slate-300 rounded-md focus:ring-1 focus:ring-color-boton-2/30 text-slate-400 text-sm font-inter">
                      <SelectValue placeholder="selecciona opción" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TIPOS_CONTRATACION_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="font-inter">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Monto Bs */}
        <div className="mb-8">
          <FormField
            control={form.control}
            name="montoEstimadoBs"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-heading-dark font-bold font-inter text-base">
                  Ingrese el monto en bolívares (Bs.) estimado de la contratación, incluyendo el
                  Impuesto al Valor Agregado (IVA).
                </FormLabel>
                <p className="text-slate-500 italic text-sm mt-0.5 mb-2 font-inter">
                  Artículo 107.2 RLCP; 6 LCC; 38 (1 al 5 primer párrafo), 91.1.9.17.23.29 LOCGR; 15
                  Y 24 NORMAS DE CONTROL INTERNO SUNAI.
                </p>
                <FormControl>
                  <MoneyInput
                    placeholder="Ej: 10.000,00"
                    className="h-11 bg-white border-slate-300 rounded-md focus-visible:ring-1 focus-visible:ring-color-boton-2/30 w-full md:w-1/3 lg:w-1/4"
                    name={field.name}
                    value={
                      typeof field.value === "number" ? field.value.toFixed(2) : field.value || ""
                    }
                    onBlur={field.onBlur}
                    onValueChange={(cleanValue) => {
                      const numericVal = parseFloat(cleanValue.replace(",", "."));
                      field.onChange(isNaN(numericVal) ? undefined : numericVal);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-end pt-6 border-t border-slate-200">
          <Button
            type="button"
            onClick={handleNext}
            disabled={isLoading}
            className="bg-navy hover:bg-navy-hover text-white font-semibold px-8 h-11 rounded-md cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              "Siguiente"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

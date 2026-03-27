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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { TIPOS_CONTRATACION_OPTIONS } from "@/lib/mocks/expedientesMock";
import type { DatosBasicosForm } from "@/types/expediente.types";

interface DatosBasicosStepProps {
  form: UseFormReturn<DatosBasicosForm>;
  onNext: () => void;
}

export function DatosBasicosStep({ form, onNext }: DatosBasicosStepProps) {
  const handleNext = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      onNext();
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
            name="objetoProcedimiento"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-heading-dark font-bold font-inter text-base">
                  Describa el objeto del procedimiento de contratación.
                </FormLabel>
                <p className="text-slate-500 italic text-sm mt-0.5 mb-2 font-inter">
                  Artículos 107.1 RLCP; 3 NORMAS DE CONTROL INTERNO SUNAI.
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
            name="nomenclatura"
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
            name="montoBs"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-heading-dark font-bold font-inter text-base">
                  Ingrese el monto (Bs.) estimado de la contratación, incluyendo el Impuesto al
                  Valor Agregado (IVA).
                </FormLabel>
                <p className="text-slate-500 italic text-sm mt-0.5 mb-2 font-inter">
                  Artículos 107.2 RLCP; 15 y 24 NORMAS DE CONTROL INTERNO SUNAI.
                </p>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ""}
                    type="text"
                    inputMode="numeric"
                    className="h-11 bg-white border-slate-300 rounded-md focus-visible:ring-1 focus-visible:ring-color-boton-2/30 w-full md:w-1/3 lg:w-1/4"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Monto Divisas */}
        <div className="mb-8">
          <FormField
            control={form.control}
            name="montoDivisas"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-heading-dark font-bold font-inter text-base">
                  Ingrese el monto equivalente en Divisas ($) Referencia
                </FormLabel>
                <p className="text-slate-500 italic text-sm mt-0.5 mb-2 font-inter">
                  Referencia financiera interna.
                </p>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ""}
                    type="text"
                    inputMode="numeric"
                    className="h-11 bg-white border-slate-300 rounded-md focus-visible:ring-1 focus-visible:ring-color-boton-2/30 w-full md:w-1/3 lg:w-1/4"
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
            className="bg-navy hover:bg-navy-hover text-white font-semibold px-8 h-11 rounded-md cursor-pointer"
          >
            Siguiente
          </Button>
        </div>
      </form>
    </Form>
  );
}

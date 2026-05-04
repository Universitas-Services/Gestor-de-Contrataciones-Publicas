"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarDays } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";

import { FASE1_FIELD_COPY, FASE1_SECTION_DESCRIPTIONS } from "@/lib/constants/fase1";
import type { Fase1FormInputValues } from "@/lib/schemas/fase1Schema";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Fase1SectionHeader } from "../Fase1SectionHeader";

interface Paso1DefinicionStepProps {
  form: UseFormReturn<Fase1FormInputValues>;
}

export function Paso1DefinicionStep({ form }: Paso1DefinicionStepProps) {
  return (
    <div className="space-y-8">
      <Fase1SectionHeader
        title="Definición técnica y financiera"
        description={FASE1_SECTION_DESCRIPTIONS[1]}
      />

      <div className="space-y-7">
        <FormField
          control={form.control}
          name="datosActoAutorizacionInicio"
          render={({ field }) => (
            <FormItem className="max-w-2xl">
              <FormLabel className="text-base font-bold leading-tight text-heading-dark">
                {FASE1_FIELD_COPY.datosActoAutorizacionInicio.label}
              </FormLabel>
              <FormDescription className="text-sm italic text-slate-500">
                {FASE1_FIELD_COPY.datosActoAutorizacionInicio.description}
              </FormDescription>
              <FormControl>
                <Input
                  {...field}
                  placeholder={FASE1_FIELD_COPY.datosActoAutorizacionInicio.placeholder}
                  className="h-11 rounded-md border-slate-300 bg-white"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fechaActaInicio"
          render={({ field }) => (
            <FormItem className="max-w-sm">
              <FormLabel className="text-base font-bold leading-tight text-heading-dark">
                {FASE1_FIELD_COPY.fechaActaInicio.label}
              </FormLabel>
              <FormDescription className="text-sm italic text-slate-500">
                {FASE1_FIELD_COPY.fechaActaInicio.description}
              </FormDescription>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 w-full justify-start rounded-md border-slate-300 bg-white text-left font-normal"
                    >
                      <CalendarDays className="mr-2 h-4 w-4 text-navy" />
                      {field.value
                        ? format(new Date(`${field.value}T12:00:00`), "dd 'de' MMMM, yyyy", {
                            locale: es,
                          })
                        : FASE1_FIELD_COPY.fechaActaInicio.placeholder}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(`${field.value}T12:00:00`) : undefined}
                    onSelect={(date) => {
                      if (date) field.onChange(format(date, "yyyy-MM-dd"));
                    }}
                    locale={es}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="detallesTecnicosCalidad"
          render={({ field }) => (
            <FormItem className="max-w-3xl">
              <FormLabel className="text-base font-bold leading-tight text-heading-dark">
                {FASE1_FIELD_COPY.detallesTecnicosCalidad.label}
              </FormLabel>
              <FormDescription className="text-sm italic text-slate-500">
                {FASE1_FIELD_COPY.detallesTecnicosCalidad.description}
              </FormDescription>
              <FormControl>
                <Textarea {...field} className="min-h-28 rounded-md border-slate-300 bg-white" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="alcanceCantidadesObra"
          render={({ field }) => (
            <FormItem className="max-w-3xl">
              <FormLabel className="text-base font-bold leading-tight text-heading-dark">
                {FASE1_FIELD_COPY.alcanceCantidadesObra.label}
              </FormLabel>
              <FormDescription className="text-sm italic text-slate-500">
                {FASE1_FIELD_COPY.alcanceCantidadesObra.description}
              </FormDescription>
              <FormControl>
                <Textarea {...field} className="min-h-28 rounded-md border-slate-300 bg-white" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="justificacionVentajas"
          render={({ field }) => (
            <FormItem className="max-w-3xl">
              <FormLabel className="text-base font-bold leading-tight text-heading-dark">
                {FASE1_FIELD_COPY.justificacionVentajas.label}
              </FormLabel>
              <FormDescription className="text-sm italic text-slate-500">
                {FASE1_FIELD_COPY.justificacionVentajas.description}
              </FormDescription>
              <FormControl>
                <Textarea {...field} className="min-h-28 rounded-md border-slate-300 bg-white" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="origenCrsRegistro"
          render={({ field }) => (
            <FormItem className="max-w-3xl">
              <FormLabel className="text-base font-bold leading-tight text-heading-dark">
                {FASE1_FIELD_COPY.origenCrsRegistro.label}
              </FormLabel>
              <FormDescription className="text-sm italic text-slate-500">
                {FASE1_FIELD_COPY.origenCrsRegistro.description}
              </FormDescription>
              <FormControl>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant={field.value === true ? "default" : "outline"}
                    className={field.value === true ? "bg-[#83bf3a] hover:bg-[#74aa32]" : ""}
                    onClick={() => field.onChange(true)}
                  >
                    Sí
                  </Button>
                  <Button
                    type="button"
                    variant={field.value === false ? "default" : "outline"}
                    className={field.value === false ? "bg-slate-500 hover:bg-slate-600" : ""}
                    onClick={() => field.onChange(false)}
                  >
                    No
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

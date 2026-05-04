"use client";

import type { UseFormReturn } from "react-hook-form";

import { FASE1_FIELD_COPY, FASE1_SECTION_DESCRIPTIONS } from "@/lib/constants/fase1";
import type { Fase1FormInputValues } from "@/lib/schemas/fase1Schema";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Fase1SectionHeader } from "../Fase1SectionHeader";

interface Paso3ParametrosLegalesStepProps {
  form: UseFormReturn<Fase1FormInputValues>;
}

export function Paso3ParametrosLegalesStep({ form }: Paso3ParametrosLegalesStepProps) {
  return (
    <div className="space-y-8">
      <Fase1SectionHeader
        title="Parámetros legales del pliego"
        description={FASE1_SECTION_DESCRIPTIONS[3]}
      />

      <div className="space-y-7">
        <FormField
          control={form.control}
          name="diasValidezOferta"
          render={({ field }) => (
            <FormItem className="max-w-sm">
              <FormLabel className="text-base font-bold leading-tight text-heading-dark">
                {FASE1_FIELD_COPY.diasValidezOferta.label}
              </FormLabel>
              <FormDescription className="text-sm italic text-slate-500">
                {FASE1_FIELD_COPY.diasValidezOferta.description}
              </FormDescription>
              <FormControl>
                <Input
                  value={field.value ?? ""}
                  type="number"
                  min="1"
                  onChange={(event) => field.onChange(event.target.value)}
                  placeholder={FASE1_FIELD_COPY.diasValidezOferta.placeholder}
                  className="h-11 rounded-md border-slate-300 bg-white"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="autoridadAclaratorias"
          render={({ field }) => (
            <FormItem className="max-w-3xl">
              <FormLabel className="text-base font-bold leading-tight text-heading-dark">
                {FASE1_FIELD_COPY.autoridadAclaratorias.label}
              </FormLabel>
              <FormDescription className="text-sm italic text-slate-500">
                {FASE1_FIELD_COPY.autoridadAclaratorias.description}
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
          name="normativaLegal"
          render={({ field }) => (
            <FormItem className="max-w-3xl">
              <FormLabel className="text-base font-bold leading-tight text-heading-dark">
                {FASE1_FIELD_COPY.normativaLegal.label}
              </FormLabel>
              <FormDescription className="text-sm italic text-slate-500">
                {FASE1_FIELD_COPY.normativaLegal.description}
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
          name="diasVigenciaGarantiaExtension"
          render={({ field }) => (
            <FormItem className="max-w-sm">
              <FormLabel className="text-base font-bold leading-tight text-heading-dark">
                {FASE1_FIELD_COPY.diasVigenciaGarantiaExtension.label}
              </FormLabel>
              <FormDescription className="text-sm italic text-slate-500">
                {FASE1_FIELD_COPY.diasVigenciaGarantiaExtension.description}
              </FormDescription>
              <FormControl>
                <Input
                  value={field.value ?? ""}
                  type="number"
                  min="1"
                  onChange={(event) => field.onChange(event.target.value)}
                  placeholder={FASE1_FIELD_COPY.diasVigenciaGarantiaExtension.placeholder}
                  className="h-11 rounded-md border-slate-300 bg-white"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

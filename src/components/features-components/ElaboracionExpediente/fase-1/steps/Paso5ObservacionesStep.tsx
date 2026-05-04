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
import { Textarea } from "@/components/ui/textarea";
import { Fase1SectionHeader } from "../Fase1SectionHeader";

interface Paso5ObservacionesStepProps {
  form: UseFormReturn<Fase1FormInputValues>;
}

export function Paso5ObservacionesStep({ form }: Paso5ObservacionesStepProps) {
  return (
    <div className="space-y-8">
      <Fase1SectionHeader
        title="Observaciones finales"
        description={FASE1_SECTION_DESCRIPTIONS[5]}
      />

      <div className="space-y-7">
        <FormField
          control={form.control}
          name="condicionPlurianual"
          render={({ field }) => (
            <FormItem className="max-w-3xl">
              <FormLabel className="text-base font-bold leading-tight text-heading-dark">
                {FASE1_FIELD_COPY.condicionPlurianual.label}
              </FormLabel>
              <FormDescription className="text-sm italic text-slate-500">
                {FASE1_FIELD_COPY.condicionPlurianual.description}
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
          name="viabilidadContratoMarco"
          render={({ field }) => (
            <FormItem className="max-w-3xl">
              <FormLabel className="text-base font-bold leading-tight text-heading-dark">
                {FASE1_FIELD_COPY.viabilidadContratoMarco.label}
              </FormLabel>
              <FormDescription className="text-sm italic text-slate-500">
                {FASE1_FIELD_COPY.viabilidadContratoMarco.description}
              </FormDescription>
              <FormControl>
                <Textarea {...field} className="min-h-28 rounded-md border-slate-300 bg-white" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

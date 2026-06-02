"use client";

import type { UseFormReturn } from "react-hook-form";

import { FASE1_FIELD_COPY, FASE1_SECTION_DESCRIPTIONS } from "@/lib/constants/fase1";
import type { Fase1FormInputValues } from "@/lib/schemas/fase1Schema";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Fase1SectionHeader } from "../Fase1SectionHeader";

interface Paso5ObservacionesStepProps {
  form: UseFormReturn<Fase1FormInputValues>;
}

const compactLabelClass = "font-bold text-color-titulos text-[11px] leading-snug";
const compactDescriptionClass = "text-[10px] text-muted-foreground italic leading-relaxed";
const compactTextareaClass =
  "min-h-[88px] rounded-md border-slate-300 bg-white px-3 py-2 text-[11px] font-medium text-slate-600 shadow-none placeholder:text-[11px] placeholder:italic placeholder:font-medium placeholder:text-slate-500/60 focus-visible:ring-[2px]";
const compactMessageClass = "text-[11px]";

export function Paso5ObservacionesStep({ form }: Paso5ObservacionesStepProps) {
  return (
    <div className="space-y-6">
      <Fase1SectionHeader
        title="Observaciones finales"
        description={FASE1_SECTION_DESCRIPTIONS[5]}
      />

      <div className="space-y-5">
        <FormField
          control={form.control}
          name="condicionPlurianual"
          render={({ field }) => (
            <FormItem className="max-w-3xl">
              <p className={compactLabelClass}>{FASE1_FIELD_COPY.condicionPlurianual.label}</p>
              <FormDescription className={compactDescriptionClass}>
                {FASE1_FIELD_COPY.condicionPlurianual.description}
              </FormDescription>
              <FormControl>
                <Textarea {...field} className={compactTextareaClass} />
              </FormControl>
              <FormMessage className={compactMessageClass} />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="viabilidadContratoMarco"
          render={({ field }) => (
            <FormItem className="max-w-3xl">
              <p className={compactLabelClass}>{FASE1_FIELD_COPY.viabilidadContratoMarco.label}</p>
              <FormDescription className={compactDescriptionClass}>
                {FASE1_FIELD_COPY.viabilidadContratoMarco.description}
              </FormDescription>
              <FormControl>
                <Textarea {...field} className={compactTextareaClass} />
              </FormControl>
              <FormMessage className={compactMessageClass} />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

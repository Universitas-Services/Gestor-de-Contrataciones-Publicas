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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Fase1SectionHeader } from "../Fase1SectionHeader";

interface Paso3ParametrosLegalesStepProps {
  form: UseFormReturn<Fase1FormInputValues>;
}

const compactLabelClass = "font-bold text-color-titulos text-[11px] leading-snug";
const compactDescriptionClass = "text-[10px] text-muted-foreground italic leading-relaxed";
const compactInputClass =
  "h-[32px] rounded-md border-slate-300 bg-white text-[11px] font-medium text-slate-600 shadow-none placeholder:text-[11px] placeholder:italic placeholder:font-medium placeholder:text-slate-500/60 focus-visible:ring-[2px]";
const compactTextareaClass =
  "min-h-[88px] rounded-md border-slate-300 bg-white px-3 py-2 text-[11px] font-medium text-slate-600 shadow-none placeholder:text-[11px] placeholder:italic placeholder:font-medium placeholder:text-slate-500/60 focus-visible:ring-[2px]";
const compactMessageClass = "text-[11px]";

export function Paso3ParametrosLegalesStep({ form }: Paso3ParametrosLegalesStepProps) {
  return (
    <div className="space-y-6">
      <Fase1SectionHeader
        title="Parametros legales del pliego"
        description={FASE1_SECTION_DESCRIPTIONS[3]}
      />

      <div className="space-y-5">
        <FormField
          control={form.control}
          name="diasValidezOferta"
          render={({ field }) => (
            <FormItem className="max-w-sm">
              <p className={compactLabelClass}>{FASE1_FIELD_COPY.diasValidezOferta.label}</p>
              <FormDescription className={compactDescriptionClass}>
                {FASE1_FIELD_COPY.diasValidezOferta.description}
              </FormDescription>
              <p className="text-[10px] italic text-slate-400">
                {FASE1_FIELD_COPY.diasValidezOferta.placeholder}
              </p>
              <FormControl>
                <Input
                  value={field.value ?? ""}
                  type="number"
                  min="1"
                  onChange={(event) => field.onChange(event.target.value)}
                  className={compactInputClass}
                />
              </FormControl>
              <FormMessage className={compactMessageClass} />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="autoridadAclaratorias"
          render={({ field }) => (
            <FormItem className="max-w-3xl">
              <p className={compactLabelClass}>{FASE1_FIELD_COPY.autoridadAclaratorias.label}</p>
              <FormDescription className={compactDescriptionClass}>
                {FASE1_FIELD_COPY.autoridadAclaratorias.description}
              </FormDescription>
              <FormControl>
                <Input {...field} className={compactInputClass} />
              </FormControl>
              <FormMessage className={compactMessageClass} />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="normativaLegal"
          render={({ field }) => (
            <FormItem className="max-w-3xl">
              <p className={compactLabelClass}>{FASE1_FIELD_COPY.normativaLegal.label}</p>
              <FormDescription className={compactDescriptionClass}>
                {FASE1_FIELD_COPY.normativaLegal.description}
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
          name="diasVigenciaGarantiaExtension"
          render={({ field }) => (
            <FormItem className="max-w-sm">
              <p className={compactLabelClass}>
                {FASE1_FIELD_COPY.diasVigenciaGarantiaExtension.label}
              </p>
              <FormDescription className={compactDescriptionClass}>
                {FASE1_FIELD_COPY.diasVigenciaGarantiaExtension.description}
              </FormDescription>
              <p className="text-[10px] italic text-slate-400">
                {FASE1_FIELD_COPY.diasVigenciaGarantiaExtension.placeholder}
              </p>
              <FormControl>
                <Input
                  value={field.value ?? ""}
                  type="number"
                  min="1"
                  onChange={(event) => field.onChange(event.target.value)}
                  className={compactInputClass}
                />
              </FormControl>
              <FormMessage className={compactMessageClass} />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

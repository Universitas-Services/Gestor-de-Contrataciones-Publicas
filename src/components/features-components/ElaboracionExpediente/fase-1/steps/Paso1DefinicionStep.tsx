"use client";

import type { UseFormReturn } from "react-hook-form";

import type { TipoContratacionBackend } from "@/lib/schemas/expedienteSchema";
import {
  FASE1_FIELD_COPY,
  FASE1_SECTION_DESCRIPTIONS,
  getFase1DynamicFieldCopy,
} from "@/lib/constants/fase1";
import { cn } from "@/lib/utils";
import type { Fase1FormInputValues } from "@/lib/schemas/fase1Schema";
import { Button } from "@/components/ui/button";
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

interface Paso1DefinicionStepProps {
  form: UseFormReturn<Fase1FormInputValues>;
  tipoContratacion: TipoContratacionBackend;
}

const compactLabelClass = "font-bold text-color-titulos text-[11px] leading-snug";
const compactDescriptionClass = "text-[10px] text-muted-foreground italic leading-relaxed";
const compactInputClass =
  "h-[32px] rounded-md border-slate-300 bg-white text-[11px] font-medium text-slate-600 shadow-none placeholder:text-[11px] placeholder:italic placeholder:font-medium placeholder:text-slate-500/60 focus-visible:ring-[2px]";
const compactTextareaClass =
  "min-h-[88px] rounded-md border-slate-300 bg-white px-3 py-2 text-[11px] font-medium text-slate-600 shadow-none placeholder:text-[11px] placeholder:italic placeholder:font-medium placeholder:text-slate-500/60 focus-visible:ring-[2px]";
const compactChoiceBaseClass =
  "h-8 min-w-[68px] cursor-pointer rounded-md border px-3 text-[11px] font-bold transition-colors";
const compactMessageClass = "text-[11px]";

export function Paso1DefinicionStep({ form, tipoContratacion }: Paso1DefinicionStepProps) {
  const detallesTecnicosCalidadCopy = getFase1DynamicFieldCopy(
    "detallesTecnicosCalidad",
    tipoContratacion
  );
  const alcanceCantidadesCopy = getFase1DynamicFieldCopy("alcanceCantidadesObra", tipoContratacion);

  return (
    <div className="space-y-6">
      <Fase1SectionHeader
        title="Definicion tecnica y financiera"
        description={FASE1_SECTION_DESCRIPTIONS[1]}
      />

      <div className="space-y-5">
        <FormField
          control={form.control}
          name="datosActoAutorizacionInicio"
          render={({ field }) => (
            <FormItem className="max-w-2xl">
              <p className={compactLabelClass}>
                {FASE1_FIELD_COPY.datosActoAutorizacionInicio.label}
              </p>
              <FormDescription className={compactDescriptionClass}>
                {FASE1_FIELD_COPY.datosActoAutorizacionInicio.description}
              </FormDescription>
              <p className="text-[10px] italic text-slate-400">
                {FASE1_FIELD_COPY.datosActoAutorizacionInicio.placeholder}
              </p>
              <FormControl>
                <Input {...field} className={compactInputClass} />
              </FormControl>
              <FormMessage className={compactMessageClass} />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="detallesTecnicosCalidad"
          render={({ field }) => (
            <FormItem className="max-w-3xl">
              <p className={compactLabelClass}>{detallesTecnicosCalidadCopy.label}</p>
              <FormDescription className={compactDescriptionClass}>
                {detallesTecnicosCalidadCopy.description}
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
          name="alcanceCantidadesObra"
          render={({ field }) => (
            <FormItem className="max-w-3xl">
              <p className={compactLabelClass}>{alcanceCantidadesCopy.label}</p>
              <FormDescription className={compactDescriptionClass}>
                {alcanceCantidadesCopy.description}
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
          name="justificacionVentajas"
          render={({ field }) => (
            <FormItem className="max-w-3xl">
              <p className={compactLabelClass}>{FASE1_FIELD_COPY.justificacionVentajas.label}</p>
              <FormDescription className={compactDescriptionClass}>
                {FASE1_FIELD_COPY.justificacionVentajas.description}
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
          name="origenCrsRegistro"
          render={({ field }) => (
            <FormItem className="max-w-3xl">
              <p className={compactLabelClass}>{FASE1_FIELD_COPY.origenCrsRegistro.label}</p>
              <FormDescription className={compactDescriptionClass}>
                {FASE1_FIELD_COPY.origenCrsRegistro.description}
              </FormDescription>
              <FormControl>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(
                      compactChoiceBaseClass,
                      field.value === true
                        ? "border-navy! bg-navy! text-white! hover:border-navy! hover:bg-navy-hover! hover:text-white!"
                        : "border-slate-200! bg-white! text-slate-500! hover:border-slate-300! hover:text-slate-700!"
                    )}
                    onClick={() => field.onChange(true)}
                  >
                    Sí
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(
                      compactChoiceBaseClass,
                      field.value === false
                        ? "border-navy! bg-navy! text-white! hover:border-navy! hover:bg-navy-hover! hover:text-white!"
                        : "border-slate-200! bg-white! text-slate-500! hover:border-slate-300! hover:text-slate-700!"
                    )}
                    onClick={() => field.onChange(false)}
                  >
                    No
                  </Button>
                </div>
              </FormControl>
              <FormMessage className={compactMessageClass} />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

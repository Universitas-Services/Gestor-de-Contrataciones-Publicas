"use client";

import { AlertTriangle } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";

import { FASE1_FIELD_COPY, FASE1_SECTION_DESCRIPTIONS } from "@/lib/constants/fase1";
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
import { Fase1SectionHeader } from "../Fase1SectionHeader";

interface Paso5ObservacionesStepProps {
  form: UseFormReturn<Fase1FormInputValues>;
}

const compactLabelClass = "font-bold text-color-titulos text-[11px] leading-snug";
const compactDescriptionClass = "text-[10px] text-muted-foreground italic leading-relaxed";
const compactInputClass =
  "h-[32px] rounded-md border-slate-300 bg-white text-[11px] font-medium text-slate-600 shadow-none placeholder:text-[11px] placeholder:italic placeholder:font-medium placeholder:text-slate-500/60 focus-visible:ring-[2px]";
const compactChoiceBaseClass =
  "h-8 min-w-[68px] rounded-md border px-3 text-[11px] font-bold transition-colors";
const compactMessageClass = "text-[11px]";

function BooleanChoiceField({
  value,
  onChange,
}: {
  value: boolean | undefined;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn(
          compactChoiceBaseClass,
          value === true
            ? "!border-navy !bg-navy !text-white hover:!bg-navy-hover hover:!text-white"
            : "!border-slate-200 !bg-white !text-slate-500 hover:!border-slate-300 hover:!text-slate-700"
        )}
        onClick={() => onChange(true)}
      >
        Si
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn(
          compactChoiceBaseClass,
          value === false
            ? "!border-navy !bg-navy !text-white hover:!bg-navy-hover hover:!text-white"
            : "!border-slate-200 !bg-white !text-slate-500 hover:!border-slate-300 hover:!text-slate-700"
        )}
        onClick={() => onChange(false)}
      >
        No
      </Button>
    </div>
  );
}

export function Paso5ObservacionesStep({ form }: Paso5ObservacionesStepProps) {
  const condicionPlurianual = form.watch("condicionPlurianual");
  const viabilidadContratoMarco = form.watch("viabilidadContratoMarco");

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
                <BooleanChoiceField value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage className={compactMessageClass} />
            </FormItem>
          )}
        />

        {condicionPlurianual === true && (
          <div className="max-w-3xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <p className="text-[12px] font-semibold leading-relaxed">
                Recuerde reflejar esta condición en el cronograma o en las condiciones del
                procedimiento.
              </p>
            </div>
          </div>
        )}

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
                <BooleanChoiceField value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage className={compactMessageClass} />
            </FormItem>
          )}
        />

        {viabilidadContratoMarco === true && (
          <FormField
            control={form.control}
            name="justificacionContratoMarco"
            render={({ field }) => (
              <FormItem className="max-w-3xl">
                <p className={compactLabelClass}>
                  {FASE1_FIELD_COPY.justificacionContratoMarco.label}
                </p>
                <FormDescription className={compactDescriptionClass}>
                  {FASE1_FIELD_COPY.justificacionContratoMarco.description}
                </FormDescription>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={FASE1_FIELD_COPY.justificacionContratoMarco.placeholder}
                    className={compactInputClass}
                  />
                </FormControl>
                <FormMessage className={compactMessageClass} />
              </FormItem>
            )}
          />
        )}
      </div>
    </div>
  );
}

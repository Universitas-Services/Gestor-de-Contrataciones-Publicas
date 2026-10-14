"use client";

import { Controller, type UseFormReturn } from "react-hook-form";

import {
  ASPECTOS_GENERALES_MODALIDAD_CRS_OPTIONS,
  ASPECTOS_GENERALES_STEP_SECTIONS,
} from "@/lib/constants/aspectosGenerales";
import type { AspectosGeneralesFormInputValues } from "@/lib/schemas/aspectosGeneralesSchema";
import { FormDropdownSelect } from "@/components/features-components/GestionExpedientes/FormDropdownSelect";
import { LocalizedDecimalInput } from "@/components/localized-decimal-input";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AspectosGeneralesFieldCopy } from "../AspectosGeneralesFieldCopy";

interface Paso3ResponsabilidadSocialStepProps {
  form: UseFormReturn<AspectosGeneralesFormInputValues>;
  readOnly?: boolean;
}

const inputClass =
  "h-10 rounded-md border-border bg-card text-[13px] font-medium text-foreground shadow-none placeholder:italic placeholder:text-muted-foreground/60 focus-visible:ring-[2px]";
const messageClass = "text-[11px]";

export function Paso3ResponsabilidadSocialStep({
  form,
  readOnly = false,
}: Paso3ResponsabilidadSocialStepProps) {
  const section = ASPECTOS_GENERALES_STEP_SECTIONS[3];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-[17px] font-bold text-color-titulos">{section.title}</h2>
        <p className="text-[12px] italic leading-relaxed text-muted-foreground">
          {section.description}
        </p>
      </div>

      <div className="space-y-5">
        <FormField
          control={form.control}
          name="porcentajeResponsabilidadSocialAuAu"
          render={() => (
            <FormItem className="max-w-3xl">
              <AspectosGeneralesFieldCopy fieldKey="porcentajeResponsabilidadSocialAuAu" />
              <FormControl>
                <div className="relative max-w-[160px]">
                  <Controller
                    control={form.control}
                    name="porcentajeResponsabilidadSocialAuAu"
                    render={({ field }) => (
                      <LocalizedDecimalInput
                        name={field.name}
                        ref={field.ref}
                        value={field.value}
                        onBlur={field.onBlur}
                        onValueChange={field.onChange}
                        disabled={readOnly}
                        max={100}
                        className={`${inputClass} pr-8`}
                        placeholder="0,00"
                      />
                    )}
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[12px] font-semibold text-muted-foreground">
                    %
                  </span>
                </div>
              </FormControl>
              <FormMessage className={messageClass} />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="unidadRespCumplimientoCrsAuAu"
          render={({ field }) => (
            <FormItem className="max-w-2xl">
              <AspectosGeneralesFieldCopy fieldKey="unidadRespCumplimientoCrsAuAu" />
              <FormControl>
                <Input {...field} disabled={readOnly} className={inputClass} />
              </FormControl>
              <FormMessage className={messageClass} />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="modalidadCrsAuAu"
          render={({ field }) => (
            <FormItem className="max-w-3xl">
              <AspectosGeneralesFieldCopy fieldKey="modalidadCrsAuAu" />
              <FormControl>
                <FormDropdownSelect
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                  options={ASPECTOS_GENERALES_MODALIDAD_CRS_OPTIONS}
                  placeholder="Seleccione la modalidad del CRS"
                  disabled={readOnly}
                  aria-label="Modalidad CRS"
                />
              </FormControl>
              <FormMessage className={messageClass} />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="formaCumplimientoCrsAuAu"
          render={({ field }) => (
            <FormItem className="max-w-3xl">
              <AspectosGeneralesFieldCopy fieldKey="formaCumplimientoCrsAuAu" />
              <FormControl>
                <Textarea
                  {...field}
                  disabled={readOnly}
                  rows={5}
                  className="min-h-[120px] rounded-md border-border bg-card text-[13px] font-medium shadow-none"
                />
              </FormControl>
              <FormMessage className={messageClass} />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

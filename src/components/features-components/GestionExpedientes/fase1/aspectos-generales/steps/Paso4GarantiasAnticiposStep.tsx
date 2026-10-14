"use client";

import { Controller, type UseFormReturn } from "react-hook-form";

import { ASPECTOS_GENERALES_STEP_SECTIONS } from "@/lib/constants/aspectosGenerales";
import type { AspectosGeneralesFormInputValues } from "@/lib/schemas/aspectosGeneralesSchema";
import { SiNoToggleField } from "@/components/features-components/GestionExpedientes/fase1/actividades-previas/SiNoToggleField";
import { LocalizedDecimalInput } from "@/components/localized-decimal-input";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { AspectosGeneralesFieldCopy } from "../AspectosGeneralesFieldCopy";

interface Paso4GarantiasAnticiposStepProps {
  form: UseFormReturn<AspectosGeneralesFormInputValues>;
  readOnly?: boolean;
}

const inputClass =
  "h-10 rounded-md border-border bg-card text-[13px] font-medium text-foreground shadow-none placeholder:italic placeholder:text-muted-foreground/60 focus-visible:ring-[2px]";
const messageClass = "text-[11px]";
const conditionalBlockClass =
  "space-y-5 rounded-lg border border-border border-l-4 border-l-navy bg-muted/40 p-4 md:p-5";

export function Paso4GarantiasAnticiposStep({
  form,
  readOnly = false,
}: Paso4GarantiasAnticiposStepProps) {
  const section = ASPECTOS_GENERALES_STEP_SECTIONS[4];
  const anticipoEspecial = form.watch("anticipoEspecialAuAu");

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
          name="porcentajeMantenimientoOfertaAuAu"
          render={() => (
            <FormItem className="max-w-3xl">
              <AspectosGeneralesFieldCopy fieldKey="porcentajeMantenimientoOfertaAuAu" />
              <FormControl>
                <div className="relative max-w-[160px]">
                  <Controller
                    control={form.control}
                    name="porcentajeMantenimientoOfertaAuAu"
                    render={({ field }) => (
                      <LocalizedDecimalInput
                        name={field.name}
                        ref={field.ref}
                        value={field.value}
                        onBlur={field.onBlur}
                        onValueChange={field.onChange}
                        disabled={readOnly}
                        max={2.5}
                        className={`${inputClass} pr-8`}
                        placeholder="1,50"
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
          name="porcentajeFielCumplimientoAuAu"
          render={() => (
            <FormItem className="max-w-3xl">
              <AspectosGeneralesFieldCopy fieldKey="porcentajeFielCumplimientoAuAu" />
              <FormControl>
                <div className="relative max-w-[160px]">
                  <Controller
                    control={form.control}
                    name="porcentajeFielCumplimientoAuAu"
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
          name="retencionFielCumplimientoAuAu"
          render={({ field }) => (
            <FormItem className="max-w-3xl">
              <AspectosGeneralesFieldCopy fieldKey="retencionFielCumplimientoAuAu" />
              <FormControl>
                <SiNoToggleField
                  value={field.value}
                  onChange={field.onChange}
                  disabled={readOnly}
                  className="max-w-xs"
                />
              </FormControl>
              <FormMessage className={messageClass} />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="anticipoEspecialAuAu"
          render={({ field }) => (
            <FormItem className="max-w-3xl">
              <AspectosGeneralesFieldCopy fieldKey="anticipoEspecialAuAu" />
              <FormControl>
                <SiNoToggleField
                  value={field.value}
                  onChange={field.onChange}
                  disabled={readOnly}
                  className="max-w-xs"
                />
              </FormControl>
              <FormMessage className={messageClass} />
            </FormItem>
          )}
        />

        {anticipoEspecial === true ? (
          <div className={conditionalBlockClass}>
            <FormField
              control={form.control}
              name="porcentajeAnticipoEspecialAuAu"
              render={() => (
                <FormItem className="max-w-3xl">
                  <AspectosGeneralesFieldCopy fieldKey="porcentajeAnticipoEspecialAuAu" />
                  <FormControl>
                    <Controller
                      control={form.control}
                      name="porcentajeAnticipoEspecialAuAu"
                      render={({ field }) => (
                        <LocalizedDecimalInput
                          name={field.name}
                          ref={field.ref}
                          value={field.value}
                          onBlur={field.onBlur}
                          onValueChange={field.onChange}
                          disabled={readOnly}
                          max={20}
                          className={`${inputClass} max-w-[160px]`}
                          placeholder="0,00"
                        />
                      )}
                    />
                  </FormControl>
                  <FormMessage className={messageClass} />
                </FormItem>
              )}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

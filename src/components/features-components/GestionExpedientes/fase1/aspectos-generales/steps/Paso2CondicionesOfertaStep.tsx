"use client";

import { Controller, type UseFormReturn } from "react-hook-form";

import { ASPECTOS_GENERALES_STEP_SECTIONS } from "@/lib/constants/aspectosGenerales";
import type { AspectosGeneralesFormInputValues } from "@/lib/schemas/aspectosGeneralesSchema";
import { SiNoToggleField } from "@/components/features-components/GestionExpedientes/fase1/actividades-previas/SiNoToggleField";
import { LocalizedDecimalInput } from "@/components/localized-decimal-input";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AspectosGeneralesFieldCopy } from "../AspectosGeneralesFieldCopy";

interface Paso2CondicionesOfertaStepProps {
  form: UseFormReturn<AspectosGeneralesFormInputValues>;
  readOnly?: boolean;
}

const inputClass =
  "h-10 rounded-md border-border bg-card text-[13px] font-medium text-foreground shadow-none placeholder:italic placeholder:text-muted-foreground/60 focus-visible:ring-[2px]";
const messageClass = "text-[11px]";

export function Paso2CondicionesOfertaStep({
  form,
  readOnly = false,
}: Paso2CondicionesOfertaStepProps) {
  const section = ASPECTOS_GENERALES_STEP_SECTIONS[2];
  const monedaDiferente = form.watch("monedaDiferenteAuAu");
  const idiomaDiferente = form.watch("idiomaDiferenteAuAu");

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
          name="diasVigenciaGarantiaExtAuAu"
          render={() => (
            <FormItem className="max-w-3xl">
              <AspectosGeneralesFieldCopy fieldKey="diasVigenciaGarantiaExtAuAu" />
              <FormControl>
                <Controller
                  control={form.control}
                  name="diasVigenciaGarantiaExtAuAu"
                  render={({ field }) => (
                    <LocalizedDecimalInput
                      name={field.name}
                      ref={field.ref}
                      value={field.value}
                      onBlur={field.onBlur}
                      onValueChange={field.onChange}
                      disabled={readOnly}
                      fractionDigits={0}
                      outputMode="raw"
                      className={`${inputClass} max-w-[160px]`}
                    />
                  )}
                />
              </FormControl>
              <FormMessage className={messageClass} />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="monedaDiferenteAuAu"
          render={({ field }) => (
            <FormItem className="max-w-3xl">
              <AspectosGeneralesFieldCopy fieldKey="monedaDiferenteAuAu" />
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

        {monedaDiferente === true ? (
          <FormField
            control={form.control}
            name="nomMonedaExtranjeraAuAu"
            render={({ field }) => (
              <FormItem className="max-w-2xl rounded-lg border border-border border-l-4 border-l-navy bg-muted/40 p-4">
                <AspectosGeneralesFieldCopy fieldKey="nomMonedaExtranjeraAuAu" />
                <FormControl>
                  <Input {...field} disabled={readOnly} className={inputClass} />
                </FormControl>
                <FormMessage className={messageClass} />
              </FormItem>
            )}
          />
        ) : null}

        <FormField
          control={form.control}
          name="idiomaDiferenteAuAu"
          render={({ field }) => (
            <FormItem className="max-w-3xl">
              <AspectosGeneralesFieldCopy fieldKey="idiomaDiferenteAuAu" />
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

        {idiomaDiferente === true ? (
          <FormField
            control={form.control}
            name="nomIdiomaDiferenteAuAu"
            render={({ field }) => (
              <FormItem className="max-w-2xl rounded-lg border border-border border-l-4 border-l-navy bg-muted/40 p-4">
                <AspectosGeneralesFieldCopy fieldKey="nomIdiomaDiferenteAuAu" />
                <FormControl>
                  <Input {...field} disabled={readOnly} className={inputClass} />
                </FormControl>
                <FormMessage className={messageClass} />
              </FormItem>
            )}
          />
        ) : null}
      </div>
    </div>
  );
}

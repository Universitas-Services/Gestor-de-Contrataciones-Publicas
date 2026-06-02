"use client";

import type { UseFormReturn } from "react-hook-form";

import {
  FASE1_FIELD_COPY,
  FASE1_HORA_OPTIONS,
  FASE1_SECTION_DESCRIPTIONS,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Fase1SectionHeader } from "../Fase1SectionHeader";

interface Paso4LlamadoPublicoStepProps {
  form: UseFormReturn<Fase1FormInputValues>;
}

const compactLabelClass = "font-bold text-color-titulos text-[11px] leading-snug";
const compactDescriptionClass = "text-[10px] text-muted-foreground italic leading-relaxed";
const compactInputClass =
  "h-[32px] rounded-md border-slate-300 bg-white text-[11px] font-medium text-slate-600 shadow-none placeholder:text-[11px] placeholder:italic placeholder:font-medium placeholder:text-slate-500/60 focus-visible:ring-[2px]";
const compactChoiceBaseClass =
  "h-8 min-w-[68px] rounded-md border px-3 text-[11px] font-bold transition-colors";
const compactSectionTitleClass = "text-[17px] font-bold text-color-titulos";
const compactSectionDescriptionClass = "text-[12px] text-muted-foreground italic leading-relaxed";
const compactSelectTriggerClass =
  "h-[32px] w-full rounded-md border-slate-300 bg-white text-[11px] font-medium text-slate-600 shadow-none focus-visible:ring-[2px]";
const compactMessageClass = "text-[11px]";

export function Paso4LlamadoPublicoStep({ form }: Paso4LlamadoPublicoStepProps) {
  const pliegoGratuito = form.watch("pliegoGratuito");

  return (
    <div className="space-y-6">
      <Fase1SectionHeader
        title="Configuracion del llamado publico"
        description={FASE1_SECTION_DESCRIPTIONS[4]}
      />

      <div className="space-y-5">
        <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
          <div className="space-y-1">
            <h3 className={compactSectionTitleClass}>
              {FASE1_FIELD_COPY.objetivosEspecificos1.label}
            </h3>
            <p className={compactSectionDescriptionClass}>
              {FASE1_FIELD_COPY.objetivosEspecificos1.description}
            </p>
          </div>

          <FormField
            control={form.control}
            name="objetivosEspecificos1"
            render={({ field }) => (
              <FormItem className="max-w-2xl">
                <p className={compactLabelClass}>Objetivo 1</p>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={FASE1_FIELD_COPY.objetivosEspecificos1.placeholder}
                    className={compactInputClass}
                  />
                </FormControl>
                <FormMessage className={compactMessageClass} />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="objetivosEspecificos2"
            render={({ field }) => (
              <FormItem className="max-w-2xl">
                <p className={compactLabelClass}>Objetivo 2</p>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={FASE1_FIELD_COPY.objetivosEspecificos2.placeholder}
                    className={compactInputClass}
                  />
                </FormControl>
                <FormMessage className={compactMessageClass} />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="objetivosEspecificos3"
            render={({ field }) => (
              <FormItem className="max-w-2xl">
                <p className={compactLabelClass}>Objetivo 3</p>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={FASE1_FIELD_COPY.objetivosEspecificos3.placeholder}
                    className={compactInputClass}
                  />
                </FormControl>
                <FormMessage className={compactMessageClass} />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="direccionRetiroPliego"
          render={({ field }) => (
            <FormItem className="max-w-2xl">
              <p className={compactLabelClass}>{FASE1_FIELD_COPY.direccionRetiroPliego.label}</p>
              <FormDescription className={compactDescriptionClass}>
                {FASE1_FIELD_COPY.direccionRetiroPliego.description}
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
          name="horarioRetiroPliego"
          render={({ field }) => (
            <FormItem className="max-w-2xl">
              <p className={compactLabelClass}>{FASE1_FIELD_COPY.horarioRetiroPliego.label}</p>
              <FormDescription className={compactDescriptionClass}>
                {FASE1_FIELD_COPY.horarioRetiroPliego.description}
              </FormDescription>
              <p className="text-[10px] italic text-slate-400">
                {FASE1_FIELD_COPY.horarioRetiroPliego.placeholder}
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
          name="pliegoGratuito"
          render={({ field }) => (
            <FormItem className="max-w-3xl">
              <p className={compactLabelClass}>{FASE1_FIELD_COPY.pliegoGratuito.label}</p>
              <FormDescription className={compactDescriptionClass}>
                {FASE1_FIELD_COPY.pliegoGratuito.description}
              </FormDescription>
              <FormControl>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(
                      compactChoiceBaseClass,
                      field.value === false
                        ? "!border-navy !bg-navy !text-white hover:!bg-navy-hover hover:!text-white"
                        : "!border-slate-200 !bg-white !text-slate-500 hover:!border-slate-300 hover:!text-slate-700"
                    )}
                    onClick={() => field.onChange(false)}
                  >
                    Si
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(
                      compactChoiceBaseClass,
                      field.value === true
                        ? "!border-navy !bg-navy !text-white hover:!bg-navy-hover hover:!text-white"
                        : "!border-slate-200 !bg-white !text-slate-500 hover:!border-slate-300 hover:!text-slate-700"
                    )}
                    onClick={() => field.onChange(true)}
                  >
                    No
                  </Button>
                </div>
              </FormControl>
              <FormMessage className={compactMessageClass} />
            </FormItem>
          )}
        />

        {pliegoGratuito === false && (
          <div className="space-y-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="space-y-1">
              <h3 className={compactSectionTitleClass}>Datos para el pago del pliego</h3>
              <p className={compactSectionDescriptionClass}>
                Articulo 80.3.6 LCP; 3 Normas de Control Interno SUNAI.
              </p>
            </div>

            <FormField
              control={form.control}
              name="costoPliegoBs"
              render={({ field }) => (
                <FormItem className="max-w-xl">
                  <p className={compactLabelClass}>{FASE1_FIELD_COPY.costoPliegoBs.label}</p>
                  <FormDescription className={compactDescriptionClass}>
                    {FASE1_FIELD_COPY.costoPliegoBs.description}
                  </FormDescription>
                  <FormControl>
                    <Input
                      value={field.value ?? ""}
                      inputMode="decimal"
                      onChange={(event) => field.onChange(event.target.value)}
                      placeholder={FASE1_FIELD_COPY.costoPliegoBs.placeholder}
                      className={compactInputClass}
                    />
                  </FormControl>
                  <FormMessage className={compactMessageClass} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bancoPagoPliego"
              render={({ field }) => (
                <FormItem className="max-w-2xl">
                  <p className={compactLabelClass}>{FASE1_FIELD_COPY.bancoPagoPliego.label}</p>
                  <FormDescription className={compactDescriptionClass}>
                    {FASE1_FIELD_COPY.bancoPagoPliego.description}
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
              name="cuentaPagoPliego"
              render={({ field }) => (
                <FormItem className="max-w-2xl">
                  <p className={compactLabelClass}>{FASE1_FIELD_COPY.cuentaPagoPliego.label}</p>
                  <FormDescription className={compactDescriptionClass}>
                    {FASE1_FIELD_COPY.cuentaPagoPliego.description}
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
              name="titularPagoPliego"
              render={({ field }) => (
                <FormItem className="max-w-2xl">
                  <p className={compactLabelClass}>{FASE1_FIELD_COPY.titularPagoPliego.label}</p>
                  <FormDescription className={compactDescriptionClass}>
                    {FASE1_FIELD_COPY.titularPagoPliego.description}
                  </FormDescription>
                  <FormControl>
                    <Input {...field} className={compactInputClass} />
                  </FormControl>
                  <FormMessage className={compactMessageClass} />
                </FormItem>
              )}
            />
          </div>
        )}

        <FormField
          control={form.control}
          name="horaActoRecepAper"
          render={({ field }) => (
            <FormItem className="max-w-sm">
              <p className={compactLabelClass}>{FASE1_FIELD_COPY.horaActoRecepAper.label}</p>
              <FormDescription className={compactDescriptionClass}>
                {FASE1_FIELD_COPY.horaActoRecepAper.description}
              </FormDescription>
              <Select onValueChange={field.onChange} value={field.value || undefined}>
                <FormControl>
                  <SelectTrigger className={compactSelectTriggerClass}>
                    <SelectValue placeholder={FASE1_FIELD_COPY.horaActoRecepAper.placeholder} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {FASE1_HORA_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className={compactMessageClass} />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

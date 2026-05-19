"use client";

import type { UseFormReturn } from "react-hook-form";

import {
  FASE1_FIELD_COPY,
  FASE1_HORA_OPTIONS,
  FASE1_SECTION_DESCRIPTIONS,
} from "@/lib/constants/fase1";
import type { Fase1FormInputValues } from "@/lib/schemas/fase1Schema";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
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

export function Paso4LlamadoPublicoStep({ form }: Paso4LlamadoPublicoStepProps) {
  const pliegoGratuito = form.watch("pliegoGratuito");

  return (
    <div className="space-y-8">
      <Fase1SectionHeader
        title="Configuración del llamado Público"
        description={FASE1_SECTION_DESCRIPTIONS[4]}
      />

      <div className="space-y-7">
        <div className="space-y-5">
          <div className="space-y-1">
            <h3 className="text-base font-bold leading-tight text-heading-dark">
              {FASE1_FIELD_COPY.objetivosEspecificos1.label}
            </h3>
            <p className="text-sm italic text-slate-500">
              {FASE1_FIELD_COPY.objetivosEspecificos1.description}
            </p>
          </div>

          <FormField
            control={form.control}
            name="objetivosEspecificos1"
            render={({ field }) => (
              <FormItem className="max-w-2xl">
                <FormLabel className="text-base font-bold text-heading-dark">Objetivo 1</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={FASE1_FIELD_COPY.objetivosEspecificos1.placeholder}
                    className="h-11 rounded-md border-slate-300 bg-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="objetivosEspecificos2"
            render={({ field }) => (
              <FormItem className="max-w-2xl">
                <FormLabel className="text-base font-bold text-heading-dark">Objetivo 2</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={FASE1_FIELD_COPY.objetivosEspecificos2.placeholder}
                    className="h-11 rounded-md border-slate-300 bg-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="objetivosEspecificos3"
            render={({ field }) => (
              <FormItem className="max-w-2xl">
                <FormLabel className="text-base font-bold text-heading-dark">Objetivo 3</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={FASE1_FIELD_COPY.objetivosEspecificos3.placeholder}
                    className="h-11 rounded-md border-slate-300 bg-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="direccionRetiroPliego"
          render={({ field }) => (
            <FormItem className="max-w-2xl">
              <FormLabel className="text-base font-bold leading-tight text-heading-dark">
                {FASE1_FIELD_COPY.direccionRetiroPliego.label}
              </FormLabel>
              <FormDescription className="text-sm italic text-slate-500">
                {FASE1_FIELD_COPY.direccionRetiroPliego.description}
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
          name="horarioRetiroPliego"
          render={({ field }) => (
            <FormItem className="max-w-2xl">
              <FormLabel className="text-base font-bold leading-tight text-heading-dark">
                {FASE1_FIELD_COPY.horarioRetiroPliego.label}
              </FormLabel>
              <FormDescription className="text-sm italic text-slate-500">
                {FASE1_FIELD_COPY.horarioRetiroPliego.description}
              </FormDescription>
              <FormControl>
                <Input
                  {...field}
                  placeholder={FASE1_FIELD_COPY.horarioRetiroPliego.placeholder}
                  className="h-11 rounded-md border-slate-300 bg-white"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="pliegoGratuito"
          render={({ field }) => (
            <FormItem className="max-w-3xl">
              <FormLabel className="text-base font-bold leading-tight text-heading-dark">
                {FASE1_FIELD_COPY.pliegoGratuito.label}
              </FormLabel>
              <FormDescription className="text-sm italic text-slate-500">
                {FASE1_FIELD_COPY.pliegoGratuito.description}
              </FormDescription>
              <FormControl>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant={field.value === false ? "default" : "outline"}
                    className={field.value === false ? "bg-[#83bf3a] hover:bg-[#74aa32]" : ""}
                    onClick={() => field.onChange(false)}
                  >
                    Sí
                  </Button>
                  <Button
                    type="button"
                    variant={field.value === true ? "default" : "outline"}
                    className={field.value === true ? "bg-slate-500 hover:bg-slate-600" : ""}
                    onClick={() => field.onChange(true)}
                  >
                    No
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {pliegoGratuito === false && (
          <div className="space-y-7 rounded-xl border border-slate-200 bg-slate-50 p-5">
            <div className="space-y-1 pl-1">
              <h3 className="text-lg font-bold text-[#215ea8]">
                Indique los datos para el pago del pliego.
              </h3>
              <p className="text-sm italic text-slate-500">
                Artículo 80.3.6 LCP; 3 NORMAS DE CONTROL INTERNO SUNAI.
              </p>
            </div>

            <FormField
              control={form.control}
              name="costoPliegoBs"
              render={({ field }) => (
                <FormItem className="max-w-xl">
                  <FormLabel className="text-base font-bold text-heading-dark">
                    {FASE1_FIELD_COPY.costoPliegoBs.label}
                  </FormLabel>
                  <FormDescription className="text-sm italic text-slate-500">
                    {FASE1_FIELD_COPY.costoPliegoBs.description}
                  </FormDescription>
                  <FormControl>
                    <Input
                      value={field.value ?? ""}
                      inputMode="decimal"
                      onChange={(event) => field.onChange(event.target.value)}
                      placeholder={FASE1_FIELD_COPY.costoPliegoBs.placeholder}
                      className="h-11 rounded-md border-slate-300 bg-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bancoPagoPliego"
              render={({ field }) => (
                <FormItem className="max-w-2xl">
                  <FormLabel className="text-base font-bold text-heading-dark">
                    {FASE1_FIELD_COPY.bancoPagoPliego.label}
                  </FormLabel>
                  <FormDescription className="text-sm italic text-slate-500">
                    {FASE1_FIELD_COPY.bancoPagoPliego.description}
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
              name="cuentaPagoPliego"
              render={({ field }) => (
                <FormItem className="max-w-2xl">
                  <FormLabel className="text-base font-bold text-heading-dark">
                    {FASE1_FIELD_COPY.cuentaPagoPliego.label}
                  </FormLabel>
                  <FormDescription className="text-sm italic text-slate-500">
                    {FASE1_FIELD_COPY.cuentaPagoPliego.description}
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
              name="titularPagoPliego"
              render={({ field }) => (
                <FormItem className="max-w-2xl">
                  <FormLabel className="text-base font-bold text-heading-dark">
                    {FASE1_FIELD_COPY.titularPagoPliego.label}
                  </FormLabel>
                  <FormDescription className="text-sm italic text-slate-500">
                    {FASE1_FIELD_COPY.titularPagoPliego.description}
                  </FormDescription>
                  <FormControl>
                    <Input {...field} className="h-11 rounded-md border-slate-300 bg-white" />
                  </FormControl>
                  <FormMessage />
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
              <FormLabel className="text-base font-bold leading-tight text-heading-dark">
                {FASE1_FIELD_COPY.horaActoRecepAper.label}
              </FormLabel>
              <FormDescription className="text-sm italic text-slate-500">
                {FASE1_FIELD_COPY.horaActoRecepAper.description}
              </FormDescription>
              <Select onValueChange={field.onChange} value={field.value || undefined}>
                <FormControl>
                  <SelectTrigger className="h-11 w-full rounded-md border-slate-300 bg-white">
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
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

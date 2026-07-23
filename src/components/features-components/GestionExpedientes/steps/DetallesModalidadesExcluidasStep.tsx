"use client";

import React, { useMemo } from "react";
import { Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CAUSALES_ME_ART4,
  CAUSALES_ME_ART5,
  getCausalMeByValue,
  type CausalModalidadExcluida,
} from "@/lib/modalidades/causalesModalidadesExcluidas";
import {
  detallesModalidadesExcluidasSchema,
  type DetallesModalidadesExcluidasFormValues,
} from "@/lib/schemas/gestionExpedienteSchema";
import { cn } from "@/lib/utils";

export interface DetallesModalidadesExcluidasStepProps {
  initialValues?: DetallesModalidadesExcluidasFormValues | null;
  onBack: () => void;
  onNext: (data: DetallesModalidadesExcluidasFormValues) => void;
  readOnly?: boolean;
}

function CausalCardGrid({
  causales,
  selected,
  onSelect,
  readOnly,
}: {
  causales: CausalModalidadExcluida[];
  selected?: string;
  onSelect: (value: string) => void;
  readOnly: boolean;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {causales.map((causal) => {
        const isSelected = selected === causal.value;
        return (
          <button
            key={causal.value}
            type="button"
            disabled={readOnly}
            onClick={() => onSelect(causal.value)}
            className={cn(
              "relative text-left rounded-lg border p-4 transition-colors min-w-0",
              isSelected
                ? "border-navy bg-navy/5 ring-1 ring-navy/30"
                : "border-slate-200 bg-white hover:border-navy/40 hover:bg-slate-50",
              readOnly && "opacity-60 cursor-not-allowed"
            )}
          >
            {isSelected && (
              <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-navy text-white">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
            )}
            <p className="font-semibold text-heading-dark font-inter text-sm pr-7 leading-snug">
              {causal.titulo}
            </p>
          </button>
        );
      })}
    </div>
  );
}

export function DetallesModalidadesExcluidasStep({
  initialValues = null,
  onBack,
  onNext,
  readOnly = false,
}: DetallesModalidadesExcluidasStepProps) {
  const form = useForm<DetallesModalidadesExcluidasFormValues>({
    resolver: zodResolver(detallesModalidadesExcluidasSchema),
    defaultValues: {
      causalProcedenciaMe: initialValues?.causalProcedenciaMe,
      descObjetoContratacionMe: initialValues?.descObjetoContratacionMe ?? "",
      codNomenclaturaProcesoMe: initialValues?.codNomenclaturaProcesoMe ?? "",
    },
  });

  const causalValue = form.watch("causalProcedenciaMe");
  const descObjeto = form.watch("descObjetoContratacionMe") ?? "";
  const codNomenclatura = form.watch("codNomenclaturaProcesoMe") ?? "";

  const causalSeleccionada = useMemo(
    () => (causalValue ? getCausalMeByValue(causalValue) : undefined),
    [causalValue]
  );

  const defaultTab = causalSeleccionada?.articulo === 5 ? "art5" : "art4";

  const handleSubmit = async () => {
    if (readOnly) return;
    const valid = await form.trigger();
    if (valid) onNext(form.getValues());
  };

  return (
    <Form {...form}>
      <form
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
            e.preventDefault();
          }
        }}
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="causalProcedenciaMe"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-heading-dark font-bold font-inter text-base">
                Seleccione la causal legal de exclusión que justifica el procedimiento.
              </FormLabel>
              <p className="text-slate-500 italic text-sm mt-0.5 mb-3 font-inter">
                Artículos 4 y 5 del Decreto con Rango, Valor y Fuerza de Ley de Contrataciones
                Públicas.
              </p>

              <Tabs defaultValue={defaultTab} className="w-full gap-4">
                <TabsList
                  variant="line"
                  className="w-full grid grid-cols-2 h-auto p-0 border-b border-slate-200"
                >
                  <TabsTrigger
                    value="art4"
                    className="rounded-none py-2.5 text-xs sm:text-sm data-[state=active]:text-navy"
                  >
                    Exclusiones de la Ley (Art. 4)
                  </TabsTrigger>
                  <TabsTrigger
                    value="art5"
                    className="rounded-none py-2.5 text-xs sm:text-sm data-[state=active]:text-navy"
                  >
                    Exclusiones de la Modalidad (Art. 5)
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="art4" className="mt-4">
                  <CausalCardGrid
                    causales={CAUSALES_ME_ART4}
                    selected={field.value}
                    onSelect={field.onChange}
                    readOnly={readOnly}
                  />
                </TabsContent>

                <TabsContent value="art5" className="mt-4">
                  <CausalCardGrid
                    causales={CAUSALES_ME_ART5}
                    selected={field.value}
                    onSelect={field.onChange}
                    readOnly={readOnly}
                  />
                </TabsContent>
              </Tabs>

              {causalSeleccionada && (
                <div className="mt-4 rounded-lg border border-navy/20 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-navy mb-1.5 font-inter">
                    Texto legal a invocar (Acto motivado) — Art. {causalSeleccionada.articulo}
                  </p>
                  <p className="text-sm text-heading-dark font-inter leading-relaxed">
                    {causalSeleccionada.textoLegal}
                  </p>
                </div>
              )}

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descObjetoContratacionMe"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-heading-dark font-bold font-inter text-base">
                Describa el objeto del procedimiento de contratación.
              </FormLabel>
              <p className="text-slate-500 italic text-sm mt-0.5 mb-2 font-inter">
                Artículo 107.1 RLCP; 38 (1 al 5 primer párrafo), 91.9 LOCGR; 23 NORMAS DE CONTROL
                INTERNO SUNAI.
              </p>
              <FormControl>
                <div className="relative w-full min-w-0 max-w-full">
                  <Textarea
                    {...field}
                    disabled={readOnly}
                    maxLength={255}
                    rows={4}
                    className="resize-none border-slate-300 bg-white pr-16 pb-8 break-all"
                    placeholder="Describa el objeto del procedimiento..."
                  />
                  <span className="absolute bottom-2 right-3 text-xs text-slate-400 font-inter">
                    {descObjeto.length} / 255
                  </span>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="codNomenclaturaProcesoMe"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-heading-dark font-bold font-inter text-base">
                Indique el número o nomenclatura del procedimiento de contratación.
              </FormLabel>
              <p className="text-slate-500 italic text-sm mt-0.5 mb-2 font-inter">
                Artículos 107.1 RLCP; 23 NORMAS DE CONTROL INTERNO SUNAI.
              </p>
              <FormControl>
                <div className="relative w-full min-w-0 max-w-full md:w-2/3">
                  <Input
                    {...field}
                    disabled={readOnly}
                    maxLength={50}
                    className="h-11 min-w-0 max-w-full border-slate-300 bg-white pr-14"
                    placeholder="Ej: PROC-2026-001"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-inter">
                    {codNomenclatura.length} / 50
                  </span>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between pt-4 border-t border-slate-200">
          <Button type="button" variant="outline" onClick={onBack} className="h-11 px-6">
            Anterior
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={readOnly}
            className="bg-navy hover:bg-navy-hover text-white font-semibold px-8 h-11 rounded-md cursor-pointer"
          >
            Siguiente &gt;
          </Button>
        </div>
      </form>
    </Form>
  );
}

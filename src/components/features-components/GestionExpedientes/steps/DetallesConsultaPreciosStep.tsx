"use client";

import React from "react";
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
import { FormDropdownSelect } from "@/components/features-components/GestionExpedientes/FormDropdownSelect";
import { CAUSALES_CONSULTA_PRECIOS } from "@/lib/modalidades/causalesConsultaPrecios";
import {
  detallesConsultaPreciosSchema,
  type DetallesConsultaPreciosFormValues,
} from "@/lib/schemas/gestionExpedienteSchema";

export interface DetallesConsultaPreciosStepProps {
  initialValues?: DetallesConsultaPreciosFormValues | null;
  onBack: () => void;
  onNext: (data: DetallesConsultaPreciosFormValues) => void;
  readOnly?: boolean;
}

export function DetallesConsultaPreciosStep({
  initialValues = null,
  onBack,
  onNext,
  readOnly = false,
}: DetallesConsultaPreciosStepProps) {
  const form = useForm<DetallesConsultaPreciosFormValues>({
    resolver: zodResolver(detallesConsultaPreciosSchema),
    defaultValues: {
      causalProcedenciaCp: initialValues?.causalProcedenciaCp,
      descObjetoContratacionCp: initialValues?.descObjetoContratacionCp ?? "",
      codNomenclaturaProcesoCp: initialValues?.codNomenclaturaProcesoCp ?? "",
    },
  });

  const descObjeto = form.watch("descObjetoContratacionCp") ?? "";
  const codNomenclatura = form.watch("codNomenclaturaProcesoCp") ?? "";

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
          name="causalProcedenciaCp"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-heading-dark font-bold font-inter text-base">
                Seleccione la causal de procedencia para la modalidad de Consulta de Precios
              </FormLabel>
              <p className="text-slate-500 italic text-sm mt-0.5 mb-2 font-inter">
                Artículo 96 LCP.
              </p>
              <FormControl>
                <FormDropdownSelect
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={readOnly}
                  className="md:w-2/3"
                  placeholder="Seleccione una causal"
                  options={CAUSALES_CONSULTA_PRECIOS.map((opt) => ({
                    value: opt.value,
                    label: opt.label,
                  }))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descObjetoContratacionCp"
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
                    className="resize-none border-slate-300 bg-white pr-16 pb-8"
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
          name="codNomenclaturaProcesoCp"
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

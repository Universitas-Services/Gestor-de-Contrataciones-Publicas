"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Scale, ShieldCheck } from "lucide-react";

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
import {
  CAUSALES_CONTRATACION_DIRECTA,
  getCausalByNumeral,
} from "@/lib/modalidades/causalesContratacionDirecta";
import {
  detallesContratacionDirectaSchema,
  type DetallesContratacionDirectaFormValues,
} from "@/lib/schemas/gestionExpedienteSchema";
import { cn } from "@/lib/utils";

export interface DetallesContratacionDirectaStepProps {
  initialValues?: DetallesContratacionDirectaFormValues | null;
  onBack: () => void;
  onNext: (data: DetallesContratacionDirectaFormValues) => void;
  readOnly?: boolean;
}

export function DetallesContratacionDirectaStep({
  initialValues = null,
  onBack,
  onNext,
  readOnly = false,
}: DetallesContratacionDirectaStepProps) {
  const form = useForm<DetallesContratacionDirectaFormValues>({
    resolver: zodResolver(detallesContratacionDirectaSchema),
    defaultValues: {
      numeralCausalProcedenciaCd: initialValues?.numeralCausalProcedenciaCd,
      causalProcedenciaCd: initialValues?.causalProcedenciaCd ?? "",
      descObjetoContratacionCd: initialValues?.descObjetoContratacionCd ?? "",
      codNomenclaturaProcesoCd: initialValues?.codNomenclaturaProcesoCd ?? "",
    },
  });

  const selectedNumeral = form.watch("numeralCausalProcedenciaCd");
  const selectedCausal = selectedNumeral ? getCausalByNumeral(selectedNumeral) : undefined;
  const descObjeto = form.watch("descObjetoContratacionCd") ?? "";
  const codNomenclatura = form.watch("codNomenclaturaProcesoCd") ?? "";

  const handleSelectCausal = (numeral: string) => {
    if (readOnly) return;
    const causal = getCausalByNumeral(numeral);
    if (!causal) return;
    form.setValue(
      "numeralCausalProcedenciaCd",
      causal.numeral as DetallesContratacionDirectaFormValues["numeralCausalProcedenciaCd"],
      { shouldValidate: true }
    );
    form.setValue("causalProcedenciaCd", causal.textoLegal, { shouldValidate: true });
  };

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
        <div>
          <p className="text-heading-dark font-bold font-inter text-base">
            Seleccione la causal de procedencia para la modalidad de Contratación Directa:
          </p>
          <p className="text-slate-500 italic text-sm mt-0.5 font-inter">Artículo 101 LCP.</p>
        </div>

        <FormField
          control={form.control}
          name="numeralCausalProcedenciaCd"
          render={() => (
            <FormItem>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {CAUSALES_CONTRATACION_DIRECTA.map((causal) => {
                  const isSelected = selectedNumeral === causal.numeral;
                  return (
                    <button
                      key={causal.numeral}
                      type="button"
                      disabled={readOnly}
                      onClick={() => handleSelectCausal(causal.numeral)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-2 rounded-xl border px-3 py-4 min-h-[110px] text-center transition-colors",
                        "bg-white hover:border-navy/40 hover:bg-navy/5",
                        isSelected
                          ? "border-navy bg-navy/15 ring-2 ring-navy/30"
                          : "border-slate-300",
                        readOnly && "opacity-60 cursor-not-allowed"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                          isSelected ? "bg-navy/20 text-navy" : "bg-slate-100 text-slate-600"
                        )}
                      >
                        Num. {causal.numeral}
                      </span>
                      <span
                        className={cn(
                          "text-sm font-semibold font-inter leading-snug",
                          isSelected ? "text-navy" : "text-heading-dark"
                        )}
                      >
                        {causal.tituloCorto}
                      </span>
                    </button>
                  );
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedCausal && (
          <div className="relative overflow-hidden rounded-xl border border-navy/40 bg-navy/10 p-5 animate-in fade-in duration-200">
            <Scale
              className="pointer-events-none absolute right-4 top-4 h-16 w-16 text-navy/20"
              aria-hidden
            />
            <div className="relative flex items-center gap-2 mb-3">
              <ShieldCheck className="h-5 w-5 text-navy shrink-0" />
              <h4 className="text-navy font-bold text-sm uppercase tracking-wide font-inter">
                Texto legal a invocar (Acto motivado)
              </h4>
            </div>
            <p className="relative text-sm text-navy/90 font-inter leading-relaxed">
              <span className="font-bold text-navy">Numeral {selectedCausal.numeral}:</span>{" "}
              <span className="italic">&quot;{selectedCausal.textoLegal}&quot;</span>
            </p>
            <div className="relative mt-4 pt-3 border-t border-navy/20">
              <p className="text-navy/70 italic text-xs font-inter">
                Al hacer clic en &quot;Siguiente&quot;, este será el fundamento legal guardado en el
                expediente.
              </p>
            </div>
          </div>
        )}

        <FormField
          control={form.control}
          name="descObjetoContratacionCd"
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
                    maxLength={500}
                    rows={4}
                    className="resize-none border-slate-300 bg-white pr-16 pb-8"
                    placeholder="Describa el objeto del procedimiento..."
                  />
                  <span className="absolute bottom-2 right-3 text-xs text-slate-400 font-inter">
                    {descObjeto.length} / 500
                  </span>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="codNomenclaturaProcesoCd"
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

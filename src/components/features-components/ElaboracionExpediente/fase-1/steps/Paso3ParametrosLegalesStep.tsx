"use client";

import { useState, useEffect } from "react";
import { Check, Trash2 } from "lucide-react";
import { Controller, type UseFormReturn } from "react-hook-form";

import {
  FASE1_FIELD_COPY,
  FASE1_SECTION_DESCRIPTIONS,
  getDatosActoAutorizacionInicioPlaceholder,
  isFase1GestionFlow,
} from "@/lib/constants/fase1";
import type { Fase1FormInputValues } from "@/lib/schemas/fase1Schema";
import { LocalizedDecimalInput } from "@/components/localized-decimal-input";
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
import { NormativasLegalesModal } from "../NormativasLegalesModal";

interface Paso3ParametrosLegalesStepProps {
  form: UseFormReturn<Fase1FormInputValues>;
  basePath?: string;
}

const compactLabelClass = "font-bold text-color-titulos text-[11px] leading-snug";
const compactDescriptionClass = "text-[10px] text-muted-foreground italic leading-relaxed";
const compactInputClass =
  "h-[32px] rounded-md border-slate-300 bg-white text-[11px] font-medium text-slate-600 shadow-none placeholder:text-[11px] placeholder:italic placeholder:font-medium placeholder:text-slate-500/60 focus-visible:ring-[2px]";
const compactMessageClass = "text-[11px]";

function asNormativaList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }
  return [];
}

export function Paso3ParametrosLegalesStep({
  form,
  basePath = "/elaboracion-expediente",
}: Paso3ParametrosLegalesStepProps) {
  const isGestionFlow = isFase1GestionFlow(basePath);
  const datosActoPlaceholder = getDatosActoAutorizacionInicioPlaceholder(basePath);
  const [normativasModalOpen, setNormativasModalOpen] = useState(false);
  const [draftNormativa, setDraftNormativa] = useState("");

  const rawNormativaLegal = form.watch("normativaLegal");
  const normativas = asNormativaList(rawNormativaLegal);

  useEffect(() => {
    if (!Array.isArray(rawNormativaLegal)) {
      form.setValue("normativaLegal", asNormativaList(rawNormativaLegal), {
        shouldValidate: false,
      });
    }
  }, [form, rawNormativaLegal]);

  const handleAddNormativa = () => {
    const trimmed = draftNormativa.trim();
    if (!trimmed) return;

    const current = asNormativaList(form.getValues("normativaLegal"));
    if (current.some((item) => item.toLowerCase() === trimmed.toLowerCase())) {
      setDraftNormativa("");
      return;
    }

    form.setValue("normativaLegal", [...current, trimmed], {
      shouldDirty: true,
      shouldValidate: true,
    });
    setDraftNormativa("");
  };

  const handleRemoveNormativa = (index: number) => {
    const current = asNormativaList(form.getValues("normativaLegal"));
    form.setValue(
      "normativaLegal",
      current.filter((_, i) => i !== index),
      { shouldDirty: true, shouldValidate: true }
    );
  };

  const verifyLinkText =
    FASE1_FIELD_COPY.normativaLegal.verifyLink ??
    "Verifica las normativas aplicables al procedimiento ya agregadas aquí";

  return (
    <div className="space-y-6">
      <Fase1SectionHeader
        title="Parametros legales del pliego"
        description={FASE1_SECTION_DESCRIPTIONS[3]}
      />

      <div className="space-y-5">
        {isGestionFlow ? (
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
                <p className="text-[10px] italic text-slate-400">{datosActoPlaceholder}</p>
                <FormControl>
                  <Input {...field} className={compactInputClass} />
                </FormControl>
                <FormMessage className={compactMessageClass} />
              </FormItem>
            )}
          />
        ) : null}

        <FormField
          control={form.control}
          name="diasValidezOferta"
          render={() => (
            <FormItem className="max-w-sm">
              <p className={compactLabelClass}>{FASE1_FIELD_COPY.diasValidezOferta.label}</p>
              <FormDescription className={compactDescriptionClass}>
                {FASE1_FIELD_COPY.diasValidezOferta.description}
              </FormDescription>
              <p className="text-[10px] italic text-slate-400">
                {FASE1_FIELD_COPY.diasValidezOferta.placeholder}
              </p>
              <FormControl>
                <Controller
                  control={form.control}
                  name="diasValidezOferta"
                  render={({ field: controlledField }) => (
                    <LocalizedDecimalInput
                      name={controlledField.name}
                      ref={controlledField.ref}
                      value={controlledField.value}
                      onBlur={controlledField.onBlur}
                      onValueChange={controlledField.onChange}
                      fractionDigits={0}
                      outputMode="raw"
                      className={compactInputClass}
                    />
                  )}
                />
              </FormControl>
              <FormMessage className={compactMessageClass} />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="autoridadAclaratorias"
          render={({ field }) => (
            <FormItem className="max-w-3xl">
              <p className={compactLabelClass}>{FASE1_FIELD_COPY.autoridadAclaratorias.label}</p>
              <FormDescription className={compactDescriptionClass}>
                {FASE1_FIELD_COPY.autoridadAclaratorias.description}
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
          name="normativaLegal"
          render={() => (
            <FormItem className="max-w-3xl">
              <p className={compactLabelClass}>{FASE1_FIELD_COPY.normativaLegal.label}</p>
              <FormDescription className={compactDescriptionClass}>
                {FASE1_FIELD_COPY.normativaLegal.description}
              </FormDescription>

              <button
                type="button"
                onClick={() => setNormativasModalOpen(true)}
                className="text-left text-[12px] font-semibold text-navy underline underline-offset-2 hover:text-navy-hover"
              >
                {verifyLinkText}
              </button>

              <p className="text-[10px] italic text-slate-400">
                {FASE1_FIELD_COPY.normativaLegal.placeholder}
              </p>

              <div className="flex items-start gap-2">
                <Input
                  value={draftNormativa}
                  onChange={(event) => setDraftNormativa(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleAddNormativa();
                    }
                  }}
                  className={`${compactInputClass} flex-1`}
                />
                <Button
                  type="button"
                  size="icon"
                  onClick={handleAddNormativa}
                  disabled={!draftNormativa.trim()}
                  className="h-8 w-8 shrink-0 bg-navy text-white hover:bg-navy-hover disabled:opacity-50"
                  aria-label="Agregar normativa"
                >
                  <Check className="h-4 w-4" />
                </Button>
              </div>

              {normativas.length > 0 ? (
                <ul className="space-y-2 rounded-md border border-slate-200 bg-slate-50/60 p-3">
                  {normativas.map((norma, index) => (
                    <li
                      key={`${index}-${norma.slice(0, 24)}`}
                      className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-700"
                    >
                      <span className="mt-0.5 font-semibold text-slate-500">{index + 1}.</span>
                      <span className="min-w-0 flex-1">{norma}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveNormativa(index)}
                        className="mt-0.5 shrink-0 rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                        aria-label={`Eliminar normativa ${index + 1}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}

              <FormMessage className={compactMessageClass} />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="diasVigenciaGarantiaExtension"
          render={() => (
            <FormItem className="max-w-sm">
              <p className={compactLabelClass}>
                {FASE1_FIELD_COPY.diasVigenciaGarantiaExtension.label}
              </p>
              <FormDescription className={compactDescriptionClass}>
                {FASE1_FIELD_COPY.diasVigenciaGarantiaExtension.description}
              </FormDescription>
              <p className="text-[10px] italic text-slate-400">
                {FASE1_FIELD_COPY.diasVigenciaGarantiaExtension.placeholder}
              </p>
              <FormControl>
                <Controller
                  control={form.control}
                  name="diasVigenciaGarantiaExtension"
                  render={({ field: controlledField }) => (
                    <LocalizedDecimalInput
                      name={controlledField.name}
                      ref={controlledField.ref}
                      value={controlledField.value}
                      onBlur={controlledField.onBlur}
                      onValueChange={controlledField.onChange}
                      fractionDigits={0}
                      outputMode="raw"
                      className={compactInputClass}
                    />
                  )}
                />
              </FormControl>
              <FormMessage className={compactMessageClass} />
            </FormItem>
          )}
        />
      </div>

      <NormativasLegalesModal open={normativasModalOpen} onOpenChange={setNormativasModalOpen} />
    </div>
  );
}

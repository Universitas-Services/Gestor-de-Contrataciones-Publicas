"use client";

import { useEffect, useState } from "react";
import { Check, Trash2 } from "lucide-react";
import { Controller, type UseFormReturn } from "react-hook-form";

import {
  ASPECTOS_GENERALES_FIELD_COPY,
  ASPECTOS_GENERALES_STEP_SECTIONS,
} from "@/lib/constants/aspectosGenerales";
import type { AspectosGeneralesFormInputValues } from "@/lib/schemas/aspectosGeneralesSchema";
import { NormativasLegalesModal } from "@/components/features-components/ElaboracionExpediente/fase-1/NormativasLegalesModal";
import { LocalizedDecimalInput } from "@/components/localized-decimal-input";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AspectosGeneralesFieldCopy } from "../AspectosGeneralesFieldCopy";

interface Paso1RegimenLegalStepProps {
  form: UseFormReturn<AspectosGeneralesFormInputValues>;
  readOnly?: boolean;
}

const inputClass =
  "h-10 rounded-md border-border bg-card text-[13px] font-medium text-foreground shadow-none placeholder:italic placeholder:text-muted-foreground/60 focus-visible:ring-[2px]";
const messageClass = "text-[11px]";

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

export function Paso1RegimenLegalStep({ form, readOnly = false }: Paso1RegimenLegalStepProps) {
  const section = ASPECTOS_GENERALES_STEP_SECTIONS[1];
  const [normativasModalOpen, setNormativasModalOpen] = useState(false);
  const [draftNormativa, setDraftNormativa] = useState("");

  const rawNormativaLegal = form.watch("normativaLegalAuAu");
  const normativas = asNormativaList(rawNormativaLegal);

  useEffect(() => {
    if (!Array.isArray(rawNormativaLegal)) {
      form.setValue("normativaLegalAuAu", asNormativaList(rawNormativaLegal), {
        shouldValidate: false,
      });
    }
  }, [form, rawNormativaLegal]);

  const handleAddNormativa = () => {
    if (readOnly) return;
    const trimmed = draftNormativa.trim();
    if (!trimmed) return;

    const current = asNormativaList(form.getValues("normativaLegalAuAu"));
    if (current.some((item) => item.toLowerCase() === trimmed.toLowerCase())) {
      setDraftNormativa("");
      return;
    }

    form.setValue("normativaLegalAuAu", [...current, trimmed], {
      shouldDirty: true,
      shouldValidate: true,
      shouldTouch: true,
    });
    setDraftNormativa("");
  };

  const handleRemoveNormativa = (index: number) => {
    if (readOnly) return;
    const current = asNormativaList(form.getValues("normativaLegalAuAu"));
    form.setValue(
      "normativaLegalAuAu",
      current.filter((_, i) => i !== index),
      { shouldDirty: true, shouldValidate: true, shouldTouch: true }
    );
  };

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
          name="datosActoAutorizacionInicioAuAu"
          render={({ field }) => (
            <FormItem className="max-w-2xl">
              <AspectosGeneralesFieldCopy fieldKey="datosActoAutorizacionInicioAuAu" />
              <p className="text-[11px] italic text-muted-foreground/70">
                {ASPECTOS_GENERALES_FIELD_COPY.datosActoAutorizacionInicioAuAu.placeholder}
              </p>
              <FormControl>
                <Textarea
                  {...field}
                  disabled={readOnly}
                  rows={3}
                  className="min-h-[80px] rounded-md border-border bg-card text-[13px] font-medium shadow-none"
                />
              </FormControl>
              <FormMessage className={messageClass} />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="diasValidezOfertaAuAu"
          render={() => (
            <FormItem className="max-w-3xl">
              <AspectosGeneralesFieldCopy fieldKey="diasValidezOfertaAuAu" />
              <FormControl>
                <Controller
                  control={form.control}
                  name="diasValidezOfertaAuAu"
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
          name="autoridadAclaratoriasAuAu"
          render={({ field }) => (
            <FormItem className="max-w-3xl">
              <AspectosGeneralesFieldCopy fieldKey="autoridadAclaratoriasAuAu" />
              <FormControl>
                <Input {...field} disabled={readOnly} className={inputClass} />
              </FormControl>
              <FormMessage className={messageClass} />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="normativaLegalAuAu"
          render={() => (
            <FormItem className="max-w-3xl">
              <AspectosGeneralesFieldCopy fieldKey="normativaLegalAuAu" />

              <button
                type="button"
                onClick={() => setNormativasModalOpen(true)}
                className="text-left text-[12px] font-semibold text-navy underline underline-offset-2 hover:text-navy-hover"
              >
                {ASPECTOS_GENERALES_FIELD_COPY.normativaLegalAuAu.verifyLink}
              </button>

              <p className="text-[11px] italic text-muted-foreground/70">
                {ASPECTOS_GENERALES_FIELD_COPY.normativaLegalAuAu.placeholder}
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
                  disabled={readOnly}
                  className={`${inputClass} flex-1`}
                />
                <Button
                  type="button"
                  size="icon"
                  onClick={handleAddNormativa}
                  disabled={readOnly || !draftNormativa.trim()}
                  className="h-10 w-10 shrink-0 bg-navy text-white hover:bg-navy-hover disabled:opacity-50"
                  aria-label="Agregar normativa"
                >
                  <Check className="h-4 w-4" />
                </Button>
              </div>

              {normativas.length > 0 ? (
                <ul className="space-y-2 rounded-md border border-border bg-muted/40 p-3">
                  {normativas.map((norma, index) => (
                    <li
                      key={`${index}-${norma.slice(0, 24)}`}
                      className="flex items-start gap-2 text-[12px] leading-relaxed text-foreground"
                    >
                      <span className="mt-0.5 font-semibold text-muted-foreground">
                        {index + 1}.
                      </span>
                      <span className="min-w-0 flex-1">{norma}</span>
                      {!readOnly ? (
                        <button
                          type="button"
                          onClick={() => handleRemoveNormativa(index)}
                          className="mt-0.5 shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                          aria-label={`Eliminar normativa ${index + 1}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : null}

              <FormMessage className={messageClass} />
            </FormItem>
          )}
        />
      </div>

      <NormativasLegalesModal open={normativasModalOpen} onOpenChange={setNormativasModalOpen} />
    </div>
  );
}

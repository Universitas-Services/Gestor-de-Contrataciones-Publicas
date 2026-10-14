"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Trash2 } from "lucide-react";
import { Controller, type UseFormReturn } from "react-hook-form";
import { toast } from "sonner";

import {
  ASPECTOS_GENERALES_FIELD_COPY,
  ASPECTOS_GENERALES_STEP_SECTIONS,
} from "@/lib/constants/aspectosGenerales";
import type { AspectosGeneralesFormInputValues } from "@/lib/schemas/aspectosGeneralesSchema";
import { useDebounce } from "@/hooks/use-debounce";
import { normalizeNormativaLegalList } from "@/lib/utils/fase1MicromodulosMapper";
import { crearNormativaEnte, listarNormativaEnte } from "@/services/bibliotecaNormativaService";
import { getNormativaTexto, type NormativaEnte } from "@/types/bibliotecaLegal.types";
import { NormativasLegalesModal } from "@/components/features-components/ElaboracionExpediente/fase-1/NormativasLegalesModal";
import { LocalizedDecimalInput } from "@/components/localized-decimal-input";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AspectosGeneralesFieldCopy } from "../AspectosGeneralesFieldCopy";

type DraftSource = "empty" | "global" | "ente" | "free";

interface Paso1RegimenLegalStepProps {
  form: UseFormReturn<AspectosGeneralesFormInputValues>;
  readOnly?: boolean;
  enteId?: string;
}

const inputClass =
  "h-10 rounded-md border-border bg-card text-[13px] font-medium text-foreground shadow-none placeholder:italic placeholder:text-muted-foreground/60 focus-visible:ring-[2px]";
const messageClass = "text-[11px]";

export function Paso1RegimenLegalStep({
  form,
  readOnly = false,
  enteId,
}: Paso1RegimenLegalStepProps) {
  const section = ASPECTOS_GENERALES_STEP_SECTIONS[1];
  const [normativasModalOpen, setNormativasModalOpen] = useState(false);
  const [draftNormativa, setDraftNormativa] = useState("");
  const [draftSource, setDraftSource] = useState<DraftSource>("empty");
  const [draftOriginal, setDraftOriginal] = useState("");
  const [adding, setAdding] = useState(false);

  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<NormativaEnte[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const suggestBoxRef = useRef<HTMLDivElement>(null);

  const debouncedDraft = useDebounce(draftNormativa, 400);

  const rawNormativaLegal = form.watch("normativaLegalAuAu");
  const normativas = normalizeNormativaLegalList(rawNormativaLegal);

  useEffect(() => {
    const normalized = normalizeNormativaLegalList(rawNormativaLegal);
    const current = Array.isArray(rawNormativaLegal) ? rawNormativaLegal : null;
    const same =
      current !== null &&
      current.length === normalized.length &&
      current.every((item, index) => item === normalized[index]);

    if (!same) {
      form.setValue("normativaLegalAuAu", normalized, {
        shouldValidate: false,
      });
    }
  }, [form, rawNormativaLegal]);

  const resetDraft = () => {
    setDraftNormativa("");
    setDraftSource("empty");
    setDraftOriginal("");
    setSuggestions([]);
    setSuggestionsOpen(false);
  };

  const applyDraftFromSelection = (texto: string, source: "global" | "ente") => {
    setDraftNormativa(texto);
    setDraftOriginal(texto);
    setDraftSource(source);
    setSuggestionsOpen(false);
    setSuggestions([]);
  };

  const handleDraftChange = (value: string) => {
    setDraftNormativa(value);
    if (!value.trim()) {
      setDraftSource("empty");
      setDraftOriginal("");
      setSuggestions([]);
      setSuggestionsOpen(false);
      return;
    }
    if ((draftSource === "global" || draftSource === "ente") && value === draftOriginal) {
      return;
    }
    setDraftSource("free");
  };

  const loadEnteSuggestions = useCallback(async () => {
    if (!enteId || readOnly) {
      setSuggestions([]);
      return;
    }
    const q = debouncedDraft.trim();
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    // No buscar si el draft es una selección intacta
    if ((draftSource === "global" || draftSource === "ente") && debouncedDraft === draftOriginal) {
      setSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const res = await listarNormativaEnte(enteId, {
        page: 1,
        limit: 8,
        search: q,
      });
      setSuggestions(res.data ?? []);
      setSuggestionsOpen(true);
    } catch {
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  }, [enteId, readOnly, debouncedDraft, draftSource, draftOriginal]);

  useEffect(() => {
    void loadEnteSuggestions();
  }, [loadEnteSuggestions]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!suggestBoxRef.current?.contains(event.target as Node)) {
        setSuggestionsOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const shouldPostToEnte = (trimmed: string): boolean => {
    if (draftSource === "free") return true;
    if (draftSource === "global" || draftSource === "ente") {
      return trimmed !== draftOriginal.trim();
    }
    return false;
  };

  const handleAddNormativa = async () => {
    if (readOnly || adding) return;
    const trimmed = draftNormativa.trim();
    if (!trimmed) return;

    const current = normalizeNormativaLegalList(form.getValues("normativaLegalAuAu"));
    if (current.some((item) => item.toLowerCase() === trimmed.toLowerCase())) {
      resetDraft();
      return;
    }

    const needsPost = shouldPostToEnte(trimmed);
    if (needsPost) {
      if (!enteId) {
        toast.error("No hay un ente asociado para guardar la normativa en la biblioteca.");
        return;
      }
      setAdding(true);
      try {
        await crearNormativaEnte(enteId, { textoNormativaCompleto: trimmed });
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Error al guardar la normativa del ente"
        );
        setAdding(false);
        return;
      }
      setAdding(false);
    }

    form.setValue("normativaLegalAuAu", [...current, trimmed], {
      shouldDirty: true,
      shouldValidate: true,
      shouldTouch: true,
    });
    resetDraft();
  };

  const handleRemoveNormativa = (index: number) => {
    if (readOnly) return;
    const current = normalizeNormativaLegalList(form.getValues("normativaLegalAuAu"));
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

              <div className="relative" ref={suggestBoxRef}>
                <div className="flex items-start gap-2">
                  <Input
                    value={draftNormativa}
                    onChange={(event) => handleDraftChange(event.target.value)}
                    onFocus={() => {
                      if (suggestions.length > 0) setSuggestionsOpen(true);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") {
                        setSuggestionsOpen(false);
                        return;
                      }
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void handleAddNormativa();
                      }
                    }}
                    disabled={readOnly || adding}
                    className={`${inputClass} flex-1`}
                    autoComplete="off"
                  />
                  <Button
                    type="button"
                    size="icon"
                    onClick={() => void handleAddNormativa()}
                    disabled={readOnly || adding || !draftNormativa.trim()}
                    className="h-10 w-10 shrink-0 bg-navy text-white hover:bg-navy-hover disabled:opacity-50"
                    aria-label="Agregar normativa"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </div>

                {suggestionsOpen && !readOnly && enteId ? (
                  <div className="absolute z-20 mt-1 w-[calc(100%-2.75rem)] overflow-hidden rounded-md border border-border bg-card shadow-md">
                    {loadingSuggestions ? (
                      <p className="px-3 py-2 text-[12px] italic text-muted-foreground">
                        Buscando en biblioteca del ente…
                      </p>
                    ) : suggestions.length === 0 ? (
                      <p className="px-3 py-2 text-[12px] italic text-muted-foreground">
                        Sin coincidencias en normativas del ente.
                      </p>
                    ) : (
                      <ul className="max-h-48 overflow-y-auto py-1">
                        {suggestions.map((item) => {
                          const texto = getNormativaTexto(item);
                          return (
                            <li key={item.id}>
                              <button
                                type="button"
                                className="w-full px-3 py-2 text-left text-[12px] leading-relaxed text-foreground hover:bg-muted"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => applyDraftFromSelection(texto, "ente")}
                              >
                                {texto}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                ) : null}
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

      <NormativasLegalesModal
        open={normativasModalOpen}
        onOpenChange={setNormativasModalOpen}
        readOnly={readOnly}
        onSelect={(texto) => applyDraftFromSelection(texto, "global")}
      />
    </div>
  );
}

"use client";

import { useMemo } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { CriterioFinancieroCard } from "@/components/features-components/GestionExpedientes/evaluacion-oferente/calificacion-financiera/CriterioFinancieroCard";
import { FinancieraScoreHeader } from "@/components/features-components/GestionExpedientes/evaluacion-oferente/calificacion-financiera/FinancieraScoreHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CALIFICACION_FINANCIERA_EVAL_SUBTITLE,
  CALIFICACION_FINANCIERA_EVAL_TITLE,
  CALIFICACION_FINANCIERA_JUSTIFICACION_ARTICULOS,
  CALIFICACION_FINANCIERA_JUSTIF_CUMPLE,
  CALIFICACION_FINANCIERA_JUSTIF_NO_CUMPLE,
  computeFinancieraTotal,
} from "@/lib/constants/calificacionFinancieraEvaluacion";
import { createCalificacionFinancieraSubmitSchema } from "@/lib/schemas/calificacionFinancieraEvaluacionSchema";
import type {
  CalificacionFinancieraEvaluacionValues,
  PlantillaFinanciera,
} from "@/types/evaluacionOferente.types";

interface CalificacionFinancieraPanelProps {
  plantilla: PlantillaFinanciera;
  defaultValues: CalificacionFinancieraEvaluacionValues;
  readOnly?: boolean;
  saving?: boolean;
  onDraft: (values: CalificacionFinancieraEvaluacionValues) => void;
  onConfirm: (values: CalificacionFinancieraEvaluacionValues, cumple: boolean) => void;
}

export function CalificacionFinancieraPanel({
  plantilla,
  defaultValues,
  readOnly = false,
  saving = false,
  onDraft,
  onConfirm,
}: CalificacionFinancieraPanelProps) {
  const submitSchema = useMemo(
    () => createCalificacionFinancieraSubmitSchema(plantilla),
    [plantilla]
  );

  const form = useForm<CalificacionFinancieraEvaluacionValues>({
    resolver: zodResolver(submitSchema) as Resolver<CalificacionFinancieraEvaluacionValues>,
    defaultValues,
    mode: "onSubmit",
  });

  const watched = form.watch();
  const { total, allAnswered, cumple } = computeFinancieraTotal(plantilla, watched.criterios);
  const showJustificacion = allAnswered;
  const justifLabel =
    cumple === false
      ? CALIFICACION_FINANCIERA_JUSTIF_NO_CUMPLE
      : CALIFICACION_FINANCIERA_JUSTIF_CUMPLE;

  const handleDraft = () => {
    onDraft(form.getValues());
    toast.success("Progreso guardado");
  };

  const handleConfirm = form.handleSubmit(
    (values) => {
      const result = computeFinancieraTotal(plantilla, values.criterios);
      onConfirm(values, result.cumple === true);
    },
    () => {
      toast.error("Complete todos los criterios financieros y la justificación.");
    }
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50">
      <FinancieraScoreHeader
        titulo={CALIFICACION_FINANCIERA_EVAL_TITLE}
        subtitulo={CALIFICACION_FINANCIERA_EVAL_SUBTITLE}
        total={total}
        umbral={plantilla.puntuacionMinima}
        cumple={cumple}
      />

      <div className="min-h-0 flex-1 overflow-y-auto p-6 md:p-8">
        <div className="mx-auto max-w-4xl space-y-4 pb-8">
          {plantilla.criterios.map((criterio, index) => (
            <CriterioFinancieroCard
              key={criterio.id}
              index={index + 1}
              criterio={criterio}
              respuesta={watched.criterios[criterio.id]}
              error={Boolean(form.formState.errors.criterios?.[criterio.id]?.valor)}
              readOnly={readOnly}
              onChange={(valor) => {
                form.setValue(`criterios.${criterio.id}.valor`, valor, {
                  shouldDirty: true,
                  shouldValidate: false,
                });
                form.clearErrors(`criterios.${criterio.id}.valor`);
              }}
            />
          ))}

          {showJustificacion ? (
            <Card className="mt-2 overflow-hidden rounded-lg border-slate-200 bg-white shadow-sm">
              <CardContent className="space-y-3 p-5">
                <div>
                  <h4 className="text-sm font-bold text-color-titulos">
                    Justificación de la Calificación Financiera
                  </h4>
                  <p className="mt-0.5 text-[11px] italic text-muted-foreground">
                    {CALIFICACION_FINANCIERA_JUSTIFICACION_ARTICULOS}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-color-titulos">{justifLabel}</Label>
                  <Textarea
                    value={watched.justificacion}
                    disabled={readOnly}
                    rows={3}
                    placeholder="Redacte su justificación de los resultados financieros..."
                    onChange={(e) =>
                      form.setValue("justificacion", e.target.value, { shouldDirty: true })
                    }
                    className="resize-none"
                    aria-invalid={Boolean(form.formState.errors.justificacion)}
                  />
                  {form.formState.errors.justificacion ? (
                    <p className="text-[11px] font-medium text-destructive">
                      {form.formState.errors.justificacion.message}
                    </p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>

      <div className="z-20 flex shrink-0 items-center justify-between border-t border-slate-200 bg-white px-6 py-5 md:px-8">
        <Button
          type="button"
          variant="outline"
          disabled={saving || readOnly}
          onClick={handleDraft}
          className="h-11 rounded-md border-slate-200 px-8 font-semibold text-slate-500 hover:bg-slate-50"
        >
          Guardar borrador
        </Button>

        <Button
          type="button"
          disabled={readOnly || saving}
          onClick={() => void handleConfirm()}
          className="h-11 rounded-md bg-navy px-8 font-semibold text-white hover:bg-navy-hover disabled:opacity-50"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Guardando...
            </span>
          ) : (
            "Guardar calificación financiera y continuar"
          )}
        </Button>
      </div>
    </div>
  );
}

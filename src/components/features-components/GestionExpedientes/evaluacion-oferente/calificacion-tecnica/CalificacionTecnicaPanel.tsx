"use client";

import { useMemo } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { CriterioTecnicoEvalCard } from "@/components/features-components/GestionExpedientes/evaluacion-oferente/calificacion-tecnica/CriterioTecnicoEvalCard";
import { TecnicaScoreHeader } from "@/components/features-components/GestionExpedientes/evaluacion-oferente/calificacion-tecnica/TecnicaScoreHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CALIFICACION_TECNICA_EVAL_SUBTITLE,
  CALIFICACION_TECNICA_EVAL_TITLE,
  CALIFICACION_TECNICA_JUSTIFICACION_ARTICULOS,
  CALIFICACION_TECNICA_JUSTIF_CUMPLE,
  CALIFICACION_TECNICA_JUSTIF_NO_CUMPLE,
  computeTecnicaTotal,
} from "@/lib/constants/calificacionTecnicaEvaluacion";
import { createCalificacionTecnicaSubmitSchema } from "@/lib/schemas/calificacionTecnicaEvaluacionSchema";
import type {
  CalificacionTecnicaEvaluacionValues,
  PlantillaTecnica,
} from "@/types/evaluacionOferente.types";

interface CalificacionTecnicaPanelProps {
  plantilla: PlantillaTecnica;
  defaultValues: CalificacionTecnicaEvaluacionValues;
  readOnly?: boolean;
  saving?: boolean;
  onDraft: (values: CalificacionTecnicaEvaluacionValues) => void;
  onConfirm: (values: CalificacionTecnicaEvaluacionValues, cumple: boolean) => void;
}

export function CalificacionTecnicaPanel({
  plantilla,
  defaultValues,
  readOnly = false,
  saving = false,
  onDraft,
  onConfirm,
}: CalificacionTecnicaPanelProps) {
  const submitSchema = useMemo(() => createCalificacionTecnicaSubmitSchema(plantilla), [plantilla]);

  const form = useForm<CalificacionTecnicaEvaluacionValues>({
    resolver: zodResolver(submitSchema) as Resolver<CalificacionTecnicaEvaluacionValues>,
    defaultValues,
    mode: "onSubmit",
  });

  const watched = form.watch();
  const { total, allAnswered, cumple, hasOverMax } = computeTecnicaTotal(
    plantilla,
    watched.criterios
  );
  const showJustificacion = allAnswered && !hasOverMax;
  const justifLabel =
    cumple === false ? CALIFICACION_TECNICA_JUSTIF_NO_CUMPLE : CALIFICACION_TECNICA_JUSTIF_CUMPLE;

  const handleDraft = () => {
    onDraft(form.getValues());
    toast.success("Progreso guardado");
  };

  const handleConfirm = form.handleSubmit(
    (values) => {
      const result = computeTecnicaTotal(plantilla, values.criterios);
      onConfirm(values, result.cumple === true);
    },
    () => {
      toast.error("Complete todos los criterios técnicos y la justificación.");
    }
  );

  const canConfirm = !readOnly && !saving && !hasOverMax;

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50">
      <TecnicaScoreHeader
        titulo={CALIFICACION_TECNICA_EVAL_TITLE}
        subtitulo={CALIFICACION_TECNICA_EVAL_SUBTITLE}
        total={total}
        umbral={plantilla.puntuacionMinima}
        cumple={cumple}
      />

      <div className="min-h-0 flex-1 overflow-y-auto p-6 md:p-8">
        <div className="mx-auto max-w-4xl space-y-4 pb-8">
          {plantilla.criterios.map((criterio, index) => {
            const fieldErrors = form.formState.errors.criterios?.[criterio.id];
            return (
              <CriterioTecnicoEvalCard
                key={criterio.id}
                index={index + 1}
                criterio={criterio}
                respuesta={watched.criterios[criterio.id]}
                errors={{
                  rangoIdSeleccionado: Boolean(fieldErrors?.rangoIdSeleccionado),
                  puntuacionObtenida: Boolean(fieldErrors?.puntuacionObtenida),
                  valorObtenido: Boolean(fieldErrors?.valorObtenido),
                }}
                readOnly={readOnly}
                onChange={(next) => {
                  form.setValue(`criterios.${criterio.id}`, next, {
                    shouldDirty: true,
                    shouldValidate: false,
                  });
                  form.clearErrors(`criterios.${criterio.id}`);
                }}
              />
            );
          })}

          {showJustificacion ? (
            <Card className="mt-2 overflow-hidden rounded-lg border-slate-200 bg-white shadow-sm">
              <CardContent className="space-y-3 p-5">
                <div>
                  <h4 className="text-sm font-bold text-color-titulos">
                    Justificación de la Calificación Técnica
                  </h4>
                  <p className="mt-0.5 text-[11px] italic text-muted-foreground">
                    {CALIFICACION_TECNICA_JUSTIFICACION_ARTICULOS}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-color-titulos">{justifLabel}</Label>
                  <Textarea
                    value={watched.justificacion}
                    disabled={readOnly}
                    rows={3}
                    placeholder="Redacte su justificación..."
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
          disabled={!canConfirm}
          onClick={() => void handleConfirm()}
          className="h-11 rounded-md bg-navy px-8 font-semibold text-white hover:bg-navy-hover disabled:opacity-50"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Guardando...
            </span>
          ) : (
            "Guardar calificación técnica y continuar"
          )}
        </Button>
      </div>
    </div>
  );
}

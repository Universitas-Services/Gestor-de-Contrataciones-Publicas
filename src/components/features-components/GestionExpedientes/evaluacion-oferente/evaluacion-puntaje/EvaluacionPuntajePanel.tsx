"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { CriterioTecnicoEvalCard } from "@/components/features-components/GestionExpedientes/evaluacion-oferente/calificacion-tecnica/CriterioTecnicoEvalCard";
import { EvaluacionPuntajeScoreHeader } from "@/components/features-components/GestionExpedientes/evaluacion-oferente/evaluacion-puntaje/EvaluacionPuntajeScoreHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  EVALUACION_ECO_JUSTIF_CUMPLE,
  EVALUACION_ECO_JUSTIF_NO_CUMPLE,
  EVALUACION_PUNTAJE_JUSTIFICACION_ARTICULOS,
  EVALUACION_PUNTAJE_SUBTITLE,
  EVALUACION_PUNTAJE_TITLE,
  EVALUACION_TEC_JUSTIF_CUMPLE,
  EVALUACION_TEC_JUSTIF_NO_CUMPLE,
  computeMarcadorGlobal,
} from "@/lib/constants/evaluacionPuntajeEvaluacion";
import { createEvaluacionPuntajeSubmitSchema } from "@/lib/schemas/evaluacionPuntajeEvaluacionSchema";
import type {
  CriterioEvaluacionRespuesta,
  EvaluacionPuntajeEvaluacionValues,
  PlantillaEvaluacion,
} from "@/types/evaluacionOferente.types";

interface EvaluacionPuntajePanelProps {
  plantilla: PlantillaEvaluacion;
  defaultValues: EvaluacionPuntajeEvaluacionValues;
  readOnly?: boolean;
  saving?: boolean;
  onDraft: (values: EvaluacionPuntajeEvaluacionValues) => void;
  onConfirm: (
    values: EvaluacionPuntajeEvaluacionValues,
    resultado: { tecnicoCumple: boolean; economicoCumple: boolean; cumpleGlobal: boolean }
  ) => void;
}

const VALOR_HINT_TEC =
  "Transcriba textualmente el valor o la descripción física que el oferente presentó en su oferta técnica para este criterio.";
const VALOR_HINT_ECO =
  "Detalle el valor económico ofertado o la fórmula de proporcionalidad aplicada (folios / cálculo).";
const VALOR_PH_TEC = 'Ej: "Certificación ISO 9001 vigente" (folios 18 al 22)';
const VALOR_PH_ECO =
  'Ej: "Se aplicó fórmula de proporcionalidad inversa contra la oferta base de Bs. 350.000,00"';

export function EvaluacionPuntajePanel({
  plantilla,
  defaultValues,
  readOnly = false,
  saving = false,
  onDraft,
  onConfirm,
}: EvaluacionPuntajePanelProps) {
  const [ladoTab, setLadoTab] = useState<"tecnica" | "economica">("tecnica");
  const scrollRef = useRef<HTMLDivElement>(null);

  const submitSchema = useMemo(() => createEvaluacionPuntajeSubmitSchema(plantilla), [plantilla]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [ladoTab]);

  const form = useForm<EvaluacionPuntajeEvaluacionValues>({
    resolver: zodResolver(submitSchema) as Resolver<EvaluacionPuntajeEvaluacionValues>,
    defaultValues,
    mode: "onSubmit",
  });

  const watched = form.watch();
  const marcador = computeMarcadorGlobal(plantilla, watched);

  const showJustifTecnica = marcador.tecnica.allAnswered && !marcador.tecnica.hasOverMax;
  const showJustifEconomica = marcador.economica.allAnswered && !marcador.economica.hasOverMax;

  const handleDraft = () => {
    onDraft(form.getValues());
    toast.success("Progreso guardado");
  };

  const handleConfirm = form.handleSubmit(
    (values) => {
      const result = computeMarcadorGlobal(plantilla, values);
      const tecnicoCumple = result.tecnica.cumple === true;
      const economicoCumple =
        result.tecnica.cumple === false ? false : result.economica.cumple === true;
      const cumpleGlobal = tecnicoCumple && economicoCumple;
      onConfirm(values, { tecnicoCumple, economicoCumple, cumpleGlobal });
    },
    (errors) => {
      toast.error("Complete la evaluación y la justificación requeridas.");
      if (errors.tecnica) setLadoTab("tecnica");
      else if (errors.economica) setLadoTab("economica");
    }
  );

  const setCriterio = (
    lado: "tecnica" | "economica",
    id: string,
    next: CriterioEvaluacionRespuesta
  ) => {
    form.setValue(`${lado}.criterios.${id}`, next, {
      shouldDirty: true,
      shouldValidate: false,
    });
    form.clearErrors(`${lado}.criterios.${id}`);
  };

  const renderCriterios = (lado: "tecnica" | "economica") => {
    const bloque = plantilla[lado];
    const respuestas = watched[lado].criterios;
    const fieldErrors = form.formState.errors[lado]?.criterios;
    const isEco = lado === "economica";

    return bloque.criterios.map((criterio, index) => {
      const err = fieldErrors?.[criterio.id];
      return (
        <CriterioTecnicoEvalCard
          key={criterio.id}
          index={index + 1}
          criterio={criterio}
          respuesta={respuestas[criterio.id]}
          errors={{
            rangoIdSeleccionado: Boolean(err?.rangoIdSeleccionado),
            puntuacionObtenida: Boolean(err?.puntuacionObtenida),
            valorObtenido: Boolean(err?.valorObtenido),
          }}
          readOnly={readOnly}
          valorFisicoHint={isEco ? VALOR_HINT_ECO : VALOR_HINT_TEC}
          valorFisicoPlaceholder={isEco ? VALOR_PH_ECO : VALOR_PH_TEC}
          onChange={(next) => setCriterio(lado, criterio.id, next)}
        />
      );
    });
  };

  const renderJustificacion = (lado: "tecnica" | "economica") => {
    const cumple = lado === "tecnica" ? marcador.tecnica.cumple : marcador.economica.cumple;
    const show = lado === "tecnica" ? showJustifTecnica : showJustifEconomica;
    if (!show) return null;

    const label =
      lado === "tecnica"
        ? cumple === false
          ? EVALUACION_TEC_JUSTIF_NO_CUMPLE
          : EVALUACION_TEC_JUSTIF_CUMPLE
        : cumple === false
          ? EVALUACION_ECO_JUSTIF_NO_CUMPLE
          : EVALUACION_ECO_JUSTIF_CUMPLE;

    return (
      <Card className="mt-2 overflow-hidden rounded-lg border-slate-200 bg-white shadow-sm">
        <CardContent className="space-y-3 p-5">
          <div>
            <h4 className="text-sm font-bold text-color-titulos">
              {lado === "tecnica"
                ? "Justificación de la evaluación técnica"
                : "Justificación de la evaluación económica"}
            </h4>
            <p className="mt-0.5 text-[11px] italic text-muted-foreground">
              {EVALUACION_PUNTAJE_JUSTIFICACION_ARTICULOS}
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-color-titulos">{label}</Label>
            <Textarea
              value={watched[lado].justificacion}
              disabled={readOnly}
              rows={3}
              placeholder="Redacte su justificación..."
              onChange={(e) =>
                form.setValue(`${lado}.justificacion`, e.target.value, { shouldDirty: true })
              }
              className="resize-none"
              aria-invalid={Boolean(form.formState.errors[lado]?.justificacion)}
            />
            {form.formState.errors[lado]?.justificacion ? (
              <p className="text-[11px] font-medium text-destructive">
                {form.formState.errors[lado]?.justificacion?.message}
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50">
      <EvaluacionPuntajeScoreHeader
        titulo={EVALUACION_PUNTAJE_TITLE}
        subtitulo={EVALUACION_PUNTAJE_SUBTITLE}
        totalTecnica={marcador.tecnica.total}
        maxTecnica={plantilla.tecnica.maxPuntos}
        totalEconomica={marcador.economica.total}
        maxEconomica={plantilla.economica.maxPuntos}
        finalScore={marcador.finalScore}
        cumpleTecnica={marcador.tecnica.cumple}
        cumpleEconomica={marcador.economica.cumple}
      />

      <div className="flex shrink-0 items-end justify-between gap-4 border-b border-slate-200 bg-white px-6 pt-2">
        <Tabs
          value={ladoTab}
          onValueChange={(v) => setLadoTab(v as "tecnica" | "economica")}
          className="w-full"
        >
          <TabsList className="h-auto bg-transparent p-0">
            <TabsTrigger
              value="tecnica"
              className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-navy data-[state=active]:bg-transparent data-[state=active]:text-navy data-[state=active]:shadow-none"
            >
              Evaluación técnica ({plantilla.tecnica.maxPuntos}%)
            </TabsTrigger>
            <TabsTrigger
              value="economica"
              className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-navy data-[state=active]:bg-transparent data-[state=active]:text-navy data-[state=active]:shadow-none"
            >
              Evaluación económica ({plantilla.economica.maxPuntos}%)
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto p-6 md:p-8">
        <div className="mx-auto max-w-4xl space-y-4 pb-8">
          {ladoTab === "tecnica" ? (
            <>
              <div className="space-y-4">{renderCriterios("tecnica")}</div>
              {renderJustificacion("tecnica")}
            </>
          ) : (
            <>
              <div className="space-y-4">{renderCriterios("economica")}</div>
              {renderJustificacion("economica")}
            </>
          )}
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
          disabled={readOnly || saving || marcador.hasOverMax}
          onClick={() => void handleConfirm()}
          className="h-11 rounded-md bg-navy px-8 font-semibold text-white hover:bg-navy-hover disabled:opacity-50"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Guardando...
            </span>
          ) : (
            "Guardar evaluación y continuar"
          )}
        </Button>
      </div>
    </div>
  );
}

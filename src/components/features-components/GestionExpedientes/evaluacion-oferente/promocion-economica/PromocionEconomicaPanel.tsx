"use client";

import { useMemo } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calculator, Info, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { SiNoToggleField } from "@/components/features-components/GestionExpedientes/fase1/actividades-previas/SiNoToggleField";
import { PromocionScoreHeader } from "@/components/features-components/GestionExpedientes/evaluacion-oferente/promocion-economica/PromocionScoreHeader";
import { LocalizedDecimalInput } from "@/components/localized-decimal-input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  PROMOCION_ALERT,
  PROMOCION_EVAL_SUBTITLE,
  PROMOCION_EVAL_TITLE,
  PROMOCION_LOCAL_ARTICULOS,
  PROMOCION_LOCAL_LABEL,
  PROMOCION_SUJETO_ARTICULOS,
  PROMOCION_SUJETO_LABEL,
  PROMOCION_VAN_ARTICULOS,
  PROMOCION_VAN_CONSIGNO_LABEL,
  PROMOCION_VAN_PCT_LABEL,
  PROMOCION_VAN_PTS_LABEL,
  applyComputedToForm,
  computePromocionBonos,
  exceedVanPtsMessage,
  parsePromocionDecimal,
} from "@/lib/constants/promocionEconomicaEvaluacion";
import { createPromocionEconomicaSubmitSchema } from "@/lib/schemas/promocionEconomicaEvaluacionSchema";
import type {
  PlantillaPromocion,
  PromocionEconomicaEvaluacionValues,
} from "@/types/evaluacionOferente.types";

interface PromocionEconomicaPanelProps {
  plantilla: PlantillaPromocion;
  notaBase: number;
  defaultValues: PromocionEconomicaEvaluacionValues;
  readOnly?: boolean;
  saving?: boolean;
  onDraft: (values: PromocionEconomicaEvaluacionValues) => void;
  onConfirm: (values: PromocionEconomicaEvaluacionValues) => void;
}

export function PromocionEconomicaPanel({
  plantilla,
  notaBase,
  defaultValues,
  readOnly = false,
  saving = false,
  onDraft,
  onConfirm,
}: PromocionEconomicaPanelProps) {
  const submitSchema = useMemo(() => createPromocionEconomicaSubmitSchema(plantilla), [plantilla]);

  const form = useForm<PromocionEconomicaEvaluacionValues>({
    resolver: zodResolver(submitSchema) as Resolver<PromocionEconomicaEvaluacionValues>,
    defaultValues,
    mode: "onSubmit",
  });

  const watched = form.watch();
  const computed = computePromocionBonos(plantilla, watched, notaBase);

  const handleCalcular = () => {
    if (plantilla.requiereVan && watched.consignoDeclaracionVan === undefined) {
      form.setError("consignoDeclaracionVan", {
        type: "manual",
        message: "Debe marcar SÍ o NO.",
      });
      toast.error("Responda las preguntas de promoción antes de calcular.");
      return;
    }
    if (plantilla.requiereVan && watched.consignoDeclaracionVan === true) {
      if (
        watched.valVanOferente === null ||
        watched.valVanOferente === undefined ||
        watched.valVanOferente < 0 ||
        watched.valVanOferente > 100
      ) {
        form.setError("valVanOferente", {
          type: "manual",
          message: "Indique el porcentaje de VAN (0.00 a 100.00).",
        });
        toast.error("Corrija el porcentaje de VAN.");
        return;
      }
      if (
        watched.ptsBonoVan === null ||
        watched.ptsBonoVan === undefined ||
        watched.ptsBonoVan < 0 ||
        watched.ptsBonoVan > plantilla.puntajeVanMax
      ) {
        form.setError("ptsBonoVan", {
          type: "manual",
          message: exceedVanPtsMessage(plantilla.puntajeVanMax),
        });
        toast.error("Corrija la puntuación del bono VAN.");
        return;
      }
    }
    if (plantilla.indPrefLocal && watched.aplicaPrefLocal === undefined) {
      form.setError("aplicaPrefLocal", {
        type: "manual",
        message: "Debe marcar SÍ o NO.",
      });
      toast.error("Responda preferencia local antes de calcular.");
      return;
    }
    if (plantilla.indBonoSujeto && watched.aplicaBonoSujeto === undefined) {
      form.setError("aplicaBonoSujeto", {
        type: "manual",
        message: "Debe marcar SÍ o NO.",
      });
      toast.error("Responda bono de sujeto protegido antes de calcular.");
      return;
    }

    const next = applyComputedToForm(watched, computed, true);
    form.reset(next);
    toast.success("Calificaciones de promoción calculadas.");
  };

  const handleDraft = () => {
    const next = applyComputedToForm(form.getValues(), computed, watched.calculado);
    onDraft(next);
    toast.success("Progreso guardado");
  };

  const handleConfirm = form.handleSubmit(
    (values) => {
      const next = applyComputedToForm(
        values,
        computePromocionBonos(plantilla, values, notaBase),
        true
      );
      onConfirm(next);
    },
    () => {
      toast.error("Complete las medidas de promoción requeridas.");
    }
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50">
      <PromocionScoreHeader
        titulo={PROMOCION_EVAL_TITLE}
        subtitulo={PROMOCION_EVAL_SUBTITLE}
        notaBase={notaBase}
        totalBonos={computed.totalPuntosPromocion}
        puntuacionFinal={computed.puntuacionFinalConBonos}
      />

      <div className="min-h-0 flex-1 overflow-y-auto p-6 md:p-8">
        <div className="mx-auto max-w-4xl space-y-4 pb-8">
          <Alert className="border-navy/20 bg-navy/5">
            <Info className="text-navy" />
            <AlertTitle className="text-navy">Módulo de fomento al desarrollo nacional</AlertTitle>
            <AlertDescription className="text-sm text-color-subtitulos">
              {PROMOCION_ALERT}
            </AlertDescription>
          </Alert>

          {plantilla.requiereVan ? (
            <Card className="overflow-hidden rounded-lg border-slate-200 bg-white shadow-sm">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
                      A · Valor Agregado Nacional (VAN)
                    </p>
                    <p className="mt-1 text-sm font-bold text-color-titulos">
                      {PROMOCION_VAN_CONSIGNO_LABEL}
                    </p>
                    <p className="mt-1 text-[11px] italic text-muted-foreground">
                      {PROMOCION_VAN_ARTICULOS}
                    </p>
                  </div>
                  <div className="shrink-0 rounded-md border border-border bg-muted/40 px-3 py-2 text-center">
                    <p className="text-[9px] font-bold uppercase text-muted-foreground">Máx.</p>
                    <p className="text-sm font-black text-navy">
                      {plantilla.puntajeVanMax.toFixed(2)} pts
                    </p>
                  </div>
                </div>

                <div className="max-w-[200px]">
                  <SiNoToggleField
                    value={watched.consignoDeclaracionVan}
                    disabled={readOnly}
                    className="gap-2"
                    buttonClassName="h-9 text-xs"
                    onChange={(next) => {
                      form.setValue("consignoDeclaracionVan", next, { shouldDirty: true });
                      form.clearErrors("consignoDeclaracionVan");
                      if (!next) {
                        form.setValue("valVanOferente", 0, { shouldDirty: true });
                        form.setValue("ptsBonoVan", 0, { shouldDirty: true });
                        form.clearErrors(["valVanOferente", "ptsBonoVan"]);
                      } else {
                        form.setValue("valVanOferente", null, { shouldDirty: true });
                        form.setValue("ptsBonoVan", null, { shouldDirty: true });
                      }
                      form.setValue("calculado", false, { shouldDirty: true });
                    }}
                  />
                  {form.formState.errors.consignoDeclaracionVan ? (
                    <p className="mt-2 text-[11px] font-medium text-destructive">
                      {form.formState.errors.consignoDeclaracionVan.message}
                    </p>
                  ) : null}
                </div>

                <div
                  className={cn(
                    "grid transition-[grid-template-rows] duration-300 ease-in-out",
                    watched.consignoDeclaracionVan === true ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="space-y-4 border-t border-border pt-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-color-titulos">
                          {PROMOCION_VAN_PCT_LABEL}
                        </Label>
                        <p className="text-[11px] italic text-muted-foreground">
                          {PROMOCION_VAN_ARTICULOS}
                        </p>
                        <LocalizedDecimalInput
                          value={watched.valVanOferente}
                          fractionDigits={2}
                          max={100}
                          allowEmpty
                          outputMode="raw"
                          disabled={readOnly}
                          className={cn(
                            "h-9 w-28",
                            (computed.vanPctInvalid || form.formState.errors.valVanOferente) &&
                              "border-destructive"
                          )}
                          onValueChange={(raw) => {
                            form.setValue("valVanOferente", parsePromocionDecimal(raw), {
                              shouldDirty: true,
                            });
                            form.clearErrors("valVanOferente");
                            form.setValue("calculado", false, { shouldDirty: true });
                          }}
                        />
                        {form.formState.errors.valVanOferente ? (
                          <p className="text-[11px] font-medium text-destructive">
                            {form.formState.errors.valVanOferente.message}
                          </p>
                        ) : null}
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-color-titulos">
                          {PROMOCION_VAN_PTS_LABEL}
                        </Label>
                        <p className="text-[11px] italic text-muted-foreground">
                          {PROMOCION_VAN_ARTICULOS}
                        </p>
                        <LocalizedDecimalInput
                          value={watched.ptsBonoVan}
                          fractionDigits={2}
                          allowEmpty
                          outputMode="raw"
                          disabled={readOnly}
                          className={cn(
                            "h-9 w-28",
                            (computed.vanPtsOverMax || form.formState.errors.ptsBonoVan) &&
                              "border-destructive"
                          )}
                          onValueChange={(raw) => {
                            form.setValue("ptsBonoVan", parsePromocionDecimal(raw), {
                              shouldDirty: true,
                            });
                            form.clearErrors("ptsBonoVan");
                            form.setValue("calculado", false, { shouldDirty: true });
                          }}
                        />
                        {(computed.vanPtsOverMax || form.formState.errors.ptsBonoVan) && (
                          <p className="text-[11px] font-medium text-destructive">
                            {form.formState.errors.ptsBonoVan?.message ??
                              exceedVanPtsMessage(plantilla.puntajeVanMax)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {plantilla.indPrefLocal ? (
            <Card className="overflow-hidden rounded-lg border-slate-200 bg-white shadow-sm">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
                      B · Preferencia local
                    </p>
                    <p className="mt-1 text-sm font-bold text-color-titulos">
                      {PROMOCION_LOCAL_LABEL}
                    </p>
                    <p className="mt-1 text-[11px] italic text-muted-foreground">
                      {PROMOCION_LOCAL_ARTICULOS}
                    </p>
                  </div>
                  <div className="shrink-0 rounded-md border border-border bg-muted/40 px-3 py-2 text-center">
                    <p className="text-[9px] font-bold uppercase text-muted-foreground">Bono</p>
                    <p className="text-sm font-black text-navy">
                      {plantilla.puntuacionBonoLocal.toFixed(2)} pts
                    </p>
                  </div>
                </div>
                <div className="max-w-[200px]">
                  <SiNoToggleField
                    value={watched.aplicaPrefLocal}
                    disabled={readOnly}
                    className="gap-2"
                    buttonClassName="h-9 text-xs"
                    onChange={(next) => {
                      form.setValue("aplicaPrefLocal", next, { shouldDirty: true });
                      form.clearErrors("aplicaPrefLocal");
                      form.setValue("calculado", false, { shouldDirty: true });
                    }}
                  />
                  {form.formState.errors.aplicaPrefLocal ? (
                    <p className="mt-2 text-[11px] font-medium text-destructive">
                      {form.formState.errors.aplicaPrefLocal.message}
                    </p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ) : null}

          {plantilla.indBonoSujeto ? (
            <Card className="overflow-hidden rounded-lg border-slate-200 bg-white shadow-sm">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
                      C · Sujeto protegido
                    </p>
                    <p className="mt-1 text-sm font-bold text-color-titulos">
                      {PROMOCION_SUJETO_LABEL}
                    </p>
                    <p className="mt-1 text-[11px] italic text-muted-foreground">
                      {PROMOCION_SUJETO_ARTICULOS}
                    </p>
                  </div>
                  <div className="shrink-0 rounded-md border border-border bg-muted/40 px-3 py-2 text-center">
                    <p className="text-[9px] font-bold uppercase text-muted-foreground">Bono</p>
                    <p className="text-sm font-black text-navy">
                      {plantilla.puntuacionBonoSujeto.toFixed(2)} pts
                    </p>
                  </div>
                </div>
                <div className="max-w-[200px]">
                  <SiNoToggleField
                    value={watched.aplicaBonoSujeto}
                    disabled={readOnly}
                    className="gap-2"
                    buttonClassName="h-9 text-xs"
                    onChange={(next) => {
                      form.setValue("aplicaBonoSujeto", next, { shouldDirty: true });
                      form.clearErrors("aplicaBonoSujeto");
                      form.setValue("calculado", false, { shouldDirty: true });
                    }}
                  />
                  {form.formState.errors.aplicaBonoSujeto ? (
                    <p className="mt-2 text-[11px] font-medium text-destructive">
                      {form.formState.errors.aplicaBonoSujeto.message}
                    </p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ) : null}

          {!readOnly ? (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleCalcular}
                disabled={computed.vanPtsOverMax || computed.vanPctInvalid}
                className="h-11 rounded-md border-navy/30 font-semibold text-navy hover:bg-navy/5"
              >
                <Calculator className="h-4 w-4" />
                Calcular calificaciones de promoción
              </Button>
            </div>
          ) : null}

          {watched.calculado ? (
            <Card className="overflow-hidden rounded-lg border-slate-200 bg-white shadow-sm">
              <CardContent className="space-y-2 p-5 text-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Desglose calculado
                </p>
                <div className="grid gap-1 text-color-titulos sm:grid-cols-3">
                  <p>
                    VAN: <span className="font-bold">{computed.ptsBonoVan.toFixed(2)} pts</span>
                  </p>
                  <p>
                    Local: <span className="font-bold">{computed.ptsBonoLocal.toFixed(2)} pts</span>
                  </p>
                  <p>
                    Sujeto:{" "}
                    <span className="font-bold">{computed.ptsBonoSujeto.toFixed(2)} pts</span>
                  </p>
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
          disabled={readOnly || saving || computed.vanPtsOverMax || computed.vanPctInvalid}
          onClick={() => void handleConfirm()}
          className="h-11 rounded-md bg-navy px-8 font-semibold text-white hover:bg-navy-hover disabled:opacity-50"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Guardando...
            </span>
          ) : (
            "Guardar calificación y continuar"
          )}
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChartPie } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  CALIFICACION_FINANCIERA_ALERT,
  CALIFICACION_FINANCIERA_DRAFT_LABEL,
  CALIFICACION_FINANCIERA_SUBMIT_HINT,
  CALIFICACION_FINANCIERA_SUBMIT_LABEL,
  CALIFICACION_FINANCIERA_SUCCESS_DESCRIPTION,
  CALIFICACION_FINANCIERA_SUCCESS_TITLE,
  CALIFICACION_FINANCIERA_WIZARD_TITLE,
  CRITERIOS_FINANCIEROS_META,
  SNC_DEFAULTS,
  createDefaultCalificacionFinancieraValues,
  getCalificacionFinancieraFormStorageKey,
  type CalificacionFinancieraFormValues,
  type CalificacionFinancieraStoredForm,
  type TresRangosValues,
} from "@/lib/constants/calificacionFinanciera";
import {
  canSubmitCalificacionFinanciera,
  getCalificacionFinancieraIssues,
} from "@/lib/schemas/calificacionFinancieraSchema";
import { expedienteFase1TabPath } from "@/lib/utils/fase1InicialRoutes";
import { useFase1InicialState } from "@/components/features-components/GestionExpedientes/fase1/hooks/useFase1InicialState";
import { LocalizedDecimalInput } from "@/components/localized-decimal-input";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CriterioDescapitalizacionPanel } from "./CriterioDescapitalizacionPanel";
import { CriterioFinancieroCard } from "./CriterioFinancieroCard";
import { CriterioTresRangosPanel } from "./CriterioTresRangosPanel";

export interface CalificacionFinancieraFormProps {
  expedienteId: string;
  readOnly?: boolean;
  basePath?: string;
}

function parseLocalized(raw: string): number {
  const normalized = raw.replace(/\./g, "").replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}

function clearLegacySncPuntajes(
  values: CalificacionFinancieraFormValues
): CalificacionFinancieraFormValues {
  const clearIfSnc = (
    block: TresRangosValues,
    snc: (typeof SNC_DEFAULTS)["solvencia"]
  ): TresRangosValues => {
    const matchesLegacy =
      block.puntajeMaximo === snc.puntajeMaximo &&
      block.puntajeMedio === snc.puntajeMedio &&
      block.puntajeMinimo === snc.puntajeMinimo;
    if (!matchesLegacy) return block;
    return { ...block, puntajeMaximo: null, puntajeMedio: null, puntajeMinimo: null };
  };

  return {
    ...values,
    puntajeMaximoDescapitalAuAu:
      values.puntajeMaximoDescapitalAuAu === SNC_DEFAULTS.descapitalPuntaje
        ? null
        : values.puntajeMaximoDescapitalAuAu,
    solvencia: clearIfSnc(values.solvencia, SNC_DEFAULTS.solvencia),
    rotacion: clearIfSnc(values.rotacion, SNC_DEFAULTS.rotacion),
    rendimiento: clearIfSnc(values.rendimiento, SNC_DEFAULTS.rendimiento),
    rentabilidad: clearIfSnc(values.rentabilidad, SNC_DEFAULTS.rentabilidad),
    endeudamiento: clearIfSnc(values.endeudamiento, SNC_DEFAULTS.endeudamiento),
  };
}

function loadStored(expedienteId: string): CalificacionFinancieraStoredForm {
  const defaults = createDefaultCalificacionFinancieraValues();
  if (typeof window === "undefined") {
    return { values: defaults, status: "draft" };
  }
  try {
    const raw = window.localStorage.getItem(getCalificacionFinancieraFormStorageKey(expedienteId));
    if (!raw) return { values: defaults, status: "draft" };
    const parsed = JSON.parse(raw) as Partial<CalificacionFinancieraStoredForm>;
    const incoming = parsed.values ?? {};

    const toggleKeys = [
      "criterioCalifFinanDescapitalAuAu",
      "criterioCalifFinanSolvenciaAuAu",
      "criterioCalifFinanRotacionAuAu",
      "criterioCalifFinanRendimientoAuAu",
      "criterioCalifFinanRentabilidadAuAu",
      "criterioCalifFinanEndeudamientoAuAu",
    ] as const;

    // Defaults antiguos preseleccionaban todos en NO o todos en SÍ. Migrar a neutro.
    const allLegacyUniform =
      parsed.status !== "completed" &&
      (toggleKeys.every((key) => incoming[key] === false) ||
        toggleKeys.every((key) => incoming[key] === true));

    const togglesOverride = allLegacyUniform
      ? Object.fromEntries(toggleKeys.map((key) => [key, undefined]))
      : {};

    const merged: CalificacionFinancieraFormValues = {
      ...defaults,
      ...incoming,
      ...togglesOverride,
      solvencia: { ...defaults.solvencia, ...(incoming.solvencia ?? {}) },
      rotacion: { ...defaults.rotacion, ...(incoming.rotacion ?? {}) },
      rendimiento: { ...defaults.rendimiento, ...(incoming.rendimiento ?? {}) },
      rentabilidad: { ...defaults.rentabilidad, ...(incoming.rentabilidad ?? {}) },
      endeudamiento: { ...defaults.endeudamiento, ...(incoming.endeudamiento ?? {}) },
    };

    // Borradores con puntajes SNC prellenados (legado) → vaciar puntajes; conservar rangos.
    const values = parsed.status === "completed" ? merged : clearLegacySncPuntajes(merged);

    return {
      values,
      status: parsed.status === "completed" ? "completed" : "draft",
    };
  } catch {
    return { values: defaults, status: "draft" };
  }
}

function persist(expedienteId: string, payload: CalificacionFinancieraStoredForm) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    getCalificacionFinancieraFormStorageKey(expedienteId),
    JSON.stringify(payload)
  );
}

export function CalificacionFinancieraForm({
  expedienteId,
  readOnly = false,
  basePath = "/gestion-expedientes",
}: CalificacionFinancieraFormProps) {
  const router = useRouter();
  const { completeMicromodule, saveMicromoduleDraft } = useFase1InicialState(expedienteId);

  const [hydrated, setHydrated] = useState(false);
  const [values, setValues] = useState<CalificacionFinancieraFormValues>(
    createDefaultCalificacionFinancieraValues
  );
  const [isSaving, setIsSaving] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    const stored = loadStored(expedienteId);
    setValues(stored.values);
    setHydrated(true);
  }, [expedienteId]);

  const goToPanel = useCallback(() => {
    router.push(expedienteFase1TabPath(basePath, expedienteId));
  }, [basePath, expedienteId, router]);

  const issues = useMemo(() => getCalificacionFinancieraIssues(values), [values]);
  const canSubmit = useMemo(() => canSubmitCalificacionFinanciera(values), [values]);

  const patchValues = (partial: Partial<CalificacionFinancieraFormValues>) => {
    setValues((prev) => ({ ...prev, ...partial }));
  };

  const patchTresRangos = (
    key: "solvencia" | "rotacion" | "rendimiento" | "rentabilidad" | "endeudamiento",
    next: TresRangosValues
  ) => {
    setValues((prev) => ({ ...prev, [key]: next }));
  };

  const handleSaveDraft = () => {
    if (readOnly) return;
    setIsSaving(true);
    try {
      persist(expedienteId, { values, status: "draft" });
      saveMicromoduleDraft("calificacion-financiera");
      toast.success("Borrador de calificación financiera guardado.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = () => {
    if (readOnly || !canSubmit) return;
    setIsSaving(true);
    try {
      persist(expedienteId, { values, status: "completed" });
      completeMicromodule("calificacion-financiera");
      setSuccessOpen(true);
    } finally {
      setIsSaving(false);
    }
  };

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Cargando calificación financiera...
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="w-full space-y-4 px-4 py-6 md:px-6">
        <div className="mx-auto w-full max-w-5xl space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-4 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-navy">
              <ChartPie className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-[20px] font-bold leading-tight text-color-titulos md:text-[22px]">
                {CALIFICACION_FINANCIERA_WIZARD_TITLE}
              </h1>
            </div>
          </div>

          <div className="flex gap-3 rounded-lg border border-success/30 bg-success-bg px-4 py-3 text-sm text-foreground">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            <p className="leading-relaxed text-success-text">{CALIFICACION_FINANCIERA_ALERT}</p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4 shadow-sm md:p-6">
            <div className="space-y-4">
              {CRITERIOS_FINANCIEROS_META.map((meta) => {
                const active = values[meta.toggleKey];
                return (
                  <CriterioFinancieroCard
                    key={meta.id}
                    title={meta.title}
                    pregunta={meta.pregunta}
                    basamentoLegal={meta.basamentoLegal}
                    value={active}
                    readOnly={readOnly}
                    inverseRibbon={meta.inverseRibbon}
                    onChange={(next) => patchValues({ [meta.toggleKey]: next })}
                  >
                    {meta.id === "descapital" ? (
                      <CriterioDescapitalizacionPanel
                        puntajeNoDescapitalizado={values.puntajeMaximoDescapitalAuAu}
                        readOnly={readOnly}
                        onPuntajeChange={(n) => patchValues({ puntajeMaximoDescapitalAuAu: n })}
                      />
                    ) : null}

                    {meta.id === "solvencia" ? (
                      <CriterioTresRangosPanel
                        values={values.solvencia}
                        mode="ascendente"
                        aspectoLabel={meta.aspectoLabel}
                        aspectoHint={meta.aspectoHint}
                        readOnly={readOnly}
                        onChange={(next) => patchTresRangos("solvencia", next)}
                      />
                    ) : null}

                    {meta.id === "rotacion" ? (
                      <CriterioTresRangosPanel
                        values={values.rotacion}
                        mode="ascendente"
                        aspectoLabel={meta.aspectoLabel}
                        aspectoHint={meta.aspectoHint}
                        unitSuffix="veces"
                        readOnly={readOnly}
                        onChange={(next) => patchTresRangos("rotacion", next)}
                      />
                    ) : null}

                    {meta.id === "rendimiento" ? (
                      <CriterioTresRangosPanel
                        values={values.rendimiento}
                        mode="ascendente"
                        aspectoLabel={meta.aspectoLabel}
                        aspectoHint={meta.aspectoHint}
                        showPercentHint
                        fractionDigits={4}
                        readOnly={readOnly}
                        onChange={(next) => patchTresRangos("rendimiento", next)}
                      />
                    ) : null}

                    {meta.id === "rentabilidad" ? (
                      <CriterioTresRangosPanel
                        values={values.rentabilidad}
                        mode="ascendente"
                        aspectoLabel={meta.aspectoLabel}
                        aspectoHint={meta.aspectoHint}
                        showPercentHint
                        fractionDigits={4}
                        readOnly={readOnly}
                        onChange={(next) => patchTresRangos("rentabilidad", next)}
                      />
                    ) : null}

                    {meta.id === "endeudamiento" ? (
                      <CriterioTresRangosPanel
                        values={values.endeudamiento}
                        mode="inverso"
                        aspectoLabel={meta.aspectoLabel}
                        aspectoHint={meta.aspectoHint}
                        readOnly={readOnly}
                        onChange={(next) => patchTresRangos("endeudamiento", next)}
                      />
                    ) : null}
                  </CriterioFinancieroCard>
                );
              })}

              <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-4">
                <Label className="text-sm font-bold text-color-titulos">
                  Indique la puntuación mínima aprobatoria (sobre una base de 100 puntos) que el
                  oferente debe alcanzar en la Calificación Financiera para ser APTO y proceder a la
                  siguiente fase del proceso.
                </Label>
                <p className="text-[11px] italic leading-relaxed text-muted-foreground">
                  Artículo 67 RLCP; art. 16 Normas de Control Interno SUNAI.
                </p>
                <LocalizedDecimalInput
                  value={values.puntuacionMinimaCalifFinancieraAuAu}
                  fractionDigits={0}
                  max={100}
                  outputMode="raw"
                  disabled={readOnly}
                  className="h-10 w-28"
                  onValueChange={(raw) =>
                    patchValues({ puntuacionMinimaCalifFinancieraAuAu: parseLocalized(raw) || 1 })
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex flex-wrap items-center justify-between gap-3">
            {readOnly ? (
              <Button type="button" variant="outline" onClick={goToPanel}>
                Volver al panel
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSaving}
                  onClick={handleSaveDraft}
                  className="border-border text-muted-foreground hover:bg-muted"
                >
                  {CALIFICACION_FINANCIERA_DRAFT_LABEL}
                </Button>

                <TooltipProvider delayDuration={150}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex">
                        <Button
                          type="button"
                          disabled={isSaving || !canSubmit}
                          onClick={handleSubmit}
                          className="bg-navy text-white hover:bg-navy-hover"
                        >
                          {CALIFICACION_FINANCIERA_SUBMIT_LABEL}
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-xs">
                      {canSubmit ? (
                        <p>{CALIFICACION_FINANCIERA_SUBMIT_HINT}</p>
                      ) : (
                        <>
                          <p>{CALIFICACION_FINANCIERA_SUBMIT_HINT}</p>
                          {issues[0] ? (
                            <p className="mt-1 text-muted-foreground">{issues[0]}</p>
                          ) : null}
                        </>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            )}
          </div>
        </div>
      </div>

      <AlertDialog
        open={successOpen}
        onOpenChange={(open) => {
          if (!open) {
            setSuccessOpen(false);
            goToPanel();
          }
        }}
      >
        <AlertDialogContent className="max-w-[340px] rounded-xl border-border bg-card p-6 shadow-lg">
          <AlertDialogTitle className="sr-only">
            {CALIFICACION_FINANCIERA_SUCCESS_TITLE}
          </AlertDialogTitle>
          <AlertDialogDescription className="sr-only">
            {CALIFICACION_FINANCIERA_SUCCESS_DESCRIPTION}
          </AlertDialogDescription>
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success-bg">
              <CheckCircle2 className="h-7 w-7 text-success" strokeWidth={2} />
            </div>
            <h2 className="text-lg font-bold text-color-titulos">
              {CALIFICACION_FINANCIERA_SUCCESS_TITLE}
            </h2>
            <p className="mt-2 max-w-[280px] text-xs leading-relaxed text-muted-foreground">
              {CALIFICACION_FINANCIERA_SUCCESS_DESCRIPTION}
            </p>
            <Button
              type="button"
              onClick={() => {
                setSuccessOpen(false);
                goToPanel();
              }}
              className="mt-5 w-full bg-navy text-white hover:bg-navy-hover"
            >
              Volver al Panel Principal
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

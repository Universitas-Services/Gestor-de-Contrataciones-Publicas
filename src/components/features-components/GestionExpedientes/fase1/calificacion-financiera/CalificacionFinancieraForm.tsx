"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ChartPie } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  CALIFICACION_FINANCIERA_ALERT,
  CALIFICACION_FINANCIERA_DRAFT_LABEL,
  CALIFICACION_FINANCIERA_PUNTUACION_MINIMA_HINT,
  CALIFICACION_FINANCIERA_SUBMIT_HINT,
  CALIFICACION_FINANCIERA_SUBMIT_LABEL,
  CALIFICACION_FINANCIERA_SUCCESS_DESCRIPTION,
  CALIFICACION_FINANCIERA_SUCCESS_TITLE,
  CALIFICACION_FINANCIERA_WIZARD_TITLE,
  CRITERIOS_FINANCIEROS_META,
  SNC_DEFAULTS,
  TOTAL_PUNTAJE_MAXIMO,
  createDefaultCalificacionFinancieraValues,
  getTotalPuntajeMaximoActivos,
  type CalificacionFinancieraFormValues,
  type TresRangosValues,
} from "@/lib/constants/calificacionFinanciera";
import {
  canSubmitCalificacionFinanciera,
  getCalificacionFinancieraIssues,
} from "@/lib/schemas/calificacionFinancieraSchema";
import { expedienteFase1TabPath } from "@/lib/utils/fase1InicialRoutes";
import { formatMicromoduloErrorMessage } from "@/lib/utils/fase1ApiError";
import {
  calificacionFinancieraFromResponse,
  calificacionFinancieraToApi,
  ensureMicromoduloEditable,
} from "@/lib/utils/fase1MicromodulosMapper";
import {
  completarMicromodulo,
  guardarBorradorMicromodulo,
  obtenerCalificacionFinanciera,
} from "@/services/fase1MicromodulosService";
import type { EstadoMicromoduloApi } from "@/types/fase1Micromodulos.types";
import { LocalizedDecimalInput } from "@/components/localized-decimal-input";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { CriterioDescapitalizacionPanel } from "./CriterioDescapitalizacionPanel";
import { CriterioFinancieroCard } from "./CriterioFinancieroCard";
import { CriterioTresRangosPanel } from "./CriterioTresRangosPanel";

export interface CalificacionFinancieraFormProps {
  expedienteId: string;
  readOnly?: boolean;
  basePath?: string;
}

function parseOptionalUmbral(raw: string): number {
  if (!raw.trim()) return 0;
  const normalized = raw.replace(/\./g, "").replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}

function clearLegacySncPuntajes(
  values: CalificacionFinancieraFormValues
): CalificacionFinancieraFormValues {
  const clearIfSnc = (block: TresRangosValues, snc: TresRangosValues): TresRangosValues => {
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

export function CalificacionFinancieraForm({
  expedienteId,
  readOnly = false,
  basePath = "/gestion-expedientes",
}: CalificacionFinancieraFormProps) {
  const router = useRouter();

  const [hydrated, setHydrated] = useState(false);
  const [values, setValues] = useState<CalificacionFinancieraFormValues>(
    createDefaultCalificacionFinancieraValues
  );
  const [estado, setEstado] = useState<EstadoMicromoduloApi | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const response = await obtenerCalificacionFinanciera(expedienteId);
        if (cancelled) return;

        setEstado(response.estado);
        const fromApi = calificacionFinancieraFromResponse(response as Record<string, unknown>);
        setValues(response.estado === "COMPLETADO" ? fromApi : clearLegacySncPuntajes(fromApi));
      } catch {
        if (!cancelled) setValues(createDefaultCalificacionFinancieraValues());
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [expedienteId]);

  const goToPanel = useCallback(() => {
    router.push(expedienteFase1TabPath(basePath, expedienteId, "configuracion-pliego"));
  }, [basePath, expedienteId, router]);

  const issues = useMemo(() => getCalificacionFinancieraIssues(values), [values]);
  const canSubmit = useMemo(() => canSubmitCalificacionFinanciera(values), [values]);
  const totalPuntajeMaximo = useMemo(() => getTotalPuntajeMaximoActivos(values), [values]);
  const totalState =
    totalPuntajeMaximo === TOTAL_PUNTAJE_MAXIMO
      ? "perfect"
      : totalPuntajeMaximo > TOTAL_PUNTAJE_MAXIMO
        ? "exceeded"
        : "incomplete";
  const totalRemaining = Math.abs(TOTAL_PUNTAJE_MAXIMO - totalPuntajeMaximo);

  const patchValues = (partial: Partial<CalificacionFinancieraFormValues>) => {
    setValues((prev) => ({ ...prev, ...partial }));
  };

  const patchTresRangos = (
    key: "solvencia" | "rotacion" | "rendimiento" | "rentabilidad" | "endeudamiento",
    next: TresRangosValues
  ) => {
    setValues((prev) => ({ ...prev, [key]: next }));
  };

  const handleSaveDraft = async () => {
    if (readOnly) return;
    setIsSaving(true);
    try {
      // Reabrir solo al guardar (no al abrir el formulario).
      await ensureMicromoduloEditable(expedienteId, "calificacion-financiera", estado);
      if (estado === "COMPLETADO") setEstado("BORRADOR");
      const apiPayload = calificacionFinancieraToApi(values);
      await guardarBorradorMicromodulo(
        expedienteId,
        "calificacion-financiera",
        apiPayload as unknown as Record<string, unknown>
      );
      toast.success("Borrador de calificación financiera guardado.");
      goToPanel();
    } catch (error) {
      toast.error(formatMicromoduloErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (readOnly || !canSubmit) return;
    setIsSaving(true);
    try {
      await ensureMicromoduloEditable(expedienteId, "calificacion-financiera", estado);
      if (estado === "COMPLETADO") setEstado("BORRADOR");
      const apiPayload = calificacionFinancieraToApi(values);
      await guardarBorradorMicromodulo(
        expedienteId,
        "calificacion-financiera",
        apiPayload as unknown as Record<string, unknown>
      );
      await completarMicromodulo(
        expedienteId,
        "calificacion-financiera",
        apiPayload as unknown as Record<string, unknown>
      );
      setEstado("COMPLETADO");
      setSuccessOpen(true);
    } catch (error) {
      toast.error(formatMicromoduloErrorMessage(error));
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
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                      Suma de puntajes máximos (criterios activos)
                    </p>
                    <p className="text-2xl font-black leading-none text-color-titulos">
                      {totalPuntajeMaximo.toLocaleString("es-VE", { maximumFractionDigits: 2 })}{" "}
                      <span className="text-sm font-semibold text-muted-foreground">
                        / {TOTAL_PUNTAJE_MAXIMO} pts
                      </span>
                    </p>
                  </div>
                  <Badge
                    className={cn(
                      "shrink-0 text-[11px] font-bold",
                      totalState === "perfect"
                        ? "border-0 bg-success-bg text-success-text"
                        : totalState === "exceeded"
                          ? "border-0 bg-destructive/10 text-destructive"
                          : "border-0 bg-doc-warning-bg text-amber-dark"
                    )}
                  >
                    {totalState === "perfect" ? (
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        ¡Exacto!
                      </span>
                    ) : totalState === "exceeded" ? (
                      <span className="inline-flex items-center gap-1">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Excede por {totalRemaining}
                      </span>
                    ) : (
                      `Faltan ${totalRemaining}`
                    )}
                  </Badge>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      totalState === "perfect"
                        ? "bg-success"
                        : totalState === "exceeded"
                          ? "bg-destructive"
                          : "bg-amber-dark"
                    )}
                    style={{
                      width: `${Math.min(100, Math.max(0, (totalPuntajeMaximo / TOTAL_PUNTAJE_MAXIMO) * 100))}%`,
                    }}
                  />
                </div>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  {CALIFICACION_FINANCIERA_SUBMIT_HINT}
                </p>
              </div>

              <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-4">
                <Label className="text-sm font-bold text-color-titulos">
                  Indique la puntuación mínima aprobatoria (sobre una base de 100 puntos) que el
                  oferente debe alcanzar en la Calificación Financiera para ser APTO y proceder a la
                  siguiente fase del proceso.
                </Label>
                <p className="text-[11px] italic leading-relaxed text-muted-foreground">
                  Artículo 67 RLCP; art. 16 Normas de Control Interno SUNAI.
                </p>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  {CALIFICACION_FINANCIERA_PUNTUACION_MINIMA_HINT}
                </p>
                <LocalizedDecimalInput
                  value={values.puntuacionMinimaCalifFinancieraAuAu}
                  fractionDigits={0}
                  max={100}
                  allowEmpty
                  outputMode="raw"
                  disabled={readOnly}
                  className="h-10 w-28"
                  onValueChange={(raw) =>
                    patchValues({
                      puntuacionMinimaCalifFinancieraAuAu: parseOptionalUmbral(raw),
                    })
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

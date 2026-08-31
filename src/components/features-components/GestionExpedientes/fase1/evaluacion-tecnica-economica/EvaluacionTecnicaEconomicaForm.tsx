"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChartPie, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  EVALUACION_TE_DRAFT_LABEL,
  EVALUACION_TE_EMPTY_ECONOMICA_DESCRIPTION,
  EVALUACION_TE_EMPTY_ECONOMICA_TITLE,
  EVALUACION_TE_EMPTY_TECNICA_DESCRIPTION,
  EVALUACION_TE_EMPTY_TECNICA_TITLE,
  EVALUACION_TE_SUBMIT_DISABLED_HINT,
  EVALUACION_TE_SUBMIT_LABEL,
  EVALUACION_TE_SUCCESS_DESCRIPTION,
  EVALUACION_TE_SUCCESS_TITLE,
  EVALUACION_TE_WIZARD_TITLE,
  TOTAL_PUNTOS_OBJETIVO,
  createDefaultEvaluacionTecnicaEconomicaValues,
  getEvaluacionTecnicaEconomicaFormStorageKey,
  roundPts,
  type CriterioEvalEconomica,
  type CriterioEvalTecnica,
  type EvaluacionLado,
  type EvaluacionTecnicaEconomicaFormValues,
  type EvaluacionTecnicaEconomicaStoredForm,
} from "@/lib/constants/evaluacionTecnicaEconomica";
import {
  canSubmitEvaluacionTecnicaEconomica,
  getEvaluacionTecnicaEconomicaIssues,
  getTotalEconomica,
  getTotalMatriz,
  getTotalTecnica,
} from "@/lib/schemas/evaluacionTecnicaEconomicaSchema";
import { expedienteFase1TabPath } from "@/lib/utils/fase1InicialRoutes";
import { useFase1InicialState } from "@/components/features-components/GestionExpedientes/fase1/hooks/useFase1InicialState";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BolsaCompartidaBar } from "./BolsaCompartidaBar";
import { CriterioEvaluacionDialog } from "./CriterioEvaluacionDialog";
import { EvaluacionTabPanel } from "./EvaluacionTabPanel";

const evaluacionTabTriggerClassName = [
  "h-full w-full cursor-pointer rounded-lg border border-transparent bg-transparent px-3 text-sm font-semibold text-muted-foreground shadow-none transition-all duration-200 ease-in-out after:hidden",
  "hover:bg-card/80 hover:text-color-titulos",
  "data-[state=active]:border-navy/15 data-[state=active]:bg-navy data-[state=active]:text-white data-[state=active]:shadow-sm",
  "focus-visible:ring-0 focus-visible:ring-offset-0",
].join(" ");

export interface EvaluacionTecnicaEconomicaFormProps {
  expedienteId: string;
  readOnly?: boolean;
  basePath?: string;
}

type CriterioUnion = CriterioEvalTecnica | CriterioEvalEconomica;

function loadStored(expedienteId: string): EvaluacionTecnicaEconomicaStoredForm {
  const defaults = createDefaultEvaluacionTecnicaEconomicaValues();
  if (typeof window === "undefined") {
    return { values: defaults, status: "draft" };
  }
  try {
    const raw = window.localStorage.getItem(
      getEvaluacionTecnicaEconomicaFormStorageKey(expedienteId)
    );
    if (!raw) return { values: defaults, status: "draft" };
    const parsed = JSON.parse(raw) as Partial<EvaluacionTecnicaEconomicaStoredForm>;
    const incoming = parsed.values;
    return {
      values: {
        ...defaults,
        ...(incoming ?? {}),
        criteriosTecnicos: Array.isArray(incoming?.criteriosTecnicos)
          ? incoming.criteriosTecnicos
          : [],
        criteriosEconomicos: Array.isArray(incoming?.criteriosEconomicos)
          ? incoming.criteriosEconomicos
          : [],
        puntuacionMinimaEvaluacionTecnicaAuAu:
          typeof incoming?.puntuacionMinimaEvaluacionTecnicaAuAu === "number"
            ? incoming.puntuacionMinimaEvaluacionTecnicaAuAu
            : defaults.puntuacionMinimaEvaluacionTecnicaAuAu,
        puntuacionMinimaEvaluacionEconomicaAuAu:
          typeof incoming?.puntuacionMinimaEvaluacionEconomicaAuAu === "number"
            ? incoming.puntuacionMinimaEvaluacionEconomicaAuAu
            : defaults.puntuacionMinimaEvaluacionEconomicaAuAu,
      },
      status: parsed.status === "completed" ? "completed" : "draft",
    };
  } catch {
    return { values: defaults, status: "draft" };
  }
}

function persist(expedienteId: string, payload: EvaluacionTecnicaEconomicaStoredForm) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    getEvaluacionTecnicaEconomicaFormStorageKey(expedienteId),
    JSON.stringify(payload)
  );
}

export function EvaluacionTecnicaEconomicaForm({
  expedienteId,
  readOnly = false,
  basePath = "/gestion-expedientes",
}: EvaluacionTecnicaEconomicaFormProps) {
  const router = useRouter();
  const { completeMicromodule, saveMicromoduleDraft } = useFase1InicialState(expedienteId);

  const [hydrated, setHydrated] = useState(false);
  const [values, setValues] = useState<EvaluacionTecnicaEconomicaFormValues>(
    createDefaultEvaluacionTecnicaEconomicaValues
  );
  const [activeTab, setActiveTab] = useState<EvaluacionLado>("tecnica");
  const [isSaving, setIsSaving] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [dialogLado, setDialogLado] = useState<EvaluacionLado>("tecnica");
  const [editingCriterio, setEditingCriterio] = useState<CriterioUnion | null>(null);

  useEffect(() => {
    setValues(loadStored(expedienteId).values);
    setHydrated(true);
  }, [expedienteId]);

  const goToPanel = useCallback(() => {
    router.push(expedienteFase1TabPath(basePath, expedienteId));
  }, [basePath, expedienteId, router]);

  const totalTecnica = useMemo(() => getTotalTecnica(values), [values]);
  const totalEconomica = useMemo(() => getTotalEconomica(values), [values]);
  const totalMatriz = useMemo(() => getTotalMatriz(values), [values]);
  const canSubmit = useMemo(() => canSubmitEvaluacionTecnicaEconomica(values), [values]);
  const issues = useMemo(() => getEvaluacionTecnicaEconomicaIssues(values), [values]);

  const clampUmbral = (lado: EvaluacionLado, value: number) => {
    const capped = Math.min(Math.max(0, value), TOTAL_PUNTOS_OBJETIVO);
    const sectionTotal = lado === "tecnica" ? totalTecnica : totalEconomica;
    if (sectionTotal <= 0) return capped;
    return Math.min(capped, sectionTotal);
  };

  const setCriteriosTecnicos = (criteriosTecnicos: CriterioEvalTecnica[]) => {
    setValues((prev) => {
      const nextTotal = roundPts(
        criteriosTecnicos.reduce(
          (acc, c) => acc + (Number(c.puntuacionCriterioEvaluacionTecnicaAuAu) || 0),
          0
        )
      );
      const umbral =
        nextTotal > 0
          ? Math.min(prev.puntuacionMinimaEvaluacionTecnicaAuAu, nextTotal)
          : prev.puntuacionMinimaEvaluacionTecnicaAuAu;
      return {
        ...prev,
        criteriosTecnicos,
        puntuacionMinimaEvaluacionTecnicaAuAu: umbral,
      };
    });
  };

  const setCriteriosEconomicos = (criteriosEconomicos: CriterioEvalEconomica[]) => {
    setValues((prev) => {
      const nextTotal = roundPts(
        criteriosEconomicos.reduce(
          (acc, c) => acc + (Number(c.puntuacionCriterioEvaluacionEconomicaAuAu) || 0),
          0
        )
      );
      const umbral =
        nextTotal > 0
          ? Math.min(prev.puntuacionMinimaEvaluacionEconomicaAuAu, nextTotal)
          : prev.puntuacionMinimaEvaluacionEconomicaAuAu;
      return {
        ...prev,
        criteriosEconomicos,
        puntuacionMinimaEvaluacionEconomicaAuAu: umbral,
      };
    });
  };

  const openCreate = (lado: EvaluacionLado) => {
    if (readOnly) return;
    setDialogLado(lado);
    setDialogMode("create");
    setEditingCriterio(null);
    setDialogOpen(true);
  };

  const openEdit = (lado: EvaluacionLado, id: string) => {
    const found =
      lado === "tecnica"
        ? (values.criteriosTecnicos.find((c) => c.id === id) ?? null)
        : (values.criteriosEconomicos.find((c) => c.id === id) ?? null);
    if (!found) return;
    setDialogLado(lado);
    setDialogMode("edit");
    setEditingCriterio(found);
    setDialogOpen(true);
  };

  const handleSaveCriterio = (criterio: CriterioUnion) => {
    if (dialogLado === "tecnica") {
      const next = criterio as CriterioEvalTecnica;
      if (dialogMode === "edit") {
        setCriteriosTecnicos(values.criteriosTecnicos.map((c) => (c.id === next.id ? next : c)));
        toast.success("Criterio técnico actualizado.");
        return;
      }
      setCriteriosTecnicos([...values.criteriosTecnicos, next]);
      toast.success("Criterio técnico agregado.");
      return;
    }

    const next = criterio as CriterioEvalEconomica;
    if (dialogMode === "edit") {
      setCriteriosEconomicos(values.criteriosEconomicos.map((c) => (c.id === next.id ? next : c)));
      toast.success("Criterio económico actualizado.");
      return;
    }
    setCriteriosEconomicos([...values.criteriosEconomicos, next]);
    toast.success("Criterio económico agregado.");
  };

  const handleSaveDraft = () => {
    if (readOnly) return;
    setIsSaving(true);
    try {
      persist(expedienteId, { values, status: "draft" });
      saveMicromoduleDraft("evaluacion-tecnica-economica");
      toast.success("Borrador de evaluación técnica y económica guardado.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = () => {
    if (readOnly || !canSubmit) return;
    setIsSaving(true);
    try {
      persist(expedienteId, { values, status: "completed" });
      completeMicromodule("evaluacion-tecnica-economica");
      setSuccessOpen(true);
    } finally {
      setIsSaving(false);
    }
  };

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Cargando evaluación técnica y económica...
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-5xl space-y-4 px-0 pb-8">
        <div className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-4 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-navy">
            <ChartPie className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-[20px] font-bold leading-tight text-color-titulos md:text-[22px]">
              {EVALUACION_TE_WIZARD_TITLE}
            </h1>
          </div>
        </div>

        {/* Una sola card: bolsa + tabs + umbral/lista */}
        <div className="rounded-lg border border-border bg-card shadow-sm">
          <div className="border-b border-border px-4 py-4 md:px-6">
            <BolsaCompartidaBar
              totalMatriz={totalMatriz}
              totalTecnica={totalTecnica}
              totalEconomica={totalEconomica}
            />
          </div>

          <div className="px-4 pt-4 md:px-6">
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as EvaluacionLado)}
              className="w-full"
            >
              <TabsList className="grid h-11 w-full grid-cols-2 gap-1 rounded-xl border border-border bg-muted p-1 shadow-inner">
                <TabsTrigger value="tecnica" className={evaluacionTabTriggerClassName}>
                  Evaluación Técnica
                </TabsTrigger>
                <TabsTrigger value="economica" className={evaluacionTabTriggerClassName}>
                  Evaluación Económica
                </TabsTrigger>
              </TabsList>

              <TabsContent value="tecnica" className="mt-0 outline-none">
                <div className="py-4 md:py-6">
                  <EvaluacionTabPanel
                    lado="tecnica"
                    totalSeccion={totalTecnica}
                    umbral={values.puntuacionMinimaEvaluacionTecnicaAuAu}
                    emptyTitle={EVALUACION_TE_EMPTY_TECNICA_TITLE}
                    emptyDescription={EVALUACION_TE_EMPTY_TECNICA_DESCRIPTION}
                    addLabel="Agregar Criterio Técnico"
                    criteriosTecnicos={values.criteriosTecnicos}
                    readOnly={readOnly}
                    onUmbralChange={(value) =>
                      setValues((prev) => ({
                        ...prev,
                        puntuacionMinimaEvaluacionTecnicaAuAu: value,
                      }))
                    }
                    onUmbralBlur={() =>
                      setValues((prev) => ({
                        ...prev,
                        puntuacionMinimaEvaluacionTecnicaAuAu: clampUmbral(
                          "tecnica",
                          prev.puntuacionMinimaEvaluacionTecnicaAuAu
                        ),
                      }))
                    }
                    onAdd={() => openCreate("tecnica")}
                    onEdit={(id) => openEdit("tecnica", id)}
                    onRemove={(id) =>
                      setCriteriosTecnicos(values.criteriosTecnicos.filter((c) => c.id !== id))
                    }
                  />
                </div>
              </TabsContent>

              <TabsContent value="economica" className="mt-0 outline-none">
                <div className="py-4 md:py-6">
                  <EvaluacionTabPanel
                    lado="economica"
                    totalSeccion={totalEconomica}
                    umbral={values.puntuacionMinimaEvaluacionEconomicaAuAu}
                    emptyTitle={EVALUACION_TE_EMPTY_ECONOMICA_TITLE}
                    emptyDescription={EVALUACION_TE_EMPTY_ECONOMICA_DESCRIPTION}
                    addLabel="Agregar Criterio Económico"
                    criteriosEconomicos={values.criteriosEconomicos}
                    readOnly={readOnly}
                    onUmbralChange={(value) =>
                      setValues((prev) => ({
                        ...prev,
                        puntuacionMinimaEvaluacionEconomicaAuAu: value,
                      }))
                    }
                    onUmbralBlur={() =>
                      setValues((prev) => ({
                        ...prev,
                        puntuacionMinimaEvaluacionEconomicaAuAu: clampUmbral(
                          "economica",
                          prev.puntuacionMinimaEvaluacionEconomicaAuAu
                        ),
                      }))
                    }
                    onAdd={() => openCreate("economica")}
                    onEdit={(id) => openEdit("economica", id)}
                    onRemove={(id) =>
                      setCriteriosEconomicos(values.criteriosEconomicos.filter((c) => c.id !== id))
                    }
                  />
                </div>
              </TabsContent>
            </Tabs>
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
                {EVALUACION_TE_DRAFT_LABEL}
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
                        {EVALUACION_TE_SUBMIT_LABEL}
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {!canSubmit ? (
                    <TooltipContent className="max-w-xs text-xs">
                      <p>{EVALUACION_TE_SUBMIT_DISABLED_HINT}</p>
                      {issues[0] &&
                      issues[0] !== EVALUACION_TE_SUBMIT_DISABLED_HINT &&
                      !issues[0].includes("Too small") ? (
                        <p className="mt-1 text-muted-foreground">{issues[0]}</p>
                      ) : null}
                    </TooltipContent>
                  ) : null}
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </div>
      </div>

      <CriterioEvaluacionDialog
        open={dialogOpen}
        mode={dialogMode}
        lado={dialogLado}
        initial={editingCriterio}
        matrixTotal={totalMatriz}
        readOnly={readOnly}
        onOpenChange={setDialogOpen}
        onSave={handleSaveCriterio}
      />

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
          <AlertDialogTitle className="sr-only">{EVALUACION_TE_SUCCESS_TITLE}</AlertDialogTitle>
          <AlertDialogDescription className="sr-only">
            {EVALUACION_TE_SUCCESS_DESCRIPTION}
          </AlertDialogDescription>
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success-bg">
              <CheckCircle2 className="h-7 w-7 text-success" strokeWidth={2} />
            </div>
            <h2 className="text-lg font-bold text-color-titulos">{EVALUACION_TE_SUCCESS_TITLE}</h2>
            <p className="mt-2 max-w-[280px] text-xs leading-relaxed text-muted-foreground">
              {EVALUACION_TE_SUCCESS_DESCRIPTION}
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

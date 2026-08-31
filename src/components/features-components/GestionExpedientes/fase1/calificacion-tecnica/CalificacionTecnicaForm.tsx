"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, ClipboardCheck, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  CALIFICACION_TECNICA_DRAFT_LABEL,
  CALIFICACION_TECNICA_EMPTY_DESCRIPTION,
  CALIFICACION_TECNICA_EMPTY_TITLE,
  CALIFICACION_TECNICA_SUBMIT_DISABLED_HINT,
  CALIFICACION_TECNICA_SUBMIT_LABEL,
  CALIFICACION_TECNICA_SUCCESS_DESCRIPTION,
  CALIFICACION_TECNICA_SUCCESS_TITLE,
  CALIFICACION_TECNICA_WIZARD_TITLE,
  createDefaultCalificacionTecnicaValues,
  getCalificacionTecnicaFormStorageKey,
  roundPts,
  type CalificacionTecnicaFormValues,
  type CalificacionTecnicaStoredForm,
  type CriterioTecnico,
} from "@/lib/constants/calificacionTecnica";
import {
  canSubmitCalificacionTecnica,
  getCalificacionTecnicaIssues,
  getTotalPonderacion,
} from "@/lib/schemas/calificacionTecnicaSchema";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CriterioTecnicoListItem } from "./CriterioTecnicoCard";
import { CriterioTecnicoDialog } from "./CriterioTecnicoDialog";
import { PonderacionTotalSticky } from "./PonderacionTotalSticky";

export interface CalificacionTecnicaFormProps {
  expedienteId: string;
  readOnly?: boolean;
  basePath?: string;
}

function loadStored(expedienteId: string): CalificacionTecnicaStoredForm {
  const defaults = createDefaultCalificacionTecnicaValues();
  if (typeof window === "undefined") {
    return { values: defaults, status: "draft" };
  }
  try {
    const raw = window.localStorage.getItem(getCalificacionTecnicaFormStorageKey(expedienteId));
    if (!raw) return { values: defaults, status: "draft" };
    const parsed = JSON.parse(raw) as Partial<CalificacionTecnicaStoredForm>;
    const incoming = parsed.values;
    return {
      values: {
        ...defaults,
        ...(incoming ?? {}),
        criterios: Array.isArray(incoming?.criterios) ? incoming.criterios : [],
        puntuacionMinimaCalifTecnicaAuAu:
          typeof incoming?.puntuacionMinimaCalifTecnicaAuAu === "number"
            ? incoming.puntuacionMinimaCalifTecnicaAuAu
            : defaults.puntuacionMinimaCalifTecnicaAuAu,
      },
      status: parsed.status === "completed" ? "completed" : "draft",
    };
  } catch {
    return { values: defaults, status: "draft" };
  }
}

function persist(expedienteId: string, payload: CalificacionTecnicaStoredForm) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    getCalificacionTecnicaFormStorageKey(expedienteId),
    JSON.stringify(payload)
  );
}

export function CalificacionTecnicaForm({
  expedienteId,
  readOnly = false,
  basePath = "/gestion-expedientes",
}: CalificacionTecnicaFormProps) {
  const router = useRouter();
  const { completeMicromodule, saveMicromoduleDraft } = useFase1InicialState(expedienteId);

  const [hydrated, setHydrated] = useState(false);
  const [values, setValues] = useState<CalificacionTecnicaFormValues>(
    createDefaultCalificacionTecnicaValues
  );
  const [isSaving, setIsSaving] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingCriterio, setEditingCriterio] = useState<CriterioTecnico | null>(null);

  useEffect(() => {
    setValues(loadStored(expedienteId).values);
    setHydrated(true);
  }, [expedienteId]);

  const goToPanel = useCallback(() => {
    router.push(expedienteFase1TabPath(basePath, expedienteId));
  }, [basePath, expedienteId, router]);

  const total = useMemo(() => getTotalPonderacion(values), [values]);
  const canSubmit = useMemo(() => canSubmitCalificacionTecnica(values), [values]);
  const issues = useMemo(() => getCalificacionTecnicaIssues(values), [values]);

  const setCriterios = (criterios: CriterioTecnico[]) => {
    setValues((prev) => {
      const nextTotal = roundPts(
        criterios.reduce(
          (acc, c) => acc + (Number(c.puntuacionCriterioCalificacionTecnicaAuAu) || 0),
          0
        )
      );
      const umbral =
        nextTotal > 0
          ? Math.min(prev.puntuacionMinimaCalifTecnicaAuAu, nextTotal)
          : prev.puntuacionMinimaCalifTecnicaAuAu;
      return {
        criterios,
        puntuacionMinimaCalifTecnicaAuAu: umbral,
      };
    });
  };

  const openCreate = () => {
    if (readOnly) return;
    setDialogMode("create");
    setEditingCriterio(null);
    setDialogOpen(true);
  };

  const openEdit = (criterio: CriterioTecnico) => {
    setDialogMode("edit");
    setEditingCriterio(criterio);
    setDialogOpen(true);
  };

  const handleSaveCriterio = (criterio: CriterioTecnico) => {
    if (dialogMode === "edit") {
      setCriterios(values.criterios.map((c) => (c.id === criterio.id ? criterio : c)));
      toast.success("Criterio actualizado.");
      return;
    }
    setCriterios([...values.criterios, criterio]);
    toast.success("Criterio agregado a la matriz.");
  };

  const handleSaveDraft = () => {
    if (readOnly) return;
    setIsSaving(true);
    try {
      persist(expedienteId, { values, status: "draft" });
      saveMicromoduleDraft("calificacion-tecnica");
      toast.success("Borrador de calificación técnica guardado.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = () => {
    if (readOnly || !canSubmit) return;
    setIsSaving(true);
    try {
      persist(expedienteId, { values, status: "completed" });
      completeMicromodule("calificacion-tecnica");
      setSuccessOpen(true);
    } finally {
      setIsSaving(false);
    }
  };

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Cargando calificación técnica...
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-5xl space-y-4 px-0 pb-8">
        <div className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-4 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-navy">
            <ClipboardCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-[20px] font-bold leading-tight text-color-titulos md:text-[22px]">
              {CALIFICACION_TECNICA_WIZARD_TITLE}
            </h1>
          </div>
        </div>

        {/* Una sola card: ponderación/umbral + matriz (sin sticky) */}
        <div className="rounded-lg border border-border bg-card shadow-sm">
          <div className="border-b border-border px-4 py-4 md:px-6">
            <PonderacionTotalSticky
              total={total}
              umbral={values.puntuacionMinimaCalifTecnicaAuAu}
              readOnly={readOnly}
              onUmbralChange={(value) =>
                setValues((prev) => ({
                  ...prev,
                  puntuacionMinimaCalifTecnicaAuAu: value,
                }))
              }
            />
          </div>

          <div className="space-y-5 p-4 md:p-6">
            {values.criterios.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
                <ClipboardCheck className="mb-3 h-10 w-10 text-muted-foreground" />
                <p className="text-sm font-bold text-color-titulos">
                  {CALIFICACION_TECNICA_EMPTY_TITLE}
                </p>
                <p className="mt-1 max-w-md text-xs leading-relaxed text-muted-foreground">
                  {CALIFICACION_TECNICA_EMPTY_DESCRIPTION}
                </p>
                {!readOnly ? (
                  <Button
                    type="button"
                    onClick={openCreate}
                    className="mt-4 bg-navy text-white hover:bg-navy-hover"
                  >
                    <Plus className="mr-1.5 h-4 w-4" />
                    Agregar Criterio
                  </Button>
                ) : null}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-bold text-color-titulos">Criterios de la matriz</p>
                {values.criterios.map((criterio, index) => (
                  <CriterioTecnicoListItem
                    key={criterio.id}
                    index={index}
                    criterio={criterio}
                    readOnly={readOnly}
                    onEdit={() => openEdit(criterio)}
                    onRemove={() =>
                      setCriterios(values.criterios.filter((c) => c.id !== criterio.id))
                    }
                  />
                ))}
                {!readOnly ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={openCreate}
                    className="w-full border-dashed border-navy/40 text-navy hover:bg-muted"
                  >
                    <Plus className="mr-1.5 h-4 w-4" />
                    Agregar nuevo criterio
                  </Button>
                ) : null}
              </div>
            )}
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
                {CALIFICACION_TECNICA_DRAFT_LABEL}
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
                        {CALIFICACION_TECNICA_SUBMIT_LABEL}
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {!canSubmit ? (
                    <TooltipContent className="max-w-xs text-xs">
                      <p>{CALIFICACION_TECNICA_SUBMIT_DISABLED_HINT}</p>
                      {issues[0] ? <p className="mt-1 text-muted-foreground">{issues[0]}</p> : null}
                    </TooltipContent>
                  ) : null}
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </div>
      </div>

      <CriterioTecnicoDialog
        open={dialogOpen}
        mode={dialogMode}
        initial={editingCriterio}
        matrixTotal={total}
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
          <AlertDialogTitle className="sr-only">
            {CALIFICACION_TECNICA_SUCCESS_TITLE}
          </AlertDialogTitle>
          <AlertDialogDescription className="sr-only">
            {CALIFICACION_TECNICA_SUCCESS_DESCRIPTION}
          </AlertDialogDescription>
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success-bg">
              <CheckCircle2 className="h-7 w-7 text-success" strokeWidth={2} />
            </div>
            <h2 className="text-lg font-bold text-color-titulos">
              {CALIFICACION_TECNICA_SUCCESS_TITLE}
            </h2>
            <p className="mt-2 max-w-[280px] text-xs leading-relaxed text-muted-foreground">
              {CALIFICACION_TECNICA_SUCCESS_DESCRIPTION}
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

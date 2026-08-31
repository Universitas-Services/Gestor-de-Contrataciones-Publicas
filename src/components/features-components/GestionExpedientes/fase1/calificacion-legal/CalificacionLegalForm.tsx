"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Package, PackageOpen, Scale } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  CALIFICACION_LEGAL_BANNER,
  CALIFICACION_LEGAL_DRAFT_LABEL,
  CALIFICACION_LEGAL_SUBMIT_DISABLED_HINT,
  CALIFICACION_LEGAL_SUBMIT_LABEL,
  CALIFICACION_LEGAL_SUCCESS_DESCRIPTION,
  CALIFICACION_LEGAL_SUCCESS_TITLE,
  CALIFICACION_LEGAL_WIZARD_TITLE,
  createEmptyCalificacionLegalForm,
  getCalificacionLegalFormStorageKey,
  getRecaudosBySobre,
  RECAUDOS_CALIFICACION_LEGAL,
  type CalificacionLegalStoredForm,
  type RecaudoPersonalizadoItem,
} from "@/lib/constants/calificacionLegal";
import { getAspectosGeneralesFormStorageKey } from "@/lib/constants/aspectosGenerales";
import { getCalificacionLegalValidationIssues } from "@/lib/schemas/calificacionLegalSchema";
import {
  expedienteFase1TabPath,
  getActividadesPreviasFormStorageKey,
} from "@/lib/utils/fase1InicialRoutes";
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
import { ModeloDocumentoDialog, type ModeloPreviewPayload } from "./ModeloDocumentoDialog";
import { RecaudoExigirCard } from "./RecaudoExigirCard";
import { RecaudoPersonalizadoCard } from "./RecaudoPersonalizadoCard";
import { RecaudoPersonalizadoPanel } from "./RecaudoPersonalizadoPanel";

export interface CalificacionLegalFormProps {
  expedienteId: string;
  readOnly?: boolean;
  basePath?: string;
}

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const sobreTabTriggerClassName = [
  "h-full w-full cursor-pointer rounded-lg border border-transparent bg-transparent px-3 text-sm font-semibold text-slate-500 shadow-none transition-all duration-200 ease-in-out after:hidden",
  "hover:bg-white/80 hover:text-slate-700",
  "data-[state=active]:border-navy/15 data-[state=active]:bg-navy data-[state=active]:text-white data-[state=active]:shadow-sm",
  "focus-visible:ring-0 focus-visible:ring-offset-0",
].join(" ");

function readJsonFlag(storageKey: string, field: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { values?: Record<string, unknown> };
    return parsed.values?.[field] === true;
  } catch {
    return false;
  }
}

function loadStoredForm(expedienteId: string): CalificacionLegalStoredForm {
  const empty = createEmptyCalificacionLegalForm();
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.localStorage.getItem(getCalificacionLegalFormStorageKey(expedienteId));
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<CalificacionLegalStoredForm>;
    const exigidos = { ...empty.exigidos, ...(parsed.exigidos ?? {}) };

    // Default antiguo dejaba todos en false (NO marcado). Migrar a sin selección.
    const allLegacyNo = RECAUDOS_CALIFICACION_LEGAL.every((r) => exigidos[r.id] === false);
    if (allLegacyNo) {
      for (const recaudo of RECAUDOS_CALIFICACION_LEGAL) {
        exigidos[recaudo.id] = undefined;
      }
    }

    return {
      ...empty,
      ...parsed,
      exigidos,
      sustitutos: { ...empty.sustitutos, ...(parsed.sustitutos ?? {}) },
      personalizados: Array.isArray(parsed.personalizados) ? parsed.personalizados : [],
      indOtroSobre1:
        parsed.indOtroSobre1 === true || parsed.indOtroSobre1 === false
          ? parsed.indOtroSobre1
          : undefined,
      indOtroSobre2:
        parsed.indOtroSobre2 === true || parsed.indOtroSobre2 === false
          ? parsed.indOtroSobre2
          : undefined,
      modeloOtroSobre1:
        parsed.modeloOtroSobre1 === true || parsed.modeloOtroSobre1 === false
          ? parsed.modeloOtroSobre1
          : undefined,
      modeloOtroSobre2:
        parsed.modeloOtroSobre2 === true || parsed.modeloOtroSobre2 === false
          ? parsed.modeloOtroSobre2
          : undefined,
      status: parsed.status === "completed" ? "completed" : "draft",
    };
  } catch {
    return empty;
  }
}

function persistForm(expedienteId: string, form: CalificacionLegalStoredForm) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    getCalificacionLegalFormStorageKey(expedienteId),
    JSON.stringify(form)
  );
}

function applyAutoFlags(
  form: CalificacionLegalStoredForm,
  flags: { van: boolean; fianza: boolean }
): CalificacionLegalStoredForm {
  const exigidos = { ...form.exigidos };
  for (const recaudo of RECAUDOS_CALIFICACION_LEGAL) {
    if (recaudo.autoFrom === "requiereVanAuAu" && flags.van) {
      exigidos[recaudo.id] = true;
    }
    if (recaudo.autoFrom === "requiereGarantiaLaboralAuAu" && flags.fianza) {
      exigidos[recaudo.id] = true;
    }
  }
  return { ...form, exigidos };
}

export function CalificacionLegalForm({
  expedienteId,
  readOnly = false,
  basePath = "/gestion-expedientes",
}: CalificacionLegalFormProps) {
  const router = useRouter();
  const { completeMicromodule, saveMicromoduleDraft } = useFase1InicialState(expedienteId);

  const [hydrated, setHydrated] = useState(false);
  const [form, setForm] = useState<CalificacionLegalStoredForm>(createEmptyCalificacionLegalForm);
  const [autoVan, setAutoVan] = useState(false);
  const [autoFianza, setAutoFianza] = useState(false);
  const [activeTab, setActiveTab] = useState("sobre-1");
  const [isSaving, setIsSaving] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [modeloOpen, setModeloOpen] = useState(false);
  const [modeloPayload, setModeloPayload] = useState<ModeloPreviewPayload | null>(null);

  useEffect(() => {
    const van = readJsonFlag(getActividadesPreviasFormStorageKey(expedienteId), "requiereVanAuAu");
    const fianza = readJsonFlag(
      getAspectosGeneralesFormStorageKey(expedienteId),
      "requiereGarantiaLaboralAuAu"
    );
    setAutoVan(van);
    setAutoFianza(fianza);
    setForm(applyAutoFlags(loadStoredForm(expedienteId), { van, fianza }));
    setHydrated(true);
  }, [expedienteId]);

  const goToPanel = useCallback(() => {
    router.push(expedienteFase1TabPath(basePath, expedienteId));
  }, [basePath, expedienteId, router]);

  const validationIssues = useMemo(() => getCalificacionLegalValidationIssues(form), [form]);
  const canSubmit = validationIssues.length === 0;

  const lockedIds = useMemo(() => {
    const set = new Set<string>();
    for (const recaudo of RECAUDOS_CALIFICACION_LEGAL) {
      if (recaudo.autoFrom === "requiereVanAuAu" && autoVan) set.add(recaudo.id);
      if (recaudo.autoFrom === "requiereGarantiaLaboralAuAu" && autoFianza) set.add(recaudo.id);
    }
    return set;
  }, [autoFianza, autoVan]);

  const updateForm = (
    updater: (prev: CalificacionLegalStoredForm) => CalificacionLegalStoredForm
  ) => {
    setForm((prev) => updater(prev));
  };

  const handleExigidoChange = (id: string, value: boolean) => {
    if (lockedIds.has(id)) return;
    updateForm((prev) => {
      const exigidos = { ...prev.exigidos, [id]: value };
      const sustitutos = { ...prev.sustitutos };
      const def = RECAUDOS_CALIFICACION_LEGAL.find((r) => r.id === id);
      if (def?.substitute && !value) {
        sustitutos[def.substitute.id] = undefined;
      }
      return { ...prev, exigidos, sustitutos };
    });
  };

  const handleSubstituteChange = (id: string, value: boolean) => {
    updateForm((prev) => ({
      ...prev,
      sustitutos: { ...prev.sustitutos, [id]: value },
    }));
  };

  const handleAddPersonalizado = (sobre: 1 | 2) => {
    updateForm((prev) => {
      const desc = sobre === 1 ? prev.descOtroSobre1.trim() : prev.descOtroSobre2.trim();
      if (!desc) return prev;
      const item: RecaudoPersonalizadoItem = {
        id: createId(),
        sobre,
        descripcion: desc,
        tieneModelo: sobre === 1 ? prev.modeloOtroSobre1 === true : prev.modeloOtroSobre2 === true,
        archivo: sobre === 1 ? prev.archivoOtroSobre1 : prev.archivoOtroSobre2,
        exigido: true,
      };
      if (sobre === 1) {
        return {
          ...prev,
          personalizados: [...prev.personalizados, item],
          indOtroSobre1: undefined,
          descOtroSobre1: "",
          modeloOtroSobre1: undefined,
          archivoOtroSobre1: null,
        };
      }
      return {
        ...prev,
        personalizados: [...prev.personalizados, item],
        indOtroSobre2: undefined,
        descOtroSobre2: "",
        modeloOtroSobre2: undefined,
        archivoOtroSobre2: null,
      };
    });
    toast.success(`Recaudo personalizado agregado al Sobre N° ${sobre}.`);
  };

  const flushPendingPersonalizados = (
    current: CalificacionLegalStoredForm
  ): CalificacionLegalStoredForm => {
    let next = current;
    if (next.indOtroSobre1 === true && next.descOtroSobre1.trim()) {
      const item: RecaudoPersonalizadoItem = {
        id: createId(),
        sobre: 1,
        descripcion: next.descOtroSobre1.trim(),
        tieneModelo: next.modeloOtroSobre1 === true,
        archivo: next.archivoOtroSobre1,
        exigido: true,
      };
      next = {
        ...next,
        personalizados: [...next.personalizados, item],
        indOtroSobre1: undefined,
        descOtroSobre1: "",
        modeloOtroSobre1: undefined,
        archivoOtroSobre1: null,
      };
    }
    if (next.indOtroSobre2 === true && next.descOtroSobre2.trim()) {
      const item: RecaudoPersonalizadoItem = {
        id: createId(),
        sobre: 2,
        descripcion: next.descOtroSobre2.trim(),
        tieneModelo: next.modeloOtroSobre2 === true,
        archivo: next.archivoOtroSobre2,
        exigido: true,
      };
      next = {
        ...next,
        personalizados: [...next.personalizados, item],
        indOtroSobre2: undefined,
        descOtroSobre2: "",
        modeloOtroSobre2: undefined,
        archivoOtroSobre2: null,
      };
    }
    return next;
  };

  const handleSaveDraft = () => {
    if (readOnly) return;
    setIsSaving(true);
    try {
      const payload = { ...form, status: "draft" as const };
      persistForm(expedienteId, payload);
      setForm(payload);
      saveMicromoduleDraft("calificacion-legal");
      toast.success("Borrador de calificación legal guardado.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfigurar = () => {
    if (readOnly || !canSubmit) return;
    setIsSaving(true);
    try {
      const flushed = flushPendingPersonalizados(form);
      const payload = { ...flushed, status: "completed" as const };
      persistForm(expedienteId, payload);
      setForm(payload);
      completeMicromodule("calificacion-legal");
      setSuccessOpen(true);
    } finally {
      setIsSaving(false);
    }
  };

  const openModelo = (payload: ModeloPreviewPayload) => {
    setModeloPayload(payload);
    setModeloOpen(true);
  };

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Cargando calificación legal...
      </div>
    );
  }

  const renderSobre = (sobre: 1 | 2) => {
    const recaudos = getRecaudosBySobre(sobre);
    const customs = form.personalizados.filter((p) => p.sobre === sobre);

    return (
      <div className="space-y-4">
        <h2 className="text-base font-bold text-color-titulos">
          {sobre === 1
            ? "Recaudos Legales y Financieros (Sobre N° 1)"
            : "Oferta Técnica y Económica (Sobre N° 2)"}
        </h2>

        <div className="space-y-3">
          {recaudos.map((recaudo) => (
            <RecaudoExigirCard
              key={recaudo.id}
              recaudo={recaudo}
              exigido={form.exigidos[recaudo.id]}
              substituteValue={
                recaudo.substitute ? form.sustitutos[recaudo.substitute.id] : undefined
              }
              locked={lockedIds.has(recaudo.id)}
              readOnly={readOnly}
              onExigidoChange={(value) => handleExigidoChange(recaudo.id, value)}
              onSubstituteChange={
                recaudo.substitute
                  ? (value) => handleSubstituteChange(recaudo.substitute!.id, value)
                  : undefined
              }
              onVerModelo={openModelo}
            />
          ))}

          {customs.map((item) => (
            <RecaudoPersonalizadoCard
              key={item.id}
              item={item}
              readOnly={readOnly}
              onRemove={(id) =>
                updateForm((prev) => ({
                  ...prev,
                  personalizados: prev.personalizados.filter((p) => p.id !== id),
                }))
              }
              onVerModelo={openModelo}
            />
          ))}
        </div>

        <RecaudoPersonalizadoPanel
          sobre={sobre}
          indOtro={sobre === 1 ? form.indOtroSobre1 : form.indOtroSobre2}
          descripcion={sobre === 1 ? form.descOtroSobre1 : form.descOtroSobre2}
          quiereModelo={sobre === 1 ? form.modeloOtroSobre1 : form.modeloOtroSobre2}
          archivo={sobre === 1 ? form.archivoOtroSobre1 : form.archivoOtroSobre2}
          readOnly={readOnly}
          onIndOtroChange={(value) =>
            updateForm((prev) =>
              sobre === 1 ? { ...prev, indOtroSobre1: value } : { ...prev, indOtroSobre2: value }
            )
          }
          onDescripcionChange={(value) =>
            updateForm((prev) =>
              sobre === 1 ? { ...prev, descOtroSobre1: value } : { ...prev, descOtroSobre2: value }
            )
          }
          onQuiereModeloChange={(value) =>
            updateForm((prev) =>
              sobre === 1
                ? {
                    ...prev,
                    modeloOtroSobre1: value,
                    archivoOtroSobre1: value ? prev.archivoOtroSobre1 : null,
                  }
                : {
                    ...prev,
                    modeloOtroSobre2: value,
                    archivoOtroSobre2: value ? prev.archivoOtroSobre2 : null,
                  }
            )
          }
          onArchivoChange={(meta) =>
            updateForm((prev) =>
              sobre === 1
                ? { ...prev, archivoOtroSobre1: meta }
                : { ...prev, archivoOtroSobre2: meta }
            )
          }
          onAdd={() => handleAddPersonalizado(sobre)}
        />
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="w-full space-y-4 px-4 py-6 md:px-6">
        <div className="mx-auto w-full max-w-5xl space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-4 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-navy">
              <Scale className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-[20px] font-bold leading-tight text-color-titulos md:text-[22px]">
                {CALIFICACION_LEGAL_WIZARD_TITLE}
              </h1>
            </div>
          </div>

          <div className="flex gap-3 rounded-lg border border-navy/25 bg-sky-50 px-4 py-3 text-sm text-foreground">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-navy" />
            <p className="leading-relaxed">
              <strong className="text-navy">Atención:</strong>{" "}
              {CALIFICACION_LEGAL_BANNER.replace(/^Atención:\s*/i, "")}
            </p>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex w-full flex-col gap-4"
          >
            <TabsList className="mx-auto grid h-11 w-full max-w-3xl grid-cols-2 gap-1 rounded-xl border border-slate-200/80 bg-slate-50 p-1 shadow-inner">
              <TabsTrigger value="sobre-1" className={sobreTabTriggerClassName}>
                <Package className="h-4 w-4 shrink-0" />
                <span className="truncate">Sobre N° 1 (Legal / Financiero)</span>
              </TabsTrigger>
              <TabsTrigger value="sobre-2" className={sobreTabTriggerClassName}>
                <PackageOpen className="h-4 w-4 shrink-0" />
                <span className="truncate">Sobre N° 2 (Técnico / Económico)</span>
              </TabsTrigger>
            </TabsList>

            <div className="rounded-lg border border-border bg-card p-4 shadow-sm md:p-6">
              <TabsContent value="sobre-1" className="mt-0">
                {renderSobre(1)}
              </TabsContent>
              <TabsContent value="sobre-2" className="mt-0">
                {renderSobre(2)}
              </TabsContent>
            </div>
          </Tabs>

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
                  {CALIFICACION_LEGAL_DRAFT_LABEL}
                </Button>

                <TooltipProvider delayDuration={150}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex">
                        <Button
                          type="button"
                          disabled={isSaving || !canSubmit}
                          onClick={handleConfigurar}
                          className="bg-navy text-white hover:bg-navy-hover"
                        >
                          {CALIFICACION_LEGAL_SUBMIT_LABEL}
                        </Button>
                      </span>
                    </TooltipTrigger>
                    {!canSubmit ? (
                      <TooltipContent className="max-w-xs text-xs">
                        <p>{CALIFICACION_LEGAL_SUBMIT_DISABLED_HINT}</p>
                        {validationIssues[0] ? (
                          <p className="mt-1 text-muted-foreground">{validationIssues[0]}</p>
                        ) : null}
                      </TooltipContent>
                    ) : null}
                  </Tooltip>
                </TooltipProvider>
              </>
            )}
          </div>
        </div>
      </div>

      <ModeloDocumentoDialog
        open={modeloOpen}
        onOpenChange={(open) => {
          setModeloOpen(open);
          if (!open) setModeloPayload(null);
        }}
        payload={modeloPayload}
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
            {CALIFICACION_LEGAL_SUCCESS_TITLE}
          </AlertDialogTitle>
          <AlertDialogDescription className="sr-only">
            {CALIFICACION_LEGAL_SUCCESS_DESCRIPTION}
          </AlertDialogDescription>
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success-bg">
              <CheckCircle2 className="h-7 w-7 text-success" strokeWidth={2} />
            </div>
            <h2 className="text-lg font-bold text-color-titulos">
              {CALIFICACION_LEGAL_SUCCESS_TITLE}
            </h2>
            <p className="mt-2 max-w-[280px] text-xs leading-relaxed text-muted-foreground">
              {CALIFICACION_LEGAL_SUCCESS_DESCRIPTION}
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

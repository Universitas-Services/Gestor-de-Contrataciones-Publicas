"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Scale } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";

import {
  ASPECTOS_GENERALES_DRAFT_LABEL,
  ASPECTOS_GENERALES_STEPS,
  ASPECTOS_GENERALES_SUBMIT_DISABLED_TOOLTIP,
  ASPECTOS_GENERALES_SUBMIT_LABEL,
  ASPECTOS_GENERALES_SUCCESS_DESCRIPTION,
  ASPECTOS_GENERALES_SUCCESS_TITLE,
  ASPECTOS_GENERALES_WIZARD_DESCRIPTION,
  ASPECTOS_GENERALES_WIZARD_TITLE,
  createAspectosGeneralesDefaultValues,
  getAspectosGeneralesFormStorageKey,
  getAspectosGeneralesStepFields,
  type AspectosGeneralesStoredForm,
} from "@/lib/constants/aspectosGenerales";
import {
  aspectosGeneralesFormSchema,
  type AspectosGeneralesFormInputValues,
} from "@/lib/schemas/aspectosGeneralesSchema";
import { expedienteFase1TabPath } from "@/lib/utils/fase1InicialRoutes";
import { cn } from "@/lib/utils";
import { useFase1InicialState } from "@/components/features-components/GestionExpedientes/fase1/hooks/useFase1InicialState";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AspectosGeneralesStepProgressBar } from "./AspectosGeneralesStepProgressBar";
import { Paso1RegimenLegalStep } from "./steps/Paso1RegimenLegalStep";
import { Paso2CondicionesOfertaStep } from "./steps/Paso2CondicionesOfertaStep";
import { Paso3ResponsabilidadSocialStep } from "./steps/Paso3ResponsabilidadSocialStep";
import { Paso4GarantiasAnticiposStep } from "./steps/Paso4GarantiasAnticiposStep";

export interface AspectosGeneralesFormProps {
  expedienteId: string;
  readOnly?: boolean;
  basePath?: string;
}

function scrollToTop() {
  if (typeof window === "undefined") return;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function loadStoredForm(
  expedienteId: string,
  defaults: AspectosGeneralesFormInputValues
): AspectosGeneralesStoredForm {
  if (typeof window === "undefined") {
    return { values: defaults, currentStep: 1, status: "draft" };
  }

  try {
    const raw = window.localStorage.getItem(getAspectosGeneralesFormStorageKey(expedienteId));
    if (!raw) return { values: defaults, currentStep: 1, status: "draft" };
    const parsed = JSON.parse(raw) as AspectosGeneralesStoredForm;
    if (!parsed?.values) return { values: defaults, currentStep: 1, status: "draft" };
    return {
      values: {
        ...defaults,
        ...parsed.values,
        normativaLegalAuAu: Array.isArray(parsed.values.normativaLegalAuAu)
          ? parsed.values.normativaLegalAuAu
          : defaults.normativaLegalAuAu,
      },
      currentStep: parsed.currentStep ?? 1,
      status: parsed.status === "completed" ? "completed" : "draft",
    };
  } catch {
    return { values: defaults, currentStep: 1, status: "draft" };
  }
}

function persistForm(expedienteId: string, payload: AspectosGeneralesStoredForm) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    getAspectosGeneralesFormStorageKey(expedienteId),
    JSON.stringify(payload)
  );
}

export function AspectosGeneralesForm({
  expedienteId,
  readOnly = false,
  basePath = "/gestion-expedientes",
}: AspectosGeneralesFormProps) {
  const router = useRouter();
  const { completeMicromodule, saveMicromoduleDraft } = useFase1InicialState(expedienteId);
  const defaultValues = useMemo(() => createAspectosGeneralesDefaultValues(), []);

  const [currentStep, setCurrentStep] = useState(1);
  const [hydrated, setHydrated] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const skipPersistRef = useRef(false);

  const form = useForm<AspectosGeneralesFormInputValues>({
    resolver: zodResolver(
      aspectosGeneralesFormSchema
    ) as unknown as Resolver<AspectosGeneralesFormInputValues>,
    mode: "onTouched",
    shouldUnregister: false,
    defaultValues,
  });

  useEffect(() => {
    const stored = loadStoredForm(expedienteId, defaultValues);
    form.reset(stored.values);
    setCurrentStep(stored.currentStep);
    setHydrated(true);
  }, [defaultValues, expedienteId, form]);

  const values = form.watch();

  useEffect(() => {
    if (!hydrated || skipPersistRef.current) return;
    persistForm(expedienteId, {
      values,
      currentStep,
      status: "draft",
    });
  }, [currentStep, expedienteId, hydrated, values]);

  const totalSteps = ASPECTOS_GENERALES_STEPS.length;
  const isLastStep = currentStep === totalSteps;
  const canSubmit = hydrated && !readOnly && aspectosGeneralesFormSchema.safeParse(values).success;

  const goToPanel = useCallback(() => {
    router.push(expedienteFase1TabPath(basePath, expedienteId));
  }, [basePath, expedienteId, router]);

  const validateCurrentStep = useCallback(async () => {
    const fields = getAspectosGeneralesStepFields(currentStep, form.getValues());
    return form.trigger(fields as Parameters<typeof form.trigger>[0], { shouldFocus: true });
  }, [currentStep, form]);

  const handleBack = () => {
    if (currentStep <= 1) return;
    setCurrentStep((prev) => prev - 1);
    scrollToTop();
  };

  const handleSaveDraft = () => {
    if (readOnly) return;
    setIsSaving(true);
    try {
      skipPersistRef.current = true;
      persistForm(expedienteId, {
        values: form.getValues(),
        currentStep,
        status: "draft",
      });
      saveMicromoduleDraft("aspectos-generales-pliego");
      toast.success("Borrador de aspectos generales guardado.");
      goToPanel();
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    if (readOnly) {
      if (isLastStep) {
        goToPanel();
        return;
      }
      setCurrentStep((prev) => prev + 1);
      scrollToTop();
      return;
    }

    const isValid = await validateCurrentStep();
    if (!isValid) return;

    setCurrentStep((prev) => prev + 1);
    scrollToTop();
  };

  const handleSubmit = async () => {
    if (readOnly) return;
    setIsSaving(true);
    try {
      const isValid = await form.trigger(undefined, { shouldFocus: true });
      if (!isValid) {
        toast.error("Revise los campos pendientes antes de finalizar.");
        return;
      }

      skipPersistRef.current = true;
      persistForm(expedienteId, {
        values: form.getValues(),
        currentStep: totalSteps,
        status: "completed",
      });
      completeMicromodule("aspectos-generales-pliego");
      setIsConfirmOpen(true);
    } finally {
      setIsSaving(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <Paso1RegimenLegalStep form={form} readOnly={readOnly} />;
      case 2:
        return <Paso2CondicionesOfertaStep form={form} readOnly={readOnly} />;
      case 3:
        return <Paso3ResponsabilidadSocialStep form={form} readOnly={readOnly} />;
      case 4:
        return <Paso4GarantiasAnticiposStep form={form} readOnly={readOnly} />;
      default:
        return <Paso1RegimenLegalStep form={form} readOnly={readOnly} />;
    }
  };

  return (
    <div className="w-full">
      <div className="w-full py-6">
        <div className="mx-auto max-w-5xl">
          <Card className="gap-0 overflow-hidden border-border bg-card py-0 shadow-sm">
            <div className="flex items-start gap-3 border-b border-border px-5 py-5 md:px-8">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-navy">
                <Scale className="h-5 w-5" />
              </div>
              <div className="min-w-0 space-y-1">
                <h1 className="text-[20px] font-bold leading-tight text-color-titulos md:text-[22px]">
                  {ASPECTOS_GENERALES_WIZARD_TITLE}
                </h1>
                <p className="text-[12px] italic leading-relaxed text-muted-foreground">
                  {ASPECTOS_GENERALES_WIZARD_DESCRIPTION}
                </p>
              </div>
            </div>

            <CardContent className="p-0">
              <div className="px-5 pt-6 md:px-8">
                <AspectosGeneralesStepProgressBar currentStep={currentStep} />
              </div>

              <Form {...form}>
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                  }}
                >
                  <div className="px-5 pb-6 md:px-8 md:pb-7">{renderCurrentStep()}</div>

                  <Separator />

                  <div className="flex flex-wrap items-center justify-between gap-3 bg-card px-5 py-4 md:px-8">
                    <div className="flex flex-wrap items-center gap-2">
                      {currentStep > 1 ? (
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isSaving || isConfirmOpen}
                          onClick={handleBack}
                          className="border-border text-muted-foreground hover:bg-muted"
                        >
                          Anterior
                        </Button>
                      ) : (
                        <span />
                      )}

                      {!readOnly ? (
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isSaving || isConfirmOpen}
                          onClick={handleSaveDraft}
                          className="border-border text-muted-foreground hover:bg-muted"
                        >
                          {ASPECTOS_GENERALES_DRAFT_LABEL}
                        </Button>
                      ) : null}
                    </div>

                    <div className="flex justify-end">
                      {readOnly && isLastStep ? (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={goToPanel}
                          className="border-border text-muted-foreground hover:bg-muted"
                        >
                          Volver al panel
                        </Button>
                      ) : !isLastStep ? (
                        <Button
                          type="button"
                          disabled={isSaving || isConfirmOpen}
                          onClick={() => void handleNext()}
                          className="bg-navy text-white hover:bg-navy-hover"
                        >
                          Siguiente
                        </Button>
                      ) : readOnly ? (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={goToPanel}
                          className="border-border text-muted-foreground hover:bg-muted"
                        >
                          Volver al panel
                        </Button>
                      ) : (
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-flex">
                                <Button
                                  type="button"
                                  disabled={!canSubmit || isSaving || isConfirmOpen}
                                  onClick={() => void handleSubmit()}
                                  className={cn(
                                    "bg-navy text-white hover:bg-navy-hover disabled:opacity-50"
                                  )}
                                >
                                  {isSaving ? "Guardando..." : ASPECTOS_GENERALES_SUBMIT_LABEL}
                                </Button>
                              </span>
                            </TooltipTrigger>
                            {!canSubmit ? (
                              <TooltipContent
                                side="top"
                                className="max-w-[280px] text-center text-xs"
                              >
                                {ASPECTOS_GENERALES_SUBMIT_DISABLED_TOOLTIP}
                              </TooltipContent>
                            ) : null}
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog
        open={isConfirmOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsConfirmOpen(false);
            goToPanel();
          }
        }}
      >
        <AlertDialogContent className="max-w-[340px] rounded-xl border-border bg-card p-6 shadow-lg">
          <AlertDialogTitle className="sr-only">
            {ASPECTOS_GENERALES_SUCCESS_TITLE}
          </AlertDialogTitle>
          <AlertDialogDescription className="sr-only">
            {ASPECTOS_GENERALES_SUCCESS_DESCRIPTION}
          </AlertDialogDescription>

          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success-bg">
              <CheckCircle2 className="h-7 w-7 text-success" strokeWidth={2} />
            </div>

            <h2 className="text-lg font-bold leading-tight text-color-titulos">
              {ASPECTOS_GENERALES_SUCCESS_TITLE}
            </h2>

            <p className="mt-2 max-w-[280px] text-xs leading-relaxed text-muted-foreground">
              {ASPECTOS_GENERALES_SUCCESS_DESCRIPTION}
            </p>

            <Button
              type="button"
              onClick={() => {
                setIsConfirmOpen(false);
                goToPanel();
              }}
              className="mt-5 w-full bg-navy text-white hover:bg-navy-hover"
            >
              Volver al panel
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

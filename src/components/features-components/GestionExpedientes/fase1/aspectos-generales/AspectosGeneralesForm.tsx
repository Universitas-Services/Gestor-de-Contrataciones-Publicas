"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  getAspectosGeneralesStepFields,
} from "@/lib/constants/aspectosGenerales";
import {
  aspectosGeneralesFormSchema,
  type AspectosGeneralesFormInputValues,
} from "@/lib/schemas/aspectosGeneralesSchema";
import { expedienteFase1TabPath } from "@/lib/utils/fase1InicialRoutes";
import { formatMicromoduloErrorMessage } from "@/lib/utils/fase1ApiError";
import {
  aspectosGeneralesFromApi,
  aspectosGeneralesToApi,
  ensureMicromoduloEditable,
} from "@/lib/utils/fase1MicromodulosMapper";
import {
  completarMicromodulo,
  guardarBorradorMicromodulo,
  obtenerAspectosGenerales,
} from "@/services/fase1MicromodulosService";
import type { EstadoMicromoduloApi } from "@/types/fase1Micromodulos.types";
import { cn } from "@/lib/utils";
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
  enteId?: string;
  readOnly?: boolean;
  basePath?: string;
}

function scrollToTop() {
  if (typeof window === "undefined") return;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function getStepStorageKey(expedienteId: string): string {
  return `aspectos-generales-step:${expedienteId}`;
}

export function AspectosGeneralesForm({
  expedienteId,
  enteId,
  readOnly = false,
  basePath = "/gestion-expedientes",
}: AspectosGeneralesFormProps) {
  const router = useRouter();
  const defaultValues = useMemo(() => createAspectosGeneralesDefaultValues(), []);

  const [currentStep, setCurrentStep] = useState(1);
  const [hydrated, setHydrated] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [estado, setEstado] = useState<EstadoMicromoduloApi | undefined>();

  const form = useForm<AspectosGeneralesFormInputValues>({
    resolver: zodResolver(
      aspectosGeneralesFormSchema
    ) as unknown as Resolver<AspectosGeneralesFormInputValues>,
    mode: "onTouched",
    shouldUnregister: false,
    defaultValues,
  });

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const response = await obtenerAspectosGenerales(expedienteId);
        if (cancelled) return;

        setEstado(response.estado);
        form.reset(aspectosGeneralesFromApi(response as Record<string, unknown>));

        const storedStep = sessionStorage.getItem(getStepStorageKey(expedienteId));
        if (storedStep) {
          const step = Number(storedStep);
          if (step >= 1 && step <= ASPECTOS_GENERALES_STEPS.length) {
            setCurrentStep(step);
          }
        }
      } catch {
        if (!cancelled) form.reset(defaultValues);
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [defaultValues, expedienteId, form]);

  const values = form.watch();
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
    sessionStorage.setItem(getStepStorageKey(expedienteId), String(currentStep - 1));
    scrollToTop();
  };

  const handleSaveDraft = async () => {
    if (readOnly) return;
    setIsSaving(true);
    try {
      await ensureMicromoduloEditable(expedienteId, "aspectos-generales", estado);
      if (estado === "COMPLETADO") setEstado("BORRADOR");
      await guardarBorradorMicromodulo(
        expedienteId,
        "aspectos-generales",
        aspectosGeneralesToApi(form.getValues())
      );
      toast.success("Borrador de aspectos generales guardado.");
      goToPanel();
    } catch (error) {
      toast.error(formatMicromoduloErrorMessage(error));
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

    // Completado: solo navegar. No PUT/reabrir hasta Guardar borrador o Finalizar.
    if (estado === "COMPLETADO") {
      const nextStep = currentStep + 1;
      if (!isLastStep) {
        setCurrentStep(nextStep);
        sessionStorage.setItem(getStepStorageKey(expedienteId), String(nextStep));
        scrollToTop();
      }
      return;
    }

    setIsSaving(true);
    try {
      await ensureMicromoduloEditable(expedienteId, "aspectos-generales", estado);
      await guardarBorradorMicromodulo(
        expedienteId,
        "aspectos-generales",
        aspectosGeneralesToApi(form.getValues())
      );
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      sessionStorage.setItem(getStepStorageKey(expedienteId), String(nextStep));
      scrollToTop();
    } catch (error) {
      toast.error(formatMicromoduloErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
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

      await ensureMicromoduloEditable(expedienteId, "aspectos-generales", estado);
      if (estado === "COMPLETADO") setEstado("BORRADOR");
      await guardarBorradorMicromodulo(
        expedienteId,
        "aspectos-generales",
        aspectosGeneralesToApi(form.getValues())
      );
      await completarMicromodulo(expedienteId, "aspectos-generales");
      sessionStorage.removeItem(getStepStorageKey(expedienteId));
      setIsConfirmOpen(true);
    } catch (error) {
      toast.error(formatMicromoduloErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <Paso1RegimenLegalStep form={form} readOnly={readOnly} enteId={enteId} />;
      case 2:
        return <Paso2CondicionesOfertaStep form={form} readOnly={readOnly} />;
      case 3:
        return <Paso3ResponsabilidadSocialStep form={form} readOnly={readOnly} />;
      case 4:
        return <Paso4GarantiasAnticiposStep form={form} readOnly={readOnly} />;
      default:
        return <Paso1RegimenLegalStep form={form} readOnly={readOnly} enteId={enteId} />;
    }
  };

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Cargando aspectos generales…
      </div>
    );
  }

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
                          onClick={() => void handleSaveDraft()}
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

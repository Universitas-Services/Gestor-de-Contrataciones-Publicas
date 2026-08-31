"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";

import {
  ACTIVIDADES_PREVIAS_STEPS,
  ACTIVIDADES_PREVIAS_WIZARD_DESCRIPTION,
  ACTIVIDADES_PREVIAS_WIZARD_TITLE,
  createActividadesPreviasDefaultValues,
  getActividadesPreviasStepFields,
} from "@/lib/constants/actividadesPrevias";
import type { TipoContratacionBackend } from "@/lib/schemas/expedienteSchema";
import {
  buildActividadesPreviasFormSchema,
  type ActividadesPreviasFormInputValues,
} from "@/lib/schemas/actividadesPreviasSchema";
import {
  expedienteFase1TabPath,
  getActividadesPreviasFormStorageKey,
} from "@/lib/utils/fase1InicialRoutes";
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
import { ActividadesPreviasStepProgressBar } from "./ActividadesPreviasStepProgressBar";
import { Paso1IdentificacionStep } from "./steps/Paso1IdentificacionStep";
import { Paso2ObjetoJustificacionStep } from "./steps/Paso2ObjetoJustificacionStep";
import { Paso3LogisticaStep } from "./steps/Paso3LogisticaStep";
import { Paso4PromocionStep } from "./steps/Paso4PromocionStep";

interface StoredActividadesPreviasForm {
  values: ActividadesPreviasFormInputValues;
  currentStep: number;
}

export interface ActividadesPreviasFormProps {
  expedienteId: string;
  tipoContratacion: TipoContratacionBackend;
  direccionEnteDefault?: string;
  readOnly?: boolean;
  basePath?: string;
}

function scrollToTop() {
  if (typeof window === "undefined") return;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function loadStoredForm(
  expedienteId: string,
  defaults: ActividadesPreviasFormInputValues
): { values: ActividadesPreviasFormInputValues; currentStep: number } {
  if (typeof window === "undefined") {
    return { values: defaults, currentStep: 1 };
  }

  try {
    const raw = window.localStorage.getItem(getActividadesPreviasFormStorageKey(expedienteId));
    if (!raw) return { values: defaults, currentStep: 1 };
    const parsed = JSON.parse(raw) as StoredActividadesPreviasForm;
    if (!parsed?.values) return { values: defaults, currentStep: 1 };
    return {
      values: { ...defaults, ...parsed.values },
      currentStep: parsed.currentStep ?? 1,
    };
  } catch {
    return { values: defaults, currentStep: 1 };
  }
}

function persistForm(expedienteId: string, payload: StoredActividadesPreviasForm) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    getActividadesPreviasFormStorageKey(expedienteId),
    JSON.stringify(payload)
  );
}

export function ActividadesPreviasForm({
  expedienteId,
  tipoContratacion,
  direccionEnteDefault = "",
  readOnly = false,
  basePath = "/gestion-expedientes",
}: ActividadesPreviasFormProps) {
  const router = useRouter();
  const { completeMicromodule } = useFase1InicialState(expedienteId);
  const defaultValues = useMemo(
    () => createActividadesPreviasDefaultValues(direccionEnteDefault),
    [direccionEnteDefault]
  );
  const formSchema = useMemo(
    () => buildActividadesPreviasFormSchema(tipoContratacion),
    [tipoContratacion]
  );

  const [currentStep, setCurrentStep] = useState(1);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const skipPersistRef = useRef(false);

  const form = useForm<ActividadesPreviasFormInputValues>({
    resolver: zodResolver(formSchema) as unknown as Resolver<ActividadesPreviasFormInputValues>,
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
    persistForm(expedienteId, { values, currentStep });
  }, [currentStep, expedienteId, hydrated, values]);

  const totalSteps = ACTIVIDADES_PREVIAS_STEPS.length;
  const isLastStep = currentStep === totalSteps;

  const validateCurrentStep = useCallback(async () => {
    const fields = getActividadesPreviasStepFields(currentStep, form.getValues(), tipoContratacion);
    return form.trigger(fields as Parameters<typeof form.trigger>[0], { shouldFocus: true });
  }, [currentStep, form, tipoContratacion]);

  const goToExpediente = useCallback(() => {
    router.push(expedienteFase1TabPath(basePath, expedienteId));
  }, [basePath, expedienteId, router]);

  const handleBack = () => {
    if (currentStep <= 1) return;
    setCurrentStep((prev) => prev - 1);
    scrollToTop();
  };

  const handleNext = async () => {
    if (readOnly) {
      if (isLastStep) {
        goToExpediente();
        return;
      }
      setCurrentStep((prev) => prev + 1);
      scrollToTop();
      return;
    }

    const isValid = await validateCurrentStep();
    if (!isValid) return;

    if (isLastStep) {
      setIsSaving(true);
      try {
        const fullValid = await form.trigger(undefined, { shouldFocus: true });
        if (!fullValid) {
          toast.error("Revise los campos pendientes antes de finalizar.");
          return;
        }

        skipPersistRef.current = true;
        persistForm(expedienteId, { values: form.getValues(), currentStep: totalSteps });
        completeMicromodule("actividades-previas");
        setIsConfirmOpen(true);
      } finally {
        setIsSaving(false);
      }
      return;
    }

    setCurrentStep((prev) => prev + 1);
    scrollToTop();
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <Paso1IdentificacionStep form={form} readOnly={readOnly} />;
      case 2:
        return (
          <Paso2ObjetoJustificacionStep
            form={form}
            tipoContratacion={tipoContratacion}
            readOnly={readOnly}
          />
        );
      case 3:
        return <Paso3LogisticaStep form={form} readOnly={readOnly} />;
      case 4:
        return <Paso4PromocionStep form={form} readOnly={readOnly} />;
      default:
        return <Paso1IdentificacionStep form={form} readOnly={readOnly} />;
    }
  };

  return (
    <div className="min-h-screen w-full">
      <div className="w-full px-0 py-6 sm:px-0">
        <div className="mx-auto max-w-5xl">
          <Card className="overflow-hidden border border-slate-200 bg-white shadow-sm">
            <div className="space-y-1.5 border-b border-slate-200 bg-slate-50/70 px-5 py-5 md:px-8">
              <h1 className="text-[20px] font-bold leading-tight text-color-titulos md:text-[22px]">
                {ACTIVIDADES_PREVIAS_WIZARD_TITLE}
              </h1>
              <p className="max-w-4xl text-[12px] italic leading-relaxed text-muted-foreground">
                {ACTIVIDADES_PREVIAS_WIZARD_DESCRIPTION}
              </p>
            </div>

            <CardContent className="p-0">
              <div className="px-5 pt-6 md:px-8">
                <ActividadesPreviasStepProgressBar currentStep={currentStep} />
              </div>

              <Form {...form}>
                <form className="space-y-0" onSubmit={(event) => event.preventDefault()}>
                  <div className="px-5 pb-6 md:px-8 md:pb-7">{renderCurrentStep()}</div>

                  <div className="border-t border-slate-200 bg-white px-5 py-5 md:px-8">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex justify-start">
                        {currentStep > 1 ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleBack}
                            disabled={isSaving || isConfirmOpen}
                            className="min-w-30 cursor-pointer border-slate-200 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
                          >
                            Anterior
                          </Button>
                        ) : (
                          <span />
                        )}
                      </div>

                      <div className="flex justify-end">
                        {readOnly && isLastStep ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={goToExpediente}
                            className="min-w-35 cursor-pointer border-slate-200 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
                          >
                            Volver al expediente
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => void handleNext()}
                            disabled={isSaving || isConfirmOpen}
                            className={cn(
                              "min-w-35 cursor-pointer text-[11px] font-semibold text-white",
                              isLastStep
                                ? "bg-emerald-600 hover:bg-emerald-700"
                                : "bg-navy hover:bg-navy-hover"
                            )}
                          >
                            {isSaving ? "Procesando..." : isLastStep ? "Finalizar" : "Siguiente"}
                          </Button>
                        )}
                      </div>
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
            goToExpediente();
          }
        }}
      >
        <AlertDialogContent className="max-w-[340px] rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
          <AlertDialogTitle className="sr-only">Actividades previas completadas</AlertDialogTitle>
          <AlertDialogDescription className="sr-only">
            El formulario de Actividades Previas ha sido completado.
          </AlertDialogDescription>

          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-7 w-7 text-green-600" strokeWidth={2} />
            </div>

            <h2 className="text-lg font-bold leading-tight text-slate-800">
              ¡Datos guardados con éxito!
            </h2>

            <p className="mt-2 max-w-[280px] text-xs leading-relaxed text-slate-500">
              El formulario de Actividades Previas ha sido completado. Puede generar el documento
              desde el panel principal.
            </p>

            <Button
              type="button"
              onClick={() => {
                setIsConfirmOpen(false);
                goToExpediente();
              }}
              className="mt-5 h-9 w-full max-w-[220px] cursor-pointer bg-navy text-xs font-bold text-white hover:bg-navy-hover"
            >
              Volver al Expediente
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

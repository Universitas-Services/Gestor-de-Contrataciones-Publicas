"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";

import {
  FASE1_STEP_FIELDS,
  FASE1_WIZARD_DESCRIPTION,
  FASE1_WIZARD_TITLE,
} from "@/lib/constants/fase1";
import {
  normalizeCrearPresupuestoItemResponse,
  normalizePresupuestoItemRecord,
} from "@/lib/utils/fase1Presupuesto";
import {
  fase1FormSchema,
  type Fase1FormInputValues,
  type Fase1PayloadFormValues,
  type ProductoItemFormValues,
} from "@/lib/schemas/fase1Schema";
import type { TipoContratacionBackend } from "@/lib/schemas/expedienteSchema";
import {
  actualizarFasePreparatoria,
  crearPresupuestoItem,
  eliminarPresupuestoItem,
  guardarFasePreparatoria,
  listarPresupuestoItems,
} from "@/services/fase1Service";
import type {
  CrearOActualizarFase1Payload,
  FasePreparatoriaDetalleResponse,
  PresupuestoItemRecord,
} from "@/types/fase1.types";
import { AlertDialog, AlertDialogContent, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Fase1StepProgressBar } from "./Fase1StepProgressBar";
import { Fase1WizardFooter } from "./Fase1WizardFooter";
import { Paso1DefinicionStep } from "./steps/Paso1DefinicionStep";
import { Paso2PresupuestoStep } from "./steps/Paso2PresupuestoStep";
import { Paso3ParametrosLegalesStep } from "./steps/Paso3ParametrosLegalesStep";
import { Paso4LlamadoPublicoStep } from "./steps/Paso4LlamadoPublicoStep";
import { Paso5ObservacionesStep } from "./steps/Paso5ObservacionesStep";

type Fase1WizardStepId =
  | "definicion"
  | "presupuesto"
  | "parametrosLegales"
  | "llamadoPublico"
  | "observaciones";

interface Fase1WizardStep {
  id: Fase1WizardStepId;
  fields: readonly string[];
  render: () => ReactNode;
}

export interface Fase1FormProps {
  expedienteId: string;
  tipoContratacion: TipoContratacionBackend;
  direccionEnteDefault?: string;
  initialFasePreparatoria: FasePreparatoriaDetalleResponse | null;
  hasPersistedItems: boolean;
  isEditMode: boolean;
  initialFase1IdFromQuery?: string;
  readOnly?: boolean;
  /** Ruta canónica del módulo de expedientes (default: gestion). */
  basePath?: string;
}

function scrollToTop() {
  if (typeof window === "undefined") return;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function buildFechaIso(fechaActaInicio: string) {
  return `${fechaActaInicio}T00:00:00.000Z`;
}

function toFormString(value: number | string | undefined | null) {
  if (value == null) return "";
  return String(value);
}

function normalizeNormativaLegal(value: string | string[] | null | undefined): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => item.trim()).filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }
  return [];
}

function buildDefaultValues({
  direccionEnteDefault,
  fasePreparatoria,
}: {
  direccionEnteDefault: string;
  fasePreparatoria: FasePreparatoriaDetalleResponse | null;
}): Fase1FormInputValues {
  if (!fasePreparatoria) {
    return {
      datosActoAutorizacionInicio: "",
      fechaActaInicio: "",
      detallesTecnicosCalidad: "",
      alcanceCantidadesObra: "",
      justificacionVentajas: "",
      origenCrsRegistro: undefined,
      diasValidezOferta: "",
      autoridadAclaratorias: "",
      normativaLegal: [],
      diasVigenciaGarantiaExtension: "",
      objetivosEspecificos1: "",
      objetivosEspecificos2: "",
      objetivosEspecificos3: "",
      direccionRetiroPliego: direccionEnteDefault,
      horarioRetiroPliego: "",
      pliegoGratuito: undefined,
      costoPliegoBs: "",
      bancoPagoPliego: "",
      cuentaPagoPliego: "",
      titularPagoPliego: "",
      horaActoRecepAper: "",
      condicionPlurianual: undefined,
      viabilidadContratoMarco: undefined,
      justificacionContratoMarco: "",
    };
  }

  const shouldClearPaymentFields = fasePreparatoria.pliegoGratuito === true;

  return {
    datosActoAutorizacionInicio: fasePreparatoria.datosActoAutorizacionInicio ?? "",
    fechaActaInicio: fasePreparatoria.fechaActaInicio
      ? fasePreparatoria.fechaActaInicio.split("T")[0]
      : "",
    detallesTecnicosCalidad: fasePreparatoria.detallesTecnicosCalidad ?? "",
    alcanceCantidadesObra: fasePreparatoria.alcanceCantidadesObra ?? "",
    justificacionVentajas: fasePreparatoria.justificacionVentajas ?? "",
    origenCrsRegistro: fasePreparatoria.origenCrsRegistro,
    diasValidezOferta: toFormString(fasePreparatoria.diasValidezOferta),
    autoridadAclaratorias: fasePreparatoria.autoridadAclaratorias ?? "",
    normativaLegal: normalizeNormativaLegal(fasePreparatoria.normativaLegal),
    diasVigenciaGarantiaExtension: toFormString(fasePreparatoria.diasVigenciaGarantiaExtension),
    objetivosEspecificos1: fasePreparatoria.objetivosEspecificos1 ?? "",
    objetivosEspecificos2: fasePreparatoria.objetivosEspecificos2 ?? "",
    objetivosEspecificos3: fasePreparatoria.objetivosEspecificos3 ?? "",
    direccionRetiroPliego: fasePreparatoria.direccionRetiroPliego || direccionEnteDefault,
    horarioRetiroPliego: fasePreparatoria.horarioRetiroPliego ?? "",
    pliegoGratuito: fasePreparatoria.pliegoGratuito,
    costoPliegoBs: shouldClearPaymentFields ? "" : toFormString(fasePreparatoria.costoPliegoBs),
    bancoPagoPliego: shouldClearPaymentFields ? "" : (fasePreparatoria.bancoPagoPliego ?? ""),
    cuentaPagoPliego: shouldClearPaymentFields ? "" : (fasePreparatoria.cuentaPagoPliego ?? ""),
    titularPagoPliego: shouldClearPaymentFields ? "" : (fasePreparatoria.titularPagoPliego ?? ""),
    horaActoRecepAper: fasePreparatoria.horaActoRecepAper ?? "",
    condicionPlurianual: fasePreparatoria.condicionPlurianual,
    viabilidadContratoMarco: fasePreparatoria.viabilidadContratoMarco,
    justificacionContratoMarco:
      fasePreparatoria.justificacionContratoMarco ??
      fasePreparatoria.justificacion_contrato_marco_au_au ??
      "",
  };
}

function getLlamadoPublicoFields(pliegoGratuito: boolean | undefined) {
  const baseFields = [
    "objetivosEspecificos1",
    "objetivosEspecificos2",
    "objetivosEspecificos3",
    "direccionRetiroPliego",
    "horarioRetiroPliego",
    "pliegoGratuito",
    "horaActoRecepAper",
  ] as const;

  if (pliegoGratuito === false) {
    return [
      ...baseFields,
      "costoPliegoBs",
      "bancoPagoPliego",
      "cuentaPagoPliego",
      "titularPagoPliego",
    ] as const;
  }

  return baseFields;
}

function getObservacionesFields(viabilidadContratoMarco: boolean | undefined) {
  const baseFields = ["condicionPlurianual", "viabilidadContratoMarco"] as const;

  if (viabilidadContratoMarco === true) {
    return [...baseFields, "justificacionContratoMarco"] as const;
  }

  return baseFields;
}

function buildPayload(values: Fase1PayloadFormValues): CrearOActualizarFase1Payload {
  if (
    values.origenCrsRegistro === undefined ||
    values.pliegoGratuito === undefined ||
    values.condicionPlurianual === undefined ||
    values.viabilidadContratoMarco === undefined
  ) {
    throw new Error("Faltan datos obligatorios del formulario.");
  }

  const payload: CrearOActualizarFase1Payload = {
    datosActoAutorizacionInicio: values.datosActoAutorizacionInicio,
    fechaActaInicio: buildFechaIso(values.fechaActaInicio),
    detallesTecnicosCalidad: values.detallesTecnicosCalidad,
    alcanceCantidadesObra: values.alcanceCantidadesObra,
    justificacionVentajas: values.justificacionVentajas,
    origenCrsRegistro: values.origenCrsRegistro,
    diasValidezOferta: values.diasValidezOferta,
    autoridadAclaratorias: values.autoridadAclaratorias,
    normativaLegal: values.normativaLegal,
    diasVigenciaGarantiaExtension: values.diasVigenciaGarantiaExtension,
    objetivosEspecificos1: values.objetivosEspecificos1,
    objetivosEspecificos2: values.objetivosEspecificos2,
    objetivosEspecificos3: values.objetivosEspecificos3,
    direccionRetiroPliego: values.direccionRetiroPliego,
    horarioRetiroPliego: values.horarioRetiroPliego,
    pliegoGratuito: values.pliegoGratuito,
    horaActoRecepAper: values.horaActoRecepAper,
    condicionPlurianual: values.condicionPlurianual,
    viabilidadContratoMarco: values.viabilidadContratoMarco,
  };

  if (values.pliegoGratuito === false) {
    payload.costoPliegoBs = values.costoPliegoBs;
    payload.bancoPagoPliego = values.bancoPagoPliego;
    payload.cuentaPagoPliego = values.cuentaPagoPliego;
    payload.titularPagoPliego = values.titularPagoPliego;
  }

  if (values.viabilidadContratoMarco === true && values.justificacionContratoMarco) {
    payload.justificacion_contrato_marco_au_au = values.justificacionContratoMarco;
  }

  return payload;
}

export function Fase1Form({
  expedienteId,
  tipoContratacion,
  direccionEnteDefault = "",
  initialFasePreparatoria,
  isEditMode,
  readOnly = false,
  basePath = "/gestion-expedientes",
}: Fase1FormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [items, setItems] = useState<PresupuestoItemRecord[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSavingItem, setIsSavingItem] = useState(false);
  const [isSavingPhase, setIsSavingPhase] = useState(false);
  const [isLoadingItems, setIsLoadingItems] = useState(true);

  const defaultValues = useMemo(
    () =>
      buildDefaultValues({
        direccionEnteDefault,
        fasePreparatoria: initialFasePreparatoria,
      }),
    [direccionEnteDefault, initialFasePreparatoria]
  );

  const form = useForm<Fase1FormInputValues>({
    resolver: zodResolver(fase1FormSchema) as unknown as Resolver<Fase1FormInputValues>,
    mode: "onTouched",
    shouldUnregister: false,
    defaultValues,
  });
  const pliegoGratuito = form.watch("pliegoGratuito");
  const viabilidadContratoMarco = form.watch("viabilidadContratoMarco");

  useEffect(() => {
    if (viabilidadContratoMarco !== true) {
      form.clearErrors("justificacionContratoMarco");
    }
  }, [form, viabilidadContratoMarco]);

  const reloadItems = useCallback(async () => {
    const response = await listarPresupuestoItems(expedienteId, { page: 1, limit: 100 });
    setItems(response.items.map((item) => normalizePresupuestoItemRecord(item)));
  }, [expedienteId]);

  useEffect(() => {
    let cancelled = false;

    const loadItems = async () => {
      setIsLoadingItems(true);
      try {
        await reloadItems();
      } catch (error) {
        if (!cancelled) {
          toast.error(
            error instanceof Error
              ? error.message
              : "No se pudieron cargar los ítems del presupuesto."
          );
        }
      } finally {
        if (!cancelled) setIsLoadingItems(false);
      }
    };

    void loadItems();

    return () => {
      cancelled = true;
    };
  }, [reloadItems]);

  const handleAddItem = useCallback(
    async (values: ProductoItemFormValues) => {
      if (readOnly) return;
      setIsSavingItem(true);

      try {
        const response = await crearPresupuestoItem(expedienteId, values);
        const newItem = normalizeCrearPresupuestoItemResponse(response, values);
        setItems((prev) => [...prev, newItem]);
        toast.success("Ítem agregado al presupuesto base.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "No se pudo guardar el ítem.");
        throw error;
      } finally {
        setIsSavingItem(false);
      }
    },
    [expedienteId, readOnly]
  );

  const handleDeleteItem = useCallback(
    async (item: PresupuestoItemRecord) => {
      if (readOnly) return;
      setIsSavingItem(true);

      try {
        await eliminarPresupuestoItem(item.id, expedienteId);
        setItems((prev) => prev.filter((current) => current.id !== item.id));
        toast.success("Ítem eliminado del presupuesto base.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "No se pudo eliminar el ítem.");
      } finally {
        setIsSavingItem(false);
      }
    },
    [expedienteId, readOnly]
  );

  const visibleSteps = useMemo<Fase1WizardStep[]>(
    () => [
      {
        id: "definicion",
        fields: FASE1_STEP_FIELDS[1],
        render: () => <Paso1DefinicionStep form={form} tipoContratacion={tipoContratacion} />,
      },
      {
        id: "presupuesto",
        fields: FASE1_STEP_FIELDS[2],
        render: () => (
          <Paso2PresupuestoStep
            items={items}
            onAddItem={handleAddItem}
            onDeleteItem={handleDeleteItem}
            isSubmitting={isSavingItem || isLoadingItems}
          />
        ),
      },
      {
        id: "parametrosLegales",
        fields: FASE1_STEP_FIELDS[3],
        render: () => <Paso3ParametrosLegalesStep form={form} />,
      },
      {
        id: "llamadoPublico",
        fields: getLlamadoPublicoFields(pliegoGratuito),
        render: () => <Paso4LlamadoPublicoStep form={form} />,
      },
      {
        id: "observaciones",
        fields: getObservacionesFields(viabilidadContratoMarco),
        render: () => <Paso5ObservacionesStep form={form} />,
      },
    ],
    [
      form,
      handleAddItem,
      handleDeleteItem,
      isLoadingItems,
      isSavingItem,
      items,
      pliegoGratuito,
      tipoContratacion,
      viabilidadContratoMarco,
    ]
  );

  const totalSteps = visibleSteps.length;
  const currentStepConfig = visibleSteps[currentStep - 1] ?? visibleSteps[0];
  const isLastStep = currentStep === totalSteps;

  function goToStep(step: number) {
    setCurrentStep(step);
    scrollToTop();
  }

  const validateStep = async () => {
    if (!currentStepConfig) return false;

    if (currentStepConfig.id === "presupuesto") {
      if (items.length === 0) {
        toast.error("Debe agregar al menos un ítem para continuar.");
        return false;
      }

      return true;
    }

    if (!currentStepConfig.fields.length) return true;

    return form.trigger(currentStepConfig.fields as Parameters<typeof form.trigger>[0], {
      shouldFocus: true,
    });
  };

  const handleBack = () => {
    if (currentStep === 1) return;
    goToStep(currentStep - 1);
  };

  const handleFinalSubmit = async () => {
    if (readOnly) return;

    if (items.length === 0) {
      const budgetStepIndex = visibleSteps.findIndex((step) => step.id === "presupuesto");
      if (budgetStepIndex >= 0) {
        setCurrentStep(budgetStepIndex + 1);
      }

      toast.error("Debe agregar al menos un ítem antes de finalizar.");
      scrollToTop();
      return;
    }

    const isValid = await form.trigger(undefined, { shouldFocus: true });
    if (!isValid) {
      toast.error("Complete los campos obligatorios antes de finalizar.");
      return;
    }

    const parsed = fase1FormSchema.safeParse(form.getValues());
    if (!parsed.success) {
      toast.error("Complete los campos obligatorios antes de finalizar.");
      return;
    }

    setIsSavingPhase(true);

    try {
      const payload = buildPayload(parsed.data);
      if (isEditMode || initialFasePreparatoria) {
        await actualizarFasePreparatoria(expedienteId, payload);
      } else {
        await guardarFasePreparatoria(expedienteId, payload);
      }

      setIsConfirmOpen(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar la Fase 1.");
    } finally {
      setIsSavingPhase(false);
    }
  };

  const handleNext = async () => {
    const isValid = await validateStep();
    if (!isValid) return;

    if (isLastStep) {
      await handleFinalSubmit();
      return;
    }

    goToStep(currentStep + 1);
  };

  const handleSuccessClose = () => {
    setIsConfirmOpen(false);
    router.push(`${basePath}/${expedienteId}?tab=fase-1`);
    router.refresh();
  };

  const renderCurrentStep = () =>
    currentStepConfig?.render() ?? (
      <Paso1DefinicionStep form={form} tipoContratacion={tipoContratacion} />
    );

  return (
    <div className="min-h-screen w-full">
      <div className="w-full px-0 py-6 sm:px-0">
        <div className="mx-auto max-w-5xl">
          <Card className="overflow-hidden border border-slate-200 bg-white shadow-sm">
            <div className="space-y-1.5 border-b border-slate-200 bg-slate-50/70 px-5 py-5 md:px-8">
              <h1 className="text-[20px] font-bold leading-tight text-color-titulos md:text-[22px]">
                {FASE1_WIZARD_TITLE}
              </h1>
              <p className="max-w-4xl text-[12px] italic leading-relaxed text-muted-foreground">
                {FASE1_WIZARD_DESCRIPTION}
              </p>
            </div>

            <CardContent className="p-0">
              <div className="px-5 pt-6 md:px-8">
                <Fase1StepProgressBar currentStep={currentStep} />
              </div>

              <Form {...form}>
                <form className="space-y-0" onSubmit={(event) => event.preventDefault()}>
                  <div className="px-5 pb-6 md:px-8 md:pb-7">{renderCurrentStep()}</div>

                  <div className="border-t border-slate-200 bg-white px-5 py-5 md:px-8">
                    <Fase1WizardFooter
                      currentStep={currentStep}
                      totalSteps={totalSteps}
                      onBack={handleBack}
                      onNext={handleNext}
                      nextLabel={isLastStep ? "Finalizar" : "Siguiente"}
                      isLoading={isSavingPhase}
                      backDisabled={currentStep === 1}
                      nextDisabled={isSavingItem || isLoadingItems}
                    />
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
          if (!open) handleSuccessClose();
        }}
      >
        <AlertDialogContent className="max-w-[340px] rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
          <AlertDialogTitle className="sr-only">Fase preparatoria completada</AlertDialogTitle>

          <div className="flex flex-col items-center text-center">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border-2 border-emerald-500">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" strokeWidth={2} />
            </div>

            <h2 className="text-[18px] font-bold leading-tight text-color-titulos">¡Excelente!</h2>

            <p className="mt-1.5 max-w-[280px] text-[13px] font-semibold leading-snug text-color-titulos">
              Ha completado la carga de datos de la fase preparatoria.
            </p>

            <p className="mt-2 max-w-[290px] text-[11px] italic leading-relaxed text-slate-500">
              El sistema está listo para generar el Acta de Inicio, el Pliego de Condiciones y el
              Llamado a Participar
            </p>

            <Button
              type="button"
              onClick={handleSuccessClose}
              className="mt-4 h-9 w-full max-w-[200px] cursor-pointer bg-navy text-[12px] font-semibold text-white hover:bg-navy-hover"
            >
              Generar documentos
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

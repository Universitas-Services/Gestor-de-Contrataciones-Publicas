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
import { shouldShowBudgetStepOnEntry } from "@/lib/utils/fase1Wizard";
import { normalizeCrearPresupuestoItemResponse } from "@/lib/utils/fase1Presupuesto";
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
  guardarFasePreparatoria,
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
import { ProductoItemSheet } from "./ProductoItemSheet";
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
      normativaLegal: "",
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
    normativaLegal: fasePreparatoria.normativaLegal ?? "",
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
    justificacionContratoMarco: fasePreparatoria.justificacionContratoMarco ?? "",
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

  if (values.viabilidadContratoMarco === true) {
    payload.justificacionContratoMarco = values.justificacionContratoMarco;
  }

  return payload;
}

export function Fase1Form({
  expedienteId,
  tipoContratacion,
  direccionEnteDefault = "",
  initialFasePreparatoria,
  hasPersistedItems,
  isEditMode,
  readOnly = false,
}: Fase1FormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [items, setItems] = useState<PresupuestoItemRecord[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSavingItem, setIsSavingItem] = useState(false);
  const [isSavingPhase, setIsSavingPhase] = useState(false);
  const [showBudgetStep] = useState(() =>
    shouldShowBudgetStepOnEntry({
      isEditMode,
      hasPersistedItems,
    })
  );
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

  const handleOpenItemSheet = useCallback(() => {
    if (readOnly) return;
    window.setTimeout(() => {
      setIsSheetOpen(true);
    }, 0);
  }, [readOnly]);

  const visibleSteps = useMemo<Fase1WizardStep[]>(
    () => [
      {
        id: "definicion",
        fields: FASE1_STEP_FIELDS[1],
        render: () => <Paso1DefinicionStep form={form} tipoContratacion={tipoContratacion} />,
      },
      ...(showBudgetStep
        ? [
            {
              id: "presupuesto" as const,
              fields: FASE1_STEP_FIELDS[2],
              render: () => <Paso2PresupuestoStep items={items} onAddItem={handleOpenItemSheet} />,
            },
          ]
        : []),
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
      handleOpenItemSheet,
      items,
      pliegoGratuito,
      showBudgetStep,
      tipoContratacion,
      viabilidadContratoMarco,
    ]
  );

  const totalSteps = visibleSteps.length;
  const currentStepConfig = visibleSteps[currentStep - 1] ?? visibleSteps[0];
  const isLastStep = currentStep === totalSteps;
  const finalButtonLabel = isEditMode ? "Guardar cambios" : "Generar documentos";

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

  const handleNext = async () => {
    const isValid = await validateStep();
    if (!isValid) return;

    if (isLastStep) {
      await handleFinalSubmit();
      return;
    }

    goToStep(currentStep + 1);
  };

  const handleAddItem = async (values: ProductoItemFormValues) => {
    if (readOnly) return;
    setIsSavingItem(true);

    try {
      const response = await crearPresupuestoItem(expedienteId, values);
      const newItem = normalizeCrearPresupuestoItemResponse(response, values);

      setItems((prev) => [...prev, newItem]);
      setIsSheetOpen(false);
      toast.success("Ítem agregado al presupuesto base.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar el ítem.");
      throw error;
    } finally {
      setIsSavingItem(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (readOnly) return;
    if (showBudgetStep && items.length === 0) {
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

    setIsSavingPhase(true);

    try {
      const payload = buildPayload(fase1FormSchema.parse(form.getValues()));
      if (isEditMode) {
        await actualizarFasePreparatoria(expedienteId, payload);
      } else {
        await guardarFasePreparatoria(expedienteId, payload);
      }

      // Mostrar popup de éxito. Los documentos se generan individualmente
      // desde el panel principal (tarjeta "Documentos del Procedimiento").
      setIsConfirmOpen(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar la Fase 1.");
    } finally {
      setIsSavingPhase(false);
    }
  };

  const handleSuccessClose = () => {
    setIsConfirmOpen(false);
    router.push(`/elaboracion-expediente/${expedienteId}?tab=fase-1`);
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
            <CardContent className="p-0">
              <div className="space-y-1.5 border-b border-slate-200 bg-slate-50/70 px-5 py-5 md:px-8">
                <h1 className="text-[20px] font-bold leading-tight text-color-titulos md:text-[22px]">
                  {FASE1_WIZARD_TITLE}
                </h1>
                <p className="max-w-4xl text-[12px] italic leading-relaxed text-muted-foreground">
                  {FASE1_WIZARD_DESCRIPTION}
                </p>
              </div>

              <Form {...form}>
                <form className="space-y-0" onSubmit={(event) => event.preventDefault()}>
                  <div className="px-5 py-6 md:px-8 md:py-7">{renderCurrentStep()}</div>

                  <div className="border-t border-slate-200 bg-white px-5 py-5 md:px-8">
                    <Fase1WizardFooter
                      currentStep={currentStep}
                      totalSteps={totalSteps}
                      onBack={handleBack}
                      onNext={handleNext}
                      nextLabel={isLastStep ? finalButtonLabel : "Siguiente"}
                      isLoading={isSavingPhase}
                      backDisabled={currentStep === 1}
                    />
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>

      <ProductoItemSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onSubmit={handleAddItem}
        isSubmitting={isSavingItem}
      />

      <AlertDialog
        open={isConfirmOpen}
        onOpenChange={(open) => {
          if (!open) handleSuccessClose();
        }}
      >
        <AlertDialogContent className="max-w-[480px] overflow-hidden border-0 p-0 shadow-2xl">
          {/* Título oculto requerido por Radix para accesibilidad ARIA */}
          <AlertDialogTitle className="sr-only">Fase preparatoria completada</AlertDialogTitle>

          {/* Franja superior con gradiente */}
          <div className="relative flex flex-col items-center bg-linear-to-br from-emerald-500 via-emerald-600 to-teal-700 px-8 pb-8 pt-10">
            {/* Círculo de icono con efecto glassmorphism */}
            <div className="mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-white/20 shadow-lg ring-4 ring-white/30 backdrop-blur-sm">
              <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-white shadow-inner">
                <CheckCircle2 className="h-[30px] w-[30px] text-emerald-600" strokeWidth={2.5} />
              </div>
            </div>

            {/* Título */}
            <h2 className="text-center text-[26px] font-extrabold leading-tight tracking-tight text-white drop-shadow-sm sm:text-[28px]">
              ¡Excelente!
            </h2>

            {/* Subtítulo principal */}
            <p className="mt-2 max-w-[340px] text-center text-[14px] font-semibold leading-snug text-white/90">
              Ha completado la carga de datos de la fase preparatoria.
            </p>

            {/* Detalle adicional */}
            <p className="mt-3 max-w-[360px] text-center text-[12px] leading-relaxed text-white/75">
              El sistema está listo para generar el acta de inicio, el pliego de condiciones y el
              llamado a participar.
            </p>

            {/* Decorative blobs */}
            <div className="pointer-events-none absolute -left-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-white/10" />
          </div>

          {/* Sección inferior */}
          <div className="flex flex-col items-center gap-4 bg-white px-8 pb-7 pt-6">
            {/* Chips de documentos */}
            <div className="flex flex-wrap justify-center gap-2">
              {["Acta de Inicio", "Pliego de Condiciones", "Llamado a Participar"].map((doc) => (
                <span
                  key={doc}
                  className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700"
                >
                  <CheckCircle2 className="h-3 w-3 shrink-0" />
                  {doc}
                </span>
              ))}
            </div>

            {/* Botón de acción */}
            <Button
              type="button"
              onClick={handleSuccessClose}
              className="cursor-pointer mt-1 w-full max-w-[280px] bg-navy text-[13px] font-semibold text-white shadow-sm transition-all duration-200 hover:bg-navy-hover hover:shadow-md"
            >
              Volver al expediente
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

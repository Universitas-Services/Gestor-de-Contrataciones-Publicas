"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";

import {
  FASE1_STEP_FIELDS,
  FASE1_STEPS,
  FASE1_WIZARD_DESCRIPTION,
  FASE1_WIZARD_TITLE,
} from "@/lib/constants/fase1";
import {
  fase1FormSchema,
  type Fase1FormInputValues,
  type Fase1PayloadFormValues,
  type ProductoItemFormValues,
} from "@/lib/schemas/fase1Schema";
import { crearPresupuestoItem, guardarFasePreparatoria } from "@/services/fase1Service";
import type {
  CrearOActualizarFase1Payload,
  CrearPresupuestoItemResponse,
  PresupuestoItemRecord,
} from "@/types/fase1.types";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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

export interface Fase1FormProps {
  expedienteId: string;
  direccionEnteDefault?: string;
}

function scrollToTop() {
  if (typeof window === "undefined") return;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function buildFechaIso(fechaActaInicio: string) {
  return `${fechaActaInicio}T00:00:00.000Z`;
}

function toNumber(value: unknown, fallback: number) {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return fallback;
}

function buildPresupuestoItemRecord(
  input: ProductoItemFormValues,
  response: CrearPresupuestoItemResponse
): PresupuestoItemRecord {
  const cantidadRequerida = toNumber(response.cantidadRequerida, input.cantidadRequerida);
  const precioUnitarioEstimado = toNumber(
    response.precioUnitarioEstimado,
    input.precioUnitarioEstimado
  );
  const totalItems = toNumber(response.totalItems, cantidadRequerida * precioUnitarioEstimado);

  return {
    id: response.id ?? crypto.randomUUID(),
    descripcionItem: response.descripcionItem ?? input.descripcionItem,
    codigoPartida: response.codigoPartida ?? input.codigoPartida,
    unidadMedida: response.unidadMedida ?? input.unidadMedida,
    cantidadRequerida,
    precioUnitarioEstimado,
    totalItems,
  };
}

function buildPayload(values: Fase1PayloadFormValues): CrearOActualizarFase1Payload {
  if (values.origenCrsRegistro === undefined || values.pliegoGratuito === undefined) {
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

  return payload;
}

export function Fase1Form({ expedienteId, direccionEnteDefault = "" }: Fase1FormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [items, setItems] = useState<PresupuestoItemRecord[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSavingItem, setIsSavingItem] = useState(false);
  const [isSavingPhase, setIsSavingPhase] = useState(false);

  const form = useForm<Fase1FormInputValues>({
    resolver: zodResolver(fase1FormSchema) as unknown as Resolver<Fase1FormInputValues>,
    mode: "onTouched",
    shouldUnregister: false,
    defaultValues: {
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
      condicionPlurianual: "",
      viabilidadContratoMarco: "",
    },
  });

  const validateStep = async () => {
    if (currentStep === 2) {
      if (items.length === 0) {
        toast.error("Debe agregar al menos un ítem para continuar.");
        return false;
      }

      return true;
    }

    const fields = FASE1_STEP_FIELDS[currentStep as keyof typeof FASE1_STEP_FIELDS];
    if (!fields.length) return true;

    return form.trigger(fields as Parameters<typeof form.trigger>[0], {
      shouldFocus: true,
    });
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
    scrollToTop();
  };

  const handleBack = () => {
    if (currentStep === 1) return;
    goToStep(currentStep - 1);
  };

  const handleOpenItemSheet = () => {
    window.setTimeout(() => {
      setIsSheetOpen(true);
    }, 0);
  };

  const handleNext = async () => {
    const isValid = await validateStep();
    if (!isValid) return;

    if (currentStep === FASE1_STEPS.length) {
      setIsConfirmOpen(true);
      return;
    }

    goToStep(currentStep + 1);
  };

  const handleAddItem = async (values: ProductoItemFormValues) => {
    setIsSavingItem(true);

    try {
      const response = await crearPresupuestoItem(expedienteId, values);
      const newItem = buildPresupuestoItemRecord(values, response);

      setItems((prev) => [...prev, newItem]);
      toast.success("Ítem agregado al presupuesto base.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar el ítem.");
      throw error;
    } finally {
      setIsSavingItem(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (items.length === 0) {
      setIsConfirmOpen(false);
      setCurrentStep(2);
      toast.error("Debe agregar al menos un ítem antes de finalizar.");
      scrollToTop();
      return;
    }

    const isValid = await form.trigger(undefined, { shouldFocus: true });
    if (!isValid) {
      setIsConfirmOpen(false);
      toast.error("Complete los campos obligatorios antes de finalizar.");
      return;
    }

    setIsSavingPhase(true);

    try {
      const payload = buildPayload(fase1FormSchema.parse(form.getValues()));
      await guardarFasePreparatoria(expedienteId, payload);
      toast.success("La Fase 1 fue guardada correctamente.");
      router.push(`/elaboracion-expediente/${expedienteId}?tab=fase-1`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar la Fase 1.");
    } finally {
      setIsSavingPhase(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <Paso1DefinicionStep form={form} />;
      case 2:
        return <Paso2PresupuestoStep items={items} onAddItem={handleOpenItemSheet} />;
      case 3:
        return <Paso3ParametrosLegalesStep form={form} />;
      case 4:
        return <Paso4LlamadoPublicoStep form={form} />;
      case 5:
        return <Paso5ObservacionesStep form={form} />;
      default:
        return <Paso1DefinicionStep form={form} />;
    }
  };

  return (
    <div className="min-h-screen w-full pb-16">
      <div className="w-full px-0 py-8 sm:px-0">
        <div className="mx-auto max-w-6xl">
          <Card className="overflow-hidden border border-slate-200 bg-white shadow-sm">
            <CardContent className="p-0">
              <div className="space-y-2 border-b border-slate-200 px-5 py-6 md:px-8">
                <h1 className="text-[28px] font-bold leading-tight text-heading-dark">
                  {FASE1_WIZARD_TITLE}
                </h1>
                <p className="max-w-5xl text-base italic text-slate-500">
                  {FASE1_WIZARD_DESCRIPTION}
                </p>
              </div>

              <Form {...form}>
                <form className="space-y-10" onSubmit={(event) => event.preventDefault()}>
                  <div className="px-5 py-7 md:px-8 md:py-9">{renderCurrentStep()}</div>

                  <div className="border-t border-slate-200 bg-white px-5 py-6 md:px-8">
                    <Fase1WizardFooter
                      currentStep={currentStep}
                      totalSteps={FASE1_STEPS.length}
                      onBack={handleBack}
                      onNext={handleNext}
                      nextLabel={currentStep === FASE1_STEPS.length ? "Finalizar" : "Siguiente"}
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

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent className="max-w-[640px] border-none px-6 py-8 shadow-2xl sm:px-10">
          <AlertDialogHeader className="space-y-4 text-center">
            <AlertDialogMedia className="mx-auto mb-0 size-16 rounded-full border-2 border-[#83bf3a]/30 bg-[#f5faef] text-[#83bf3a]">
              <Check className="h-8 w-8" />
            </AlertDialogMedia>
            <AlertDialogTitle className="text-center text-4xl font-extrabold text-[#0d4e88] sm:text-5xl">
              ¡Excelente!
            </AlertDialogTitle>
            <div className="space-y-3">
              <p className="text-center text-2xl font-extrabold leading-tight text-[#0d4e88] sm:text-[38px]">
                Ha completado la carga de datos de la fase preparatoria.
              </p>
              <AlertDialogDescription className="mx-auto max-w-2xl text-center text-base italic text-slate-500 sm:text-2xl">
                El sistema está listo para generar el Acta de Inicio, el Pliego de Condiciones y el
                Llamado a Participar.
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-4 justify-center">
            <Button
              type="button"
              onClick={handleFinalSubmit}
              disabled={isSavingPhase}
              className="min-w-[280px] bg-navy text-white hover:bg-navy-hover"
            >
              {isSavingPhase ? "Procesando..." : "Generar documentos"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

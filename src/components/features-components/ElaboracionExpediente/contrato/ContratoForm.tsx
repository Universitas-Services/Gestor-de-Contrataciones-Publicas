"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CONTRATO_WIZARD_STEPS, getContratoFieldsForStep } from "@/lib/constants/contratoFieldCopy";
import {
  contratoFormSchema,
  contratoFormDefaultValues,
  type ContratoFormValues,
} from "@/lib/schemas/contratoSchema";
import type { TipoContratacionBackend } from "@/lib/schemas/expedienteSchema";

import { ContratoSectionA } from "./ContratoSectionA";
import { ContratoSectionB } from "./ContratoSectionB";
import { ContratoSectionC } from "./ContratoSectionC";
import { ContratoSectionD } from "./ContratoSectionD";
import { ContratoStepProgressBar } from "./ContratoStepProgressBar";
import { ContratoSuccessDialog } from "./ContratoSuccessDialog";

interface ContratoFormProps {
  expedienteId: string;
  tipoContratacion: TipoContratacionBackend;
  readOnly?: boolean;
}

export function ContratoForm({
  expedienteId,
  tipoContratacion,
  readOnly = false,
}: ContratoFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [successOpen, setSuccessOpen] = useState(false);

  const form = useForm<ContratoFormValues>({
    resolver: zodResolver(contratoFormSchema),
    defaultValues: contratoFormDefaultValues,
    mode: "onChange",
  });

  const currentStepMeta = CONTRATO_WIZARD_STEPS[step - 1];

  const validateCurrentStep = async () => {
    const fields = getContratoFieldsForStep(step);
    const valid = await form.trigger(fields);
    if (!valid) {
      toast.error("Complete los campos requeridos antes de continuar.");
    }
    return valid;
  };

  const handleSiguiente = async () => {
    if (readOnly) return;
    const valid = await validateCurrentStep();
    if (!valid) return;
    setStep((s) => Math.min(s + 1, CONTRATO_WIZARD_STEPS.length));
  };

  const handleAnterior = () => {
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleGuardar = async () => {
    if (readOnly) return;
    const valid = await form.trigger();
    if (!valid) {
      toast.error("Revise los campos del formulario antes de guardar.");
      return;
    }
    toast.success("Datos del contrato guardados localmente (mock).");
    setSuccessOpen(true);
  };

  const renderSection = () => {
    switch (step) {
      case 1:
        return (
          <ContratoSectionA
            control={form.control}
            tipoContratacion={tipoContratacion}
            readOnly={readOnly}
          />
        );
      case 2:
        return (
          <ContratoSectionB
            control={form.control}
            tipoContratacion={tipoContratacion}
            readOnly={readOnly}
          />
        );
      case 3:
        return <ContratoSectionC control={form.control} readOnly={readOnly} />;
      case 4:
        return (
          <ContratoSectionD
            control={form.control}
            tipoContratacion={tipoContratacion}
            readOnly={readOnly}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Card className="mx-auto w-full max-w-6xl shadow-sm border border-border mb-16">
        <CardHeader className="px-10 pt-10 pb-6 border-b border-slate-200">
          <CardTitle className="text-[28px] font-bold text-heading-dark font-inter">
            Elaboración del contrato
          </CardTitle>
          <CardDescription className="text-slate-500 italic mt-1 font-inter text-base"></CardDescription>
        </CardHeader>

        <CardContent className="px-10 pt-8 pb-10">
          <ContratoStepProgressBar currentStep={step} />

          <div className="mb-8 pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-color-titulos">{currentStepMeta.title}</h2>
            <p className="text-sm text-slate-500 italic mt-1">{currentStepMeta.subtitle}</p>
          </div>

          <Form {...form}>
            <form
              onSubmit={(e) => e.preventDefault()}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.preventDefault();
              }}
              className="space-y-6"
            >
              {renderSection()}

              <div className="flex items-center justify-between pt-8 mt-4 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 px-8 rounded-md font-semibold text-slate-500 border-slate-200 hover:bg-slate-50"
                  onClick={
                    step === 1
                      ? () => router.push(`/elaboracion-expediente/${expedienteId}?tab=fase-4`)
                      : handleAnterior
                  }
                >
                  Anterior
                </Button>

                {step < CONTRATO_WIZARD_STEPS.length ? (
                  <Button
                    type="button"
                    disabled={readOnly}
                    className="h-11 px-8 rounded-md font-semibold bg-navy hover:bg-navy-hover text-white"
                    onClick={handleSiguiente}
                  >
                    Siguiente
                  </Button>
                ) : (
                  <Button
                    type="button"
                    disabled={readOnly}
                    className="h-11 px-8 rounded-md font-semibold bg-navy hover:bg-navy-hover text-white"
                    onClick={handleGuardar}
                  >
                    Guardar
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <ContratoSuccessDialog
        open={successOpen}
        onOpenChange={setSuccessOpen}
        expedienteId={expedienteId}
        readOnly={readOnly}
      />
    </>
  );
}

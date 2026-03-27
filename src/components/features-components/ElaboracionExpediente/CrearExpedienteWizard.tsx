"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StepProgressBar } from "./steps/StepProgressBar";
import { DatosBasicosStep } from "./steps/DatosBasicosStep";
import { AnalisisModalidadStep } from "./steps/AnalisisModalidadStep";
import { ConfiguracionActoresStep } from "./steps/ConfiguracionActoresStep";
import { PlanificacionStep } from "./steps/PlanificacionStep";
import { ANALISIS_MODALIDAD_MOCK } from "@/lib/mocks/expedientesMock";
import type { DatosBasicosForm } from "@/types/expediente.types";

// ─── Step titles & descriptions ─────────────────────────────────────

const STEP_META = [
  {
    title: "Creación de nuevo expediente",
    description:
      "Ingrese los datos básicos del procedimiento para determinar la modalidad de contratación y calcular los lapsos legales",
  },
  {
    title: "Análisis de modalidad sugerida",
    description:
      "Verifique los datos financieros calculados. El sistema ha determinado la modalidad legal aplicable basándose en el valor UCAU actual.",
  },
  {
    title: "Configuración de actores y tiempos",
    description:
      "Seleccione las autoridades que intervendrán en el procedimiento y defina la fecha del llamado para proyectar el cronograma.",
  },
  {
    title: "Planificación del procedimiento",
    description:
      "Visualice y ajuste los lapsos del procedimiento. Arrastre los eventos para modificar las fechas respetando las validaciones legales.",
  },
];

const TOTAL_STEPS = 4;

// ─── Component ──────────────────────────────────────────────────────

export function CrearExpedienteWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  // Form for Step 1
  const datosBasicosForm = useForm<DatosBasicosForm>({
    defaultValues: {
      objetoProcedimiento: "",
      nomenclatura: "",
      tipoContratacion: "",
      montoBs: "",
      montoDivisas: "",
    },
  });

  // ─── Navigation handlers ──────────────────────────────────────────

  const goToStep = (step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStep1Next = () => {
    goToStep(2);
  };

  const handleStep2Edit = () => {
    goToStep(1);
  };

  const handleStep2Confirm = () => {
    goToStep(3);
  };

  const handleStep3Back = () => {
    goToStep(2);
  };

  const handleStep3Next = () => {
    goToStep(4);
  };

  const handleStep4Back = () => {
    goToStep(3);
  };

  const handleFinish = () => {
    toast.success("Expediente creado exitosamente (demo)");
    router.push("/elaboracion-expediente");
  };

  // ─── Current step meta ────────────────────────────────────────────

  const { title, description } = STEP_META[currentStep - 1];

  return (
    <Card className="mx-auto w-full max-w-4xl shadow-sm border-0 mb-16">
      <CardHeader className="px-10 pt-10 pb-6 border-b border-slate-200">
        <StepProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />
        <CardTitle className="text-[28px] font-bold text-heading-dark font-inter">
          {title}
        </CardTitle>
        <CardDescription className="text-slate-500 italic mt-1 font-inter text-base">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="px-10 pt-8 pb-10">
        {currentStep === 1 && <DatosBasicosStep form={datosBasicosForm} onNext={handleStep1Next} />}

        {currentStep === 2 && (
          <AnalisisModalidadStep
            data={ANALISIS_MODALIDAD_MOCK}
            onEdit={handleStep2Edit}
            onConfirm={handleStep2Confirm}
          />
        )}

        {currentStep === 3 && (
          <ConfiguracionActoresStep onBack={handleStep3Back} onFinish={handleStep3Next} />
        )}

        {currentStep === 4 && (
          <PlanificacionStep onBack={handleStep4Back} onFinish={handleFinish} />
        )}
      </CardContent>
    </Card>
  );
}

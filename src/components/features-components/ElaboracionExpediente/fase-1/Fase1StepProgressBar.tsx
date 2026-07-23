"use client";

import {
  Calculator,
  Check,
  ClipboardList,
  Megaphone,
  Scale,
  Settings2,
  type LucideIcon,
} from "lucide-react";

const FASE1_STEPPER_STEPS: Array<{ label: string; icon: LucideIcon }> = [
  { label: "Definición Técnica", icon: Settings2 },
  { label: "Presupuesto", icon: Calculator },
  { label: "Parámetros Legales", icon: Scale },
  { label: "Llamado Público", icon: Megaphone },
  { label: "Observaciones", icon: ClipboardList },
];

interface Fase1StepProgressBarProps {
  currentStep: number;
}

export function Fase1StepProgressBar({ currentStep }: Fase1StepProgressBarProps) {
  const steps = FASE1_STEPPER_STEPS;
  const progressWidth =
    steps.length <= 1 ? 0 : (Math.min(currentStep - 1, steps.length - 1) / (steps.length - 1)) * 80;

  return (
    <div className="mb-8 w-full px-2 pt-2 pb-1 md:px-4">
      <div className="relative flex w-full items-start justify-between">
        <div className="absolute top-6 left-[10%] right-[10%] -z-10 h-[2px] bg-slate-200" />
        <div
          className="absolute top-6 left-[10%] -z-10 h-[2px] bg-success transition-all duration-500"
          style={{ width: `${progressWidth}%` }}
        />

        {steps.map((step, index) => {
          const stepNum = index + 1;
          const isActive = stepNum === currentStep;
          const isCompleted = stepNum < currentStep;
          const Icon = step.icon;

          let circleClass = "";
          let statusText = "";
          let badgeClass = "";

          if (isCompleted) {
            circleClass = "bg-success text-white border-2 border-success";
            statusText = "Completado";
            badgeClass = "bg-success/10 text-success font-medium";
          } else if (isActive) {
            circleClass =
              "bg-color-boton-2 text-white border-2 border-color-boton-2 ring-4 ring-color-boton-2/20";
            statusText = "En curso";
            badgeClass = "bg-slate-100 text-slate-700 font-medium";
          } else {
            circleClass = "bg-white text-slate-400 border-2 border-slate-200";
            statusText = "Pendiente";
            badgeClass = "bg-slate-50 text-slate-400";
          }

          return (
            <div key={step.label} className="relative z-10 flex w-1/5 flex-col items-center">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full shadow-sm transition-all duration-300 ${circleClass}`}
              >
                {isCompleted ? (
                  <Check className="h-6 w-6 stroke-[3]" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>

              <div className="mt-3 flex flex-col items-center space-y-1 text-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 md:text-[11px]">
                  Paso {stepNum}
                </span>
                <span
                  className={`text-[11px] font-bold leading-tight md:text-[13px] ${
                    isActive || isCompleted ? "text-slate-800" : "text-slate-500"
                  }`}
                >
                  {step.label}
                </span>
                <span
                  className={`mt-0.5 hidden rounded-full px-2 py-0.5 text-[10px] sm:inline-flex ${badgeClass}`}
                >
                  {statusText}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

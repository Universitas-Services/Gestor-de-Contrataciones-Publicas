"use client";

import { Check } from "lucide-react";

import { ACTIVIDADES_PREVIAS_STEPS } from "@/lib/constants/actividadesPrevias";
import { cn } from "@/lib/utils";

interface ActividadesPreviasStepProgressBarProps {
  currentStep: number;
}

export function ActividadesPreviasStepProgressBar({
  currentStep,
}: ActividadesPreviasStepProgressBarProps) {
  const steps = ACTIVIDADES_PREVIAS_STEPS;
  const progressWidth =
    steps.length <= 1 ? 0 : (Math.min(currentStep - 1, steps.length - 1) / (steps.length - 1)) * 80;

  return (
    <div className="mb-8 w-full px-2 pt-2 pb-1 md:px-4">
      <div className="relative flex w-full items-start justify-between">
        <div className="absolute top-6 left-[10%] right-[10%] -z-10 h-[2px] bg-slate-200" />
        <div
          className="absolute top-6 left-[10%] -z-10 h-[2px] bg-blue-600 transition-all duration-300"
          style={{ width: `${progressWidth}%` }}
        />

        {steps.map((step) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;

          return (
            <div key={step.id} className="relative flex w-1/4 flex-col items-center bg-white px-1">
              <div
                className={cn(
                  "mb-2 flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold shadow-sm transition-colors",
                  isCompleted && "bg-emerald-500 text-white",
                  isActive && "bg-blue-600 text-white",
                  !isCompleted && !isActive && "bg-slate-200 text-slate-500"
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" strokeWidth={3} /> : step.id}
              </div>
              <span
                className={cn(
                  "text-center text-[11px] leading-snug",
                  isCompleted && "font-bold text-emerald-600",
                  isActive && "font-bold text-blue-800",
                  !isCompleted && !isActive && "font-semibold text-slate-500"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

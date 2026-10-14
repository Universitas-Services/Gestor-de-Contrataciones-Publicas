"use client";

import { Check } from "lucide-react";

import { ASPECTOS_GENERALES_STEPS } from "@/lib/constants/aspectosGenerales";
import { cn } from "@/lib/utils";

interface AspectosGeneralesStepProgressBarProps {
  currentStep: number;
}

export function AspectosGeneralesStepProgressBar({
  currentStep,
}: AspectosGeneralesStepProgressBarProps) {
  const steps = ASPECTOS_GENERALES_STEPS;
  const progressWidth =
    steps.length <= 1 ? 0 : (Math.min(currentStep - 1, steps.length - 1) / (steps.length - 1)) * 80;

  return (
    <div className="mb-8 w-full px-2 pb-1 pt-2 md:px-4">
      <div className="relative flex w-full items-start justify-between">
        <div className="absolute left-[10%] right-[10%] top-6 -z-10 h-[2px] bg-border" />
        <div
          className="absolute left-[10%] top-6 -z-10 h-[2px] bg-navy transition-all duration-300"
          style={{ width: `${progressWidth}%` }}
        />

        {steps.map((step) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;

          return (
            <div key={step.id} className="relative flex w-1/4 flex-col items-center bg-card px-1">
              <div
                className={cn(
                  "mb-2 flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold shadow-sm transition-colors",
                  isCompleted && "bg-success text-white",
                  isActive && "bg-navy text-white",
                  !isCompleted && !isActive && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" strokeWidth={3} /> : step.id}
              </div>
              <span
                className={cn(
                  "text-center text-[11px] leading-snug",
                  isCompleted && "font-bold text-success",
                  isActive && "font-bold text-navy",
                  !isCompleted && !isActive && "font-semibold text-muted-foreground"
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

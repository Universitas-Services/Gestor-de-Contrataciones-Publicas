"use client";

import React from "react";
import { Check, Calculator, FileText, Users, Calendar } from "lucide-react";

interface StepProgressBarProps {
  currentStep: number;
}

const STEPS = [
  { label: "Datos Básicos", icon: Calculator },
  { label: "Especificaciones", icon: FileText },
  { label: "Actores", icon: Users },
  { label: "Cronograma", icon: Calendar },
];

export function StepProgressBar({ currentStep }: StepProgressBarProps) {
  return (
    <div className="w-full mb-8 pt-4 pb-2">
      <div className="relative flex justify-between items-start w-full">
        <div className="absolute top-6 left-[10%] right-[10%] h-[2px] bg-slate-200 -z-10" />
        <div
          className="absolute top-6 left-[10%] h-[2px] bg-success transition-all duration-500 -z-10"
          style={{
            width: `${(Math.min(currentStep - 1, STEPS.length - 1) / (STEPS.length - 1)) * 80}%`,
          }}
        />

        {STEPS.map((step, index) => {
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
            <div key={step.label} className="flex flex-col items-center relative z-10 w-1/4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${circleClass}`}
              >
                {isCompleted ? (
                  <Check className="w-6 h-6 stroke-[3]" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>

              <div className="flex flex-col items-center mt-4 text-center space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  PASO {stepNum}
                </span>
                <span
                  className={`text-[14px] font-bold leading-tight ${
                    isActive || isCompleted ? "text-slate-800" : "text-slate-500"
                  }`}
                >
                  {step.label}
                </span>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full mt-1 ${badgeClass}`}>
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

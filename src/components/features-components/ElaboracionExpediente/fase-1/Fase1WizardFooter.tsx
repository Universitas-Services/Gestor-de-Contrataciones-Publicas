"use client";

import { Button } from "@/components/ui/button";

interface Fase1WizardFooterProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  nextLabel: string;
  isLoading?: boolean;
  backDisabled?: boolean;
  nextDisabled?: boolean;
}

export function Fase1WizardFooter({
  currentStep,
  onBack,
  onNext,
  nextLabel,
  isLoading = false,
  backDisabled = false,
  nextDisabled = false,
}: Fase1WizardFooterProps) {
  const showBackButton = !backDisabled && currentStep > 1;

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex justify-start">
        {showBackButton ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onBack}
            disabled={isLoading}
            className="min-w-30 cursor-pointer border-slate-200 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
          >
            Anterior
          </Button>
        ) : (
          <span />
        )}
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          onClick={onNext}
          disabled={nextDisabled || isLoading}
          className="min-w-35 cursor-pointer bg-navy text-[11px] font-semibold text-white hover:bg-navy-hover"
        >
          {isLoading ? "Procesando..." : nextLabel}
        </Button>
      </div>
    </div>
  );
}

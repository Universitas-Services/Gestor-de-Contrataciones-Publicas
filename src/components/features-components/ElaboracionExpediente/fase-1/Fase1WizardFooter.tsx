"use client";

import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";

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
  totalSteps,
  onBack,
  onNext,
  nextLabel,
  isLoading = false,
  backDisabled = false,
  nextDisabled = false,
}: Fase1WizardFooterProps) {
  const showBackButton = !backDisabled;

  return (
    <div className="flex flex-col gap-4 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center">
      <div className="flex justify-start">
        {showBackButton ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onBack}
            disabled={isLoading}
            className="cursor-pointer min-w-30 border-slate-200 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
          >
            Anterior
          </Button>
        ) : null}
      </div>

      <Pagination className="justify-center">
        <PaginationContent className="gap-2">
          {Array.from({ length: totalSteps }, (_, index) => {
            const step = index + 1;
            const isActive = step === currentStep;

            return (
              <PaginationItem key={step}>
                <PaginationLink
                  href="#"
                  isActive={isActive}
                  className={[
                    "pointer-events-none rounded-lg border px-3 py-1.5 text-[11px] font-semibold",
                    isActive
                      ? "border-navy bg-navy hover:bg-navy"
                      : "border-slate-200 bg-white text-slate-500",
                  ].join(" ")}
                  onClick={(event) => event.preventDefault()}
                >
                  {step}
                </PaginationLink>
              </PaginationItem>
            );
          })}
        </PaginationContent>
      </Pagination>

      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          onClick={onNext}
          disabled={nextDisabled || isLoading}
          className="cursor-pointer min-w-35 bg-navy text-[11px] font-semibold text-white hover:bg-navy-hover"
        >
          {isLoading ? "Procesando..." : nextLabel}
        </Button>
      </div>
    </div>
  );
}

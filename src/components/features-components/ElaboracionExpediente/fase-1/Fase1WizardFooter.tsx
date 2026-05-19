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
  return (
    <div className="flex flex-col gap-4 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center">
      <div className="flex justify-start">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={backDisabled || isLoading}
          className="min-w-[140px]"
        >
          Anterior
        </Button>
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
                    "pointer-events-none rounded-full border px-3 py-2 text-sm",
                    isActive
                      ? "border-navy bg-navy text-white hover:bg-navy"
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
          onClick={onNext}
          disabled={nextDisabled || isLoading}
          className="min-w-[160px] bg-navy text-white hover:bg-navy-hover"
        >
          {isLoading ? "Procesando..." : nextLabel}
        </Button>
      </div>
    </div>
  );
}

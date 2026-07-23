"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface PasoStubStepProps {
  title: string;
  onBack: () => void;
  onNext?: () => void;
  nextLabel?: string;
}

export function PasoStubStep({
  title,
  onBack,
  onNext,
  nextLabel = "Siguiente >",
}: PasoStubStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-heading-dark font-bold text-lg">{title}</h3>
        <p className="text-slate-500 italic text-sm mt-1">
          Este paso se implementará en una iteración posterior.
        </p>
      </div>
      <div className="flex justify-between pt-4 border-t border-slate-200">
        <Button type="button" variant="outline" onClick={onBack} className="h-11 px-6">
          Anterior
        </Button>
        {onNext && (
          <Button
            type="button"
            onClick={onNext}
            className="bg-navy hover:bg-navy-hover text-white font-semibold px-8 h-11 rounded-md"
          >
            {nextLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

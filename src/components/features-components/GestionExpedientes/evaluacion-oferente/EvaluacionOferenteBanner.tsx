"use client";

import { FaRegBuilding } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatMontoOfertaBs } from "@/lib/constants/calificacionLegalEvaluacion";
import type { EvaluacionOferenteBannerData } from "@/types/evaluacionOferente.types";

interface EvaluacionOferenteBannerProps {
  banner: EvaluacionOferenteBannerData;
  onBack: () => void;
}

export function EvaluacionOferenteBanner({ banner, onBack }: EvaluacionOferenteBannerProps) {
  return (
    <Card className="shrink-0 overflow-hidden rounded-none border-0 border-b border-slate-200 bg-white shadow-none">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-transparent bg-edificio-bg text-edificio-icon">
            <FaRegBuilding className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-[17px] font-bold text-color-titulos">
              {banner.nombreProveedor}
            </h2>
            <p className="mt-0.5 text-[12px] italic text-muted-foreground">
              RIF: {banner.rif}
              <span className="mx-2 text-slate-300">·</span>
              Monto ofertado:{" "}
              <span className="font-semibold not-italic text-color-titulos">
                {formatMontoOfertaBs(banner.montoOfertaBs)}
              </span>
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="h-10 shrink-0 rounded-md border-slate-200 font-semibold text-slate-500 hover:bg-slate-50"
        >
          Volver a la tabla
        </Button>
      </CardContent>
    </Card>
  );
}

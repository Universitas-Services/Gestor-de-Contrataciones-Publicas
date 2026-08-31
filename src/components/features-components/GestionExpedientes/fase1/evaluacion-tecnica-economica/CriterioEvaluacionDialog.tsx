"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  createEmptyCriterioEconomica,
  createEmptyCriterioTecnica,
  EVALUACION_TE_CRITERIO_MAX_MESSAGE,
  PUNTUACION_CRITERIO_MAX,
  roundPts,
  type CriterioEvalEconomica,
  type CriterioEvalTecnica,
  type EvaluacionLado,
} from "@/lib/constants/evaluacionTecnicaEconomica";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BolsaProgressMini } from "./BolsaCompartidaBar";
import { CriterioEvaluacionFormFields } from "./CriterioEvaluacionCard";

type CriterioUnion = CriterioEvalTecnica | CriterioEvalEconomica;

function isDraftValid(lado: EvaluacionLado, criterio: CriterioUnion): string | null {
  if (lado === "tecnica") {
    const c = criterio as CriterioEvalTecnica;
    if (!c.criterioEvaluacionTecnicaAuAu.trim()) {
      return "Indique el nombre del criterio técnico.";
    }
    if (!(c.puntuacionCriterioEvaluacionTecnicaAuAu > 0)) {
      return "La ponderación máxima debe ser mayor a 0.";
    }
    if (c.puntuacionCriterioEvaluacionTecnicaAuAu > PUNTUACION_CRITERIO_MAX) {
      return EVALUACION_TE_CRITERIO_MAX_MESSAGE;
    }
    if (c.rangos.length < 1) {
      return "Agregue al menos un rango de evaluación.";
    }
    for (const rango of c.rangos) {
      if (!rango.rangoCriterioEvaluacionTecnicaAuAu.trim()) {
        return "Complete el texto de cada escala / rango.";
      }
      if (
        rango.puntuacionRangoCriterioEvaluacionTecnicaAuAu >
        c.puntuacionCriterioEvaluacionTecnicaAuAu
      ) {
        return "Un puntaje de rango supera la ponderación máxima del criterio.";
      }
    }
    return null;
  }

  const c = criterio as CriterioEvalEconomica;
  if (!c.criterioEvaluacionEconomicaAuAu.trim()) {
    return "Indique el nombre del criterio económico.";
  }
  if (!(c.puntuacionCriterioEvaluacionEconomicaAuAu > 0)) {
    return "La ponderación máxima debe ser mayor a 0.";
  }
  if (c.puntuacionCriterioEvaluacionEconomicaAuAu > PUNTUACION_CRITERIO_MAX) {
    return EVALUACION_TE_CRITERIO_MAX_MESSAGE;
  }
  if (c.rangos.length < 1) {
    return "Agregue al menos un rango de evaluación.";
  }
  for (const rango of c.rangos) {
    if (!rango.rangoCriterioEvaluacionEconomicaAuAu.trim()) {
      return "Complete el texto de cada escala / rango.";
    }
    if (
      rango.puntuacionRangoCriterioEvaluacionEconomicaAuAu >
      c.puntuacionCriterioEvaluacionEconomicaAuAu
    ) {
      return "Un puntaje de rango supera la ponderación máxima del criterio.";
    }
  }
  return null;
}

function getPts(lado: EvaluacionLado, criterio: CriterioUnion | null): number {
  if (!criterio) return 0;
  if (lado === "tecnica") {
    return Number((criterio as CriterioEvalTecnica).puntuacionCriterioEvaluacionTecnicaAuAu) || 0;
  }
  return Number((criterio as CriterioEvalEconomica).puntuacionCriterioEvaluacionEconomicaAuAu) || 0;
}

interface CriterioEvaluacionDialogProps {
  open: boolean;
  mode: "create" | "edit";
  lado: EvaluacionLado;
  initial: CriterioUnion | null;
  matrixTotal: number;
  readOnly?: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (criterio: CriterioUnion) => void;
}

export function CriterioEvaluacionDialog({
  open,
  mode,
  lado,
  initial,
  matrixTotal,
  readOnly = false,
  onOpenChange,
  onSave,
}: CriterioEvaluacionDialogProps) {
  const [draft, setDraft] = useState<CriterioUnion>(
    lado === "tecnica" ? createEmptyCriterioTecnica : createEmptyCriterioEconomica
  );

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => {
      if (initial) {
        setDraft(JSON.parse(JSON.stringify(initial)) as CriterioUnion);
        return;
      }
      setDraft(lado === "tecnica" ? createEmptyCriterioTecnica() : createEmptyCriterioEconomica());
    });
  }, [open, initial, lado]);

  const projectedTotal = useMemo(() => {
    const previousPts = mode === "edit" ? getPts(lado, initial) : 0;
    const draftPts = getPts(lado, draft);
    return roundPts(matrixTotal - previousPts + draftPts);
  }, [draft, initial, lado, matrixTotal, mode]);

  const handleSave = () => {
    const error = isDraftValid(lado, draft);
    if (error) {
      toast.error(error);
      return;
    }
    onSave(draft);
    onOpenChange(false);
  };

  const title =
    mode === "edit"
      ? lado === "tecnica"
        ? "Editar criterio técnico"
        : "Editar criterio económico"
      : lado === "tecnica"
        ? "Agregar criterio técnico"
        : "Agregar criterio económico";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col gap-0 overflow-hidden border-border bg-card p-0 sm:max-w-3xl">
        <DialogHeader className="shrink-0 space-y-3 border-b border-border px-6 py-4">
          <div>
            <DialogTitle className="text-color-titulos">{title}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Complete las preguntas del criterio. Al guardar, se agregará al listado de la pestaña.
            </DialogDescription>
          </div>
          <BolsaProgressMini total={projectedTotal} />
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          <CriterioEvaluacionFormFields
            lado={lado}
            criterio={draft}
            readOnly={readOnly}
            onChange={setDraft}
          />
        </div>

        <DialogFooter className="shrink-0 gap-2 border-t border-border px-6 py-4 sm:justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          {!readOnly ? (
            <Button
              type="button"
              className="bg-navy text-white hover:bg-navy-hover"
              onClick={handleSave}
            >
              Guardar criterio
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

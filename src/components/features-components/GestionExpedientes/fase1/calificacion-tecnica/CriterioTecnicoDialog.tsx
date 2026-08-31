"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  createEmptyCriterio,
  roundPts,
  type CriterioTecnico,
} from "@/lib/constants/calificacionTecnica";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CriterioTecnicoFormFields } from "./CriterioTecnicoCard";
import { PonderacionProgressMini } from "./PonderacionTotalSticky";

function isCriterioDraftValid(criterio: CriterioTecnico): string | null {
  if (!criterio.criterioCalificacionTecnicaAuAu.trim()) {
    return "Indique el nombre del criterio técnico.";
  }
  if (!(criterio.puntuacionCriterioCalificacionTecnicaAuAu > 0)) {
    return "La ponderación máxima debe ser mayor a 0.";
  }
  if (criterio.rangos.length < 1) {
    return "Agregue al menos un rango de evaluación.";
  }
  for (const rango of criterio.rangos) {
    if (!rango.rangoCriterioCalificacionTecnicaAuAu.trim()) {
      return "Complete el texto de cada escala / rango.";
    }
    if (
      rango.puntuacionRangoCriterioCalificacionTecnicaAuAu >
      criterio.puntuacionCriterioCalificacionTecnicaAuAu
    ) {
      return "Un puntaje de rango supera la ponderación máxima del criterio.";
    }
  }
  return null;
}

interface CriterioTecnicoDialogProps {
  open: boolean;
  mode: "create" | "edit";
  initial: CriterioTecnico | null;
  /** Suma actual de la matriz (sin el borrador del modal). */
  matrixTotal: number;
  readOnly?: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (criterio: CriterioTecnico) => void;
}

export function CriterioTecnicoDialog({
  open,
  mode,
  initial,
  matrixTotal,
  readOnly = false,
  onOpenChange,
  onSave,
}: CriterioTecnicoDialogProps) {
  const [draft, setDraft] = useState<CriterioTecnico>(createEmptyCriterio);

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => {
      setDraft(
        initial ? (JSON.parse(JSON.stringify(initial)) as CriterioTecnico) : createEmptyCriterio()
      );
    });
  }, [open, initial]);

  const projectedTotal = useMemo(() => {
    const previousPts =
      mode === "edit" && initial
        ? Number(initial.puntuacionCriterioCalificacionTecnicaAuAu) || 0
        : 0;
    const draftPts = Number(draft.puntuacionCriterioCalificacionTecnicaAuAu) || 0;
    return roundPts(matrixTotal - previousPts + draftPts);
  }, [draft.puntuacionCriterioCalificacionTecnicaAuAu, initial, matrixTotal, mode]);

  const handleSave = () => {
    const error = isCriterioDraftValid(draft);
    if (error) {
      toast.error(error);
      return;
    }
    onSave(draft);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col gap-0 overflow-hidden border-border bg-card p-0 sm:max-w-3xl">
        <DialogHeader className="shrink-0 space-y-3 border-b border-border px-6 py-4">
          <div>
            <DialogTitle className="text-color-titulos">
              {mode === "edit" ? "Editar criterio técnico" : "Agregar criterio técnico"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Complete las preguntas del criterio. Al guardar, se agregará al listado de la matriz.
            </DialogDescription>
          </div>
          <PonderacionProgressMini total={projectedTotal} />
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          <CriterioTecnicoFormFields criterio={draft} readOnly={readOnly} onChange={setDraft} />
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

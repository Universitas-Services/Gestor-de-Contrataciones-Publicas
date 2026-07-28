"use client";

import { useMemo, useState } from "react";
import { AlertCircle, Lock } from "lucide-react";

import {
  CAUSALES_DECLARATORIA_DESIERTO,
  type CausalDeclaratoriaDesierto,
} from "@/lib/constants/fase2Desierto";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface DeclararProcedimientoDesiertoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSubmitting?: boolean;
  onConfirm: (payload: {
    causal_declaratoria_desierto_au_au: CausalDeclaratoriaDesierto;
    justificacion_declaratoria_desierto_au_au: string;
  }) => void | Promise<void>;
}

export function DeclararProcedimientoDesiertoModal({
  open,
  onOpenChange,
  isSubmitting = false,
  onConfirm,
}: DeclararProcedimientoDesiertoModalProps) {
  const [confirmacion, setConfirmacion] = useState<boolean | null>(null);
  const [causal, setCausal] = useState<CausalDeclaratoriaDesierto | "">("");
  const [justificacion, setJustificacion] = useState("");

  const resetForm = () => {
    setConfirmacion(null);
    setCausal("");
    setJustificacion("");
  };

  const handleOpenChange = (next: boolean) => {
    if (isSubmitting) return;
    if (!next) resetForm();
    onOpenChange(next);
  };

  const selectedShortLabel = useMemo(
    () => CAUSALES_DECLARATORIA_DESIERTO.find((option) => option.value === causal)?.shortLabel,
    [causal]
  );

  const canSubmit =
    confirmacion === true && Boolean(causal) && justificacion.trim().length > 0 && !isSubmitting;

  const handleConfirm = async () => {
    if (!canSubmit || !causal) return;
    await onConfirm({
      causal_declaratoria_desierto_au_au: causal,
      justificacion_declaratoria_desierto_au_au: justificacion.trim(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex w-[calc(100%-2rem)] max-w-lg flex-col gap-0 overflow-hidden border-border bg-card p-0 sm:max-w-lg sm:rounded-xl">
        <DialogHeader className="shrink-0 space-y-0 border-b border-border px-5 py-4 text-left">
          <div className="flex min-w-0 items-center gap-2.5 pr-8">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="h-4 w-4" />
            </span>
            <DialogTitle className="truncate text-[15px] font-bold text-destructive">
              Declarar Procedimiento Desierto
            </DialogTitle>
          </div>
          <DialogDescription className="sr-only">
            Confirme la declaratoria de desierto del procedimiento según el artículo 113 LCP.
          </DialogDescription>
        </DialogHeader>

        <div className="min-w-0 space-y-4 overflow-x-hidden overflow-y-auto px-5 py-4">
          <div className="min-w-0 rounded-lg border border-border bg-muted px-4 py-3">
            <p className="text-[13px] font-semibold leading-snug break-words text-color-titulos">
              ¿Está seguro que procede la Declaratoria de Desierto?
            </p>
            <p className="mt-1 text-[11px] italic text-muted-foreground">
              Base Legal: Artículo 113 LCP; 4 Normas SUNAI.
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant={confirmacion === true ? "destructive" : "outline"}
                disabled={isSubmitting}
                className={
                  confirmacion === true
                    ? undefined
                    : "border-border text-color-titulos hover:bg-muted"
                }
                onClick={() => setConfirmacion(true)}
              >
                Sí
              </Button>
              <Button
                type="button"
                size="sm"
                variant={confirmacion === false ? "secondary" : "outline"}
                disabled={isSubmitting}
                className="border-border"
                onClick={() => {
                  setConfirmacion(false);
                  setCausal("");
                  setJustificacion("");
                }}
              >
                No
              </Button>
            </div>
          </div>

          <div className="min-w-0 space-y-1.5">
            <Label className="text-[12px] font-semibold break-words text-color-titulos">
              Seleccione la causal legal de la Declaratoria (Art. 113 LCP):
            </Label>
            <Select
              value={causal || undefined}
              onValueChange={(value) => setCausal(value as CausalDeclaratoriaDesierto)}
              disabled={confirmacion !== true || isSubmitting}
            >
              <SelectTrigger
                title={
                  CAUSALES_DECLARATORIA_DESIERTO.find((option) => option.value === causal)?.label
                }
                className="h-9 w-full min-w-0 max-w-full overflow-hidden border-border text-left text-[12px] data-[size=default]:h-9"
              >
                <SelectValue placeholder="Seleccione una causal">
                  {selectedShortLabel ? (
                    <span className="block truncate pr-1">{selectedShortLabel}</span>
                  ) : null}
                </SelectValue>
              </SelectTrigger>
              <SelectContent
                position="popper"
                className="z-[60] w-[var(--radix-select-trigger-width)] max-w-[var(--radix-select-trigger-width)]"
              >
                {CAUSALES_DECLARATORIA_DESIERTO.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="items-start py-2 text-[12px] leading-snug whitespace-normal"
                  >
                    <span className="pr-4 break-words">{option.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-0 space-y-1.5">
            <Label className="text-[12px] font-semibold break-words text-color-titulos">
              Justifique detalladamente las razones legales o técnicas:
            </Label>
            <Textarea
              value={justificacion}
              onChange={(event) => setJustificacion(event.target.value)}
              disabled={confirmacion !== true || isSubmitting}
              placeholder="Argumentación para el Informe de Recomendación..."
              className="min-h-[100px] w-full max-w-full resize-none break-words border-border text-[12px] italic placeholder:text-muted-foreground"
            />
            <p className="text-[10px] italic text-muted-foreground">
              Artículos 113 LCP; 4 Normas SUNAI.
            </p>
          </div>
        </div>

        <DialogFooter className="w-full shrink-0 flex-col-reverse gap-2 border-t border-border px-5 py-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            className="w-full border-border text-color-titulos sm:w-auto"
            onClick={() => handleOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!canSubmit}
            onClick={handleConfirm}
            className="w-full gap-2 sm:w-auto"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Guardando...
              </span>
            ) : (
              <>
                <Lock className="h-3.5 w-3.5" />
                Ejecutar Declaratoria
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

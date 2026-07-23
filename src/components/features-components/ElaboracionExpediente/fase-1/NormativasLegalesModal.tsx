"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FASE1_NORMATIVAS_PREDEFINIDAS } from "@/lib/constants/fase1";

export interface NormativasLegalesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NormativasLegalesModal({ open, onOpenChange }: NormativasLegalesModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[85vh] flex-col gap-0 overflow-hidden border-0 bg-white p-0 shadow-xl sm:max-w-2xl"
      >
        <DialogHeader className="shrink-0 border-b border-slate-100 px-5 py-4 text-left">
          <DialogTitle className="font-inter text-base font-bold text-color-titulos">
            Normativas aplicables al procedimiento
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <ul className="space-y-3">
            {FASE1_NORMATIVAS_PREDEFINIDAS.map((norma) => (
              <li
                key={norma}
                className="border-b border-slate-100 pb-3 text-[12px] leading-relaxed text-slate-700 last:border-b-0 last:pb-0"
              >
                {norma}
              </li>
            ))}
          </ul>
        </div>

        <DialogFooter className="shrink-0 border-t border-slate-100 px-5 py-4 sm:justify-end">
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="bg-navy font-inter text-white hover:bg-navy-hover"
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

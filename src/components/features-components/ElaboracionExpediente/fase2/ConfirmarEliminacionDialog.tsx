"use client";

import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ConfirmarEliminacionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  tipo: "adquirente" | "oferente";
}

export function ConfirmarEliminacionDialog({
  open,
  onOpenChange,
  onConfirm,
  tipo,
}: ConfirmarEliminacionDialogProps) {
  const [inputValue, setInputValue] = useState("");
  const [step, setStep] = useState(1);

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setInputValue("");
      setStep(1);
    }
    onOpenChange(isOpen);
  };

  const handleNextStep = () => {
    if (inputValue === "ELIMINAR") {
      setStep(2);
    }
  };

  const handleFinalConfirm = () => {
    onConfirm();
    handleClose(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent className="bg-white border-2 border-danger max-w-[400px]">
        {step === 1 ? (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-heading-dark font-inter text-lg font-bold">
                ¿Estás absolutamente seguro?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-muted-foreground font-inter italic">
                Esta acción es irreversible y no se puede deshacer. ¿Estás seguro que deseas
                eliminar a este {tipo}?
              </AlertDialogDescription>
              <p className="text-sm font-inter mt-1 italic text-muted-foreground">
                Si es sí, escribe{" "}
                <span className="font-bold text-red-600 not-italic">ELIMINAR</span>
              </p>
            </AlertDialogHeader>

            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="ELIMINAR"
              className="h-10 border-border font-inter"
            />

            <AlertDialogFooter className="sm:justify-end gap-2">
              <Button
                onClick={handleNextStep}
                disabled={inputValue !== "ELIMINAR"}
                className="bg-red-600 hover:bg-red-700 text-white font-inter font-semibold disabled:opacity-50"
              >
                Eliminar
              </Button>
              <AlertDialogCancel className="font-inter mt-0">Cancelar</AlertDialogCancel>
            </AlertDialogFooter>
          </>
        ) : (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold text-slate-800">
                ¿Estás absolutamente seguro?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-slate-500 font-medium leading-relaxed italic">
                Esta acción es irreversible y no se puede deshacer. Esto eliminará permanentemente
                los datos del {tipo} de nuestros servidores.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="flex flex-row justify-center gap-3 mt-4">
              <Button
                variant="ghost"
                onClick={() => handleClose(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-8 rounded-md"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleFinalConfirm}
                className="bg-[#ff4d4d] hover:bg-red-600 text-white font-bold px-6 rounded-md"
              >
                Continuar con la eliminación
              </Button>
            </div>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}

"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface EliminarFeriadoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  descripcion: string;
  onConfirm: () => void;
  loading?: boolean;
}

export function EliminarFeriadoDialog({
  open,
  onOpenChange,
  descripcion,
  onConfirm,
  loading = false,
}: EliminarFeriadoDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white border border-danger">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-heading-dark">
            ¿Eliminar día no laborable?
          </AlertDialogTitle>
          <AlertDialogDescription>
            ¿Está seguro que desea eliminar <strong>{descripcion}</strong>? Esta acción no se puede
            deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="bg-danger hover:bg-danger/90 text-white"
          >
            {loading ? "Eliminando..." : "Eliminar"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

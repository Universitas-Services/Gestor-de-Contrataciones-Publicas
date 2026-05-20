"use client";

import { useRouter } from "next/navigation";
import { FaCheckCircle } from "react-icons/fa";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ContratoSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expedienteId: string;
  readOnly?: boolean;
}

export function ContratoSuccessDialog({
  open,
  onOpenChange,
  expedienteId,
  readOnly = false,
}: ContratoSuccessDialogProps) {
  const router = useRouter();

  const handleGenerarContrato = () => {
    if (readOnly) return;
    onOpenChange(false);
    toast.success("El contrato se generó correctamente.");
    router.replace(`/elaboracion-expediente/${expedienteId}?tab=fase-4`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] flex flex-col items-center justify-center p-8 gap-4 rounded-xl">
        <div className="w-16 h-16 rounded-full border-[3px] border-success flex items-center justify-center mb-2">
          <FaCheckCircle className="w-8 h-8 text-success" />
        </div>
        <DialogHeader className="text-center w-full space-y-2">
          <DialogTitle className="text-xl font-bold text-navy w-full text-center">
            ¡Excelente!
          </DialogTitle>
          <DialogDescription className="text-sm text-foreground w-full text-center">
            Ha completado la carga de datos del contrato.
          </DialogDescription>
        </DialogHeader>
        <div className="w-full mt-4 flex flex-col items-center gap-3">
          <Button
            type="button"
            onClick={handleGenerarContrato}
            disabled={readOnly}
            className="w-full sm:w-[200px] bg-navy hover:bg-navy-hover text-white font-bold h-11 rounded-md"
          >
            Generar contrato
          </Button>
          <p className="w-full text-sm italic text-muted-foreground text-center">
            El sistema está listo para generar el contrato.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaCheckCircle } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { generarDocumento } from "@/services/generadorDocumentosService";

interface ContratoSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expedienteId: string;
  readOnly?: boolean;
  isEditing?: boolean;
  onContratoGenerado?: () => void;
}

export function ContratoSuccessDialog({
  open,
  onOpenChange,
  expedienteId,
  readOnly = false,
  isEditing = false,
  onContratoGenerado,
}: ContratoSuccessDialogProps) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerarContrato = async () => {
    if (readOnly) return;

    setIsGenerating(true);
    try {
      await generarDocumento("contrato", expedienteId);
      toast.success(
        isEditing ? "Contrato regenerado correctamente." : "Contrato generado correctamente."
      );
      onOpenChange(false);
      onContratoGenerado?.();
      router.replace(`/elaboracion-expediente/${expedienteId}?tab=fase-4`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al generar el contrato formalizado"
      );
    } finally {
      setIsGenerating(false);
    }
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
            {isEditing
              ? "Los datos del contrato han sido actualizados."
              : "Ha completado la carga de datos del contrato."}
          </DialogDescription>
        </DialogHeader>
        <div className="w-full mt-4 flex flex-col items-center gap-3">
          <Button
            type="button"
            onClick={handleGenerarContrato}
            disabled={readOnly || isGenerating}
            className="w-full sm:w-[200px] bg-navy hover:bg-navy-hover text-white font-bold h-11 rounded-md"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Generando...
              </span>
            ) : isEditing ? (
              "Regenerar contrato"
            ) : (
              "Generar contrato"
            )}
          </Button>
          <p className="w-full text-sm italic text-muted-foreground text-center">
            {isEditing
              ? "Puedes regenerar el contrato con los datos actualizados."
              : "El sistema está listo para generar el contrato."}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

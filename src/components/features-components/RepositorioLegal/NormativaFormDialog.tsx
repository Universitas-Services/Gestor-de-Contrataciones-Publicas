"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  bibliotecaNormativaFormSchema,
  type BibliotecaNormativaFormValues,
} from "@/lib/schemas/bibliotecaNormativaSchema";
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
import { Textarea } from "@/components/ui/textarea";

interface NormativaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "crear" | "editar";
  initialTexto?: string;
  saving?: boolean;
  onSubmit: (values: BibliotecaNormativaFormValues) => Promise<void> | void;
}

export function NormativaFormDialog({
  open,
  onOpenChange,
  mode,
  initialTexto = "",
  saving = false,
  onSubmit,
}: NormativaFormDialogProps) {
  const form = useForm<BibliotecaNormativaFormValues>({
    resolver: zodResolver(bibliotecaNormativaFormSchema),
    defaultValues: { textoNormativaCompleto: initialTexto },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({ textoNormativaCompleto: initialTexto });
  }, [open, initialTexto, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{mode === "crear" ? "Agregar normativa" : "Editar normativa"}</DialogTitle>
          <DialogDescription>
            Ingrese el texto completo de la normativa para la biblioteca del ente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="textoNormativaCompleto">Texto de la normativa</Label>
            <Textarea
              id="textoNormativaCompleto"
              rows={10}
              disabled={saving}
              className="min-h-[200px] resize-y"
              {...form.register("textoNormativaCompleto")}
            />
            {form.formState.errors.textoNormativaCompleto ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.textoNormativaCompleto.message}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : mode === "crear" ? "Agregar" : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

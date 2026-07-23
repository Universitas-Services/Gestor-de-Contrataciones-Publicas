"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  bulkFeriadosSchema,
  type BulkFeriadosFormValues,
} from "@/lib/schemas/cronogramaEnteSchema";

interface BulkFeriadosDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fechas: string[];
  onRemoveFecha: (fecha: string) => void;
  onSubmit: (values: BulkFeriadosFormValues) => Promise<void>;
  loading?: boolean;
}

function formatFechaLabel(fecha: string) {
  return format(parseISO(fecha), "EEE d MMM yyyy", { locale: es });
}

export function BulkFeriadosDialog({
  open,
  onOpenChange,
  fechas,
  onRemoveFecha,
  onSubmit,
  loading = false,
}: BulkFeriadosDialogProps) {
  const form = useForm<BulkFeriadosFormValues>({
    resolver: zodResolver(bulkFeriadosSchema),
    defaultValues: {
      descripcion: "",
      fechas,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({ descripcion: form.getValues("descripcion") || "", fechas });
    }
  }, [open, fechas, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle className="text-heading-dark">
            Registrar {fechas.length} días no laborables
          </DialogTitle>
          <DialogDescription>
            Se crearán feriados específicos para cada fecha seleccionada en el calendario.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bulk-descripcion">Descripción común</Label>
            <Input
              id="bulk-descripcion"
              placeholder="Ej. Feriados locales, Puente institucional"
              {...form.register("descripcion")}
            />
            {form.formState.errors.descripcion && (
              <p className="text-sm text-danger">{form.formState.errors.descripcion.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Fechas seleccionadas ({fechas.length})</Label>
            <div className="max-h-40 overflow-y-auto rounded-lg border border-border-light p-3 flex flex-wrap gap-2">
              {fechas.map((fecha) => (
                <Badge
                  key={fecha}
                  variant="outline"
                  className="gap-1 border-cal-bulk-selected-border bg-cal-bulk-selected-bg text-heading-dark"
                >
                  {formatFechaLabel(fecha)}
                  <button
                    type="button"
                    aria-label={`Quitar ${fecha}`}
                    onClick={() => onRemoveFecha(fecha)}
                    className="rounded-full hover:bg-muted p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            {form.formState.errors.fechas && (
              <p className="text-sm text-danger">{form.formState.errors.fechas.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || fechas.length === 0}
              className="bg-navy hover:bg-navy-hover"
            >
              {loading ? "Guardando..." : `Guardar ${fechas.length} feriados`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

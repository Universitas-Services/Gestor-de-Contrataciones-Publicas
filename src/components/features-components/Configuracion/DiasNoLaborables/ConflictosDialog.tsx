"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ConflictoDetectado } from "@/types/cronogramaEnte.types";
import Link from "next/link";

interface ConflictosDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conflictos: ConflictoDetectado[];
}

export function ConflictosDialog({ open, onOpenChange, conflictos }: ConflictosDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-heading-dark">
            Conflictos detectados en expedientes
          </DialogTitle>
          <DialogDescription>
            El feriado fue registrado, pero algunos expedientes activos tienen fechas que caen en
            días no laborables.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[360px] overflow-y-auto border border-border-light rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Expediente</TableHead>
                <TableHead>Campo afectado</TableHead>
                <TableHead>Fecha anterior</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conflictos.map((conflicto) =>
                conflicto.camposAfectados.map((campo) => (
                  <TableRow key={`${conflicto.expedienteId}-${campo.campo}`}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium text-heading-dark">
                          {conflicto.codigoNomenclatura}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {conflicto.descripcionObjeto}
                        </p>
                        <Link
                          href={`/elaboracion-expediente/${conflicto.expedienteId}`}
                          className="text-xs text-navy hover:underline"
                        >
                          Ver expediente
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>{campo.etiqueta}</TableCell>
                    <TableCell>{campo.fechaAnterior}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="bg-navy hover:bg-navy-hover">
            Entendido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DiaNoLaborable } from "@/types/cronogramaEnte.types";
import { formatDiaNoLaborableDisplay } from "@/lib/utils/diasNoLaborablesUtils";

interface FeriadosColumnsOptions {
  onEdit: (dia: DiaNoLaborable) => void;
  onDelete: (dia: DiaNoLaborable) => void;
}

export function getFeriadosColumns({
  onEdit,
  onDelete,
}: FeriadosColumnsOptions): ColumnDef<DiaNoLaborable>[] {
  return [
    {
      accessorKey: "descripcion",
      header: "Descripción",
      cell: ({ row }) => (
        <span className="font-medium text-heading-dark">{row.original.descripcion}</span>
      ),
    },
    {
      id: "fecha",
      header: "Fecha",
      cell: ({ row }) => (
        <span className="text-sm text-text-muted-dark">
          {formatDiaNoLaborableDisplay(row.original)}
        </span>
      ),
    },
    {
      id: "tipo",
      header: "Tipo",
      cell: ({ row }) => (
        <Badge variant="outline" className="border-border-light">
          {row.original.esRecurrente ? "Recurrente" : "Específico"}
        </Badge>
      ),
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onEdit(row.original)}
            aria-label="Editar"
          >
            <Pencil className="h-4 w-4 text-navy" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onDelete(row.original)}
            aria-label="Eliminar"
          >
            <Trash2 className="h-4 w-4 text-danger" />
          </Button>
        </div>
      ),
    },
  ];
}

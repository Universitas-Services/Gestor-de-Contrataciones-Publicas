"use client";

import React, { useEffect, useState } from "react";
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { Pencil, Plus, Trash2, WalletCards } from "lucide-react";

import { FASE1_IVA_RATE } from "@/lib/constants/fase1";
import type { PresupuestoItemRecord } from "@/types/fase1.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface PresupuestoItemsTableProps {
  items: PresupuestoItemRecord[];
  readOnly?: boolean;
  showAddButton?: boolean;
  addButtonDisabled?: boolean;
  addButtonLabel?: string;
  onAdd?: () => void;
  onEdit?: (item: PresupuestoItemRecord) => void;
  onDelete?: (item: PresupuestoItemRecord) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  pageSize?: number;
}

function formatBs(value: number) {
  return value.toLocaleString("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function buildColumns({
  readOnly,
  onEdit,
  onDelete,
}: Pick<
  PresupuestoItemsTableProps,
  "readOnly" | "onEdit" | "onDelete"
>): ColumnDef<PresupuestoItemRecord>[] {
  return [
    {
      accessorKey: "descripcionItem",
      header: "Descripción del ítem",
      cell: ({ row }) => (
        <span className="block min-w-[220px] whitespace-normal font-medium text-slate-700">
          {row.original.descripcionItem}
        </span>
      ),
    },
    {
      accessorKey: "codigoPartida",
      header: "Partida Presupuestaria",
      cell: ({ row }) => row.original.codigoPartida,
    },
    {
      accessorKey: "unidadMedida",
      header: "Unidad de Medida",
      cell: ({ row }) => row.original.unidadMedida,
    },
    {
      accessorKey: "cantidadRequerida",
      header: "Cantidad",
      cell: ({ row }) => formatBs(row.original.cantidadRequerida),
    },
    {
      accessorKey: "precioUnitarioEstimado",
      header: "Precio Unitario (Bs)",
      cell: ({ row }) => formatBs(row.original.precioUnitarioEstimado),
    },
    {
      accessorKey: "totalItems",
      header: "Total Items",
      cell: ({ row }) => formatBs(row.original.totalItems),
    },
    {
      id: "acciones",
      header: () => <span className="block text-center">Acciones</span>,
      cell: ({ row }) => {
        const isDisabled = readOnly || !onEdit || !onDelete;

        return (
          <div className="flex items-center justify-center gap-1">
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              disabled={isDisabled}
              aria-label={`Editar ${row.original.descripcionItem}`}
              onClick={() => onEdit?.(row.original)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              disabled={isDisabled}
              aria-label={`Eliminar ${row.original.descripcionItem}`}
              onClick={() => onDelete?.(row.original)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      },
    },
  ];
}

export function PresupuestoItemsTable({
  items,
  readOnly = false,
  showAddButton = false,
  addButtonDisabled = false,
  addButtonLabel = "Agregar Item",
  onAdd,
  onEdit,
  onDelete,
  emptyTitle = "Sin ítems cargados",
  emptyDescription = "Agregue al menos un producto para construir el presupuesto base.",
  pageSize = 5,
}: PresupuestoItemsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedItems = React.useMemo(
    () => items.slice(startIndex, startIndex + pageSize),
    [items, startIndex, pageSize]
  );
  const subtotal = items.reduce((sum, item) => sum + item.totalItems, 0);
  const iva = subtotal * FASE1_IVA_RATE;
  const totalPresupuesto = subtotal + iva;

  const columns = React.useMemo(
    () => buildColumns({ readOnly, onEdit, onDelete }),
    [readOnly, onEdit, onDelete]
  );

  // TanStack Table expone funciones no memoizables; este uso local del hook es esperado.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: paginatedItems,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardHeader className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-heading-dark">
          <WalletCards className="h-5 w-5 text-navy" />
          Presupuesto Base
        </CardTitle>

        {showAddButton && (
          <Button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onAdd?.();
            }}
            disabled={addButtonDisabled}
            className="w-fit bg-navy text-white hover:bg-navy-hover"
          >
            <Plus className="h-4 w-4" />
            {addButtonLabel}
          </Button>
        )}
      </CardHeader>

      <CardContent className="px-0 pb-4">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 first:pl-6 last:pr-6"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="px-4 py-4 align-top text-sm text-slate-700 first:pl-6 last:pr-6"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7} className="px-6 py-10 text-center">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-600">{emptyTitle}</p>
                    <p className="text-sm text-slate-500">{emptyDescription}</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>

          <TableFooter className="bg-white">
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={5}
                className="border-r-0 px-6 py-4 text-right text-sm text-slate-500"
              >
                Sub totales
              </TableCell>
              <TableCell
                colSpan={2}
                className="px-6 py-4 text-right text-base font-semibold text-heading-dark"
              >
                {formatBs(subtotal)} Bs
              </TableCell>
            </TableRow>
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={5}
                className="border-r-0 px-6 py-4 text-right text-sm text-slate-500"
              >
                IVA
              </TableCell>
              <TableCell
                colSpan={2}
                className="px-6 py-4 text-right text-base font-semibold text-heading-dark"
              >
                {formatBs(iva)} Bs
              </TableCell>
            </TableRow>
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={5}
                className="border-r-0 px-6 py-4 text-right text-sm text-slate-500"
              >
                Total Presupuesto
              </TableCell>
              <TableCell
                colSpan={2}
                className="px-6 py-4 text-right text-lg font-bold text-heading-dark"
              >
                {formatBs(totalPresupuesto)} Bs
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>

        <div className="px-4 pt-4 sm:px-6">
          <Pagination className="justify-end">
            <PaginationContent className="gap-1">
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  aria-disabled={currentPage === 1}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  onClick={(event) => {
                    event.preventDefault();
                    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
                  }}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }).map((_, index) => {
                const page = index + 1;

                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      isActive={page === currentPage}
                      onClick={(event) => {
                        event.preventDefault();
                        setCurrentPage(page);
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  aria-disabled={currentPage === totalPages}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  onClick={(event) => {
                    event.preventDefault();
                    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </CardContent>
    </Card>
  );
}

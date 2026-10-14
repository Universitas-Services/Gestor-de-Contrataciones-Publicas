"use client";

import React, { useEffect, useState } from "react";
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { Pencil, Plus, Trash2, WalletCards } from "lucide-react";

import { FASE1_IVA_RATE } from "@/lib/constants/fase1";
import type { PresupuestoItemRecord, PresupuestoItemsTotals } from "@/types/fase1.types";
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
import { Skeleton } from "@/components/ui/skeleton";

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
  loading?: boolean;
  hideHeader?: boolean;
  serverPagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  serverTotals?: PresupuestoItemsTotals;
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
  rowNumberOffset,
}: Pick<PresupuestoItemsTableProps, "readOnly" | "onEdit" | "onDelete"> & {
  rowNumberOffset: number;
}): ColumnDef<PresupuestoItemRecord>[] {
  return [
    {
      id: "numero",
      header: "Nº",
      cell: ({ row }) => (
        <span className="font-semibold text-slate-600">{rowNumberOffset + row.index + 1}</span>
      ),
    },
    {
      accessorKey: "descripcionItem",
      header: "Descripción del ítem",
      cell: ({ row }) => (
        <span className="block min-w-[160px] whitespace-normal text-center text-[12px] leading-5 font-medium text-slate-700">
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
      cell: ({ row }) => <span className="font-semibold">{formatBs(row.original.totalItems)}</span>,
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => {
        if (readOnly) {
          return <span className="text-xs font-semibold text-slate-400">Solo lectura</span>;
        }

        const isEditDisabled = !onEdit;
        const isDeleteDisabled = !onDelete;

        return (
          <div className="flex items-center justify-center gap-1">
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              disabled={isEditDisabled}
              aria-label={`Editar ${row.original.descripcionItem}`}
              onClick={() => onEdit?.(row.original)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              disabled={isDeleteDisabled}
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

const COLUMN_HEADER_CLASSNAMES: Record<string, string> = {
  numero: "w-[6%] min-w-[48px] text-center",
  descripcionItem: "w-[19%] min-w-[160px] text-center",
  codigoPartida: "w-[15%] min-w-[128px] text-center",
  unidadMedida: "w-[13%] min-w-[110px] text-center",
  cantidadRequerida: "w-[10%] min-w-[82px] text-center",
  precioUnitarioEstimado: "w-[15%] min-w-[118px] text-center",
  totalItems: "w-[12%] min-w-[96px] text-center",
  acciones: "w-[10%] min-w-[84px] text-center",
};

const COLUMN_CELL_CLASSNAMES: Record<string, string> = {
  numero: "min-w-[48px] text-center",
  descripcionItem: "min-w-[160px] text-center",
  codigoPartida: "min-w-[128px] text-center",
  unidadMedida: "min-w-[110px] text-center",
  cantidadRequerida: "min-w-[82px] text-center",
  precioUnitarioEstimado: "min-w-[118px] text-center",
  totalItems: "min-w-[96px] text-center",
  acciones: "min-w-[84px] text-center",
};

const SKELETON_CELL_WIDTHS = [
  "w-[28px]",
  "w-[85%]",
  "w-[70%]",
  "w-[60%]",
  "w-[55%]",
  "w-[65%]",
  "w-[68%]",
  "w-[48px]",
] as const;

export function PresupuestoItemsTable({
  items,
  readOnly = false,
  showAddButton = false,
  addButtonDisabled = false,
  addButtonLabel = "Agregar item",
  onAdd,
  onEdit,
  onDelete,
  emptyTitle = "Sin ítems cargados",
  emptyDescription = "Agregue al menos un producto para construir el presupuesto base.",
  pageSize = 5,
  loading = false,
  hideHeader = false,
  serverPagination,
  serverTotals,
}: PresupuestoItemsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const isServerMode = Boolean(serverPagination);
  const totalPages = isServerMode
    ? Math.max(1, serverPagination?.totalPages ?? 1)
    : Math.max(1, Math.ceil(items.length / pageSize));
  const resolvedCurrentPage = isServerMode
    ? Math.max(1, serverPagination?.currentPage ?? 1)
    : currentPage;

  useEffect(() => {
    if (!isServerMode && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, isServerMode, totalPages]);

  const startIndex = (resolvedCurrentPage - 1) * pageSize;
  const paginatedItems = React.useMemo(
    () => (isServerMode ? items : items.slice(startIndex, startIndex + pageSize)),
    [isServerMode, items, startIndex, pageSize]
  );
  const subtotal = isServerMode
    ? (serverTotals?.subtotal ?? 0)
    : items.reduce((sum, item) => sum + item.totalItems, 0);
  const iva = isServerMode ? (serverTotals?.montoIva ?? 0) : subtotal * FASE1_IVA_RATE;
  const totalPresupuesto = isServerMode ? (serverTotals?.montoTotal ?? 0) : subtotal + iva;

  const columns = React.useMemo(
    () => buildColumns({ readOnly, onEdit, onDelete, rowNumberOffset: startIndex }),
    [readOnly, onEdit, onDelete, startIndex]
  );
  const fillerRowCount =
    !loading && paginatedItems.length > 0 ? Math.max(0, pageSize - paginatedItems.length) : 0;

  // TanStack Table expone funciones no memoizables; este uso local del hook es esperado.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: paginatedItems,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card className="border border-slate-200 shadow-sm">
      {!hideHeader ? (
        <CardHeader className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/60 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-[17px] font-bold text-color-titulos">
            <WalletCards className="h-5 w-5 text-navy" />
            Presupuesto base
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
              size="sm"
              className="w-fit cursor-pointer bg-navy text-[11px] font-semibold text-white hover:bg-navy-hover"
            >
              <Plus className="h-4 w-4" />
              {addButtonLabel}
            </Button>
          )}
        </CardHeader>
      ) : null}

      <CardContent className="px-0 pb-4">
        <Table className="table-fixed min-w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={`bg-slate-50 px-3 py-2.5 text-[10px] font-semibold uppercase leading-[1.25] tracking-[0.04em] whitespace-normal text-slate-500 first:pl-5 last:pr-5 ${COLUMN_HEADER_CLASSNAMES[header.column.id] ?? ""}`}
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
            {loading ? (
              Array.from({ length: pageSize }).map((_, rowIndex) => (
                <TableRow key={`skeleton-row-${rowIndex}`} className="hover:bg-transparent">
                  {table.getVisibleLeafColumns().map((column, columnIndex) => (
                    <TableCell
                      key={`skeleton-cell-${rowIndex}-${column.id}`}
                      className={`px-3 py-3 align-top first:pl-5 last:pr-5 ${COLUMN_CELL_CLASSNAMES[column.id] ?? ""}`}
                    >
                      {columnIndex === table.getVisibleLeafColumns().length - 1 ? (
                        <div className="flex items-center justify-center gap-2">
                          <Skeleton className="h-4 w-4 rounded-sm" />
                          <Skeleton className="h-4 w-4 rounded-sm" />
                        </div>
                      ) : (
                        <Skeleton
                          className={`h-5 ${SKELETON_CELL_WIDTHS[columnIndex] ?? "w-full"}`}
                        />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length > 0 ? (
              <>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={`px-3 py-3 align-middle text-center text-[12px] leading-5 text-slate-700 first:pl-5 last:pr-5 ${COLUMN_CELL_CLASSNAMES[cell.column.id] ?? ""}`}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}

                {Array.from({ length: fillerRowCount }).map((_, index) => (
                  <TableRow key={`filler-row-${index}`} aria-hidden="true">
                    {table.getVisibleLeafColumns().map((column) => (
                      <TableCell
                        key={`filler-cell-${index}-${column.id}`}
                        className={`px-3 py-3 text-[12px] first:pl-5 last:pr-5 ${COLUMN_CELL_CLASSNAMES[column.id] ?? ""}`}
                      >
                        &nbsp;
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </>
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={8} className="h-[281px] px-6 py-10 text-center align-middle">
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
                colSpan={6}
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
                colSpan={6}
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
                colSpan={6}
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

        <div className="px-4 pt-2 sm:px-6">
          <Pagination className="justify-end">
            <PaginationContent className="gap-1">
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  aria-disabled={resolvedCurrentPage === 1 || loading}
                  className={
                    resolvedCurrentPage === 1 || loading ? "pointer-events-none opacity-50" : ""
                  }
                  onClick={(event) => {
                    event.preventDefault();
                    if (resolvedCurrentPage <= 1 || loading) return;

                    if (isServerMode) {
                      serverPagination?.onPageChange(resolvedCurrentPage - 1);
                      return;
                    }

                    setCurrentPage((prev) => prev - 1);
                  }}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }).map((_, index) => {
                const page = index + 1;

                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      isActive={page === resolvedCurrentPage}
                      onClick={(event) => {
                        event.preventDefault();
                        if (loading || page === resolvedCurrentPage) return;

                        if (isServerMode) {
                          serverPagination?.onPageChange(page);
                          return;
                        }

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
                  aria-disabled={resolvedCurrentPage === totalPages || loading}
                  className={
                    resolvedCurrentPage === totalPages || loading
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                  onClick={(event) => {
                    event.preventDefault();
                    if (resolvedCurrentPage >= totalPages || loading) return;

                    if (isServerMode) {
                      serverPagination?.onPageChange(resolvedCurrentPage + 1);
                      return;
                    }

                    setCurrentPage((prev) => prev + 1);
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

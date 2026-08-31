"use client";

import React, { useEffect, useState } from "react";
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { Landmark, Pencil, Plus, Trash2 } from "lucide-react";

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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CUENTAS_BANCARIAS_ADD_LABEL,
  CUENTAS_BANCARIAS_EMPTY_DESCRIPTION,
  CUENTAS_BANCARIAS_EMPTY_TITLE,
  CUENTAS_BANCARIAS_SECTION_TITLE,
  labelTipoCuenta,
  type CuentaBancariaEnte,
} from "@/lib/constants/cuentasBancariasEnte";

const PAGE_SIZE = 5;

const COLUMN_HEADER_CLASSNAMES: Record<string, string> = {
  numero: "w-[8%] text-center",
  bancoPagoPliego: "w-[32%] text-center",
  cuentaPagoPliego: "w-[30%] text-center",
  tipoCuentaPagoPliego: "w-[18%] text-center",
  acciones: "w-[12%] text-center",
};

const COLUMN_CELL_CLASSNAMES: Record<string, string> = {
  numero: "text-center",
  bancoPagoPliego: "text-center",
  cuentaPagoPliego: "text-center font-mono text-[11px]",
  tipoCuentaPagoPliego: "text-center",
  acciones: "text-center",
};

function buildColumns({
  readOnly,
  onEdit,
  onDelete,
  rowNumberOffset,
}: {
  readOnly?: boolean;
  onEdit?: (item: CuentaBancariaEnte) => void;
  onDelete?: (item: CuentaBancariaEnte) => void;
  rowNumberOffset: number;
}): ColumnDef<CuentaBancariaEnte>[] {
  return [
    {
      id: "numero",
      header: "Nº",
      cell: ({ row }) => (
        <span className="font-semibold text-slate-600">{rowNumberOffset + row.index + 1}</span>
      ),
    },
    {
      accessorKey: "bancoPagoPliego",
      header: "Nombre del Banco",
      cell: ({ row }) => (
        <span className="block min-w-[120px] whitespace-normal text-[12px] font-medium leading-5 text-slate-700">
          {row.original.bancoPagoPliego}
        </span>
      ),
    },
    {
      accessorKey: "cuentaPagoPliego",
      header: "Número de cuenta",
      cell: ({ row }) => row.original.cuentaPagoPliego,
    },
    {
      accessorKey: "tipoCuentaPagoPliego",
      header: "Tipo de cuenta",
      cell: ({ row }) => labelTipoCuenta(row.original.tipoCuentaPagoPliego),
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => {
        if (readOnly) {
          return <span className="text-xs font-semibold text-slate-400">Solo lectura</span>;
        }

        return (
          <div className="flex items-center justify-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:text-navy"
              aria-label={`Editar ${row.original.bancoPagoPliego}`}
              onClick={() => onEdit?.(row.original)}
              disabled={!onEdit}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:text-destructive"
              aria-label={`Eliminar ${row.original.bancoPagoPliego}`}
              onClick={() => onDelete?.(row.original)}
              disabled={!onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];
}

export interface CuentasBancariasTableProps {
  items: CuentaBancariaEnte[];
  readOnly?: boolean;
  onAdd?: () => void;
  onEdit?: (item: CuentaBancariaEnte) => void;
  onDelete?: (item: CuentaBancariaEnte) => void;
}

export function CuentasBancariasTable({
  items,
  readOnly = false,
  onAdd,
  onEdit,
  onDelete,
}: CuentasBancariasTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedItems = React.useMemo(
    () => items.slice(startIndex, startIndex + PAGE_SIZE),
    [items, startIndex]
  );
  const fillerRowCount =
    paginatedItems.length > 0 ? Math.max(0, PAGE_SIZE - paginatedItems.length) : 0;

  const columns = React.useMemo(
    () => buildColumns({ readOnly, onEdit, onDelete, rowNumberOffset: startIndex }),
    [readOnly, onEdit, onDelete, startIndex]
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: paginatedItems,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardHeader className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/60 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="flex items-center gap-2 text-[17px] font-bold text-color-titulos">
          <Landmark className="h-5 w-5 text-navy" />
          {CUENTAS_BANCARIAS_SECTION_TITLE}
        </CardTitle>

        {!readOnly ? (
          <Button
            type="button"
            onClick={onAdd}
            size="sm"
            className="w-fit cursor-pointer bg-navy text-[11px] font-semibold text-white hover:bg-navy-hover"
          >
            <Plus className="h-4 w-4" />
            {CUENTAS_BANCARIAS_ADD_LABEL}
          </Button>
        ) : null}
      </CardHeader>

      <CardContent className="px-0 pb-4">
        <Table className="min-w-full table-fixed">
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
            {table.getRowModel().rows.length > 0 ? (
              <>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={`px-3 py-3 align-middle text-[12px] leading-5 text-slate-700 first:pl-5 last:pr-5 ${COLUMN_CELL_CLASSNAMES[cell.column.id] ?? ""}`}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {Array.from({ length: fillerRowCount }).map((_, index) => (
                  <TableRow key={`filler-${index}`} aria-hidden="true">
                    {table.getVisibleLeafColumns().map((column) => (
                      <TableCell
                        key={`filler-${index}-${column.id}`}
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
                <TableCell colSpan={5} className="h-[220px] px-6 py-10 text-center align-middle">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-600">
                      {CUENTAS_BANCARIAS_EMPTY_TITLE}
                    </p>
                    <p className="text-sm text-slate-500">{CUENTAS_BANCARIAS_EMPTY_DESCRIPTION}</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {items.length > PAGE_SIZE ? (
          <div className="mt-3 flex justify-center px-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage((p) => Math.max(1, p - 1));
                    }}
                    className={currentPage <= 1 ? "pointer-events-none opacity-50" : undefined}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === i + 1}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(i + 1);
                      }}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage((p) => Math.min(totalPages, p + 1));
                    }}
                    className={
                      currentPage >= totalPages ? "pointer-events-none opacity-50" : undefined
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

"use client";

import * as React from "react";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTablePagination } from "@/components/features-components/GestionUsuarios/DataTablePagination";
import type { DiaNoLaborable } from "@/types/cronogramaEnte.types";
import type { PaginationMetadata } from "@/types/user-management.types";
import { getFeriadosColumns } from "./columns";

interface FeriadosTableProps {
  data: DiaNoLaborable[];
  metadata: PaginationMetadata | null;
  loading: boolean;
  selectedYear: number;
  onYearChange: (year: number) => void;
  pagination: { pageIndex: number; pageSize: number };
  onPaginationChange: (pagination: { pageIndex: number; pageSize: number }) => void;
  onCreate: () => void;
  onEdit: (dia: DiaNoLaborable) => void;
  onDelete: (dia: DiaNoLaborable) => void;
}

const YEAR_OPTIONS = Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - 1 + i);

export function FeriadosTable({
  data,
  metadata,
  loading,
  selectedYear,
  onYearChange,
  pagination,
  onPaginationChange,
  onCreate,
  onEdit,
  onDelete,
}: FeriadosTableProps) {
  const columns = React.useMemo(() => getFeriadosColumns({ onEdit, onDelete }), [onEdit, onDelete]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: metadata?.totalPages ?? 0,
    state: { pagination },
    onPaginationChange: (updater) => {
      const next = typeof updater === "function" ? updater(pagination) : updater;
      onPaginationChange(next);
    },
  });

  return (
    <Card className="border-border-light shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-heading-dark">Días registrados</CardTitle>
            <CardDescription>Listado de feriados y días inhábiles del ente.</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Select value={String(selectedYear)} onValueChange={(v) => onYearChange(Number(v))}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {YEAR_OPTIONS.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={onCreate} className="bg-navy hover:bg-navy-hover">
              <Plus className="h-4 w-4 mr-2" />
              Registrar feriado
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border-light overflow-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
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
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    <TableCell colSpan={columns.length}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No hay días no laborables registrados para {selectedYear}.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="pt-2">
          <DataTablePagination
            totalCount={metadata?.total ?? 0}
            pageCount={metadata?.totalPages ?? 0}
            pageIndex={pagination.pageIndex}
            pageSize={pagination.pageSize}
            onPageChange={(page) => onPaginationChange({ ...pagination, pageIndex: page })}
            onPageSizeChange={(size) => onPaginationChange({ pageIndex: 0, pageSize: size })}
          />
        </div>
      </CardContent>
    </Card>
  );
}

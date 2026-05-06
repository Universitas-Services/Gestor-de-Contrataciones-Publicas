"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { columns } from "./columns";
import { listarUsuariosEnte } from "@/services/enteService";
import { User, PaginationMetadata } from "@/types/user-management.types";
import { DataTablePagination } from "./DataTablePagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { useDebounce } from "@/hooks/use-debounce";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function UserManagementTable() {
  const searchParams = useSearchParams();
  const initialRol = searchParams.get("rol") || undefined;

  const [data, setData] = React.useState<User[]>([]);
  const [metadata, setMetadata] = React.useState<PaginationMetadata | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Pagination State
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Search State
  const [searchQuery, setSearchQuery] = React.useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 700);

  // Filter State
  const [roleFilter, setRoleFilter] = React.useState<string | undefined>(initialRol);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await listarUsuariosEnte({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        busqueda: debouncedSearchQuery,
        rol: roleFilter,
      });
      setData(response.data);
      setMetadata(response.metadata);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, debouncedSearchQuery, roleFilter]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    manualPagination: true,
    pageCount: metadata?.totalPages ?? -1,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    onPaginationChange: setPagination,
  });

  return (
    <Card className="bg-white shadow-sm border-slate-200 gap-0">
      <CardHeader className="pb-4 flex flex-row items-center justify-between space-y-0 border-b border-slate-100">
        <div className="space-y-1.5">
          <CardTitle className="text-2xl font-bold text-[#1e3a5f]">Panel de usuarios</CardTitle>
          <CardDescription className="text-sm text-slate-500 font-medium italic">
            Administra los roles y accesos de los {metadata?.total ?? "..."} usuarios registrados.
          </CardDescription>
        </div>
        <Button asChild className="bg-[#1e3a5f] hover:bg-[#162a45] h-10 px-6">
          <Link href="/admin_ente/gestion-datos/usuarios/nuevo">
            <Plus className="mr-2 h-5 w-5 text-white" />
            Agregar usuario
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="pt-5 px-6 space-y-5">
        {/* Filters Section */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Buscar por nombre, apellido o correo..."
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              }}
              className="pl-10 border-slate-200 focus-visible:ring-[#1e3a5f] bg-white h-10"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-600">Filtrar por:</span>
            <Select
              value={roleFilter || "TODOS"}
              onValueChange={(value) => {
                setRoleFilter(value === "TODOS" ? undefined : value);
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              }}
            >
              <SelectTrigger className="w-[200px] bg-white border-slate-200 focus:ring-[#1e3a5f] h-10 font-medium">
                <SelectValue placeholder="Todos los roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos los roles</SelectItem>
                <SelectItem value="EJECUTOR">Ejecutor</SelectItem>
                <SelectItem value="VISUALIZADOR">Visualizador</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content Section (Table or Loading) */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="hover:bg-transparent border-slate-200">
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="h-10 py-2 px-4">
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
                  // Loading state: Skeletons inside TableBody
                  Array.from({ length: pagination.pageSize }).map((_, i) => (
                    <TableRow key={`skeleton-${i}`} className="border-slate-100">
                      {columns.map((_, j) => (
                        <TableCell key={`skeleton-cell-${j}`} className="px-4 py-2.5">
                          <Skeleton className="h-5 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : data.length > 0 ? (
                  <>
                    {/* Actual data rows */}
                    {table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        className="hover:bg-slate-100 data-[state=selected]:bg-slate-200/50 border-slate-100 transition-colors"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="px-4 py-2.5">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                    {/* Empty filler rows to maintain consistent height with dividers */}
                    {Array.from({ length: Math.max(0, pagination.pageSize - data.length) }).map(
                      (_, i) => (
                        <TableRow
                          key={`empty-${i}`}
                          className="border-slate-100 hover:bg-transparent"
                        >
                          <TableCell colSpan={columns.length} className="px-4 py-2.5 h-[49px]">
                            &nbsp;
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-32 text-center text-slate-500 font-medium"
                    >
                      No se encontraron usuarios registrados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Section */}
          <div className="pt-1">
            <DataTablePagination
              totalCount={metadata?.total ?? 0}
              pageCount={metadata?.totalPages ?? 0}
              pageIndex={pagination.pageIndex}
              pageSize={pagination.pageSize}
              onPageChange={(page) => setPagination((prev) => ({ ...prev, pageIndex: page }))}
              onPageSizeChange={(size) => setPagination({ pageIndex: 0, pageSize: size })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

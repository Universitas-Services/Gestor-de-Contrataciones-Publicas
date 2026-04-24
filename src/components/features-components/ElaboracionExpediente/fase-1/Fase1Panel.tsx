"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import {
  Download,
  Eye,
  FileText,
  FileUp,
  Pencil,
  Plus,
  RefreshCw,
  Settings2,
  Trash2,
  WalletCards,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
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

interface Fase1PanelProps {
  expedienteId: string;
}

interface PresupuestoBaseRow {
  descripcion: string;
  partida: string;
  unidad: string;
  cantidad: number;
  precioUnitario: string;
  total: string;
}

interface DocumentoProcedimiento {
  id: string;
  label: string;
}

const DOCUMENTOS_PROCEDIMIENTO: DocumentoProcedimiento[] = [
  { id: "acta-inicio", label: "Acta de Inicio" },
  { id: "pliego-condiciones", label: "Pliego de Condiciones" },
  { id: "llamado-participar", label: "Llamado a participar" },
];

const PRESUPUESTO_COLUMNS: ColumnDef<PresupuestoBaseRow>[] = [
  {
    accessorKey: "descripcion",
    header: "Descripción del ítem",
    cell: ({ row }) => (
      <span className="block min-w-[220px] whitespace-normal font-medium text-slate-700">
        {row.original.descripcion}
      </span>
    ),
  },
  {
    accessorKey: "partida",
    header: "Partida Presupuestaria",
    cell: ({ row }) => row.original.partida,
  },
  {
    accessorKey: "unidad",
    header: "Unidad de Medida",
    cell: ({ row }) => row.original.unidad,
  },
  {
    accessorKey: "cantidad",
    header: "Cantidad",
    cell: ({ row }) => row.original.cantidad,
  },
  {
    accessorKey: "precioUnitario",
    header: "Precio Unitario Bs",
    cell: ({ row }) => row.original.precioUnitario,
  },
  {
    accessorKey: "total",
    header: "Total ítems",
    cell: ({ row }) => row.original.total,
  },
  {
    id: "acciones",
    header: () => <span className="block text-center">Acciones</span>,
    cell: () => (
      <div className="flex items-center justify-center gap-1">
        <Button disabled size="icon-xs" variant="ghost" aria-label="Editar ítem">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button disabled size="icon-xs" variant="ghost" aria-label="Eliminar ítem">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    ),
  },
];

const EMPTY_PRESUPUESTO: PresupuestoBaseRow[] = [];

function EmptyText({ children }: { children: ReactNode }) {
  return <p className="text-sm leading-6 text-slate-500">{children}</p>;
}

function formatBs(value: number) {
  return value.toLocaleString("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function Fase1Panel({ expedienteId }: Fase1PanelProps) {
  // TanStack Table expone funciones no memoizables; este uso local del hook es esperado.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: EMPTY_PRESUPUESTO,
    columns: PRESUPUESTO_COLUMNS,
    getCoreRowModel: getCoreRowModel(),
  });

  const totalPages = 1;
  const currentPage = 1;
  const subtotal = 0;
  const iva = 0;
  const totalEstimado = subtotal + iva;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          asChild
          className="bg-navy hover:bg-navy-hover text-white font-inter font-semibold shadow-sm"
        >
          <Link href={`/elaboracion-expediente/${expedienteId}/fase-1`}>
            Iniciar fase de preparación
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.9fr)]">
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="space-y-0 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-heading-dark">
              <Settings2 className="h-5 w-5 text-navy" />
              Definición técnica y financiera
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <section className="space-y-2">
              <h3 className="text-base font-semibold text-heading-dark">
                Características técnicas
              </h3>
              <EmptyText>
                Sin información registrada para esta fase. Aquí se mostrará la definición técnica
                del procedimiento.
              </EmptyText>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-semibold text-heading-dark">Cantidades y alcance</h3>
              <EmptyText>
                Pendiente por completar. Este bloque resumirá cantidades, alcance operativo y
                unidades asociadas al expediente.
              </EmptyText>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-semibold text-heading-dark">
                Ventajas económicas/técnicas
              </h3>
              <EmptyText>
                Aún no se han incorporado observaciones. Se visualizarán aquí las justificaciones
                técnicas y financieras del procedimiento.
              </EmptyText>
            </section>

            <section className="flex flex-col gap-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-heading-dark">
                  Proyecto de Responsabilidad Social
                </h3>
                <p className="text-sm text-slate-500">
                  Estado pendiente. Se definirá cuando se configure la información del formulario.
                </p>
              </div>
              <Badge
                variant="outline"
                className="w-fit border-slate-200 bg-white px-3 py-1 text-slate-500"
              >
                Sin definir
              </Badge>
            </section>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="space-y-0 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-heading-dark">
              <FileText className="h-5 w-5 text-navy" />
              Documentos del Procedimiento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {DOCUMENTOS_PROCEDIMIENTO.map((documento) => (
              <div
                key={documento.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                    <FileUp className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{documento.label}</span>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    disabled
                    size="icon-xs"
                    variant="ghost"
                    aria-label={`Ver ${documento.label}`}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    disabled
                    size="icon-xs"
                    variant="ghost"
                    aria-label={`Descargar ${documento.label}`}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    disabled
                    size="icon-xs"
                    variant="ghost"
                    aria-label={`Regenerar ${documento.label}`}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-heading-dark">
            <WalletCards className="h-5 w-5 text-navy" />
            Presupuesto Base
          </CardTitle>
          <Button disabled variant="ghost" className="justify-start px-0 text-navy sm:px-3">
            <Plus className="h-4 w-4" />
            Añadir ítem
          </Button>
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
                  <TableCell
                    colSpan={PRESUPUESTO_COLUMNS.length}
                    className="px-6 py-10 text-center"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-slate-600">Sin ítems cargados</p>
                      <p className="text-sm text-slate-500">
                        La tabla de presupuesto se habilitará cuando se complete el formulario de la
                        Fase 1.
                      </p>
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
                  Sub total
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
                  Total Presupuesto Estimado
                </TableCell>
                <TableCell
                  colSpan={2}
                  className="px-6 py-4 text-right text-lg font-bold text-heading-dark"
                >
                  {formatBs(totalEstimado)} Bs
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
                    aria-disabled="true"
                    className="pointer-events-none opacity-50"
                    onClick={(event) => event.preventDefault()}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }).map((_, index) => {
                  const page = index + 1;

                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        isActive={page === currentPage}
                        className="pointer-events-none"
                        onClick={(event) => event.preventDefault()}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    aria-disabled="true"
                    className="pointer-events-none opacity-50"
                    onClick={(event) => event.preventDefault()}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

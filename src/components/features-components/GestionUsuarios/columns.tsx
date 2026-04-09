"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Eye, Pencil, Trash2 } from "lucide-react";
import type { User } from "@/types/user-management.types";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const columns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "nombre",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent p-0 font-bold text-slate-900"
        >
          Nombre
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="font-medium text-slate-700">{row.getValue("nombre")}</div>,
  },
  {
    accessorKey: "apellido",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent p-0 font-bold text-slate-900"
        >
          Apellido
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="text-slate-700">{row.getValue("apellido")}</div>,
  },
  {
    accessorKey: "rol",
    header: "Roles",
    cell: ({ row }) => {
      const rol = row.getValue("rol") as string;
      return (
        <Badge
          variant="outline"
          className={cn(
            "rounded-full px-4 py-0.5 border-none font-medium",
            rol === "EJECUTOR"
              ? "bg-[#d1e7dd] text-[#0f5132]"
              : rol === "VISUALIZADOR"
                ? "bg-[#cfe2ff] text-[#084298]"
                : "bg-slate-100 text-slate-800"
          )}
        >
          {rol.charAt(0) + rol.slice(1).toLowerCase()}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center font-bold text-slate-900">Opciones</div>,
    cell: ({ row }) => {
      const user = row.original;

      return (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="h-8 w-8 text-slate-600 hover:text-slate-900"
          >
            <Link href={`/admin_ente/gestion-datos/usuarios/${user.id}`}>
              <Eye className="h-5 w-5" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="h-8 w-8 text-slate-600 hover:text-slate-900"
          >
            <Link href={`/admin_ente/gestion-datos/usuarios/${user.id}`}>
              <Pencil className="h-5 w-5" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      );
    },
  },
];

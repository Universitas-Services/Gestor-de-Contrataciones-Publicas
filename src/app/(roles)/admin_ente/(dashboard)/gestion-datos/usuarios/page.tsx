"use client";

import React from "react";
import { Plus, Eye, Pencil, Trash2, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

const MOCK_USERS = [
  { id: "1", nombre: "Brian Hugh", apellido: "Warner", roles: ["Ejecutor"] },
  { id: "2", nombre: "Eloisa Antonieta", apellido: "Rodriguez", roles: ["Visualizador"] },
  { id: "3", nombre: "Carmen Josefina", apellido: "Linarez", roles: ["Ejecutor"] },
  { id: "4", nombre: "Laura Cardona", apellido: "Bello", roles: ["Visualizador"] },
  { id: "5", nombre: "José Gregorio", asuaje: "Asuaje", roles: ["Ejecutor"] }, // Fixed the key 'asuaje' in the image it seems to be surname
  { id: "6", nombre: "Andrea Carolina", apellido: "Fernández", roles: ["Visualizador"] },
  { id: "7", nombre: "Katiusca Marian", apellido: "Rojas", roles: ["Ejecutor"] },
  { id: "8", nombre: "Luis Fernando", apellido: "Gómez", roles: ["Visualizador"] },
  { id: "9", nombre: "José Emilio", apellido: "Castro", roles: ["Ejecutor"] },
  { id: "10", nombre: "Marco Antonio", apellido: "Solis", roles: ["Visualizador"] },
];

export default function UsuariosPage() {
  return (
    <div className="flex flex-col gap-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-800">Panel de usuarios</h1>
          <p className="text-sm text-slate-500 font-medium italic">
            Administra los roles y accesos de los {MOCK_USERS.length} usuarios registrados.
          </p>
        </div>
        <Button asChild className="bg-[#1e3a5f] hover:bg-[#162a45]">
          <Link href="/admin_ente/gestion-datos/usuarios/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Agregar usuario
          </Link>
        </Button>
      </div>

      <hr className="border-slate-200" />

      {/* Table Section */}
      <div className="rounded-md border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox aria-label="Select all" />
              </TableHead>
              <TableHead className="font-bold text-slate-900">
                <div className="flex items-center gap-1 cursor-pointer hover:text-slate-700">
                  Nombre <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead className="font-bold text-slate-900">
                <div className="flex items-center gap-1 cursor-pointer hover:text-slate-700">
                  Apellido <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead className="font-bold text-slate-900">Roles</TableHead>
              <TableHead className="font-bold text-slate-900 text-center">Opciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_USERS.map((user, index) => (
              <TableRow key={user.id} className={index % 2 === 1 ? "bg-slate-50/50" : ""}>
                <TableCell>
                  <Checkbox aria-label={`Select ${user.nombre}`} />
                </TableCell>
                <TableCell className="font-medium text-slate-700">{user.nombre}</TableCell>
                <TableCell className="text-slate-700">
                  {user.apellido || (user as any).asuaje}
                </TableCell>
                <TableCell>
                  {user.roles.map((rol) => (
                    <Badge
                      key={rol}
                      variant="outline"
                      className={cn(
                        "rounded-full px-4 py-0.5 border-none",
                        rol === "Ejecutor"
                          ? "bg-[#d1e7dd] text-[#0f5132]"
                          : "bg-[#cfe2ff] text-[#084298]"
                      )}
                    >
                      {rol}
                    </Badge>
                  ))}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      className="h-8 w-8 text-slate-600 hover:text-slate-900"
                    >
                      <Link href={`/gestion-datos/usuarios/${user.id}`}>
                        <Eye className="h-5 w-5" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      className="h-8 w-8 text-slate-600 hover:text-slate-900"
                    >
                      <Link href={`/gestion-datos/usuarios/${user.id}`}>
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Helper to keep code clean
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

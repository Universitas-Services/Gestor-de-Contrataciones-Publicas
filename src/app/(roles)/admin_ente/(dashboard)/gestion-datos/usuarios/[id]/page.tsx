"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Pencil, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function DetalleUsuarioPage({ params }: { params: { id: string } }) {
  // Mock detailed data
  const user = {
    nombre: "Brian Hugh Warner", // Image shows Brian Hugh but inputs show Brian Hugh Warner
    correo: "juan.l@email.com",
    telefono: "000000000000",
    institucion: "Instituto de la intuición",
    cargo: "Instituto de la intuición",
    rol: "Ejecutor",
  };

  return (
    <div className="flex flex-col gap-8 p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-4">
          <Button
            variant="ghost"
            asChild
            className="p-0 h-auto hover:bg-transparent text-slate-500 hover:text-slate-800"
          >
            <Link href="/admin_ente/gestion-datos/usuarios" className="flex items-center gap-1">
              <ChevronLeft className="h-4 w-4" />
              Volver al panel
            </Link>
          </Button>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
              Gestión de usuarios
            </h1>
            <p className="text-sm text-slate-500 font-medium italic">
              Administra los roles y accesos de los 66 usuarios registrados.
            </p>
          </div>
        </div>
        <Button className="bg-[#1e3a5f] hover:bg-[#162a45]">
          <Pencil className="mr-2 h-4 w-4" />
          Editar usuario
        </Button>
      </div>

      <hr className="border-slate-200" />

      {/* Profile Card */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden p-8 space-y-8">
        <div className="space-y-1 border-b border-slate-100 pb-6">
          <h2 className="text-2xl font-bold text-slate-800">Información del perfil</h2>
          <p className="text-sm text-slate-500 italic">
            Actualiza los datos de tu cuenta. El correo no puede ser modificado.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-x-12 gap-y-6 pt-2">
          {/* Nombre */}
          <div className="space-y-2">
            <Label className="text-slate-700 font-bold text-sm">Nombre completo</Label>
            <Input
              defaultValue={user.nombre}
              className="h-10 bg-white border-slate-200 text-slate-500"
            />
          </div>

          {/* Correo */}
          <div className="space-y-2">
            <Label className="text-slate-700 font-bold text-sm">Correo electrónico</Label>
            <Input
              defaultValue={user.correo}
              readOnly
              className="h-10 bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
            />
          </div>

          {/* Telefono */}
          <div className="space-y-2">
            <Label className="text-slate-700 font-bold text-sm">Teléfono</Label>
            <Input
              defaultValue={user.telefono}
              className="h-10 bg-white border-slate-200 text-slate-500"
            />
          </div>

          {/* Institución */}
          <div className="space-y-2">
            <Label className="text-slate-700 font-bold text-sm">Institución</Label>
            <Input
              defaultValue={user.institucion}
              className="h-10 bg-white border-slate-200 text-slate-500"
            />
          </div>

          {/* Cargo */}
          <div className="space-y-2">
            <Label className="text-slate-700 font-bold text-sm">Cargo</Label>
            <Input
              defaultValue={user.cargo}
              className="h-10 bg-white border-slate-200 text-slate-500"
            />
          </div>

          {/* Rol */}
          <div className="space-y-2">
            <Label className="text-slate-700 font-bold text-sm">Rol</Label>
            <Input
              defaultValue={user.rol}
              readOnly
              className="h-10 bg-white border-slate-200 text-slate-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-8">
          <Button
            variant="destructive"
            className="bg-red-600 hover:bg-red-700 rounded-lg px-6 h-10 font-bold"
          >
            Eliminar cuenta
          </Button>
        </div>
      </div>

      {/* Danger Zone Card */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden p-8 space-y-8">
        <div className="space-y-1 border-b border-slate-100 pb-6">
          <h2 className="text-2xl font-bold text-red-500">Zona de Peligro</h2>
        </div>

        <div className="pt-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <p className="text-slate-500 italic font-medium">
            Esta acción es irreversible y eliminará permanentemente al usuario y sus datos
            asociados.
          </p>
          <Button
            variant="destructive"
            className="bg-red-600 hover:bg-red-700 rounded-lg px-6 h-10 font-bold whitespace-nowrap"
          >
            Eliminar cuenta
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NuevoUsuarioPage() {
  const router = useRouter();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate saving and redirect to a profile view (as requested by user "other 2 page will be after pressing Save")
    // I'll redirect to the detail page of the first mock user for demonstration
    router.push("/admin_ente/gestion-datos/usuarios/1");
  };

  return (
    <div className="flex flex-col gap-8 p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-4">
        <Button
          variant="ghost"
          asChild
          className="p-0 h-auto hover:bg-transparent text-slate-500 hover:text-slate-800"
        >
          <Link href="/gestion-datos/usuarios" className="flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" />
            Volver al panel
          </Link>
        </Button>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-800">Crear nuevo usuario</h1>
          <p className="text-sm text-slate-500 font-medium italic leading-relaxed">
            Registre los datos del nuevo usuario, genere sus credenciales de acceso y asigne el rol
            que desempeñará dentro de la plataforma
          </p>
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* Form */}
      <form
        onSubmit={handleSave}
        className="space-y-8 bg-white p-8 rounded-xl border border-slate-100 shadow-sm"
      >
        <div className="grid gap-6">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-[#344767] font-semibold text-base">
              Nombre del usuario
            </Label>
            <p className="text-xs text-slate-400 italic">Ejemplo: Pedro José</p>
            <Input
              id="nombre"
              placeholder="Ingrese el nombre"
              className="h-11 border-slate-200 focus:border-slate-400 focus:ring-0"
            />
          </div>

          {/* Apellido */}
          <div className="space-y-2">
            <Label htmlFor="apellido" className="text-[#344767] font-semibold text-base">
              Apellido del usuario
            </Label>
            <p className="text-xs text-slate-400 italic">Ejemplo: Rodríguez Hernández</p>
            <Input
              id="apellido"
              placeholder="Ingrese el apellido"
              className="h-11 border-slate-200 focus:border-slate-400 focus:ring-0"
            />
          </div>

          {/* Correo */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#344767] font-semibold text-base">
              Correo electrónico
            </Label>
            <p className="text-xs text-slate-400 italic">Ejemplo: ejemplo@dominio.com</p>
            <Input
              id="email"
              type="email"
              placeholder="Ingrese el correo electrónico"
              className="h-11 border-slate-200 focus:border-slate-400 focus:ring-0"
            />
          </div>

          {/* Contraseña */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-[#344767] font-semibold text-base">
              Contraseña temporal
            </Label>
            <p className="text-xs text-slate-400 italic">
              Validación: Mínimo 8 caracteres, debe incluir una mayúscula y un carácter especial
              Ejemplo: A123456*
            </p>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="h-11 border-slate-200 focus:border-slate-400 focus:ring-0"
            />
          </div>

          {/* Rol */}
          <div className="space-y-2">
            <Label htmlFor="rol" className="text-[#344767] font-semibold text-base">
              Asignar Rol en la plataforma
            </Label>
            <Select>
              <SelectTrigger className="h-11 border-slate-200 focus:border-slate-400 focus:ring-0 w-full">
                <SelectValue placeholder="Asignar Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ejecutor">Ejecutor</SelectItem>
                <SelectItem value="visualizador">Visualizador</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            className="bg-[#1e3a5f] hover:bg-[#162a45] px-12 h-11 text-base rounded-md"
          >
            Guardar
          </Button>
        </div>
      </form>
    </div>
  );
}

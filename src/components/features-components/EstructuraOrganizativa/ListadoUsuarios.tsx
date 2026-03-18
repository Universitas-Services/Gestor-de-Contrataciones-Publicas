"use client";

import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { BsEye, BsPencilSquare } from "react-icons/bs";
import { FaRegTrashAlt } from "react-icons/fa";
import { ChevronDown, Plus } from "lucide-react";

interface UsuarioEstructura {
  id: string;
  nombre: string;
  estructura: string;
  status: "Activo" | "Vencido";
  fechaRegistro: string;
  detalles: {
    autoridad: {
      nombres: string;
      apellidos: string;
      cargo: string;
      cedula: string;
      resolucion: string;
    };
    delegado: {
      nombre: string;
      cedula: string;
      cargo: string;
    };
  };
}

const defaultDetalles = {
  autoridad: {
    nombres: "Pedro José",
    apellidos: "Lopez Hernadez",
    cargo: "Máxima autoridad",
    cedula: "V 000000001",
    resolucion:
      "Resolución N° 000/00 de fecha 00-00-0000 publicada en Gaceta N° 0000 de fecha 00-00-0000",
  },
  delegado: {
    nombre: "Luisa Maria Campos González",
    cedula: "V-00000000",
    cargo: "Vicepresidente, Gerente General",
  },
};

const mockUsuarios: UsuarioEstructura[] = [
  {
    id: "1",
    nombre: "Pedro de los Palotes",
    estructura: "Máxima autoridad",
    status: "Activo",
    fechaRegistro: "22/12/2026",
    detalles: defaultDetalles,
  },
  {
    id: "2",
    nombre: "Comisión de Contrataciones Permanente 2026",
    estructura: "Comisión de contrataciones",
    status: "Vencido",
    fechaRegistro: "25/12/2026",
    detalles: defaultDetalles,
  },
  {
    id: "3",
    nombre: "Dirección de Infraestructura, Gerencia de Tecnología.",
    estructura: "Unidad usuaria",
    status: "Activo",
    fechaRegistro: "28/12/2026",
    detalles: defaultDetalles,
  },
  {
    id: "4",
    nombre: "Departamento de Compras (o nombre del responsable)",
    estructura: "Unidad contratante",
    status: "Vencido",
    fechaRegistro: "29/12/2026",
    detalles: defaultDetalles,
  },
  {
    id: "5",
    nombre: "Pedro perez",
    estructura: "Máxima autoridad",
    status: "Activo",
    fechaRegistro: "22/12/2026",
    detalles: defaultDetalles,
  },
  {
    id: "6",
    nombre: "Departamento de Compras (o nombre del responsable)",
    estructura: "Unidad contratante",
    status: "Vencido",
    fechaRegistro: "29/12/2026",
    detalles: defaultDetalles,
  },
  {
    id: "7",
    nombre: "Dirección de Infraestructura, Gerencia de Tecnología.",
    estructura: "Unidad usuaria",
    status: "Activo",
    fechaRegistro: "28/12/2026",
    detalles: defaultDetalles,
  },
  {
    id: "8",
    nombre: "Lana del Rey",
    estructura: "Máxima autoridad",
    status: "Activo",
    fechaRegistro: "22/12/2026",
    detalles: defaultDetalles,
  },
  {
    id: "9",
    nombre: "Dirección de Infraestructura, Gerencia de Tecnología.",
    estructura: "Unidad usuaria",
    status: "Activo",
    fechaRegistro: "28/12/2026",
    detalles: defaultDetalles,
  },
];

export function ListadoUsuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioEstructura[]>(mockUsuarios);
  const [selectedUser, setSelectedUser] = useState<UsuarioEstructura | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const router = useRouter();

  const handleViewClick = (usuario: UsuarioEstructura) => {
    setSelectedUser(usuario);
    setIsSheetOpen(true);
  };

  const handleEditRedirect = (usuario: UsuarioEstructura) => {
    // Redireccionar al formulario de edición segun la estructura.
    // Usamos el id por ahora de forma general, se puede expandir según requerimiento real.
    router.push(`/gestion-datos/estructura-organizativa/editar/${usuario.id}`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 rounded-xl">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 border-b border-slate-200 mb-6 pb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-[#1B456F] tracking-tight mb-1">
              Panel de la estructura organizativa
            </h1>
            <p className="text-slate-500 font-medium text-sm italic">
              Administra los roles y accesos de los {usuarios.length} usuarios registrados.
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-[#1B456F] hover:bg-[#123050] text-white rounded-md px-6 py-5 h-10 flex items-center justify-between gap-6 font-semibold shadow-md min-w-[150px]">
                Crear <Plus className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-[200px] bg-[#1B456F] text-white border-none rounded-md py-2"
            >
              <DropdownMenuItem className="focus:bg-[#123050] focus:text-white cursor-pointer font-medium py-2 px-4 rounded-sm text-[15px]">
                Máxima Autoridad
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-[#123050] focus:text-white cursor-pointer font-medium py-2 px-4 rounded-sm text-[15px]">
                Unidad Usuaria
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-[#123050] focus:text-white cursor-pointer font-medium py-2 px-4 rounded-sm text-[15px]">
                Unidad Contratante
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-[#123050] focus:text-white cursor-pointer font-medium py-2 px-4 rounded-sm text-[15px]">
                Comisión de Contrataciones
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto bg-white rounded-sm border border-slate-200 relative min-h-[200px]">
          <table className="w-full text-[13px] text-left">
            <thead className="bg-[#f8fafc] text-[#475569] font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-semibold whitespace-nowrap pl-8">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-[#1e3a5f]">
                    Nombre (Persona o Comisión){" "}
                    <span className="text-slate-400 text-[10px] ml-1">↑↓</span>
                  </div>
                </th>
                <th className="px-4 py-3 font-semibold text-center whitespace-nowrap">
                  Estructura
                </th>
                <th className="px-4 py-3 font-semibold text-center whitespace-nowrap">Status</th>
                <th className="px-4 py-3 font-semibold text-center whitespace-nowrap">
                  Fecha de registro
                </th>
                <th className="px-4 py-3 font-semibold text-center whitespace-nowrap">Opciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr
                  key={usuario.id}
                  className={`border-b border-slate-200 transition-colors ${
                    usuario.status === "Vencido" ? "bg-[#e5e5e5]" : "bg-white"
                  }`}
                >
                  <td className="px-6 py-3 font-medium text-slate-800 max-w-[250px] leading-tight text-xs pl-8">
                    {usuario.nombre}
                  </td>
                  <td className="px-4 py-3 text-slate-800 font-medium text-center text-xs">
                    {usuario.estructura}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex px-4 py-1.5 rounded-full text-[11px] font-semibold tracking-wide ${
                        usuario.status === "Activo"
                          ? "bg-success-bg text-success border border-success"
                          : "bg-rechazado-bg text-rechazado border border-rechazado"
                      }`}
                    >
                      {usuario.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-800 font-medium text-center text-xs">
                    {usuario.fechaRegistro}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-4">
                      <button
                        className="text-slate-700 hover:text-navy transition-colors"
                        onClick={() => handleViewClick(usuario)}
                      >
                        <BsEye className="w-[18px] h-[18px]" />
                      </button>
                      <button
                        className="text-slate-700 hover:text-navy transition-colors"
                        onClick={() => handleEditRedirect(usuario)}
                      >
                        <BsPencilSquare className="w-[18px] h-[18px]" />
                      </button>
                      <button className="text-rechazado hover:text-red-700 transition-colors">
                        <FaRegTrashAlt className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sheet Overlay for User Details */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl md:max-w-2xl bg-white p-0 border-l overflow-y-auto">
          {selectedUser && (
            <div className="flex flex-col h-full">
              <SheetHeader className="p-8 pb-4">
                <SheetTitle className="text-2xl font-extrabold text-[#1B456F] text-left">
                  Detalles de {selectedUser.nombre}
                </SheetTitle>
                <SheetDescription className="text-slate-500 font-medium italic text-left">
                  Información detallada de la {selectedUser.estructura}
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 px-8 py-4 space-y-8">
                {/* Datos de la autoridad */}
                <div className="space-y-4">
                  <h3 className="text-[#1B456F] font-bold text-lg border-b border-slate-200 pb-2">
                    Datos de la autoridad
                  </h3>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                    <div className="space-y-1.5">
                      <Label className="text-[#1B456F] font-bold text-xs">Nombres</Label>
                      <Input
                        readOnly
                        value={selectedUser.detalles.autoridad.nombres}
                        className="bg-white text-slate-500 font-medium italic h-9 border-slate-300"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[#1B456F] font-bold text-xs">Apellidos</Label>
                      <Input
                        readOnly
                        value={selectedUser.detalles.autoridad.apellidos}
                        className="bg-white text-slate-500 font-medium italic h-9 border-slate-300"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[#1B456F] font-bold text-xs">Cargo</Label>
                      <Input
                        readOnly
                        value={selectedUser.detalles.autoridad.cargo}
                        className="bg-white text-slate-500 font-medium italic h-9 border-slate-300"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[#1B456F] font-bold text-xs">Cedula</Label>
                      <Input
                        readOnly
                        value={selectedUser.detalles.autoridad.cedula}
                        className="bg-white text-slate-500 font-medium italic h-9 border-slate-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 mt-2">
                    <Label className="text-[#1B456F] font-bold text-xs">Resolución</Label>
                    <Input
                      readOnly
                      value={selectedUser.detalles.autoridad.resolucion}
                      className="bg-white text-slate-500 font-medium italic h-9 border-slate-300 w-full"
                    />
                  </div>
                </div>

                {/* Datos del delegado */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-[#1B456F] font-bold text-lg border-b border-slate-200 pb-2">
                    Datos del delegado
                  </h3>

                  <div className="space-y-5">
                    <div className="space-y-1.5">
                      <Label className="text-[#1B456F] font-bold text-xs">
                        Nombre del delegado
                      </Label>
                      <Input
                        readOnly
                        value={selectedUser.detalles.delegado.nombre}
                        className="bg-white text-slate-500 font-medium italic h-9 border-slate-300 lg:w-3/4"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[#1B456F] font-bold text-xs">
                        Cedula del delegado
                      </Label>
                      <Input
                        readOnly
                        value={selectedUser.detalles.delegado.cedula}
                        className="bg-white text-slate-500 font-medium italic h-9 border-slate-300 lg:w-3/4"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[#1B456F] font-bold text-xs">Cargo del delegado</Label>
                      <Input
                        readOnly
                        value={selectedUser.detalles.delegado.cargo}
                        className="bg-white text-slate-500 font-medium italic h-9 border-slate-300 lg:w-3/4"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-8 pt-4 flex justify-end gap-3 pb-10">
                <Button
                  onClick={() => handleEditRedirect(selectedUser)}
                  className="bg-[#1B456F] hover:bg-[#123050] text-white font-semibold px-8 py-2 h-10 w-32 shadow-sm rounded-md"
                >
                  Editar
                </Button>
                <Button
                  onClick={() => setIsSheetOpen(false)}
                  className="bg-[#1B456F] hover:bg-[#123050] text-white font-semibold px-8 py-2 h-10 w-32 shadow-sm rounded-md"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

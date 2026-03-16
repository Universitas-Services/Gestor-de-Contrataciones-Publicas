"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronRight, Search, Filter, ArrowUpDown, ChevronLeft } from "lucide-react";
import { BsFillPeopleFill, BsFillCheckSquareFill, BsEye, BsPencilSquare } from "react-icons/bs";
import { IoAlertCircleOutline } from "react-icons/io5";
import { FaRegTrashAlt } from "react-icons/fa";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Checkbox } from "@/components/ui/checkbox";

interface ProviderData {
  id: string;
  name: string;
  rif: string;
  representative: string;
  type: "Obras" | "Bienes" | "Servicios";
  status: "Activo" | "Por vencer" | "Vencido";
  isApproved: boolean;
}

const mockProviders: ProviderData[] = [
  {
    id: "1",
    name: "Constructora Sambil C.A.",
    rif: "J-30456890-1",
    representative: "Ricardo Rodriguez",
    type: "Obras",
    status: "Activo",
    isApproved: true,
  },
  {
    id: "2",
    name: "Insumos Logisticos Express",
    rif: "J-41233455-2",
    representative: "Mariana Valera",
    type: "Bienes",
    status: "Por vencer",
    isApproved: false,
  },
  {
    id: "3",
    name: "Tecnologías del Sur",
    rif: "J-50998122-0",
    representative: "Héctor Méndez",
    type: "Servicios",
    status: "Vencido",
    isApproved: false,
  },
  {
    id: "4",
    name: "Suministros Médicos Global",
    rif: "J-22877341-5",
    representative: "Elena Farias",
    type: "Bienes",
    status: "Activo",
    isApproved: true,
  },
  {
    id: "5",
    name: "Asesoria Contable & Cia",
    rif: "J-31990442-8",
    representative: "Juan Pablo Duarte",
    type: "Servicios",
    status: "Vencido",
    isApproved: false,
  },
  {
    id: "6",
    name: "Constructora Sambil C.A.",
    rif: "J-30456890-1",
    representative: "Ricardo Rodriguez",
    type: "Obras",
    status: "Activo",
    isApproved: true,
  },
  {
    id: "7",
    name: "Insumos Logisticos Express",
    rif: "J-41233455-2",
    representative: "Mariana Valera",
    type: "Bienes",
    status: "Por vencer",
    isApproved: false,
  },
];

export function ListadoProveedores() {
  const [providers, setProviders] = useState<ProviderData[]>(mockProviders);

  const toggleApproval = (id: string) => {
    setProviders(providers.map((p) => (p.id === id ? { ...p, isApproved: !p.isApproved } : p)));
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 rounded-xl">
      {/* Main Container White */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        {/* Header Area Inside Card */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 border-b border-slate-100 mb-6 pb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-[#1e293b] tracking-tight mb-1">
              Listado de Proveedores
            </h1>
            <p className="text-slate-500 font-medium text-sm">
              Gestiona la base de datos centralizada de tus proveedores
            </p>
          </div>
          <Link href="/registro-proveedores/nuevo">
            <Button className="bg-navy hover:bg-navy-hover text-white rounded-md px-6 py-5 h-12 flex items-center gap-2 font-semibold shadow-md">
              + Agregar nuevo proveedor
            </Button>
          </Link>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar por nombre, RIF o representante..."
              className="w-full pl-10 pr-4 h-[42px] rounded-lg border-slate-300 focus-visible:ring-navy text-sm bg-white"
            />
          </div>
          <div className="flex items-center gap-3">
            <Select defaultValue="todos_tipos">
              <SelectTrigger className="w-36 h-[42px] border-slate-300 focus:ring-navy bg-white">
                <SelectValue placeholder="Tipo: Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos_tipos">Tipo: Todos</SelectItem>
                <SelectItem value="obras">Obras</SelectItem>
                <SelectItem value="bienes">Bienes</SelectItem>
                <SelectItem value="servicios">Servicios</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="todos_status">
              <SelectTrigger className="w-40 h-[42px] border-slate-300 focus:ring-navy bg-white">
                <SelectValue placeholder="Status: Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos_status">Status: Todos</SelectItem>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="por_vencer">Por vencer</SelectItem>
                <SelectItem value="vencido">Vencido</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              className="h-[42px] px-4 border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50"
            >
              <Filter className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-slate-200 overflow-hidden bg-white">
          <Table>
            <TableHeader className="bg-white">
              <TableRow className="border-b border-slate-200 hover:bg-transparent [&_th]:text-[#1e293b] [&_th]:font-bold border-t-0 border-x-0">
                <TableHead className="w-10 text-center px-2 py-3">
                  <Checkbox className="w-3.5 h-3.5 border-slate-300 data-[state=checked]:bg-[#1e3a5f] data-[state=checked]:border-[#1e3a5f] rounded" />
                </TableHead>
                <TableHead className="px-2 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-[#1e3a5f]">
                    Proveedor
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </TableHead>
                <TableHead className="px-2 py-3 text-center whitespace-nowrap">Rif</TableHead>
                <TableHead className="px-2 py-3 text-center whitespace-nowrap">
                  Representante
                </TableHead>
                <TableHead className="px-2 py-3 text-center whitespace-nowrap">Tipo</TableHead>
                <TableHead className="px-2 py-3 text-center whitespace-nowrap">Estatus</TableHead>
                <TableHead className="px-2 py-3 text-center whitespace-nowrap">Aprobar</TableHead>
                <TableHead className="px-2 py-3 text-center whitespace-nowrap">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {providers.map((provider, index) => (
                <TableRow
                  key={provider.id + index}
                  className={`border-b border-slate-100 last:border-0 transition-colors hover:bg-slate-50 border-t-0 border-x-0 ${
                    index % 2 !== 0 ? "bg-slate-50/50" : "bg-white"
                  } text-[13px]`}
                >
                  <TableCell className="px-2 py-3 text-center">
                    <Checkbox className="w-3.5 h-3.5 border-slate-300 data-[state=checked]:bg-[#1e3a5f] data-[state=checked]:border-[#1e3a5f] rounded" />
                  </TableCell>
                  <TableCell className="px-2 py-3 font-semibold text-[#1e293b] whitespace-nowrap max-w-[150px] truncate">
                    {provider.name}
                  </TableCell>
                  <TableCell className="px-2 py-3 text-[#1e3a5f] font-medium text-center whitespace-nowrap">
                    {provider.rif}
                  </TableCell>
                  <TableCell className="px-2 py-3 text-[#1e3a5f] font-medium text-center whitespace-nowrap max-w-[120px] truncate">
                    {provider.representative}
                  </TableCell>

                  {/* Tipo Pill */}
                  <TableCell className="px-2 py-3 text-center">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        provider.type === "Obras"
                          ? "bg-[#fecaca] text-[#dc2626] border-[#fca5a5]"
                          : provider.type === "Bienes"
                            ? "bg-[#bfdbfe] text-[#2563eb] border-[#93c5fd]"
                            : "bg-[#475569] text-white border-[#334155]"
                      }`}
                    >
                      {provider.type}
                    </span>
                  </TableCell>

                  {/* Estatus Pill */}
                  <TableCell className="px-2 py-3 text-center">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        provider.status === "Activo"
                          ? "bg-[#bbf7d0] text-[#16a34a] border-[#86efac]"
                          : provider.status === "Por vencer"
                            ? "bg-[#ffedd5] text-[#d97706] border-[#fcd34d]"
                            : "bg-[#fee2e2] text-[#dc2626] border-[#fca5a5]"
                      }`}
                    >
                      {provider.status}
                    </span>
                  </TableCell>

                  {/* Aprobación Switch */}
                  <TableCell className="px-2 py-3 text-center">
                    <button
                      onClick={() => toggleApproval(provider.id)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:ring-offset-2 ${
                        provider.isApproved ? "bg-[#84cc16]" : "bg-[#ef4444]"
                      }`}
                    >
                      <span className="sr-only">Toggle approval</span>
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          provider.isApproved ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </TableCell>

                  {/* Acciones */}
                  <TableCell className="px-2 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <Link href={`/registro-proveedores/${provider.id}`}>
                        <button
                          className="text-slate-600 hover:text-slate-900 transition-colors"
                          title="Ver perfil"
                        >
                          <BsEye className="w-4 h-4" />
                        </button>
                      </Link>
                      <button className="text-slate-600 hover:text-slate-900 transition-colors">
                        <BsPencilSquare className="w-4 h-4" />
                      </button>
                      <button className="text-red-500 hover:text-red-700 transition-colors">
                        <FaRegTrashAlt className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Dummy */}
        <div className="flex justify-end items-center mt-6 gap-2">
          <Button
            variant="outline"
            size="icon"
            className="w-8 h-8 rounded border-slate-300 text-slate-500 hover:text-slate-700"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="default"
            className="w-8 h-8 rounded bg-[#1e3a5f] hover:bg-[#152c4a] text-white p-0"
          >
            1
          </Button>
          <Button
            variant="outline"
            className="w-8 h-8 rounded border-slate-300 text-slate-600 hover:bg-slate-100 p-0"
          >
            2
          </Button>
          <Button
            variant="outline"
            className="w-8 h-8 rounded border-slate-300 text-slate-600 hover:bg-slate-100 p-0"
          >
            3
          </Button>
          <Button
            variant="outline"
            className="w-8 h-8 rounded border-slate-300 text-slate-600 hover:bg-slate-100 p-0"
          >
            4
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="w-8 h-8 rounded border-slate-300 text-slate-500 hover:text-slate-700"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Footer KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 mt-8 border-t border-slate-100">
          <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white hover:border-slate-300 transition-colors">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-base font-bold text-[#1e293b]">Total Proveedores</h3>
                <BsFillPeopleFill className="w-5 h-5 text-[#475569]" />
              </div>
              <div className="text-2xl font-extrabold text-[#1e293b] mb-0.5">124</div>
              <p className="text-[11px] font-semibold text-[#84cc16]">+12 este mes</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white hover:border-slate-300 transition-colors">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-base font-bold text-[#1e293b]">Documentación vencida</h3>
                <BsFillCheckSquareFill className="w-5 h-5 text-[#1e3a5f]" />
              </div>
              <div className="text-2xl font-extrabold text-[#1e3a5f] mb-0.5">18</div>
              <p className="text-[11px] font-semibold text-[#ef4444]">Requiere atención</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white hover:border-slate-300 transition-colors">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-base font-bold text-[#1e293b]">Proceso de aprobación</h3>
                <IoAlertCircleOutline className="w-6 h-6 text-[#334155]" />
              </div>
              <div className="text-2xl font-extrabold text-[#334155] mb-0.5">15</div>
              <p className="text-[11px] font-semibold text-[#ef4444]">Pendiente revisión</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

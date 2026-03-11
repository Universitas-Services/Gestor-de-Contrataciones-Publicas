"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronRight, Search, Filter, ArrowUpDown, ChevronLeft } from "lucide-react";
import { BsFillPeopleFill, BsFillCheckSquareFill, BsEye, BsPencilSquare } from "react-icons/bs";
import { IoAlertCircleOutline } from "react-icons/io5";
import { FaRegTrashAlt } from "react-icons/fa";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    <div className="w-full max-w-[1280px] mx-auto space-y-6 animate-in fade-in duration-500 rounded-xl">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1e293b] tracking-tight mb-1">
            Listado de Proveedores
          </h1>
          <p className="text-slate-500 font-medium">
            Gestiona la base de datos centralizada de tus proveedores
          </p>
        </div>
        <Button className="bg-[#1e3a5f] hover:bg-[#152c4a] text-white rounded-md px-6 py-5 h-12 flex items-center gap-2 font-semibold shadow-md">
          + Agregar nuevo proveedor
        </Button>
      </div>

      {/* Main Container White */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, RIF o representante..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent text-sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select className="appearance-none bg-white border border-slate-300 text-slate-700 py-2.5 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] text-sm font-medium w-36">
                <option>Tipo: Todos</option>
                <option>Obras</option>
                <option>Bienes</option>
                <option>Servicios</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
            <div className="relative">
              <select className="appearance-none bg-white border border-slate-300 text-slate-700 py-2.5 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] text-sm font-medium w-40">
                <option>Status: Todos</option>
                <option>Activo</option>
                <option>Por vencer</option>
                <option>Vencido</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
            <Button
              variant="outline"
              className="h-[42px] px-4 border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50"
            >
              <Filter className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#ffffff] text-[#1e293b] font-bold border-b border-slate-200">
              <tr>
                <th className="p-4 w-12 text-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-[#1e3a5f] focus:ring-[#1e3a5f]"
                  />
                </th>
                <th className="p-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 cursor-pointer hover:text-[#1e3a5f]">
                    Nombre del proveedor
                    <ArrowUpDown className="w-4 h-4 text-slate-400" />
                  </div>
                </th>
                <th className="p-4 text-center whitespace-nowrap">Rif</th>
                <th className="p-4 text-center whitespace-nowrap">Representante Legal</th>
                <th className="p-4 text-center whitespace-nowrap">tipo</th>
                <th className="p-4 text-center whitespace-nowrap">Estatus</th>
                <th className="p-4 text-center whitespace-nowrap">Aprobación</th>
                <th className="p-4 text-center whitespace-nowrap">Acción</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((provider, index) => (
                <tr
                  key={provider.id + index}
                  className={`border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors ${
                    index % 2 !== 0 ? "bg-slate-50/50" : "bg-white"
                  }`}
                >
                  <td className="p-4 text-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-300 text-[#1e3a5f] focus:ring-[#1e3a5f]"
                    />
                  </td>
                  <td className="p-4 font-semibold text-[#1e293b] whitespace-nowrap">
                    {provider.name}
                  </td>
                  <td className="p-4 text-[#1e3a5f] font-medium text-center whitespace-nowrap">
                    {provider.rif}
                  </td>
                  <td className="p-4 text-[#1e3a5f] font-medium text-center whitespace-nowrap">
                    {provider.representative}
                  </td>

                  {/* Tipo Pill */}
                  <td className="p-4 text-center">
                    <span
                      className={`inline-flex px-6 py-1 rounded-full text-xs font-bold border ${
                        provider.type === "Obras"
                          ? "bg-[#fecaca] text-[#dc2626] border-[#fca5a5]"
                          : provider.type === "Bienes"
                            ? "bg-[#bfdbfe] text-[#2563eb] border-[#93c5fd]"
                            : "bg-[#475569] text-white border-[#334155]"
                      }`}
                    >
                      {provider.type}
                    </span>
                  </td>

                  {/* Estatus Pill */}
                  <td className="p-4 text-center">
                    <span
                      className={`inline-flex px-6 py-1 rounded-full text-xs font-bold border ${
                        provider.status === "Activo"
                          ? "bg-[#bbf7d0] text-[#16a34a] border-[#86efac]"
                          : provider.status === "Por vencer"
                            ? "bg-[#ffedd5] text-[#d97706] border-[#fcd34d]"
                            : "bg-[#fee2e2] text-[#dc2626] border-[#fca5a5]"
                      }`}
                    >
                      {provider.status}
                    </span>
                  </td>

                  {/* Aprobación Switch */}
                  <td className="p-4 text-center">
                    <button
                      onClick={() => toggleApproval(provider.id)}
                      className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:ring-offset-2 ${
                        provider.isApproved ? "bg-[#84cc16]" : "bg-[#ef4444]"
                      }`}
                    >
                      <span className="sr-only">Toggle approval</span>
                      <span
                        className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          provider.isApproved ? "translate-x-6" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </td>

                  {/* Acciones */}
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-3">
                      <button className="text-slate-600 hover:text-slate-900 transition-colors">
                        <BsEye className="w-5 h-5" />
                      </button>
                      <button className="text-slate-600 hover:text-slate-900 transition-colors">
                        <BsPencilSquare className="w-5 h-5" />
                      </button>
                      <button className="text-red-500 hover:text-red-700 transition-colors">
                        <FaRegTrashAlt className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
      </div>

      {/* Footer KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-bold text-[#1e293b]">Total Proveedores</h3>
              <BsFillPeopleFill className="w-6 h-6 text-[#475569]" />
            </div>
            <div className="text-3xl font-extrabold text-[#1e293b] mb-1">124</div>
            <p className="text-xs font-semibold text-[#84cc16]">+12 este mes</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-bold text-[#1e293b]">Documentación vencida</h3>
              <div className="p-1 bg-[#1e3a5f] rounded flex items-center justify-center">
                <BsFillCheckSquareFill className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-[#1e3a5f] mb-1">18</div>
            <p className="text-xs font-semibold text-[#ef4444]">Requiere atención</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-bold text-[#1e293b]">Proceso de aprobación</h3>
              <IoAlertCircleOutline className="w-7 h-7 text-[#334155]" />
            </div>
            <div className="text-3xl font-extrabold text-[#334155] mb-1">15</div>
            <p className="text-xs font-semibold text-[#ef4444]">Pendiente revisión</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

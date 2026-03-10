"use client";

import React, { useState } from "react";
import { List, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { BsFillPeopleFill, BsFillCheckSquareFill, BsEye, BsPencilSquare } from "react-icons/bs";
import { IoAlertCircleOutline } from "react-icons/io5";
import { IoIosBriefcase, IoIosHammer, IoIosPrint } from "react-icons/io";
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
    status: "Activo",
    isApproved: true,
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
];

export function RegistroProveedoresDashboard() {
  const [providers, setProviders] = useState<ProviderData[]>(mockProviders);

  const toggleApproval = (id: string) => {
    setProviders(providers.map((p) => (p.id === id ? { ...p, isApproved: !p.isApproved } : p)));
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500 bg-white min-h-[calc(100vh-80px)] rounded-xl">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1e293b] tracking-tight mb-1">
            Estadisticas generales
          </h1>
          <p className="text-slate-500 font-medium">
            Resume general y control de solicitudes pendientes
          </p>
        </div>
        <Button className="bg-[#1e3a5f] hover:bg-[#152c4a] text-white rounded-md px-6 py-5 h-12 flex items-center gap-2 font-semibold shadow-md">
          <List className="w-5 h-5" />
          Ver lista de proveedores
        </Button>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-[#1e293b]">Total registrados</h3>
              <BsFillPeopleFill className="w-7 h-7 text-[#1e293b]" />
            </div>
            <div className="text-4xl font-extrabold text-[#1e293b] mb-2">1,250</div>
            <p className="text-sm font-semibold text-[#84cc16]">5% este mes</p>
          </CardContent>
        </Card>

        {/* Card 2 */}
        <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-[#1e293b]">Total activos</h3>
              <BsFillCheckSquareFill className="w-6 h-6 text-[#1e3a5f]" />
            </div>
            <div className="text-4xl font-extrabold text-[#1e3a5f] mb-2">1,180</div>
            <p className="text-sm font-semibold text-[#84cc16]">3% este mes</p>
          </CardContent>
        </Card>

        {/* Card 3 */}
        <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-[#1e293b]">Total vencidos</h3>
              <IoAlertCircleOutline className="w-7 h-7 text-[#334155]" />
            </div>
            <div className="text-4xl font-extrabold text-[#334155] mb-2">70</div>
            <p className="text-sm font-semibold text-[#ef4444]">2% este mes</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-[#6366f1] border shadow-sm rounded-xl hover:shadow-md transition-shadow">
          <CardContent className="p-3 pl-8 flex items-center gap-4">
            <IoIosPrint className="w-5 h-5 text-[#1e3a5f]" />
            <div className="flex flex-col justify-center">
              <h4 className="text-base font-bold text-[#1e293b] leading-tight">Bienes</h4>
              <span className="text-sm font-medium text-slate-500 leading-tight">450</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#ef4444] border shadow-sm rounded-xl hover:shadow-md transition-shadow">
          <CardContent className="p-3 pl-8 flex items-center gap-4">
            <IoIosHammer className="w-5 h-5 text-[#1e3a5f]" />
            <div className="flex flex-col justify-center">
              <h4 className="text-base font-bold text-[#1e293b] leading-tight">Obras</h4>
              <span className="text-sm font-medium text-slate-500 leading-tight">320</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-400 border shadow-sm rounded-xl hover:shadow-md transition-shadow">
          <CardContent className="p-3 pl-8 flex items-center gap-4">
            <IoIosBriefcase className="w-5 h-5 text-[#1e3a5f]" />
            <div className="flex flex-col justify-center">
              <h4 className="text-base font-bold text-[#1e293b] leading-tight">Servicios</h4>
              <span className="text-sm font-medium text-slate-500 leading-tight">444</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Section */}
      <div className="pt-6">
        <h2 className="text-2xl font-bold text-[#1e293b] tracking-tight mb-6">
          Lista de proveedores por aprobar
        </h2>

        <div className="overflow-x-auto bg-white rounded-lg border border-slate-200 shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#f8fafc] text-[#475569] font-medium border-b border-slate-200">
              <tr>
                <th className="p-4 w-12 text-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-[#1e3a5f] focus:ring-[#1e3a5f]"
                  />
                </th>
                <th className="p-4 font-semibold whitespace-nowrap">
                  <div className="flex items-center gap-2 cursor-pointer hover:text-[#1e3a5f]">
                    Nombre del proveedor
                    <ArrowUpDown className="w-4 h-4 text-slate-400" />
                  </div>
                </th>
                <th className="p-4 font-semibold text-center whitespace-nowrap">Rif</th>
                <th className="p-4 font-semibold text-center whitespace-nowrap">
                  Representante Legal
                </th>
                <th className="p-4 font-semibold text-center whitespace-nowrap">tipo</th>
                <th className="p-4 font-semibold text-center whitespace-nowrap">Estatus</th>
                <th className="p-4 font-semibold text-center whitespace-nowrap">Aprobación</th>
                <th className="p-4 font-semibold text-center whitespace-nowrap">Acción</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((provider, index) => (
                <tr
                  key={provider.id}
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
                  <td className="p-4 font-semibold text-slate-700 whitespace-nowrap">
                    {provider.name}
                  </td>
                  <td className="p-4 text-slate-600 text-center whitespace-nowrap">
                    {provider.rif}
                  </td>
                  <td className="p-4 text-slate-600 text-center font-medium whitespace-nowrap">
                    {provider.representative}
                  </td>

                  {/* Tipo Pill */}
                  <td className="p-4 text-center">
                    <span
                      className={`inline-flex px-4 py-1.5 rounded-full text-xs font-bold border ${
                        provider.type === "Obras"
                          ? "bg-[#fecaca] text-[#dc2626] border-[#f87171]"
                          : provider.type === "Bienes"
                            ? "bg-[#bfdbfe] text-[#2563eb] border-[#60a5fa]"
                            : "bg-[#e2e8f0] text-[#475569] border-[#94a3b8]"
                      }`}
                    >
                      {provider.type}
                    </span>
                  </td>

                  {/* Estatus Pill */}
                  <td className="p-4 text-center">
                    <span
                      className={`inline-flex px-4 py-1.5 rounded-full text-xs font-bold border ${
                        provider.status === "Activo"
                          ? "bg-[#bbf7d0] text-[#16a34a] border-[#4ade80]"
                          : provider.status === "Por vencer"
                            ? "bg-[#ffedd5] text-[#d97706] border-[#fbbf24]"
                            : "bg-[#fee2e2] text-[#dc2626] border-[#f87171]"
                      }`}
                    >
                      {provider.status}
                    </span>
                  </td>

                  {/* Aprobación Switch */}
                  <td className="p-4 text-center">
                    <button
                      onClick={() => toggleApproval(provider.id)}
                      className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:ring-offset-2 ${
                        provider.isApproved ? "bg-[#84cc16]" : "bg-[#ef4444]"
                      }`}
                    >
                      <span className="sr-only">Toggle approval</span>
                      <span
                        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          provider.isApproved ? "translate-x-5" : "translate-x-0"
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
            className="w-8 h-8 rounded text-slate-500 hover:text-slate-700"
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
            className="w-8 h-8 rounded text-slate-600 hover:bg-slate-100 p-0"
          >
            2
          </Button>
          <Button
            variant="outline"
            className="w-8 h-8 rounded text-slate-600 hover:bg-slate-100 p-0"
          >
            3
          </Button>
          <Button
            variant="outline"
            className="w-8 h-8 rounded text-slate-600 hover:bg-slate-100 p-0"
          >
            4
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="w-8 h-8 rounded text-slate-500 hover:text-slate-700"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

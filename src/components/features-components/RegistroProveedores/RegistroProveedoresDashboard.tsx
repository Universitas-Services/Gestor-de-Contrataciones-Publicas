"use client";

import React, { useState } from "react";
import Link from "next/link";
import { List, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { BsFillPeopleFill, BsFillCheckSquareFill, BsEye, BsPencilSquare } from "react-icons/bs";
import { IoAlertCircleOutline } from "react-icons/io5";
import { IoIosBriefcase, IoIosHammer, IoIosPrint } from "react-icons/io";
import { FaRegTrashAlt } from "react-icons/fa";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getProveedores,
  cambiarEstatusProveedor,
  getEstadisticasProveedores,
} from "@/services/proveedores.service";
import { toast } from "sonner";

interface Provider {
  id: string;
  nombre: string;
  rif: string;
  nombreRepLegal: string;
  areaEspecialidad: string;
  estatusValidacion: "PENDIENTE" | "APROBADO" | "RECHAZADO" | "EN_REVISION";
}

export function RegistroProveedoresDashboard() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);
  const [stats, setStats] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pendingRes, rejectedRes, statsRes] = await Promise.all([
        getProveedores({ estatusValidacion: "PENDIENTE", page, limit }),
        getProveedores({ estatusValidacion: "RECHAZADO", page, limit }),
        getEstadisticasProveedores(),
      ]);

      const combinedPending = [...(pendingRes.data || []), ...(rejectedRes.data || [])];
      setProviders(combinedPending.slice(0, limit));

      const maxPendingTotal = Math.max(pendingRes.total || 0, rejectedRes.total || 0);
      setTotalPages(Math.ceil(maxPendingTotal / limit) || 1);

      setStats(statsRes);
      setPendingCount(statsRes.resumen.totalPendientes + statsRes.resumen.totalRechazados);
      setTotalCount(statsRes.resumen.totalRegistrados);
      setApprovedCount(statsRes.resumen.totalAprobados);
    } catch (error) {
      toast.error("Error al cargar datos del dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleApproval = async (id: string) => {
    try {
      await cambiarEstatusProveedor(id, "APROBADO");
      toast.success("Proveedor aprobado exitosamente");
      // Remove from local list so it disappears as requested
      setProviders((prev) => prev.filter((p) => p.id !== id));
      // Refresh counts
      setPendingCount((prev) => Math.max(0, prev - 1));
      setTotalCount((prev) => prev); // Total stays same
      setApprovedCount((prev) => prev + 1);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al aprobar el proveedor");
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [page]);

  return (
    <div className="w-full max-w-5xl mx-auto p-6 md:p-8 space-y-6 animate-in fade-in duration-500 bg-white min-h-[calc(100vh-64px)] rounded-xl">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1e293b] tracking-tight mb-1">
            Estadisticas generales
          </h1>
          <p className="text-slate-500 font-medium">
            Resume general y control de solicitudes pendientes
          </p>
        </div>
        <Link href="/registro-proveedores/listado">
          <Button className="bg-[#1e3a5f] hover:bg-[#152c4a] text-white rounded-md px-6 py-5 h-12 flex items-center gap-2 font-semibold shadow-md cursor-pointer">
            <List className="w-5 h-5" />
            Ver lista de proveedores
          </Button>
        </Link>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-bold text-[#1e293b]">Total registrados</h3>
              <BsFillPeopleFill className="w-6 h-6 text-[#1e293b]" />
            </div>
            <div className="text-3xl font-extrabold text-[#1e293b] mb-1">{totalCount}</div>
            <p className="text-xs font-semibold text-[#84cc16] flex items-center gap-1">
              {stats?.crecimientoMensual?.porcentajeRegistrados >= 0 ? "+" : ""}
              {stats?.crecimientoMensual?.porcentajeRegistrados || 0}% este mes
            </p>
          </CardContent>
        </Card>

        {/* Card 2 */}
        <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-bold text-[#1e293b]">Total activos</h3>
              <BsFillCheckSquareFill className="w-5 h-5 text-[#1e3a5f]" />
            </div>
            <div className="text-3xl font-extrabold text-[#1e3a5f] mb-1">{approvedCount}</div>
            <p className="text-xs font-semibold text-[#84cc16] flex items-center gap-1">
              {stats?.crecimientoMensual?.porcentajeAprobados >= 0 ? "+" : ""}
              {stats?.crecimientoMensual?.porcentajeAprobados || 0}% este mes
            </p>
          </CardContent>
        </Card>

        {/* Card 3 */}
        <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-bold text-[#1e293b]">Total vencidos</h3>
              <IoAlertCircleOutline className="w-6 h-6 text-[#ef4444]" />
            </div>
            <div className="text-3xl font-extrabold text-[#ef4444] mb-1">
              {stats?.resumen?.totalRechazados || 0}
            </div>
            <p className="text-xs font-semibold text-[#ef4444] flex items-center gap-1">
              {stats?.crecimientoMensual?.porcentajeRechazados >= 0 ? "+" : ""}
              {stats?.crecimientoMensual?.porcentajeRechazados || 0}% este mes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-[#6366f1] border shadow-sm rounded-xl hover:shadow-md transition-shadow">
          <CardContent className="p-2 pl-6 flex items-center gap-4">
            <IoIosPrint className="w-4 h-4 text-[#1e3a5f]" />
            <div className="flex flex-col justify-center">
              <h4 className="text-sm font-bold text-[#1e293b] leading-tight">Bienes</h4>
              <span className="text-xs font-medium text-slate-500 leading-tight">
                {stats?.distribucionPorArea?.BIENES || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#ef4444] border shadow-sm rounded-xl hover:shadow-md transition-shadow">
          <CardContent className="p-2 pl-6 flex items-center gap-4">
            <IoIosHammer className="w-4 h-4 text-[#1e3a5f]" />
            <div className="flex flex-col justify-center">
              <h4 className="text-sm font-bold text-[#1e293b] leading-tight">Obras</h4>
              <span className="text-xs font-medium text-slate-500 leading-tight">
                {stats?.distribucionPorArea?.OBRAS || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-400 border shadow-sm rounded-xl hover:shadow-md transition-shadow">
          <CardContent className="p-2 pl-6 flex items-center gap-4">
            <IoIosBriefcase className="w-4 h-4 text-[#1e3a5f]" />
            <div className="flex flex-col justify-center">
              <h4 className="text-sm font-bold text-[#1e293b] leading-tight">Servicios</h4>
              <span className="text-xs font-medium text-slate-500 leading-tight">
                {stats?.distribucionPorArea?.SERVICIOS || stats?.distribucionPorArea?.SERVICIO || 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Section */}
      <div className="pt-6">
        <h2 className="text-2xl font-bold text-[#1e293b] tracking-tight mb-6">
          Lista de proveedores por aprobar
        </h2>

        <div className="overflow-x-auto bg-white rounded-lg border border-slate-200 shadow-sm relative min-h-[200px]">
          {loading && (
            <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy"></div>
            </div>
          )}
          <table className="w-full text-[13px] text-left">
            <thead className="bg-[#f8fafc] text-[#475569] font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-semibold whitespace-nowrap">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-[#1e3a5f]">
                    Nombre del proveedor
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="px-4 py-3 font-semibold text-center whitespace-nowrap">Rif</th>
                <th className="px-4 py-3 font-semibold text-center whitespace-nowrap">
                  Representante legal
                </th>
                <th className="px-4 py-3 font-semibold text-center whitespace-nowrap">Tipo</th>
                <th className="px-4 py-3 font-semibold text-center whitespace-nowrap">Estatus</th>
                <th className="px-4 py-3 font-semibold text-center whitespace-nowrap">
                  Aprobación
                </th>
                <th className="px-4 py-3 font-semibold text-center whitespace-nowrap">Acción</th>
              </tr>
            </thead>
            <tbody>
              {providers.length > 0
                ? providers.map((provider, index) => (
                    <tr
                      key={provider.id}
                      className={`border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors ${
                        index % 2 !== 0 ? "bg-slate-50/50" : "bg-white"
                      }`}
                    >
                      <td className="px-6 py-3 font-semibold text-slate-700 whitespace-nowrap max-w-[200px] truncate">
                        {provider.nombre}
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-center whitespace-nowrap">
                        {provider.rif}
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-center font-medium whitespace-nowrap max-w-[150px] truncate">
                        {provider.nombreRepLegal}
                      </td>

                      {/* Area Pill */}
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            provider.areaEspecialidad === "OBRAS"
                              ? "bg-tipo-obras-bg text-tipo-obras border-tipo-obras-border"
                              : provider.areaEspecialidad === "BIENES"
                                ? "bg-tipo-bienes-bg text-tipo-bienes border-tipo-bienes-border"
                                : "bg-tipo-servicios-bg text-tipo-servicios border-tipo-servicios-border"
                          }`}
                        >
                          {provider.areaEspecialidad}
                        </span>
                      </td>

                      {/* Estatus Pill */}
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            provider.estatusValidacion === "APROBADO"
                              ? "bg-success-bg text-success-text border-success/30"
                              : provider.estatusValidacion === "PENDIENTE"
                                ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                : provider.estatusValidacion === "RECHAZADO"
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          {provider.estatusValidacion === "APROBADO"
                            ? "activo"
                            : provider.estatusValidacion === "PENDIENTE"
                              ? "por aprobar"
                              : provider.estatusValidacion === "RECHAZADO"
                                ? "vencido"
                                : "en revisión"}
                        </span>
                      </td>

                      {/* Aprobación Switch */}
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggleApproval(provider.id)}
                          className="relative inline-flex h-6 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-navy focus:ring-offset-2 bg-[#ef4444]"
                        >
                          <span className="sr-only">Aprobar proveedor</span>
                          <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-0" />
                        </button>
                      </td>

                      {/* Acciones */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <Link href={`/registro-proveedores/${provider.id}`}>
                            <button className="text-slate-500 hover:text-navy transition-colors">
                              <BsEye className="w-4.5 h-4.5" />
                            </button>
                          </Link>
                          <Link href={`/registro-proveedores/editar/${provider.id}`}>
                            <button className="text-slate-500 hover:text-navy transition-colors">
                              <BsPencilSquare className="w-4.5 h-4.5" />
                            </button>
                          </Link>
                          <button className="text-red-400 hover:text-red-600 transition-colors">
                            <FaRegTrashAlt className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                : !loading && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-slate-500 italic">
                        No hay proveedores pendientes por aprobar
                      </td>
                    </tr>
                  )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination */}
        <div className="flex justify-end items-center mt-6 gap-2">
          <Button
            variant="outline"
            size="icon"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="w-8 h-8 rounded text-slate-500 hover:text-slate-700"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                onClick={() => setPage(p)}
                variant={page === p ? "default" : "outline"}
                className={`w-8 h-8 rounded p-0 ${
                  page === p
                    ? "bg-[#1e3a5f] hover:bg-[#152c4a] text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {p}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="w-8 h-8 rounded text-slate-500 hover:text-slate-700"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronRight, Search, Filter, ArrowUpDown, ChevronLeft, Loader2 } from "lucide-react";
import { BsFillPeopleFill, BsFillCheckSquareFill, BsEye, BsPencilSquare } from "react-icons/bs";
import { IoAlertCircleOutline, IoFilterOutline } from "react-icons/io5";
import { IoMdWarning } from "react-icons/io";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  getProveedores,
  cambiarEstatusProveedor,
  getEstadisticasProveedores,
  eliminarProveedor,
} from "@/services/proveedores.service";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Provider {
  id: string;
  nombre: string;
  rif: string;
  nombreRepLegal: string;
  areaEspecialidad: string | null;
  estatusValidacion: "PENDIENTE" | "APROBADO" | "RECHAZADO" | "EN_REVISION";
}

export function ListadoProveedores() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState<any>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [areaFilter, setAreaFilter] = useState("TODOS");
  const [limit] = useState(10);

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    try {
      // Logic to determine if search is RIF or Name (simplistic approach)
      const isRif = /^[VGJ]-?\d/.test(search);
      const data = await getProveedores({
        page,
        limit,
        estatusValidacion:
          statusFilter === "ACTIVO" || statusFilter === "POR_VENCER"
            ? "APROBADO"
            : statusFilter === "VENCIDO"
              ? "RECHAZADO"
              : statusFilter === "POR_APROBAR"
                ? "PENDIENTE"
                : undefined,
        areaEspecialidad: areaFilter !== "TODOS" ? areaFilter : undefined,
        rif: isRif ? search : undefined,
        nombre: !isRif ? search : undefined,
      });

      setProviders(data.data || []);
      setTotalPages(data.meta?.totalPages || 1);
      setTotalCount(data.meta?.totalItems || 0);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al cargar proveedores");
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter, search]);

  const handleToggleApproval = async (id: string, currentStatus: string) => {
    try {
      // API only accepts APROBADO or RECHAZADO
      const nextStatus = currentStatus === "APROBADO" ? "RECHAZADO" : "APROBADO";
      await cambiarEstatusProveedor(id, nextStatus);
      toast.success(nextStatus === "APROBADO" ? "Proveedor aprobado" : "Proveedor rechazado");
      fetchProviders(); // Refresh list to reflect changes
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al cambiar el estatus del proveedor"
      );
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      await eliminarProveedor(id);
      toast.success("Proveedor eliminado exitosamente");
      fetchProviders();
    } catch (error) {
      toast.error("Error al eliminar el proveedor");
    } finally {
      setIsDeleting(false);
      setProviderToDelete(null);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProviders();
    }, 500); // Simple debounce
    return () => clearTimeout(timer);
  }, [fetchProviders]);

  useEffect(() => {
    getEstadisticasProveedores().then(setStats).catch(console.error);
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 rounded-xl">
      {/* Main Container White */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        {/* Header Area Inside Card */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 border-b border-slate-100 mb-6 pb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-heading-dark tracking-tight mb-1">
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o RIF..."
              className="w-full pl-10 pr-4 h-[42px] rounded-lg border-slate-300 focus-visible:ring-navy text-sm bg-white"
            />
          </div>
          <div className="flex items-center gap-3">
            <Select value={areaFilter} onValueChange={setAreaFilter}>
              <SelectTrigger className="w-40 h-[42px] border-slate-300 focus:ring-navy bg-white">
                <SelectValue placeholder="Tipo: Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Tipo: Todos</SelectItem>
                <SelectItem value="BIENES">Bienes</SelectItem>
                <SelectItem value="OBRAS">Obras</SelectItem>
                <SelectItem value="SERVICIOS">Servicios</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44 h-[42px] border-slate-300 focus:ring-navy bg-white">
                <SelectValue placeholder="Estatus: Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Estatus: Todos</SelectItem>
                <SelectItem value="ACTIVO">Activo</SelectItem>
                <SelectItem value="POR_VENCER">Por vencer</SelectItem>
                <SelectItem value="VENCIDO">Vencido</SelectItem>
                <SelectItem value="POR_APROBAR">Por aprobar</SelectItem>
                <SelectItem value="PENDIENTE">Pendiente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto bg-white rounded-lg border border-slate-200 relative min-h-[200px]">
          {loading && (
            <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center backdrop-blur-[1px]">
              <Loader2 className="w-8 h-8 text-navy animate-spin" />
            </div>
          )}
          <table className="w-full text-[13px] text-left">
            <thead className="bg-slate-bg text-text-muted-dark font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-semibold whitespace-nowrap">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-navy">
                    Nombre del proveedor
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="px-4 py-3 font-semibold text-center whitespace-nowrap">Rif</th>
                <th className="px-4 py-3 font-semibold text-center whitespace-nowrap">
                  Representante Legal
                </th>
                <th className="px-4 py-3 font-semibold text-center whitespace-nowrap">tipo</th>
                <th className="px-4 py-3 font-semibold text-center whitespace-nowrap">Estatus</th>
                <th className="px-4 py-3 font-semibold text-center whitespace-nowrap">
                  Aprobación
                </th>
                <th className="px-4 py-3 font-semibold text-center whitespace-nowrap">Acción</th>
              </tr>
            </thead>
            <tbody>
              {providers.length > 0
                ? providers.map((provider, index) => {
                    const incompleto = !provider.areaEspecialidad;
                    return (
                      <tr
                        key={provider.id}
                        className="border-b border-slate-100 last:border-0 transition-colors"
                        style={{
                          backgroundColor: incompleto
                            ? "var(--proveedor-incompleto-bg)"
                            : index % 2 !== 0
                              ? "oklch(0.984 0.003 247.86 / 0.3)"
                              : "white",
                        }}
                      >
                        <td className="px-6 py-3 font-semibold text-slate-700 max-w-[200px] truncate">
                          {provider.nombre}
                        </td>
                        <td className="px-4 py-3 text-slate-600 text-center">{provider.rif}</td>
                        <td className="px-4 py-3 text-slate-600 text-center font-medium max-w-[150px] truncate">
                          {provider.nombreRepLegal}
                        </td>

                        {/* Tipo Pill */}
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
                                  : "bg-red-50 text-red-700 border-red-200"
                            }`}
                          >
                            {provider.estatusValidacion === "APROBADO"
                              ? "activo"
                              : provider.estatusValidacion === "PENDIENTE"
                                ? "por aprobar"
                                : "vencido"}
                          </span>
                        </td>

                        {/* Aprobación Switch */}
                        <td className="px-4 py-3 text-center">
                          {incompleto ? (
                            <TooltipProvider delayDuration={100}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="inline-flex cursor-not-allowed">
                                    <button
                                      disabled
                                      className="relative inline-flex h-6 w-10 flex-shrink-0 rounded-full border-2 border-transparent bg-slate-300 opacity-50 cursor-not-allowed"
                                    >
                                      <span className="sr-only">Cambiar estatus</span>
                                      <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 translate-x-0" />
                                    </button>
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="top"
                                  className="max-w-[220px] text-center text-xs"
                                >
                                  Debes completar el perfil del proveedor antes de poder aprobarlo.
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <button
                              onClick={() =>
                                handleToggleApproval(provider.id, provider.estatusValidacion)
                              }
                              className={`relative inline-flex h-6 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-navy focus:ring-offset-2 ${
                                provider.estatusValidacion === "APROBADO"
                                  ? "bg-success"
                                  : "bg-danger"
                              }`}
                            >
                              <span className="sr-only">Cambiar estatus</span>
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  provider.estatusValidacion === "APROBADO"
                                    ? "translate-x-4"
                                    : "translate-x-0"
                                }`}
                              />
                            </button>
                          )}
                        </td>

                        {/* Acciones */}
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-3">
                            <Link href={`/registro-proveedores/${provider.id}`}>
                              <button className="text-slate-500 hover:text-navy transition-colors">
                                <BsEye className="w-4.5 h-4.5" />
                              </button>
                            </Link>

                            {/* Lápiz — animado si proveedor incompleto */}
                            {incompleto ? (
                              <TooltipProvider delayDuration={100}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Link href={`/registro-proveedores/editar/${provider.id}`}>
                                      <button className="relative w-[18px] h-[18px]">
                                        {/* Lápiz normal — se desvanece */}
                                        <span className="pencil-icon-normal absolute inset-0 flex items-center justify-center">
                                          <BsPencilSquare
                                            className="w-[16px] h-[16px]"
                                            style={{ color: "var(--proveedor-incompleto-icon)" }}
                                          />
                                        </span>
                                        {/* Icono advertencia — aparece */}
                                        <span className="pencil-icon-warning absolute inset-0 flex items-center justify-center">
                                          <IoMdWarning
                                            className="w-[16px] h-[16px]"
                                            style={{ color: "var(--proveedor-incompleto-icon)" }}
                                          />
                                        </span>
                                      </button>
                                    </Link>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="top"
                                    className="max-w-[200px] text-center text-xs"
                                  >
                                    Proveedor incompleto. Haz clic para completar su información.
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <Link href={`/registro-proveedores/editar/${provider.id}`}>
                                <button className="text-slate-500 hover:text-navy transition-colors">
                                  <BsPencilSquare className="w-4.5 h-4.5" />
                                </button>
                              </Link>
                            )}

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <button className="text-red-400 hover:text-red-600 transition-colors">
                                  <FaRegTrashAlt className="w-4 h-4" />
                                </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción eliminará al proveedor{" "}
                                    <strong>{provider.nombre}</strong> de forma lógica. Podrás
                                    seguir viendo su historial si es necesario, pero ya no aparecerá
                                    en las listas activas.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel disabled={isDeleting}>
                                    Cancelar
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(provider.id)}
                                    className="bg-navy hover:bg-navy-hover text-white transition-all duration-300 font-bold"
                                    disabled={isDeleting}
                                  >
                                    {isDeleting ? "Eliminando..." : "Eliminar"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                : !loading && (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-slate-500 italic">
                        No se encontraron proveedores
                      </td>
                    </tr>
                  )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-end items-center mt-6">
          <div className="flex justify-end items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="w-9 h-9 rounded-lg border-slate-300 text-slate-500 hover:text-navy hover:border-navy transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={page === p ? "default" : "outline"}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg p-0 font-bold transition-all ${
                    page === p
                      ? "bg-navy hover:bg-navy-hover text-white shadow-md scale-105"
                      : "border-slate-300 text-slate-600 hover:border-navy hover:text-navy"
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
              className="w-9 h-9 rounded-lg border-slate-300 text-slate-500 hover:text-navy hover:border-navy transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Footer KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 mt-8 border-t border-slate-100">
          <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white hover:border-navy transition-all group">
            <CardContent className="p-2.5">
              <div className="flex justify-between items-start mb-0">
                <h3 className="text-[10px] font-bold text-slate-600 group-hover:text-navy transition-colors uppercase tracking-wider">
                  Total Proveedores
                </h3>
                <div className="transition-colors">
                  <BsFillPeopleFill className="w-4 h-4 text-navy" />
                </div>
              </div>
              <div className="text-xl font-extrabold text-navy leading-tight">
                {stats?.resumen?.totalRegistrados || totalCount}
              </div>
              <p className="text-[9px] font-bold text-success-text">
                {stats?.crecimientoMensual?.registradosEsteMes >= 0 ? "+" : ""}
                {stats?.crecimientoMensual?.registradosEsteMes || 0} este mes
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white hover:border-navy transition-all group">
            <CardContent className="p-2.5">
              <div className="flex justify-between items-start mb-0">
                <h3 className="text-[10px] font-bold text-slate-600 group-hover:text-navy transition-colors uppercase tracking-wider">
                  Documentación vencida
                </h3>
                <div className="transition-colors">
                  <BsFillCheckSquareFill className="w-4 h-4 text-navy" />
                </div>
              </div>
              <div className="text-xl font-extrabold text-danger leading-tight">
                {stats?.resumen?.totalRechazados || 0}
              </div>
              <p className="text-[9px] font-bold text-danger">Requiere atención</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white hover:border-navy transition-all group">
            <CardContent className="p-2.5">
              <div className="flex justify-between items-start mb-0">
                <h3 className="text-[10px] font-bold text-slate-600 group-hover:text-navy transition-colors uppercase tracking-wider">
                  Proceso de aprobación
                </h3>
                <div className="transition-colors">
                  <IoAlertCircleOutline className="w-5 h-5 text-navy" />
                </div>
              </div>
              <div className="text-xl font-extrabold text-navy leading-tight">
                {stats?.resumen?.totalPendientes || 0}
              </div>
              <p className="text-[9px] font-bold text-amber-dark">Pendiente revisión</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

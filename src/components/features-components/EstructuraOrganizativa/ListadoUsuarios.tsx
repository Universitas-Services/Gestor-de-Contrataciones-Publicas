"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TIPO_MIEMBRO_LABELS,
  AREA_REPRESENTACION_LABELS,
} from "@/lib/schemas/comisionContratacionesSchema";
import { BsEye, BsPencilSquare } from "react-icons/bs";
import { FaRegTrashAlt } from "react-icons/fa";
import { ChevronDown, Plus, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { getDirectorioActores } from "@/services/directorioService";
import type { Actor, ActorTipo } from "@/types/directorio.types";
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
} from "@/components/ui/alert-dialog";
import { eliminarMaximaAutoridad, obtenerMaximaAutoridad } from "@/services/maximaAutoridadService";
import { eliminarUnidadUsuaria, obtenerUnidadUsuaria } from "@/services/unidadUsuariaService";
import {
  eliminarUnidadContratante,
  obtenerUnidadContratante,
} from "@/services/unidadContratanteService";
import {
  eliminarComisionContrataciones,
  obtenerComisionContrataciones,
} from "@/services/comisionContratacionesService";

const TIPO_MAP: Record<ActorTipo, string> = {
  COMISION_CONTRATACIONES: "Comisión de contrataciones",
  UNIDAD_CONTRATANTE: "Unidad contratante",
  UNIDAD_USUARIA: "Unidad usuaria",
  MAXIMA_AUTORIDAD: "Máxima autoridad",
};

export function ListadoUsuarios() {
  const [usuarios, setUsuarios] = useState<Actor[]>([]);
  const [selectedUser, setSelectedUser] = useState<Actor | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [actorToDelete, setActorToDelete] = useState<Actor | null>(null);

  // Sheet states
  const [selectedUserDetails, setSelectedUserDetails] = useState<any>(null);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);

  const limit = 10;
  const router = useRouter();

  const fetchActores = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getDirectorioActores({ page, limit });
      setUsuarios(response.data || []);
      setTotalPages(response.meta?.lastPage || 1);
      setTotalCount(response.meta?.total || 0);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al cargar el directorio");
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchActores();
  }, [fetchActores]);

  const handleViewClick = async (usuario: Actor) => {
    setSelectedUser(usuario);
    setIsSheetOpen(true);
    setIsFetchingDetails(true);
    setSelectedUserDetails(null);
    try {
      let data;
      switch (usuario.tipo) {
        case "MAXIMA_AUTORIDAD":
          data = await obtenerMaximaAutoridad(usuario.id);
          break;
        case "UNIDAD_USUARIA":
          data = await obtenerUnidadUsuaria(usuario.id);
          break;
        case "UNIDAD_CONTRATANTE":
          data = await obtenerUnidadContratante(usuario.id);
          break;
        case "COMISION_CONTRATACIONES":
          data = await obtenerComisionContrataciones(usuario.id);
          break;
      }
      setSelectedUserDetails(data);
    } catch (error) {
      toast.error("Error al cargar detalles del actor");
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const handleEditRedirect = (usuario: Actor) => {
    switch (usuario.tipo) {
      case "MAXIMA_AUTORIDAD":
        router.push(`/admin_ente/configuracion/maxima-autoridad?id=${usuario.id}`);
        break;
      case "UNIDAD_USUARIA":
        router.push(`/admin_ente/configuracion/unidad-usuaria?id=${usuario.id}`);
        break;
      case "UNIDAD_CONTRATANTE":
        router.push(`/admin_ente/configuracion/unidad-contratante?id=${usuario.id}`);
        break;
      case "COMISION_CONTRATACIONES":
        router.push(`/admin_ente/configuracion/comision-contrataciones?id=${usuario.id}`);
        break;
      default:
        toast.error("Tipo de actor desconocido para edición");
    }
  };

  const confirmDelete = async () => {
    if (!actorToDelete) return;
    try {
      setLoading(true);
      switch (actorToDelete.tipo) {
        case "MAXIMA_AUTORIDAD":
          await eliminarMaximaAutoridad(actorToDelete.id);
          break;
        case "UNIDAD_USUARIA":
          await eliminarUnidadUsuaria(actorToDelete.id);
          break;
        case "UNIDAD_CONTRATANTE":
          await eliminarUnidadContratante(actorToDelete.id);
          break;
        case "COMISION_CONTRATACIONES":
          await eliminarComisionContrataciones(actorToDelete.id);
          break;
        default:
          throw new Error("Tipo de actor desconocido");
      }
      toast.success("Registro eliminado exitosamente");
      await fetchActores();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al eliminar");
    } finally {
      setActorToDelete(null);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 rounded-xl">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 border-b border-slate-200 mb-6 pb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-color-boton-2 tracking-tight mb-1">
              Panel de la estructura organizativa
            </h1>
            <p className="text-slate-500 font-medium text-sm italic">
              Administra la estructura del Ente con {totalCount} registros.
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-navy hover:bg-navy-deep text-white rounded-md px-6 py-5 h-10 flex items-center justify-center gap-2 font-sans font-semibold text-[14.81px] leading-[1.5] tracking-[-0.01em] shadow-md min-w-[150px]">
                Crear <Plus className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-[200px] bg-navy text-white border-none rounded-md py-2"
            >
              <DropdownMenuItem
                onClick={() => router.push("/admin_ente/configuracion/maxima-autoridad")}
                className="focus:bg-navy-deep focus:text-white cursor-pointer font-medium py-2 px-4 rounded-sm text-[15px]"
              >
                Máxima Autoridad
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/admin_ente/configuracion/unidad-usuaria")}
                className="focus:bg-navy-deep focus:text-white cursor-pointer font-medium py-2 px-4 rounded-sm text-[15px]"
              >
                Unidad Usuaria
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/admin_ente/configuracion/unidad-contratante")}
                className="focus:bg-navy-deep focus:text-white cursor-pointer font-medium py-2 px-4 rounded-sm text-[15px]"
              >
                Unidad Contratante
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/admin_ente/configuracion/comision-contrataciones")}
                className="focus:bg-navy-deep focus:text-white cursor-pointer font-medium py-2 px-4 rounded-sm text-[15px]"
              >
                Comisión de Contrataciones
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto bg-white rounded-sm border border-slate-200 relative min-h-[200px]">
          {loading && (
            <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center backdrop-blur-[1px]">
              <Loader2 className="w-8 h-8 text-color-boton-2 animate-spin" />
            </div>
          )}
          <table className="w-full text-[13px] text-left">
            <thead className="bg-slate-bg text-text-muted-dark font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-semibold whitespace-nowrap pl-8">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-navy">
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
              {usuarios.length > 0
                ? usuarios.map((usuario) => (
                    <tr
                      key={usuario.id}
                      className={`border-b border-slate-200 transition-colors ${
                        !usuario.estatus ? "bg-border-light" : "bg-white"
                      }`}
                    >
                      <td className="px-6 py-3 font-medium text-slate-800 max-w-[250px] leading-tight text-xs pl-8">
                        {usuario.nombre}
                      </td>
                      <td className="px-4 py-3 text-slate-800 font-medium text-center text-xs">
                        {TIPO_MAP[usuario.tipo] || usuario.tipo}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex px-4 py-1.5 rounded-full text-[11px] font-semibold tracking-wide ${
                            usuario.estatus
                              ? "bg-success-bg text-success border border-success"
                              : "bg-rechazado-bg text-rechazado border border-rechazado"
                          }`}
                        >
                          {usuario.estatus ? "Activo" : "Vencido"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-800 font-medium text-center text-xs">
                        {usuario.createdAt
                          ? new Date(usuario.createdAt).toLocaleDateString("es-VE")
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-4">
                          <button
                            className="text-slate-700 hover:text-navy transition-colors title='Ver detalles'"
                            onClick={() => handleViewClick(usuario)}
                          >
                            <BsEye className="w-[18px] h-[18px]" />
                          </button>
                          <button
                            className="text-slate-700 hover:text-navy transition-colors title='Editar'"
                            onClick={() => handleEditRedirect(usuario)}
                          >
                            <BsPencilSquare className="w-[18px] h-[18px]" />
                          </button>
                          <button
                            className="text-rechazado hover:text-red-700 transition-colors title='Eliminar'"
                            onClick={() => setActorToDelete(usuario)}
                          >
                            <FaRegTrashAlt className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                : !loading && (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-slate-500 italic">
                        No se encontraron registros
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
              className="w-9 h-9 rounded-lg border-slate-300 text-slate-500 hover:text-color-boton-2 hover:border-color-boton-2 transition-all"
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
                      ? "bg-color-boton-2 hover:bg-navy-deep text-white shadow-md scale-105"
                      : "border-slate-300 text-slate-600 hover:border-color-boton-2 hover:text-color-boton-2"
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
              className="w-9 h-9 rounded-lg border-slate-300 text-slate-500 hover:text-color-boton-2 hover:border-color-boton-2 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Sheet Overlay for User Details */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-md md:max-w-[450px] bg-white p-0 border-l overflow-y-auto">
          {selectedUser && (
            <div className="flex flex-col h-full">
              <SheetHeader className="p-8 pb-4">
                <SheetTitle className="text-2xl font-extrabold text-color-boton-2 text-left">
                  Detalles de {selectedUser.nombre}
                </SheetTitle>
                <SheetDescription className="text-slate-500 font-medium italic text-left">
                  Información detallada de la {TIPO_MAP[selectedUser.tipo] || selectedUser.tipo}
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 px-8 py-4 space-y-8">
                {isFetchingDetails ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                    <Loader2 className="h-8 w-8 animate-spin mb-4 text-color-boton-2" />
                    <p>Cargando detalles...</p>
                  </div>
                ) : selectedUserDetails ? (
                  <div className="space-y-6">
                    {selectedUser.tipo === "MAXIMA_AUTORIDAD" && (
                      <div className="space-y-4">
                        <div className="space-y-4">
                          <h3 className="text-color-boton-2 font-extrabold text-[13px] border-b border-slate-300 pb-1.5 flex items-center gap-2">
                            <span>Datos de la autoridad</span>
                          </h3>
                          <div className="space-y-1">
                            <Label className="text-color-boton-2 font-bold text-[11px] block">
                              Nombre y apellido de la Máxima Autoridad
                            </Label>
                            <div className="border border-slate-300 bg-white text-[11px] italic font-medium text-slate-500 px-3 py-1.5 rounded-md w-full min-h-[32px] break-words whitespace-normal leading-tight">
                              {selectedUserDetails.nombreCompletoAutoridad || "-"}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <Label className="text-color-boton-2 font-bold text-[11px] block">
                                Cargo
                              </Label>
                              <div className="border border-slate-300 bg-white text-[11px] italic font-medium text-slate-500 px-3 py-1.5 rounded-md w-full min-h-[32px] break-words whitespace-normal leading-tight">
                                {selectedUserDetails.cargoOficialAutoridad || "-"}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-color-boton-2 font-bold text-[11px] block">
                                Cédula
                              </Label>
                              <div className="border border-slate-300 bg-white text-[11px] italic font-medium text-slate-500 px-3 py-1.5 rounded-md w-full min-h-[32px] break-words whitespace-normal leading-tight">
                                {selectedUserDetails.cedulaAutoridad || "-"}
                              </div>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-color-boton-2 font-bold text-[11px] block">
                              Resolución / Designación
                            </Label>
                            <div className="border border-slate-300 bg-white text-[11px] italic font-medium text-slate-500 px-3 py-1.5 rounded-md w-full min-h-[32px] break-words whitespace-normal leading-tight">
                              {selectedUserDetails.datosDesignacionAutoridad || "-"}
                            </div>
                          </div>
                        </div>

                        {selectedUserDetails.esDelegado && (
                          <div className="space-y-4 pt-2">
                            <h3 className="text-color-boton-2 font-extrabold text-[13px] border-b border-slate-300 pb-1.5 flex items-center gap-2">
                              <span>Datos del delegado</span>
                            </h3>
                            <div className="space-y-1">
                              <Label className="text-color-boton-2 font-bold text-[11px] block">
                                Nombre completo del delegado
                              </Label>
                              <div className="border border-slate-300 bg-white text-[11px] italic font-medium text-slate-500 px-3 py-1.5 rounded-md w-full min-h-[32px] break-words whitespace-normal leading-tight">
                                {selectedUserDetails.nombreCompletoDelegado || "-"}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <Label className="text-color-boton-2 font-bold text-[11px] block">
                                  Cédula del delegado
                                </Label>
                                <div className="border border-slate-300 bg-white text-[11px] italic font-medium text-slate-500 px-3 py-1.5 rounded-md w-full min-h-[32px] break-words whitespace-normal leading-tight">
                                  {selectedUserDetails.cedulaDelegado || "-"}
                                </div>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-color-boton-2 font-bold text-[11px] block">
                                  Cargo del delegado
                                </Label>
                                <div className="border border-slate-300 bg-white text-[11px] italic font-medium text-slate-500 px-3 py-1.5 rounded-md w-full min-h-[32px] break-words whitespace-normal leading-tight">
                                  {selectedUserDetails.cargoOficialDelegado || "-"}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {selectedUser.tipo === "UNIDAD_USUARIA" && (
                      <div className="space-y-4">
                        <h3 className="text-color-boton-2 font-extrabold text-[13px] border-b border-slate-300 pb-1.5">
                          Informacion general
                        </h3>
                        <div className="space-y-1">
                          <Label className="text-color-boton-2 font-bold text-[11px] block">
                            Nombre de la Unidad, Gerencia u Oficina Usuaria
                          </Label>
                          <div className="border border-slate-300 bg-white text-[11px] italic font-medium text-slate-500 px-3 py-1.5 rounded-md w-full min-h-[32px] break-words whitespace-normal leading-tight">
                            {selectedUserDetails.nombreUnidadUsuaria || "-"}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-color-boton-2 font-bold text-[11px] block">
                            Nombre y apellido del Responsable de la Unidad
                          </Label>
                          <div className="border border-slate-300 bg-white text-[11px] italic font-medium text-slate-500 px-3 py-1.5 rounded-md w-full min-h-[32px] break-words whitespace-normal leading-tight">
                            {selectedUserDetails.nombreResponsableUnidadUsuaria || "-"}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-color-boton-2 font-bold text-[11px] block">
                            Cargo del Responsable de la Unidad Usuaria
                          </Label>
                          <div className="border border-slate-300 bg-white text-[11px] italic font-medium text-slate-500 px-3 py-1.5 rounded-md w-full min-h-[32px] break-words whitespace-normal leading-tight">
                            {selectedUserDetails.cargoResponsableUnidadUsuaria || "-"}
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedUser.tipo === "UNIDAD_CONTRATANTE" && (
                      <div className="space-y-4">
                        <h3 className="text-color-boton-2 font-extrabold text-[13px] border-b border-slate-300 pb-1.5">
                          Informacion general
                        </h3>
                        <div className="space-y-1">
                          <Label className="text-color-boton-2 font-bold text-[11px] block">
                            Nombre de la Unidad, Gerencia u Oficina que funge como Unidad
                            Contratante.
                          </Label>
                          <div className="border border-slate-300 bg-white text-[11px] italic font-medium text-slate-500 px-3 py-1.5 rounded-md w-full min-h-[32px] break-words whitespace-normal leading-tight">
                            {selectedUserDetails.nombreUnidadContratante || "-"}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-color-boton-2 font-bold text-[11px] block">
                            Nombre y apellido del Responsable de la Unidad Contratante.
                          </Label>
                          <div className="border border-slate-300 bg-white text-[11px] italic font-medium text-slate-500 px-3 py-1.5 rounded-md w-full min-h-[32px] break-words whitespace-normal leading-tight">
                            {selectedUserDetails.nombreResponsableUnidad || "-"}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-color-boton-2 font-bold text-[11px] block">
                            Cargo del Responsable de la Unidad Contratante
                          </Label>
                          <div className="border border-slate-300 bg-white text-[11px] italic font-medium text-slate-500 px-3 py-1.5 rounded-md w-full min-h-[32px] break-words whitespace-normal leading-tight">
                            {selectedUserDetails.cargoResponsable || "-"}
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedUser.tipo === "COMISION_CONTRATACIONES" && (
                      <div className="space-y-8">
                        <div className="space-y-4">
                          <h3 className="text-color-boton-2 font-extrabold text-[13px] border-b border-slate-300 pb-1.5">
                            Información general
                          </h3>
                          <div className="space-y-1">
                            <Label className="text-color-boton-2 font-bold text-[11px] block leading-tight">
                              Nombre, denominación o nomenclatura de la Comisión de Contrataciones
                            </Label>
                            <div className="border border-slate-300 bg-white text-[11px] italic font-medium text-slate-500 px-3 py-1.5 rounded-md w-full min-h-[32px] break-words whitespace-normal leading-tight">
                              {selectedUserDetails.denominacionComision || "-"}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-color-boton-2 font-bold text-[11px] block">
                              Resolución
                            </Label>
                            <div className="border border-slate-300 bg-white text-[11px] italic font-medium text-slate-500 px-3 py-1.5 rounded-md w-full min-h-[32px] break-words whitespace-normal leading-tight">
                              {selectedUserDetails.datosDesignacionComision || "-"}
                            </div>
                          </div>
                        </div>

                        {/* Miembros de la Comisión */}
                        <div className="space-y-4 pt-2">
                          <h3 className="text-color-boton-2 font-extrabold text-[15px] border-b border-slate-300 pb-2">
                            Miembros de la comisión
                          </h3>
                          <div className="border border-slate-200 rounded-md bg-white shadow-sm overflow-hidden">
                            <Table className="w-full">
                              <TableHeader className="bg-white border-b border-slate-200">
                                <TableRow className="hover:bg-white text-left">
                                  <TableHead className="font-bold text-color-boton-2 text-xs h-11 px-3">
                                    Nombre
                                  </TableHead>
                                  <TableHead className="font-bold text-color-boton-2 text-xs h-11 px-3">
                                    Cédula
                                  </TableHead>
                                  <TableHead className="font-bold text-color-boton-2 text-xs h-11 px-3">
                                    Rol
                                  </TableHead>
                                  <TableHead className="font-bold text-color-boton-2 text-xs h-11 px-3">
                                    Área
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {!selectedUserDetails.miembros ||
                                selectedUserDetails.miembros.length === 0 ? (
                                  <TableRow>
                                    <TableCell
                                      colSpan={4}
                                      className="h-16 text-center text-slate-500 italic text-[11px]"
                                    >
                                      No hay miembros registrados.
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  selectedUserDetails.miembros.map((miembro: any, idx: number) => (
                                    <TableRow
                                      key={idx}
                                      className="hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors"
                                    >
                                      <TableCell className="font-medium text-slate-700 text-xs py-3 px-3 align-top whitespace-normal break-words">
                                        {miembro.nombreCompletoMiembro}
                                      </TableCell>
                                      <TableCell className="text-slate-600 font-medium text-xs py-3 px-3 align-top whitespace-nowrap">
                                        {miembro.cedulaMiembro}
                                      </TableCell>
                                      <TableCell className="text-slate-600 font-medium text-xs py-3 px-3 align-top whitespace-normal break-words">
                                        {TIPO_MIEMBRO_LABELS[
                                          miembro.tipoMiembro as keyof typeof TIPO_MIEMBRO_LABELS
                                        ] || miembro.tipoMiembro}
                                      </TableCell>
                                      <TableCell className="text-slate-600 font-medium text-xs py-3 px-3 align-top whitespace-normal break-words">
                                        {AREA_REPRESENTACION_LABELS[
                                          miembro.areaRepresentacion as keyof typeof AREA_REPRESENTACION_LABELS
                                        ] || miembro.areaRepresentacion}
                                      </TableCell>
                                    </TableRow>
                                  ))
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-10 text-slate-500 italic">
                    Sin detalles que mostrar.
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-8 pt-6 flex justify-end gap-3 pb-12 mt-auto border-t border-slate-100 bg-slate-50/50">
                <Button
                  onClick={() => handleEditRedirect(selectedUser)}
                  className="bg-color-boton-2 hover:bg-color-boton-hover text-white font-bold px-6 py-2 h-11 flex-1 rounded-md transition-all"
                >
                  Editar
                </Button>
                <Button
                  onClick={() => setIsSheetOpen(false)}
                  className="bg-color-boton-2 hover:bg-color-boton-hover text-white font-bold px-6 py-2 h-11 flex-1 rounded-md transition-all"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* AlertDialog for Delete Confirmation */}
      <AlertDialog open={!!actorToDelete} onOpenChange={(open) => !open && setActorToDelete(null)}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-color-boton-2 font-bold">
              ¿Estás seguro de eliminar este registro?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              Esta acción borrará lógicamente a {actorToDelete?.nombre} del sistema. ¿Deseas
              continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-semibold text-slate-600">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-rechazado hover:bg-red-700 text-white font-semibold"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Loader2, MoreVertical, Trash2, Edit2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  comisionContratacionesSchema,
  miembroSchema,
  TIPO_MIEMBRO_OPTIONS,
  AREA_REPRESENTACION_OPTIONS,
  TIPO_MIEMBRO_LABELS,
  AREA_REPRESENTACION_LABELS,
  type ComisionContratacionesFormValues,
  type MiembroFormValues,
} from "@/lib/schemas/comisionContratacionesSchema";

import {
  registrarComisionContrataciones,
  obtenerComisionContrataciones,
  registrarMiembroComision,
  eliminarMiembroComision,
  actualizarComisionContrataciones,
  actualizarMiembroComision,
} from "@/services/comisionContratacionesService";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ComisionContratacionesForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [comisionId, setComisionId] = useState<number | string | null>(null);

  // Lista de miembros mantenida en estado para la tabla (refrescada vía API)
  const [miembros, setMiembros] = useState<MiembroFormValues[]>([]);

  // Estados visuales para el Inline Form de Miembro
  const [cedulaMiembroTipo, setCedulaMiembroTipo] = useState("V");
  const [cedulaMiembroNumero, setCedulaMiembroNumero] = useState("");
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [memberToEditIndex, setMemberToEditIndex] = useState<number | null>(null);

  // Formulario principal
  const form = useForm<ComisionContratacionesFormValues>({
    resolver: zodResolver(comisionContratacionesSchema),
    defaultValues: {
      denominacionComision: "",
      datosDesignacionComision: "",
      comisionCertificada: false,
    },
    mode: "onChange",
  });

  // Formulario en línea para miembros
  const memberForm = useForm<MiembroFormValues>({
    resolver: zodResolver(miembroSchema),
    defaultValues: {
      nombreCompletoMiembro: "",
      cedulaMiembro: "",
      tipoMiembro: undefined,
      areaRepresentacion: undefined,
    },
    mode: "onChange",
  });

  // Sincronizar cédula en el sub-formulario
  useEffect(() => {
    if (cedulaMiembroNumero) {
      memberForm.setValue("cedulaMiembro", `${cedulaMiembroTipo}-${cedulaMiembroNumero}`, {
        shouldValidate: true,
      });
    } else {
      memberForm.setValue("cedulaMiembro", "");
    }
  }, [cedulaMiembroTipo, cedulaMiembroNumero, memberForm]);

  useEffect(() => {
    if (editId) {
      setIsLoading(true);
      obtenerComisionContrataciones(editId)
        .then((data) => {
          if (data) {
            form.reset({
              denominacionComision: data.denominacionComision || "",
              datosDesignacionComision: data.datosDesignacionComision || "",
              comisionCertificada: data.comisionCertificada ?? false,
            });
            setComisionId(editId);
            if (data.miembros) {
              setMiembros(data.miembros);
            }
          }
        })
        .catch((err) => {
          toast.error("Error al cargar los datos para edición");
          console.error(err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [editId, form]);

  // Cargar tabla de miembros desde el servidor
  const refreshMiembros = useCallback(async () => {
    if (!comisionId) return;
    try {
      const data = await obtenerComisionContrataciones(comisionId);
      if (data.miembros) {
        setMiembros(data.miembros);
      }
    } catch (error) {
      console.error("Error al refrescar miembros:", error);
    }
  }, [comisionId]);

  // ---- PASO 1: Crear la Comisión Base ----
  const handleCrearComision = async () => {
    const isValid = await form.trigger([
      "denominacionComision",
      "datosDesignacionComision",
      "comisionCertificada",
    ]);

    if (!isValid) return;

    setIsLoading(true);
    try {
      const formValues = form.getValues();
      if (editId && comisionId) {
        await actualizarComisionContrataciones(comisionId, formValues);
        setStep(2);
        toast.success("Datos base actualizados. Ahora puede revisar los miembros.");
      } else {
        const response = await registrarComisionContrataciones(formValues);
        if (response.id) {
          setComisionId(response.id);
          setStep(2);
          toast.success("Comisión creada exitosamente. Ahora puede agregar miembros.");
        } else {
          toast.error("El servidor no retornó un ID válido para la comisión.");
        }
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Error al crear la Comisión");
    } finally {
      setIsLoading(false);
    }
  };

  // ---- PASO 2: Acciones de Miembros ----
  const handleAgregarMiembro = async (values: MiembroFormValues) => {
    if (!comisionId) return;
    setIsAddingMember(true);

    try {
      if (memberToEditIndex !== null) {
        // Editando un miembro usando su ID real mediante el endpoint PATCH
        const miembroAEditar = miembros[memberToEditIndex];
        if (miembroAEditar.id) {
          await actualizarMiembroComision(miembroAEditar.id, values);
          toast.success("Miembro actualizado.");
        } else {
          toast.error("El miembro no tiene un ID válido para editar.");
        }
        setMemberToEditIndex(null);
      } else {
        // Creando uno nuevo vía POST específico
        await registrarMiembroComision(comisionId, values);
        toast.success("Miembro agregado a la comisión.");
      }

      // Limpiar sub-formulario
      memberForm.reset({
        nombreCompletoMiembro: "",
        cedulaMiembro: "",
        tipoMiembro: undefined,
        areaRepresentacion: undefined,
      });
      setCedulaMiembroNumero("");

      // Refrescar tabla
      await refreshMiembros();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Error con el miembro");
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleEliminarMiembro = async (miembroId?: number | string) => {
    if (!miembroId) {
      toast.error("El miembro no tiene ID válido para eliminar.");
      return;
    }

    try {
      await eliminarMiembroComision(miembroId);
      toast.success("Miembro eliminado.");
      await refreshMiembros();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Error al eliminar");
    }
  };

  const handleEditarLocal = (index: number) => {
    const miembro = miembros[index];
    setMemberToEditIndex(index);

    // Parsear la cédula si viene como V-12345678
    if (miembro.cedulaMiembro) {
      const parts = miembro.cedulaMiembro.split("-");
      if (parts.length === 2) {
        setCedulaMiembroTipo(parts[0]);
        setCedulaMiembroNumero(parts[1]);
      }
    }

    memberForm.reset({
      nombreCompletoMiembro: miembro.nombreCompletoMiembro,
      cedulaMiembro: miembro.cedulaMiembro,
      tipoMiembro: miembro.tipoMiembro,
      areaRepresentacion: miembro.areaRepresentacion,
    });

    // Scrollear hacia los inputs
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  // ---- FINALIZAR ----
  const handleFinalizar = () => {
    setIsLoading(true);
    // Los cambios ya se guardaron incrementalmente. Solo redirigimos.
    toast.success("Configuración de la Comisión finalizada.");
    router.refresh();
    setTimeout(() => {
      router.push("/gestion-datos/estructura-organizativa");
    }, 500);
  };

  return (
    <Card className="mx-auto w-full max-w-6xl shadow-sm border-0 mb-16">
      <CardHeader className="px-10 pt-12 pb-6 border-b border-slate-200">
        <CardTitle className="text-[28px] font-bold text-[slate-700] font-inter">
          Datos de constitución
        </CardTitle>
        <CardDescription className="text-slate-500 italic mt-1 font-inter text-base">
          Artículos 18.7 LOPA; 15 RLCP; 3 LCC; 14 NORMAS DE CONTROL INTERNO SUNAI.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-10 pt-8 pb-10">
        {/* ======================================= */}
        {/* PASO 1 : Crear Base de la Comisión      */}
        {/* ======================================= */}
        {step === 1 && (
          <Form {...form}>
            <form
              onKeyDown={(e) => {
                if (e.key === "Enter") e.preventDefault();
              }}
              className="space-y-6"
            >
              <div className="space-y-0">
                <div className="mb-6">
                  <FormField
                    control={form.control}
                    name="denominacionComision"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[slate-700] font-bold font-inter text-base">
                          Asigne el nombre, denominación o nomenclatura de la Comisión de
                          Contrataciones para identificarla dentro de la plataforma.
                        </FormLabel>
                        <p className="text-slate-500 italic text-sm mt-0.5 mb-2 font-inter">
                          Ejemplo: Comisión de Contrataciones Permanente 2026
                        </p>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ""}
                            disabled={isLoading}
                            className="h-11 bg-white border-slate-300 rounded-md focus-visible:ring-1 focus-visible:ring-color-boton-2/30 w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mb-6">
                  <FormField
                    control={form.control}
                    name="datosDesignacionComision"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[slate-700] font-bold font-inter text-base">
                          Indique los datos de la Resolución, Decreto, Acta o Acuerdo de designación
                          de la Comisión de Contrataciones.
                        </FormLabel>
                        <p className="text-slate-500 italic text-sm mt-0.5 mb-2 font-inter">
                          Ejemplo: Resolución N° 000/00 de fecha 00-00-0000 publicado en Gaceta N°
                          0000 de fecha 00-00-0000
                        </p>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ""}
                            disabled={isLoading}
                            className="h-11 bg-white border-slate-300 rounded-md focus-visible:ring-1 focus-visible:ring-color-boton-2/30 w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mb-6">
                  <FormField
                    control={form.control}
                    name="comisionCertificada"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[slate-700] font-bold font-inter text-base block mb-3">
                          ¿Todos los miembros principales de la Comisión de Contrataciones cuentan
                          con la certificación vigente emitida por el SNC?
                        </FormLabel>
                        <div className="flex gap-4">
                          <Button
                            type="button"
                            onClick={() => field.onChange(true)}
                            className={`h-11 w-24 rounded-md border font-inter font-medium transition-colors ${
                              field.value === true
                                ? "bg-color-boton-2 text-white border-color-boton-2 hover:bg-color-boton-2/90"
                                : "bg-white text-slate-500 border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            SI
                          </Button>
                          <Button
                            type="button"
                            onClick={() => field.onChange(false)}
                            className={`h-11 w-24 rounded-md border font-inter font-medium transition-colors ${
                              field.value === false
                                ? "bg-color-boton-2 text-white border-color-boton-2 hover:bg-color-boton-2/90"
                                : "bg-white text-slate-500 border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            NO
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end pt-4 mt-8">
                  <Button
                    type="button"
                    onClick={handleCrearComision}
                    disabled={isLoading}
                    className="bg-color-boton-2 hover:bg-color-boton-2/90 text-white font-inter px-8 h-11"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                        {editId ? "Actualizando..." : "Creando..."}
                      </>
                    ) : editId ? (
                      "Siguiente"
                    ) : (
                      "Crear comisión"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        )}

        {/* ======================================= */}
        {/* PASO 2 : Gestión de Miembros            */}
        {/* ======================================= */}
        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Formulario Inline de Miembros */}
            <Form {...memberForm}>
              <form onSubmit={memberForm.handleSubmit(handleAgregarMiembro)} className="space-y-6">
                <div className="mb-6">
                  <FormField
                    control={memberForm.control}
                    name="nombreCompletoMiembro"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[slate-700] font-bold font-inter text-base">
                          Indique nombres y apellidos del miembro
                        </FormLabel>
                        <p className="text-slate-500 italic text-sm mt-0.5 mb-2 font-inter">
                          Ejemplo: María del Carmen Pérez Hernández
                        </p>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ""}
                            disabled={isAddingMember}
                            className="h-11 bg-white border-slate-300 rounded-md focus-visible:ring-1 focus-visible:ring-color-boton-2/30 w-full md:w-2/3 lg:w-1/2"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mb-6">
                  <FormField
                    control={memberForm.control}
                    name="cedulaMiembro"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-[slate-700] font-bold font-inter text-base">
                          Indique Cédula de Identidad del miembro
                        </FormLabel>
                        <p className="text-slate-500 italic text-sm mt-0.5 mb-2 font-inter">
                          Ejemplo: V-00000000
                        </p>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <Select
                              value={cedulaMiembroTipo}
                              onValueChange={setCedulaMiembroTipo}
                              disabled={isAddingMember}
                            >
                              <SelectTrigger className="w-[70px] h-11 bg-white border-slate-300 rounded-md focus:ring-1 focus:ring-color-boton-2/30 text-slate-500 font-inter">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="V">V</SelectItem>
                                <SelectItem value="E">E</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              value={cedulaMiembroNumero}
                              onChange={(e) =>
                                setCedulaMiembroNumero(e.target.value.replace(/\D/g, ""))
                              }
                              disabled={isAddingMember}
                              maxLength={8}
                              className="h-11 bg-white border-slate-300 rounded-md focus-visible:ring-1 focus-visible:ring-color-boton-2/30 w-[150px]"
                              placeholder="00000000"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mb-6">
                  <FormField
                    control={memberForm.control}
                    name="tipoMiembro"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[slate-700] font-bold font-inter text-base">
                          Seleccione el Rol del miembro dentro de la Comisión
                        </FormLabel>
                        <p className="text-slate-500 italic text-sm mt-0.5 mb-2 font-inter">
                          Ejemplo: Miembro principal, Miembro suplente
                        </p>
                        <FormControl>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}
                            disabled={isAddingMember}
                          >
                            <SelectTrigger className="w-[200px] h-11 bg-white border-slate-300 rounded-md focus:ring-1 focus:ring-color-boton-2/30 text-slate-500 font-inter">
                              <SelectValue placeholder="Seleccione el rol" />
                            </SelectTrigger>
                            <SelectContent>
                              {TIPO_MIEMBRO_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {TIPO_MIEMBRO_LABELS[option]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mb-6">
                  <FormField
                    control={memberForm.control}
                    name="areaRepresentacion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[slate-700] font-bold font-inter text-base">
                          Seleccione el Área del miembro dentro de la Comisión
                        </FormLabel>
                        <p className="text-slate-500 italic text-sm mt-0.5 mb-2 font-inter">
                          Ejemplo: Area juridica
                        </p>
                        <FormControl>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}
                            disabled={isAddingMember}
                          >
                            <SelectTrigger className="w-[200px] h-11 bg-white border-slate-300 rounded-md focus:ring-1 focus:ring-color-boton-2/30 text-slate-500 font-inter">
                              <SelectValue placeholder="Selecciona el área" />
                            </SelectTrigger>
                            <SelectContent>
                              {AREA_REPRESENTACION_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {AREA_REPRESENTACION_LABELS[option]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end pt-2 mb-8">
                  <Button
                    type="submit"
                    disabled={isAddingMember}
                    className="bg-color-boton-2 hover:bg-color-boton-2/90 text-white font-inter px-8 h-11 min-w-[140px]"
                  >
                    {isAddingMember ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : memberToEditIndex !== null ? (
                      "Guardar Miembro"
                    ) : (
                      "Agregar"
                    )}
                  </Button>
                </div>
              </form>
            </Form>

            {/* Tabla de miembros con renderizado mejorado */}
            <div className="rounded-lg border bg-white overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-bold text-slate-700">Nombre completo</TableHead>
                    <TableHead className="font-bold text-slate-700">Cédula de identidad</TableHead>
                    <TableHead className="font-bold text-slate-700">
                      Rol dentro de la comisión
                    </TableHead>
                    <TableHead className="font-bold text-slate-700">
                      Área dentro de la comisión
                    </TableHead>
                    <TableHead className="font-bold text-slate-700 w-[100px] text-center">
                      Opciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {miembros.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-slate-500 italic">
                        No se han agregado miembros aún.
                      </TableCell>
                    </TableRow>
                  ) : (
                    miembros.map((miembro, index) => (
                      <TableRow key={miembro.id || index} className="hover:bg-slate-50/50">
                        <TableCell className="font-medium text-slate-700">
                          {miembro.nombreCompletoMiembro}
                        </TableCell>
                        <TableCell className="text-slate-600">{miembro.cedulaMiembro}</TableCell>
                        <TableCell className="text-slate-600">
                          {TIPO_MIEMBRO_LABELS[
                            miembro.tipoMiembro as keyof typeof TIPO_MIEMBRO_LABELS
                          ] || miembro.tipoMiembro}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {AREA_REPRESENTACION_LABELS[
                            miembro.areaRepresentacion as keyof typeof AREA_REPRESENTACION_LABELS
                          ] || miembro.areaRepresentacion}
                        </TableCell>
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-500 hover:text-slate-700"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px]">
                              <DropdownMenuItem
                                onClick={() => handleEditarLocal(index)}
                                className="cursor-pointer gap-2"
                              >
                                <Edit2 className="h-4 w-4" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEliminarMiembro(miembro.id)}
                                className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive gap-2"
                              >
                                <Trash2 className="h-4 w-4" /> Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-between pt-8 border-t border-slate-200 mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setStep(1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="text-slate-500 font-inter px-8 h-11"
                disabled={isLoading}
              >
                Atrás
              </Button>
              <Button
                type="button"
                onClick={handleFinalizar}
                disabled={isLoading}
                className="bg-color-boton-2 hover:bg-color-boton-2/90 text-white font-inter px-8 h-11 min-w-[140px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Finalizando...
                  </>
                ) : (
                  "Finalizar"
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

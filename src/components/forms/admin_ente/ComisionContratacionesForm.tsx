"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  comisionContratacionesSchema,
  TIPO_MIEMBRO_LABELS,
  AREA_REPRESENTACION_LABELS,
  type ComisionContratacionesFormValues,
} from "@/lib/schemas/comisionContratacionesSchema";

import {
  registrarComisionContrataciones,
  obtenerComisionContrataciones,
  actualizarComisionContrataciones,
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

// Matriz de 8 slots fijos que componen la comisión obligatoria
const FIXED_SLOTS = [
  { areaRepresentacion: "AREA_JURIDICA", tipoMiembro: "MIEMBRO_PRINCIPAL" },
  { areaRepresentacion: "AREA_JURIDICA", tipoMiembro: "MIEMBRO_SUPLENTE" },
  { areaRepresentacion: "AREA_TECNICA", tipoMiembro: "MIEMBRO_PRINCIPAL" },
  { areaRepresentacion: "AREA_TECNICA", tipoMiembro: "MIEMBRO_SUPLENTE" },
  { areaRepresentacion: "AREA_ECONOMICA_FINANCIERA", tipoMiembro: "MIEMBRO_PRINCIPAL" },
  { areaRepresentacion: "AREA_ECONOMICA_FINANCIERA", tipoMiembro: "MIEMBRO_SUPLENTE" },
  { areaRepresentacion: "SECRETARIO_A", tipoMiembro: "MIEMBRO_PRINCIPAL" },
  { areaRepresentacion: "SECRETARIO_A", tipoMiembro: "MIEMBRO_SUPLENTE" },
] as const;

export function ComisionContratacionesForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const [isLoading, setIsLoading] = useState(false);

  // Generamos el template inicial de los 8 slots
  const getInitialSlots = () =>
    FIXED_SLOTS.map((slot) => ({
      nombreCompletoMiembro: "",
      cedulaMiembro: "",
      areaRepresentacion: slot.areaRepresentacion as any,
      tipoMiembro: slot.tipoMiembro as any,
    }));

  const form = useForm<ComisionContratacionesFormValues>({
    resolver: zodResolver(comisionContratacionesSchema),
    defaultValues: {
      denominacionComision: "",
      datosDesignacionComision: "",
      comisionCertificada: false,
      miembros: getInitialSlots(),
    },
    mode: "onChange",
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "miembros",
  });

  useEffect(() => {
    if (editId) {
      setIsLoading(true);
      obtenerComisionContrataciones(editId)
        .then((data) => {
          if (data) {
            // Mapeo Inteligente al Editar
            const mappedMiembros = getInitialSlots();

            if (data.miembros && Array.isArray(data.miembros)) {
              data.miembros.forEach((miembroDelApi) => {
                // Posicionar a la persona en el slot fijo exacto al que pertenece
                const slotIndex = FIXED_SLOTS.findIndex(
                  (s) =>
                    s.areaRepresentacion === miembroDelApi.areaRepresentacion &&
                    s.tipoMiembro === miembroDelApi.tipoMiembro
                );

                if (slotIndex !== -1) {
                  // Mantenemos el ID (si existe) y aplicamos al slot estático
                  mappedMiembros[slotIndex] = {
                    ...miembroDelApi,
                    areaRepresentacion: FIXED_SLOTS[slotIndex].areaRepresentacion as any,
                    tipoMiembro: FIXED_SLOTS[slotIndex].tipoMiembro as any,
                  } as any;
                }
              });
            }

            form.reset({
              denominacionComision: data.denominacionComision || "",
              datosDesignacionComision: data.datosDesignacionComision || "",
              comisionCertificada: data.comisionCertificada ?? false,
              miembros: mappedMiembros,
            });
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

  const onSubmit = async (values: ComisionContratacionesFormValues) => {
    setIsLoading(true);
    try {
      const payload = {
        ...values,
        miembros: values.miembros?.map((m) => {
          // Filtrar el ID viejo de base de datos antes de enviar
          const { id, ...rest } = m;
          return rest;
        }),
      };

      if (editId) {
        await actualizarComisionContrataciones(editId, payload);
        toast.success("Comisión de contrataciones actualizada exitosamente.");
      } else {
        await registrarComisionContrataciones(payload);
        toast.success("Comisión de contrataciones creada exitosamente.");
      }
      router.refresh();
      setTimeout(() => {
        router.push("/gestion-datos/estructura-organizativa");
      }, 500);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Error al guardar la Comisión");
    } finally {
      setIsLoading(false);
    }
  };

  const onError = (errors: any) => {
    console.error("Errores de validación interceptados:", errors);
    toast.error(
      "Hay campos incompletos o inválidos. Revisa las áreas marcadas en rojo para continuar."
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  return (
    <Card className="mx-auto w-full max-w-6xl shadow-sm border-0 mb-16">
      <CardHeader className="px-10 pt-12 pb-6 border-b border-slate-200">
        <CardTitle className="text-[28px] font-bold text-[slate-700] font-inter">
          Datos de constitución de la Comisión
        </CardTitle>
        <CardDescription className="text-slate-500 italic mt-1 font-inter text-base">
          Artículos 18.7 LOPA; 15 RLCP; 3 LCC; 14 NORMAS DE CONTROL INTERNO SUNAI.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-10 pt-8 pb-10">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onError)}
            onKeyDown={handleKeyDown}
            className="space-y-6"
          >
            {/* ====== SECCIÓN: DATOS DE LA COMISIÓN ====== */}
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="denominacionComision"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[slate-700] font-bold font-inter text-base">
                      Asigne el nombre, denominación o nomenclatura de la Comisión de Contrataciones
                      para identificarla dentro de la plataforma.
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

              <FormField
                control={form.control}
                name="datosDesignacionComision"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[slate-700] font-bold font-inter text-base">
                      Indique los datos de la Resolución, Decreto, Acta o Acuerdo de designación de
                      la Comisión de Contrataciones.
                    </FormLabel>
                    <p className="text-slate-500 italic text-sm mt-0.5 mb-2 font-inter">
                      Ejemplo: Resolución N° 000/00 de fecha 00-00-0000 publicado en Gaceta N° 0000
                      de fecha 00-00-0000
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

              <FormField
                control={form.control}
                name="comisionCertificada"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[slate-700] font-bold font-inter text-base block mb-3">
                      ¿Todos los miembros principales de la Comisión de Contrataciones cuentan con
                      la certificación vigente emitida por el SNC?
                    </FormLabel>
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        onClick={() => field.onChange(true)}
                        disabled={isLoading}
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
                        disabled={isLoading}
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

            {/* ====== SECCIÓN: MIEMBROS DE LA COMISIÓN ====== */}
            <div className="pt-8 mt-8 border-t border-slate-200">
              <h3 className="text-[20px] font-bold text-[slate-700] font-inter mb-2">
                Registrar miembros de la comisión
              </h3>
              <p className="text-slate-500 italic font-inter text-base mb-4">
                Artículos 18.7 LOPA; 3, 22 LCC; 14 NORMAS DE CONTROL INTERNO SUNAI.
              </p>
              <p className="text-slate-600 italic font-inter text-sm mb-6">
                Es importante que indique nombres y apellidos de los miembros de la comisión en cada
                una de las áreas que corresponda, completando obligatoriamente cada campo
              </p>

              <div className="rounded-lg border bg-white overflow-visible shadow-sm">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="w-[40px] text-center font-bold text-slate-700">
                        N°
                      </TableHead>
                      <TableHead className="font-bold text-slate-700 w-[240px]">
                        Área y rol a ocupar
                      </TableHead>
                      <TableHead className="font-bold text-slate-700 w-[340px] text-center">
                        Nombres y apellidos
                      </TableHead>
                      <TableHead className="font-bold text-slate-700 w-[240px] text-center">
                        Cédula de identidad
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((fieldItem, index) => {
                      // Obtenemos del array constante la etiqueta visual correspondiente a este asiento
                      const etiquetaArea =
                        AREA_REPRESENTACION_LABELS[FIXED_SLOTS[index].areaRepresentacion];
                      const etiquetaRol = TIPO_MIEMBRO_LABELS[FIXED_SLOTS[index].tipoMiembro];

                      return (
                        <TableRow key={fieldItem.id} className="hover:bg-slate-50/50 align-top">
                          <TableCell className="pt-6 align-top text-center text-slate-500 font-medium">
                            {index + 1}
                          </TableCell>

                          <TableCell className="pt-6 align-top">
                            <div className="flex flex-col gap-1.5 items-start">
                              <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-slate-100/80 text-slate-700 uppercase tracking-widest whitespace-nowrap">
                                {etiquetaArea}
                              </span>
                              <span className="text-sm font-semibold text-slate-900 font-inter">
                                {etiquetaRol}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell className="pt-4 align-top">
                            <FormField
                              control={form.control}
                              name={`miembros.${index}.nombreCompletoMiembro`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      value={field.value || ""}
                                      placeholder="Ej. María José Pérez Rodríguez"
                                      disabled={isLoading}
                                      className="h-10 bg-white border-slate-300 rounded-md focus-visible:ring-1 focus-visible:ring-color-boton-2/30 text-center"
                                    />
                                  </FormControl>
                                  <FormMessage className="text-xs text-center" />
                                </FormItem>
                              )}
                            />
                          </TableCell>

                          <TableCell className="pt-4 align-top">
                            <FormField
                              control={form.control}
                              name={`miembros.${index}.cedulaMiembro`}
                              render={({ field }) => {
                                const parts = field.value ? field.value.split("-") : ["V", ""];
                                const tipo = parts[0] || "V";
                                const numero = parts[1] || "";
                                return (
                                  <FormItem className="flex flex-col items-center">
                                    <FormControl>
                                      <div className="flex items-center gap-1 w-[200px] mx-auto">
                                        <Select
                                          value={tipo || undefined}
                                          onValueChange={(val) =>
                                            field.onChange(`${val}-${numero}`)
                                          }
                                          disabled={isLoading}
                                        >
                                          <SelectTrigger
                                            className={`w-[65px] h-10 bg-white border-slate-300 rounded-md focus:ring-1 focus:ring-color-boton-2/30 font-inter px-2 justify-center gap-1 ${tipo ? "text-slate-900" : "text-slate-500"}`}
                                          >
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="V">V</SelectItem>
                                            <SelectItem value="E">E</SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <Input
                                          value={numero}
                                          disabled={isLoading}
                                          onChange={(e) => {
                                            const newNum = e.target.value.replace(/\D/g, "");
                                            if (newNum) {
                                              field.onChange(`${tipo}-${newNum}`);
                                            } else {
                                              field.onChange("");
                                            }
                                          }}
                                          maxLength={8}
                                          placeholder="12345678"
                                          className="h-10 bg-white border-slate-300 rounded-md focus-visible:ring-1 focus-visible:ring-color-boton-2/30 flex-1 min-w-0 text-center"
                                        />
                                      </div>
                                    </FormControl>
                                    <FormMessage className="text-xs text-center" />
                                  </FormItem>
                                );
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mensaje de error general de miembros (ej: faltantes) */}
              {form.formState.errors.miembros?.message && (
                <p className="text-sm font-bold text-destructive mt-3 font-inter">
                  {form.formState.errors.miembros.message as string}
                </p>
              )}
            </div>

            <div className="flex justify-between pt-8 border-t border-slate-200 mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  router.push("/gestion-datos/estructura-organizativa");
                }}
                className="text-slate-500 font-inter px-8 h-11"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-color-boton-2 hover:bg-color-boton-2/90 text-white font-inter px-8 h-11 min-w-[200px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    {editId ? "Actualizando..." : "Registrando..."}
                  </>
                ) : editId ? (
                  "Actualizar comisión"
                ) : (
                  "Registrar comisión"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

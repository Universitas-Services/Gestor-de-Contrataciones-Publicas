"use client";

import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { MinusIcon } from "lucide-react";
import { toast } from "sonner";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getProveedores, getProveedorById } from "@/services/proveedores.service";

import { oferenteSchema, type OferenteFormValues } from "@/lib/schemas/fase2Schema";
import { type ProveedorBusqueda } from "@/types/expediente.types";

interface OferenteSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: Partial<OferenteFormValues>;
  mode?: "crear" | "editar";
  onSubmit: (data: OferenteFormValues, esNuevoProveedor: boolean) => void;
}

export function OferenteSheet({
  open,
  onOpenChange,
  defaultValues,
  mode = "crear",
  onSubmit,
}: OferenteSheetProps) {
  const form = useForm<OferenteFormValues>({
    resolver: zodResolver(oferenteSchema),
    defaultValues: {
      rif: "",
      nombreEmpresa: "",
      representanteLegal: "",
      cedulaRepresentante: "",
      registroMercantil: "",
      cantidadSobres: "",
      montoOferta: "",
      ...defaultValues,
    },
    mode: "onChange",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const isSelectingRef = useRef(false);
  const [isProveedorSeleccionado, setIsProveedorSeleccionado] = useState(false);

  // ── Sugerencias del autocomplete ──
  const [sugerencias, setSugerencias] = useState<ProveedorBusqueda[]>([]);
  const [showSugerencias, setShowSugerencias] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Reset form when sheet opens
  useEffect(() => {
    if (open) {
      form.reset({
        rif: defaultValues?.rif || "",
        nombreEmpresa: defaultValues?.nombreEmpresa || "",
        representanteLegal: defaultValues?.representanteLegal || "",
        cedulaRepresentante: defaultValues?.cedulaRepresentante || "",
        registroMercantil: defaultValues?.registroMercantil || "",
        cantidadSobres: defaultValues?.cantidadSobres || "",
        montoOferta: defaultValues?.montoOferta || "",
      });

      if (mode === "crear") {
        setSearchTerm("");
        setSugerencias([]);
        setShowSugerencias(false);
        setIsProveedorSeleccionado(false);
      }
      setIsEditing(mode === "crear");
    }
  }, [open, defaultValues, form, mode]);

  // ── Autocomplete Debounce Logic ──
  useEffect(() => {
    if (mode !== "crear") return;

    if (!searchTerm || searchTerm.length < 3) {
      setSugerencias([]);
      setShowSugerencias(false);
      return;
    }

    if (isSelectingRef.current) {
      return;
    }

    setIsSearching(true);
    const handler = setTimeout(async () => {
      try {
        const response = await getProveedores({ rif: searchTerm, limit: 10 });
        const list = Array.isArray(response) ? response : response?.data || response?.items || [];
        if (list.length > 0) {
          setSugerencias(list);
          setShowSugerencias(true);
        } else {
          setSugerencias([]);
          setShowSugerencias(false);
        }
      } catch (error) {
        console.error("Error buscando proveedores:", error);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm, mode]);

  // ── Autocompletar al seleccionar una sugerencia ──
  const handleSeleccionarSugerencia = async (proveedor: ProveedorBusqueda) => {
    try {
      isSelectingRef.current = true;
      // Llamamos endpoint para prellenar todo
      const detallado = await getProveedorById(proveedor.id);

      setSearchTerm(detallado.rif);
      form.setValue("rif", detallado.rif, { shouldValidate: true });
      form.setValue("nombreEmpresa", detallado.nombre, { shouldValidate: true });
      form.setValue("representanteLegal", detallado.nombreRepLegal, { shouldValidate: true });
      form.setValue("cedulaRepresentante", detallado.cedulaRepLegal, { shouldValidate: true });
      form.setValue("registroMercantil", detallado.datosRegistroMercantil || "—", {
        shouldValidate: true,
      });

      setIsProveedorSeleccionado(true);

      setSugerencias([]);
      setShowSugerencias(false);
      toast.success("Datos del proveedor autocargados");

      setTimeout(() => {
        isSelectingRef.current = false;
      }, 500);
    } catch (e) {
      toast.error("Error obteniendo detalles completos del proveedor");
      isSelectingRef.current = false;
    }
  };

  const handleFormSubmit = (data: OferenteFormValues) => {
    onSubmit(data, !isProveedorSeleccionado && mode === "crear");
    onOpenChange(false);
  };

  const rifCompleto = form.watch("rif");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md md:max-w-[450px] bg-white p-0 border-l overflow-y-auto"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="p-8 pb-4 border-b border-slate-100">
            <SheetTitle className="text-2xl font-extrabold text-color-titulos text-left">
              {mode === "crear" ? "Registrar Oferente" : "Detalle del Oferente"}
            </SheetTitle>
            <SheetDescription className="text-slate-500 font-medium italic text-left text-sm">
              Gestione el listado de empresas interesadas (Adquirentes) y registre las ofertas
              recibidas durante el acto público para generar las actas correspondientes.
            </SheetDescription>
          </SheetHeader>

          {/* Section label */}
          <div className="px-8 pt-6 pb-2">
            <h3 className="text-base font-bold text-navy">Oferentes del acto público</h3>
            <p className="text-xs text-muted-foreground italic mt-1">
              Registre las ofertas consignadas formalmente durante el Acto de Recepción de Sobres
              (Genera: Acta de Recepción, Acta de Apertura, Cuadro Comparativo Inicial)
            </p>
          </div>

          {/* Form body */}
          <div className="flex-1 px-8 py-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleFormSubmit)}
                className="space-y-6"
                id="oferente-form"
              >
                {/* ── RIF con InputOTP (modo crear o editar) / Campo de solo lectura ── */}
                {isEditing ? (
                  <div className="space-y-2">
                    <FormLabel className="font-bold text-color-titulos text-[11px] block">
                      Indique el RIF. de la empresa oferente.
                    </FormLabel>
                    <p className="text-[10px] text-muted-foreground italic">
                      Artículos 91, 92 LCP; 96 RLCP; 18.4 LOPA; 5 NORMAS DE CONTROL INTERNO SUNAI.
                    </p>
                    <div className="relative">
                      <div className="border border-slate-300 bg-white px-3 py-1.5 rounded-md w-full min-h-[32px] flex items-center">
                        <input
                          value={searchTerm}
                          onChange={(e) => {
                            isSelectingRef.current = false; // El usuario editó manualmente
                            setIsProveedorSeleccionado(false);

                            let val = e.target.value.toUpperCase();
                            // Limitar a J, G, números y guiones
                            val = val.replace(/[^JG0-9-]/g, "");

                            if (val.length > 0) {
                              // La primera letra debe ser J o G estrictamente
                              if (val[0] !== "J" && val[0] !== "G") {
                                val = "";
                              } else {
                                // El resto solo puede ser números o guiones (evitando dobles guiones)
                                let rest = val.slice(1).replace(/[^0-9-]/g, "");
                                rest = rest.replace(/-+/g, "-");
                                val = val[0] + rest;
                              }
                            }

                            setSearchTerm(val);
                            form.setValue("rif", val, { shouldValidate: true });
                          }}
                          placeholder="Ejemplo: G-12345678-9"
                          className="w-full bg-transparent outline-none text-[11px] italic font-medium text-slate-500"
                          maxLength={13}
                        />
                        {isSearching && (
                          <div className="w-4 h-4 border-2 border-navy border-t-transparent rounded-full animate-spin flex-shrink-0 ml-2" />
                        )}
                      </div>
                    </div>

                    {/* Sugerencias de proveedores */}
                    {showSugerencias && (
                      <div className="border border-slate-200 rounded-md bg-white shadow-md overflow-hidden mt-1">
                        <p className="text-[10px] text-muted-foreground px-3 py-1.5 border-b border-slate-100 italic">
                          Proveedores encontrados — seleccione para autocompletar
                        </p>
                        {sugerencias.map((p) => (
                          <button
                            key={p.rif}
                            type="button"
                            onClick={() => handleSeleccionarSugerencia(p)}
                            className="w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors"
                          >
                            <p className="text-[11px] font-bold text-color-titulos">{p.nombre}</p>
                            <p className="text-[10px] text-muted-foreground italic">{p.rif}</p>
                          </button>
                        ))}
                      </div>
                    )}

                    {form.formState.errors.rif && (
                      <p className="text-sm font-medium text-destructive">
                        {form.formState.errors.rif.message}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <FormLabel className="font-bold text-color-titulos text-[11px] block">
                      RIF de la empresa oferente
                    </FormLabel>
                    <div className="border border-slate-300 bg-white text-[11px] italic font-medium text-slate-500 px-3 py-1.5 rounded-md w-full min-h-[32px]">
                      {rifCompleto || "-"}
                    </div>
                  </div>
                )}

                {/* Nombre empresa */}
                <FormField
                  control={form.control}
                  name="nombreEmpresa"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="font-bold text-color-titulos text-[11px]">
                        Indique el nombre de la empresa oferente.
                      </FormLabel>
                      <p className="text-[10px] text-muted-foreground italic">
                        Artículos 91, 92, 93 LCP; 96 RLCP; 18.4 LOPA; 5 NORMAS DE CONTROL INTERNO
                        SUNAI.
                      </p>
                      <FormControl>
                        <div className="border border-slate-300 bg-white text-[11px] italic font-medium text-slate-500 px-3 py-1.5 rounded-md w-full min-h-[32px]">
                          {!isEditing ? (
                            field.value || "-"
                          ) : (
                            <input
                              {...field}
                              className="w-full bg-transparent outline-none text-[11px] italic font-medium text-slate-500"
                              placeholder="Nombre de la empresa"
                              maxLength={150}
                            />
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Representante Legal */}
                <FormField
                  control={form.control}
                  name="representanteLegal"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="font-bold text-color-titulos text-[11px]">
                        Indique nombre y apellido del Representante Legal de la empresa oferente.
                      </FormLabel>
                      <p className="text-[10px] text-muted-foreground italic">
                        Artículos 91, 92 LCP; 96 RLCP; 18.4 LOPA; 5 NORMAS DE CONTROL INTERNO SUNAI.
                      </p>
                      <FormControl>
                        <div className="border border-slate-300 bg-white text-[11px] italic font-medium text-slate-500 px-3 py-1.5 rounded-md w-full min-h-[32px]">
                          {!isEditing ? (
                            field.value || "-"
                          ) : (
                            <input
                              {...field}
                              className="w-full bg-transparent outline-none text-[11px] italic font-medium text-slate-500"
                              placeholder="Nombre y Apellido"
                              maxLength={150}
                            />
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Cédula representante */}
                <FormField
                  control={form.control}
                  name="cedulaRepresentante"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="font-bold text-color-titulos text-[11px]">
                        Indique C.I del Representante legal de la empresa oferente.
                      </FormLabel>
                      <p className="text-[10px] text-muted-foreground italic">
                        Artículos 91, 92 LCP; 96 RLCP; 18.4 LOPA; 5 NORMAS DE CONTROL INTERNO SUNAI.
                      </p>
                      <FormControl>
                        <div className="border border-slate-300 bg-white text-[11px] italic font-medium text-slate-500 px-3 py-1.5 rounded-md w-full min-h-[32px]">
                          {!isEditing ? (
                            field.value || "-"
                          ) : (
                            <input
                              {...field}
                              onChange={(e) => {
                                let val = e.target.value.toUpperCase();
                                val = val.replace(/[^VE0-9]/g, "");
                                if (val.length > 0) {
                                  let firstChar = val.charAt(0);
                                  if (firstChar !== "V" && firstChar !== "E") {
                                    firstChar = "V";
                                  }
                                  const numbers = val.substring(1).replace(/[^0-9]/g, "");
                                  val = `${firstChar}-${numbers}`;
                                }
                                field.onChange(val);
                              }}
                              className="w-full bg-transparent outline-none text-[11px] italic font-medium text-slate-500"
                              placeholder="V-00000000"
                              maxLength={10}
                            />
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Registro Mercantil */}
                <FormField
                  control={form.control}
                  name="registroMercantil"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="font-bold text-color-titulos text-[11px]">
                        Indique los datos de Registro Mercantil de la empresa oferente.
                      </FormLabel>
                      <p className="text-[10px] text-muted-foreground italic">
                        Ejemplo: Registro Mercantil Segundo del Estado Lara, bajo el N° 0, Tomo 00-A
                        del Año 0000
                      </p>
                      <FormControl>
                        <div className="border border-slate-300 bg-white text-[11px] italic font-medium text-slate-500 px-3 py-1.5 rounded-md w-full min-h-[32px]">
                          {!isEditing ? (
                            field.value || "-"
                          ) : (
                            <input
                              {...field}
                              className="w-full bg-transparent outline-none text-[11px] italic font-medium text-slate-500"
                              placeholder="Registro Mercantil..."
                              maxLength={250}
                            />
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Cantidad de sobres */}
                <FormField
                  control={form.control}
                  name="cantidadSobres"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="font-bold text-color-titulos text-[11px]">
                        Indique la cantidad (número) de sobres entregados por la empresa.
                      </FormLabel>
                      <p className="text-[10px] text-muted-foreground italic">
                        Artículos 91, 92 LCP; 96 RLCP; 3 NORMAS DE CONTROL INTERNO SUNAI.
                      </p>
                      <FormControl>
                        <div className="border border-slate-300 bg-white text-[11px] italic font-medium text-slate-500 px-3 py-1.5 rounded-md w-full min-h-[32px]">
                          {!isEditing ? (
                            field.value || "-"
                          ) : (
                            <input
                              {...field}
                              type="number"
                              className="w-full bg-transparent outline-none text-[11px] italic font-medium text-slate-500"
                              placeholder="N° de sobres"
                              maxLength={5}
                              max={99999}
                            />
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Monto oferta */}
                <FormField
                  control={form.control}
                  name="montoOferta"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="font-bold text-color-titulos text-[11px]">
                        Indique el monto (Bs) de la oferta presentada.
                      </FormLabel>
                      <p className="text-[10px] text-muted-foreground italic">
                        Artículos 58, 59 LCP; 91, 93, 94 RLCP; 18.5 LOPA; 25 NORMAS DE CONTROL
                        INTERNO SUNAI.
                      </p>
                      <FormControl>
                        <div className="border border-slate-300 bg-white text-[11px] italic font-medium text-slate-500 px-3 py-1.5 rounded-md w-full min-h-[32px]">
                          {!isEditing ? (
                            field.value || "-"
                          ) : (
                            <input
                              {...field}
                              className="w-full bg-transparent outline-none text-[11px] italic font-medium text-slate-500"
                              placeholder="Bs. 0,00"
                              maxLength={50}
                            />
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>

          {/* Footer */}
          <div className="p-8 pt-6 flex justify-end gap-3 pb-12 mt-auto border-t border-slate-100 bg-slate-50/50">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                if (isEditing && mode === "editar") {
                  setIsEditing(false);
                } else {
                  onOpenChange(false);
                }
              }}
              className="font-semibold flex-1 h-11 rounded-md"
            >
              Cancelar
            </Button>
            {mode === "editar" && !isEditing && (
              <Button
                key="btn-editar"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setIsEditing(true);
                }}
                className="bg-navy hover:bg-navy-hover text-white font-semibold flex-1 h-11 rounded-md"
              >
                Editar
              </Button>
            )}
            {(mode === "crear" || (mode === "editar" && isEditing)) && (
              <Button
                key="btn-guardar"
                type="submit"
                form="oferente-form"
                className="bg-navy hover:bg-navy-hover text-white font-semibold flex-1 h-11 rounded-md"
              >
                {mode === "crear" ? "Guardar oferente" : "Guardar cambios"}
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

"use client";

import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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

  // ── Estado visual: RIF dividido (letra + cuerpo + verificador) ──
  const [rifTipo, setRifTipo] = useState("J");
  const [rifCuerpo, setRifCuerpo] = useState("");
  const [rifVerificador, setRifVerificador] = useState("");

  // ── Estado visual: Cédula dividida (letra + número) ──
  const [cedulaTipo, setCedulaTipo] = useState("V");
  const [cedulaNumero, setCedulaNumero] = useState("");

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

      // Fragmentar RIF existente (ej: "J-12345678-9")
      if (defaultValues?.rif) {
        const parts = defaultValues.rif.split("-");
        if (parts.length === 3) {
          setRifTipo(parts[0]);
          setRifCuerpo(parts[1]);
          setRifVerificador(parts[2]);
        }
      }

      // Fragmentar Cédula existente (ej: "V-12345678")
      if (defaultValues?.cedulaRepresentante) {
        const parts = defaultValues.cedulaRepresentante.split("-");
        if (parts.length === 2) {
          setCedulaTipo(parts[0]);
          setCedulaNumero(parts[1]);
        }
      }

      if (mode === "crear") {
        setSearchTerm("");
        setSugerencias([]);
        setShowSugerencias(false);
        setIsProveedorSeleccionado(false);
        setRifTipo("J");
        setRifCuerpo("");
        setRifVerificador("");
        setCedulaTipo("V");
        setCedulaNumero("");
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

  // ── Efecto: concatenar RIF visual → campo oculto del form ──
  useEffect(() => {
    if (rifTipo && rifCuerpo.length >= 7 && rifVerificador.length === 1) {
      const rif = `${rifTipo}-${rifCuerpo}-${rifVerificador}`;
      form.setValue("rif", rif, { shouldValidate: true });
      setSearchTerm(rif);
    } else if (rifCuerpo.length > 0 || rifVerificador.length > 0) {
      // Construir searchTerm parcial para búsqueda
      const partial = `${rifTipo}-${rifCuerpo}`;
      setSearchTerm(partial);
      form.setValue("rif", "");
    }
  }, [rifTipo, rifCuerpo, rifVerificador, form]);

  // ── Efecto: concatenar Cédula visual → campo oculto del form ──
  useEffect(() => {
    if (cedulaTipo && cedulaNumero.length >= 6) {
      form.setValue("cedulaRepresentante", `${cedulaTipo}-${cedulaNumero}`, {
        shouldValidate: true,
      });
    } else if (cedulaNumero.length > 0) {
      form.setValue("cedulaRepresentante", "");
    }
  }, [cedulaTipo, cedulaNumero, form]);

  // ── Autocompletar al seleccionar una sugerencia ──
  const handleSeleccionarSugerencia = async (proveedor: ProveedorBusqueda) => {
    try {
      isSelectingRef.current = true;
      const detallado = await getProveedorById(proveedor.id);

      // Fragmentar RIF (ej: "J-12345678-9")
      if (detallado.rif) {
        const rifParts = detallado.rif.split("-");
        if (rifParts.length === 3) {
          setRifTipo(rifParts[0]);
          setRifCuerpo(rifParts[1]);
          setRifVerificador(rifParts[2]);
        }
      }
      setSearchTerm(detallado.rif);
      form.setValue("rif", detallado.rif, { shouldValidate: true });

      // Fragmentar Cédula (ej: "V-12345678")
      if (detallado.cedulaRepLegal) {
        const cidParts = detallado.cedulaRepLegal.split("-");
        if (cidParts.length === 2) {
          setCedulaTipo(cidParts[0]);
          setCedulaNumero(cidParts[1]);
        }
      }
      form.setValue("cedulaRepresentante", detallado.cedulaRepLegal, { shouldValidate: true });

      form.setValue("nombreEmpresa", detallado.nombre, { shouldValidate: true });
      form.setValue("representanteLegal", detallado.nombreRepLegal, { shouldValidate: true });
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
                {/* ── RIF con campos divididos (modo crear o editar) / Campo de solo lectura ── */}
                {isEditing ? (
                  <div className="space-y-2">
                    <FormLabel className="font-bold text-color-titulos text-[11px] block">
                      Indique el RIF. de la empresa oferente.
                    </FormLabel>
                    <p className="text-[10px] text-muted-foreground italic">
                      Artículos 91, 92 LCP; 96 RLCP; 18.4 LOPA; 5 NORMAS DE CONTROL INTERNO SUNAI.
                    </p>
                    <div className="flex items-center gap-2">
                      {/* Letra */}
                      <Select
                        value={rifTipo}
                        onValueChange={(val) => {
                          setRifTipo(val);
                          isSelectingRef.current = false;
                          setIsProveedorSeleccionado(false);
                        }}
                      >
                        <SelectTrigger className="w-[70px] h-[32px] border border-slate-300 bg-white text-[11px] font-medium shadow-none focus:ring-0">
                          <SelectValue placeholder="J" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="J">J-</SelectItem>
                          <SelectItem value="G">G-</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* 8 dígitos (cuerpo) */}
                      <div className="relative flex-1">
                        <Input
                          value={rifCuerpo}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            setRifCuerpo(val);
                            isSelectingRef.current = false;
                            setIsProveedorSeleccionado(false);
                          }}
                          placeholder="12345678"
                          maxLength={9}
                          className="h-[32px] border border-slate-300 bg-white text-[11px] italic font-medium text-slate-500 shadow-none focus-visible:ring-0 pr-7 placeholder:text-[11px] placeholder:italic placeholder:font-medium placeholder:text-slate-500/50"
                        />
                        {isSearching && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-navy border-t-transparent rounded-full animate-spin" />
                        )}
                      </div>

                      {/* Separador */}
                      <span className="text-slate-400 font-bold text-xs select-none">-</span>

                      {/* 1 dígito verificador */}
                      <Input
                        value={rifVerificador}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          setRifVerificador(val);
                        }}
                        placeholder="0"
                        maxLength={1}
                        className="w-[42px] h-[32px] text-center border border-slate-300 bg-white text-[11px] italic font-medium text-slate-500 shadow-none focus-visible:ring-0 placeholder:text-[11px] placeholder:italic placeholder:font-medium placeholder:text-slate-500/50"
                      />
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
                <div className="space-y-1">
                  <FormLabel className="font-bold text-color-titulos text-[11px]">
                    Indique C.I del Representante legal de la empresa oferente.
                  </FormLabel>
                  <p className="text-[10px] text-muted-foreground italic">
                    Artículos 91, 92 LCP; 96 RLCP; 18.4 LOPA; 5 NORMAS DE CONTROL INTERNO SUNAI.
                  </p>
                  {!isEditing ? (
                    <div className="border border-slate-300 bg-white text-[11px] italic font-medium text-slate-500 px-3 py-1.5 rounded-md w-full min-h-[32px]">
                      {form.watch("cedulaRepresentante") || "-"}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Select value={cedulaTipo} onValueChange={setCedulaTipo}>
                        <SelectTrigger className="w-[70px] h-[32px] border border-slate-300 bg-white text-[11px] font-medium shadow-none focus:ring-0">
                          <SelectValue placeholder="V" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="V">V-</SelectItem>
                          <SelectItem value="E">E-</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        value={cedulaNumero}
                        onChange={(e) => setCedulaNumero(e.target.value.replace(/\D/g, ""))}
                        placeholder="00000000"
                        maxLength={8}
                        className="flex-1 h-[32px] border border-slate-300 bg-white text-[11px] italic font-medium text-slate-500 shadow-none focus-visible:ring-0 placeholder:text-[11px] placeholder:italic placeholder:font-medium placeholder:text-slate-500/50"
                      />
                    </div>
                  )}
                  {form.formState.errors.cedulaRepresentante && (
                    <p className="text-sm font-medium text-destructive">
                      {form.formState.errors.cedulaRepresentante.message}
                    </p>
                  )}
                </div>

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
                      {!isEditing ? (
                        <div className="border border-slate-300 bg-white text-[11px] italic font-medium text-slate-500 px-3 py-1.5 rounded-md w-full min-h-[32px]">
                          {field.value || "-"}
                        </div>
                      ) : (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border border-slate-300 bg-white text-[11px] italic font-medium text-slate-500 px-3 py-1.5 rounded-md w-full min-h-[32px] h-auto shadow-none focus:ring-0">
                              <SelectValue placeholder="Seleccione N° de sobres" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem
                              value="0"
                              className="text-[11px] font-medium text-slate-500"
                            >
                              0 sobres
                            </SelectItem>
                            <SelectItem
                              value="1"
                              className="text-[11px] font-medium text-slate-500"
                            >
                              1 sobre
                            </SelectItem>
                            <SelectItem
                              value="2"
                              className="text-[11px] font-medium text-slate-500"
                            >
                              2 sobres
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
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

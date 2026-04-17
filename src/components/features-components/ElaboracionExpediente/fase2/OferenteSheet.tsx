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
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { oferenteSchema, type OferenteFormValues } from "@/lib/schemas/fase2Schema";
import { type ProveedorBusqueda } from "@/types/expediente.types";

interface OferenteSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: Partial<OferenteFormValues>;
  mode?: "crear" | "editar";
  onSubmit: (data: OferenteFormValues) => void;
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

  // ── Estado del InputOTP para RIF (solo en modo crear) ──
  const [rifTipo, setRifTipo] = useState("G");
  const [rifCuerpo, setRifCuerpo] = useState("");
  const [rifVerificador, setRifVerificador] = useState("");
  const rifVerificadorRef = useRef<HTMLInputElement>(null);

  // ── Sugerencias del autocomplete ──
  const [sugerencias, setSugerencias] = useState<ProveedorBusqueda[]>([]);
  const [showSugerencias, setShowSugerencias] = useState(false);

  // Reset form when sheet opens
  useEffect(() => {
    if (open) {
      form.reset({
        rif: "",
        nombreEmpresa: "",
        representanteLegal: "",
        cedulaRepresentante: "",
        registroMercantil: "",
        cantidadSobres: "",
        montoOferta: "",
        ...defaultValues,
      });

      if (mode === "crear") {
        setRifTipo("G");
        setRifCuerpo("");
        setRifVerificador("");
        setSugerencias([]);
        setShowSugerencias(false);
      }
    }
  }, [open, defaultValues, form, mode]);

  // ── Concatenar fragmentos del RIF al form (solo en modo crear) ──
  useEffect(() => {
    if (mode !== "crear") return;
    if (rifTipo && rifCuerpo.length === 8 && rifVerificador.length === 1) {
      const rifCompleto = `${rifTipo}-${rifCuerpo}-${rifVerificador}`;
      form.setValue("rif", rifCompleto, { shouldValidate: true });
    } else {
      form.setValue("rif", "");
    }
  }, [rifTipo, rifCuerpo, rifVerificador, form, mode]);

  // ── Búsqueda de sugerencias al escribir el cuerpo del RIF ──
  useEffect(() => {
    // Logic disabled until real provider endpoint is available
    setSugerencias([]);
    setShowSugerencias(false);
  }, [rifTipo, rifCuerpo, mode]);

  // ── Autocompletar al seleccionar una sugerencia ──
  const handleSeleccionarSugerencia = (proveedor: ProveedorBusqueda) => {
    const parts = proveedor.rif.split("-");
    if (parts.length >= 2) {
      setRifTipo(parts[0]);
      setRifCuerpo(parts[1]);
      if (parts[2]) setRifVerificador(parts[2]);
    }
    form.setValue("rif", proveedor.rif, { shouldValidate: true });
    form.setValue("nombreEmpresa", proveedor.nombre, { shouldValidate: true });
    form.setValue("representanteLegal", proveedor.nombreRepLegal, { shouldValidate: true });
    form.setValue("cedulaRepresentante", proveedor.cedulaRepLegal, { shouldValidate: true });
    form.setValue("registroMercantil", proveedor.datosRegistroMercantil, { shouldValidate: true });
    setSugerencias([]);
    setShowSugerencias(false);
    toast.success("Datos del proveedor autocargados");
  };

  const handleFormSubmit = (data: OferenteFormValues) => {
    onSubmit(data);
    toast.success(
      mode === "crear" ? "Oferente registrado exitosamente" : "Oferente actualizado exitosamente"
    );
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
                {/* ── RIF con InputOTP (modo crear) / Campo de solo lectura (modo editar) ── */}
                {mode === "crear" ? (
                  <div className="space-y-2">
                    <FormLabel className="font-bold text-color-titulos text-[11px] block">
                      Indique el RIF. de la empresa oferente.
                    </FormLabel>
                    <p className="text-[10px] text-muted-foreground italic">
                      Artículos 91, 92 LCP; 96 RLCP; 18.4 LOPA; 5 NORMAS DE CONTROL INTERNO SUNAI.
                    </p>
                    <div className="flex items-center gap-2">
                      <Select value={rifTipo} onValueChange={setRifTipo}>
                        <SelectTrigger className="w-[70px] h-[32px] border border-border bg-white text-[11px]">
                          <SelectValue placeholder="G" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="G">G</SelectItem>
                          <SelectItem value="J">J</SelectItem>
                        </SelectContent>
                      </Select>

                      <InputOTP
                        maxLength={8}
                        value={rifCuerpo}
                        onChange={(val) => {
                          setRifCuerpo(val);
                          if (val.length === 8) {
                            rifVerificadorRef.current?.focus();
                          }
                        }}
                        pattern={REGEXP_ONLY_DIGITS}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot
                            index={0}
                            className="border-r-0 shadow-none h-[32px] w-7 text-[11px]"
                          />
                          <InputOTPSlot
                            index={1}
                            className="border-r-0 shadow-none h-[32px] w-7 text-[11px]"
                          />
                          <InputOTPSlot
                            index={2}
                            className="border-r-0 shadow-none h-[32px] w-7 text-[11px]"
                          />
                          <InputOTPSlot
                            index={3}
                            className="border-r-0 shadow-none h-[32px] w-7 text-[11px]"
                          />
                          <InputOTPSlot
                            index={4}
                            className="border-r-0 shadow-none h-[32px] w-7 text-[11px]"
                          />
                          <InputOTPSlot
                            index={5}
                            className="border-r-0 shadow-none h-[32px] w-7 text-[11px]"
                          />
                          <InputOTPSlot
                            index={6}
                            className="border-r-0 shadow-none h-[32px] w-7 text-[11px]"
                          />
                          <InputOTPSlot
                            index={7}
                            className="rounded-r-md border-r shadow-none h-[32px] w-7 text-[11px]"
                          />
                        </InputOTPGroup>
                      </InputOTP>

                      <div className="text-slate-400 font-bold px-1 flex items-center">
                        <MinusIcon className="h-4 w-4" />
                      </div>

                      <InputOTP
                        ref={rifVerificadorRef}
                        maxLength={1}
                        value={rifVerificador}
                        onChange={(val) => setRifVerificador(val)}
                        pattern={REGEXP_ONLY_DIGITS}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot
                            index={0}
                            className="rounded-md border-l shadow-none h-[32px] w-7 text-[11px]"
                          />
                        </InputOTPGroup>
                      </InputOTP>
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
                          {mode === "editar" ? (
                            field.value || "-"
                          ) : (
                            <input
                              {...field}
                              className="w-full bg-transparent outline-none text-[11px] italic font-medium text-slate-500"
                              placeholder="Nombre de la empresa"
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
                          {mode === "editar" ? (
                            field.value || "-"
                          ) : (
                            <input
                              {...field}
                              className="w-full bg-transparent outline-none text-[11px] italic font-medium text-slate-500"
                              placeholder="Nombre y Apellido"
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
                          {mode === "editar" ? (
                            field.value || "-"
                          ) : (
                            <input
                              {...field}
                              className="w-full bg-transparent outline-none text-[11px] italic font-medium text-slate-500"
                              placeholder="V-00000000"
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
                          {mode === "editar" ? (
                            field.value || "-"
                          ) : (
                            <input
                              {...field}
                              className="w-full bg-transparent outline-none text-[11px] italic font-medium text-slate-500"
                              placeholder="Registro Mercantil..."
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
                          {mode === "editar" ? (
                            field.value || "-"
                          ) : (
                            <input
                              {...field}
                              type="number"
                              className="w-full bg-transparent outline-none text-[11px] italic font-medium text-slate-500"
                              placeholder="N° de sobres"
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
                          {mode === "editar" ? (
                            field.value || "-"
                          ) : (
                            <input
                              {...field}
                              className="w-full bg-transparent outline-none text-[11px] italic font-medium text-slate-500"
                              placeholder="Bs. 0,00"
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
              onClick={() => onOpenChange(false)}
              className="font-semibold flex-1 h-11 rounded-md"
            >
              Cancelar
            </Button>
            {mode === "crear" && (
              <Button
                type="submit"
                form="oferente-form"
                className="bg-navy hover:bg-navy-hover text-white font-semibold flex-1 h-11 rounded-md"
              >
                Guardar oferente
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarDays, MinusIcon } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { adquirenteSchema, type AdquirenteFormValues } from "@/lib/schemas/fase2Schema";

interface AdquirenteSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: Partial<AdquirenteFormValues>;
  mode?: "crear" | "editar";
  onSubmit: (data: AdquirenteFormValues) => void;
}

export function AdquirenteSheet({
  open,
  onOpenChange,
  defaultValues,
  mode = "crear",
  onSubmit,
}: AdquirenteSheetProps) {
  const form = useForm<AdquirenteFormValues>({
    resolver: zodResolver(adquirenteSchema),
    defaultValues: {
      fechaAdquisicion: "",
      nombreEmpresa: "",
      domicilioFiscal: "",
      telefono: "",
      correo: "",
      referenciaDeposito: "",
      ...defaultValues,
    },
    mode: "onChange",
  });

  const [telefonoPrefijo, setTelefonoPrefijo] = useState("0414");
  const [telefonoNumero, setTelefonoNumero] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const telefonoCompleto = form.watch("telefono");

  useEffect(() => {
    if (open) {
      form.reset({
        fechaAdquisicion: defaultValues?.fechaAdquisicion || "",
        nombreEmpresa: defaultValues?.nombreEmpresa || "",
        domicilioFiscal: defaultValues?.domicilioFiscal || "",
        telefono: defaultValues?.telefono || "",
        correo: defaultValues?.correo || "",
        referenciaDeposito: defaultValues?.referenciaDeposito || "",
      });
      if (mode === "crear") {
        setTelefonoPrefijo("0414");
        setTelefonoNumero("");
      }
      setIsEditing(mode === "crear");
    }
  }, [open, defaultValues, form, mode]);

  useEffect(() => {
    if (mode !== "crear") return;
    if (telefonoPrefijo && telefonoNumero.length === 7) {
      form.setValue("telefono", `${telefonoPrefijo}-${telefonoNumero}`, { shouldValidate: true });
    } else {
      form.setValue("telefono", "");
    }
  }, [telefonoPrefijo, telefonoNumero, form, mode]);

  const handleFormSubmit = (data: AdquirenteFormValues) => {
    onSubmit(data);
    toast.success(
      mode === "crear"
        ? "Adquirente registrado exitosamente"
        : "Adquirente actualizado exitosamente"
    );
    onOpenChange(false);
  };

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
              {mode === "crear" ? "Registrar Adquirente" : "Detalle del Adquirente"}
            </SheetTitle>
            <SheetDescription className="text-slate-500 font-medium italic text-left text-sm">
              Gestione el listado de empresas interesadas (Adquirentes) y registre las ofertas
              recibidas durante el acto público para generar las actas correspondientes.
            </SheetDescription>
          </SheetHeader>

          {/* Section label */}
          <div className="px-8 pt-6 pb-2">
            <h3 className="text-base font-bold text-navy">Adquirentes del pliego</h3>
            <p className="text-xs text-muted-foreground italic mt-1">
              Registre las empresas que han adquirido el Pliego de condiciones para notificaciones y
              control.
            </p>
          </div>

          {/* Form body */}
          <div className="flex-1 px-8 py-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleFormSubmit)}
                className="space-y-6"
                id="adquirente-form"
              >
                {/* Fecha de adquisición */}
                <FormField
                  control={form.control}
                  name="fechaAdquisicion"
                  render={({ field }) => (
                    <FormItem className="flex flex-col space-y-1">
                      <FormLabel className="font-bold text-color-titulos text-[11px]">
                        Indique la fecha de la adquisición del pliego de condiciones.
                      </FormLabel>
                      <p className="text-[10px] text-muted-foreground italic">
                        Artículos 32.13 RLCP; 5 NORMAS DE CONTROL INTERNO SUNAI.
                      </p>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal h-[32px] border-slate-300 text-[11px] italic text-slate-500"
                            >
                              <CalendarDays className="mr-2 h-4 w-4 text-navy" />
                              {field.value
                                ? format(new Date(field.value), "dd 'de' MMMM, yyyy", {
                                    locale: es,
                                  })
                                : "Seleccione una fecha"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => field.onChange(date ? date.toISOString() : "")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Nombre empresa */}
                <FormField
                  control={form.control}
                  name="nombreEmpresa"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="font-bold text-color-titulos text-[11px]">
                        Indique el nombre de la empresa que adquiere el pliego de condiciones.
                      </FormLabel>
                      <p className="text-[10px] text-muted-foreground italic">
                        Artículos 32.13 RLCP; 28 NORMAS DE CONTROL INTERNO SUNAI.
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

                {/* Domicilio fiscal */}
                <FormField
                  control={form.control}
                  name="domicilioFiscal"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="font-bold text-color-titulos text-[11px]">
                        Indique el domicilio fiscal de la empresa que adquiere el pliego de
                        condiciones.
                      </FormLabel>
                      <p className="text-[10px] text-muted-foreground italic">
                        Artículos 32.13 RLCP; 28 NORMAS DE CONTROL INTERNO SUNAI.
                      </p>
                      <FormControl>
                        <div className="border border-slate-300 bg-white text-[11px] italic font-medium text-slate-500 px-3 py-1.5 rounded-md w-full min-h-[32px]">
                          {!isEditing ? (
                            field.value || "-"
                          ) : (
                            <input
                              {...field}
                              className="w-full bg-transparent outline-none text-[11px] italic font-medium text-slate-500"
                              placeholder="Domicilio fiscal"
                              maxLength={250}
                            />
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Teléfono */}
                {isEditing ? (
                  <div className="space-y-2">
                    <FormLabel className="font-bold text-color-titulos text-[11px] block">
                      Indique el número telefónico de contacto de la empresa que adquiere el pliego
                      de condiciones.
                    </FormLabel>
                    <p className="text-[10px] text-muted-foreground italic">
                      Artículos 66.29 LCP; 32.13 RLCP; 28 NORMAS DE CONTROL INTERNO SUNAI.
                    </p>
                    <div className="flex items-center gap-2">
                      <Select value={telefonoPrefijo} onValueChange={setTelefonoPrefijo}>
                        <SelectTrigger className="w-[85px] h-[32px] border border-border bg-white text-[11px]">
                          <SelectValue placeholder="0414" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0414">0414</SelectItem>
                          <SelectItem value="0424">0424</SelectItem>
                          <SelectItem value="0412">0412</SelectItem>
                          <SelectItem value="0416">0416</SelectItem>
                          <SelectItem value="0426">0426</SelectItem>
                          <SelectItem value="0212">0212</SelectItem>
                          <SelectItem value="0241">0241</SelectItem>
                          <SelectItem value="0251">0251</SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="text-slate-400 font-bold px-1 flex items-center">
                        <MinusIcon className="h-4 w-4" />
                      </div>

                      <InputOTP
                        maxLength={7}
                        value={telefonoNumero}
                        onChange={(val) => setTelefonoNumero(val)}
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
                            className="rounded-r-md border-r shadow-none h-[32px] w-7 text-[11px]"
                          />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    {form.formState.errors.telefono && (
                      <p className="text-sm font-medium text-destructive">
                        {form.formState.errors.telefono.message}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <FormLabel className="font-bold text-color-titulos text-[11px] block">
                      Número telefónico de contacto de la empresa
                    </FormLabel>
                    <div className="border border-slate-300 bg-white text-[11px] italic font-medium text-slate-500 px-3 py-1.5 rounded-md w-full min-h-[32px]">
                      {telefonoCompleto || "-"}
                    </div>
                  </div>
                )}

                {/* Correo electrónico */}
                <FormField
                  control={form.control}
                  name="correo"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="font-bold text-color-titulos text-[11px]">
                        Indique el correo electrónico de contacto de la empresa que adquiere el
                        pliego de condiciones.
                      </FormLabel>
                      <p className="text-[10px] text-muted-foreground italic">
                        Artículos 66.9 LCP; 32.13 RLCP; 28 NORMAS DE CONTROL INTERNO SUNAI.
                      </p>
                      <FormControl>
                        <div className="border border-slate-300 bg-white text-[11px] italic font-medium text-slate-500 px-3 py-1.5 rounded-md w-full min-h-[32px]">
                          {!isEditing ? (
                            field.value || "-"
                          ) : (
                            <input
                              {...field}
                              className="w-full bg-transparent outline-none text-[11px] italic font-medium text-slate-500"
                              placeholder="ejemplo: bob@gmail.com"
                              maxLength={100}
                            />
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Referencia depósito */}
                <FormField
                  control={form.control}
                  name="referenciaDeposito"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="font-bold text-color-titulos text-[11px]">
                        Indique el número de referencia del depósito o transferencia de la empresa
                        que adquiere el pliego de condiciones (si aplica).
                      </FormLabel>
                      <p className="text-[10px] text-muted-foreground italic">
                        Artículos 32.13 RLCP; 5 NORMAS DE CONTROL INTERNO SUNAI.
                      </p>
                      <FormControl>
                        <div className="border border-slate-300 bg-white text-[11px] italic font-medium text-slate-500 px-3 py-1.5 rounded-md w-full min-h-[32px]">
                          {!isEditing ? (
                            field.value || "-"
                          ) : (
                            <input
                              {...field}
                              className="w-full bg-transparent outline-none text-[11px] italic font-medium text-slate-500"
                              placeholder="0001-020-316"
                              maxLength={20}
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
                form="adquirente-form"
                onClick={(e) => {
                  // Prevenir cualquier bubble si el browser hace algo raro, el submit se hace por el form id
                }}
                className="bg-navy hover:bg-navy-hover text-white font-semibold flex-1 h-11 rounded-md"
              >
                {mode === "crear" ? "Guardar adquirente" : "Guardar cambios"}
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FaCheckCircle } from "react-icons/fa";
import { toast } from "sonner";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import { actaAdjudicacionSchema, type ActaAdjudicacionFormValues } from "@/lib/schemas/fase4Schema";

interface ActaAdjudicacionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  readOnly?: boolean;
}

function sanitizeMontoInput(value: string): string {
  return value.replace(/[^\d.,]/g, "");
}

const MONTO_INPUT_CLASS =
  "w-full bg-transparent outline-none text-[11px] italic font-medium text-slate-500 placeholder:text-[11px] placeholder:italic placeholder:font-medium placeholder:text-slate-500/50";

const MONTO_WRAPPER_CLASS =
  "border border-slate-300 bg-white text-[11px] italic font-medium text-slate-500 px-3 py-1.5 rounded-md w-full min-h-[32px]";

interface MontoInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  disabled?: boolean;
  placeholder?: string;
  name: string;
}

function MontoInput({ value, onChange, onBlur, disabled, placeholder, name }: MontoInputProps) {
  return (
    <div className={MONTO_WRAPPER_CLASS}>
      <input
        name={name}
        value={value}
        disabled={disabled}
        inputMode="decimal"
        autoComplete="off"
        placeholder={placeholder}
        className={MONTO_INPUT_CLASS}
        onBlur={onBlur}
        onChange={(e) => onChange(sanitizeMontoInput(e.target.value))}
      />
    </div>
  );
}

export function ActaAdjudicacionSheet({
  open,
  onOpenChange,
  readOnly = false,
}: ActaAdjudicacionSheetProps) {
  const [successOpen, setSuccessOpen] = useState(false);

  const form = useForm<ActaAdjudicacionFormValues>({
    resolver: zodResolver(actaAdjudicacionSchema),
    defaultValues: {
      montoContratacionConIva: "",
      partidaPresupuestaria: "",
      montoResponsabilidadSocial: "",
      referenciaRecomendacion: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (open) {
      form.reset({
        montoContratacionConIva: "",
        partidaPresupuestaria: "",
        montoResponsabilidadSocial: "",
        referenciaRecomendacion: "",
      });
    }
  }, [open, form]);

  const handleFormSubmit = () => {
    onOpenChange(false);
    setSuccessOpen(true);
  };

  const handleGenerarActa = () => {
    toast.info("La generación del acta de adjudicación estará disponible próximamente.");
    setSuccessOpen(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md md:max-w-[450px] bg-white p-0 border-l overflow-y-auto"
        >
          <div className="flex flex-col h-full">
            <SheetHeader className="p-8 pb-4 border-b border-slate-100">
              <SheetTitle className="text-2xl font-extrabold text-color-titulos text-left">
                Datos del acto de Adjudicación
              </SheetTitle>
              <SheetDescription className="text-slate-500 font-medium italic text-left text-sm">
                Deje constancia de las variables de tiempo, lugar y justificación que motivaron la
                selección del ganador.
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 px-8 py-4">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleFormSubmit)}
                  className="space-y-6"
                  id="acta-adjudicacion-form"
                >
                  <FormField
                    control={form.control}
                    name="montoContratacionConIva"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="font-bold text-color-titulos text-[11px]">
                          Indique el monto (Bs) de la contratación incluyendo IVA.
                        </FormLabel>
                        <p className="text-[10px] text-muted-foreground italic">
                          Artículos 74 LCP; 25 NORMAS DE CONTROL INTERNO SUNAI.
                        </p>
                        <FormControl>
                          <MontoInput
                            name={field.name}
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            disabled={readOnly}
                            placeholder="Bs. 0,00"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="partidaPresupuestaria"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="font-bold text-color-titulos text-[11px]">
                          Indique la partida presupuestaria a la cual se imputará el gasto de la
                          presente contratación.
                        </FormLabel>
                        <p className="text-[10px] text-muted-foreground italic">
                          Artículos 74 LCP; 25 NORMAS DE CONTROL INTERNO SUNAI.
                        </p>
                        <FormControl>
                          <div className={MONTO_WRAPPER_CLASS}>
                            <input
                              {...field}
                              disabled={readOnly}
                              placeholder="0001-020-316"
                              className={MONTO_INPUT_CLASS}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="montoResponsabilidadSocial"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="font-bold text-color-titulos text-[11px]">
                          Indique el monto (Bs) del compromiso de responsabilidad social sin IVA.
                        </FormLabel>
                        <p className="text-[10px] text-muted-foreground italic">
                          Artículos 31 LCP; 5 NORMAS DE CONTROL INTERNO SUNAI.
                        </p>
                        <FormControl>
                          <MontoInput
                            name={field.name}
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            disabled={readOnly}
                            placeholder="Bs. 0,00"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="referenciaRecomendacion"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="font-bold text-color-titulos text-[11px]">
                          Desarrolle una breve referencia de la recomendación emitida por la
                          comisión de contrataciones en su informe sobre la empresa que obtuvo la
                          1era opción.
                        </FormLabel>
                        <p className="text-[10px] text-muted-foreground italic">
                          Artículos 95 LCP; 18.6 LOPA; 4 NORMAS DE CONTROL INTERNO SUNAI.
                        </p>
                        <FormControl>
                          <div className={MONTO_WRAPPER_CLASS}>
                            <textarea
                              {...field}
                              disabled={readOnly}
                              rows={4}
                              placeholder="Escriba la referencia de la recomendación..."
                              className={`${MONTO_INPUT_CLASS} min-h-[72px] resize-y`}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </div>

            <div className="p-8 pt-6 flex justify-end gap-3 pb-12 mt-auto border-t border-slate-100 bg-slate-50/50">
              <Button
                variant="outline"
                type="button"
                onClick={() => onOpenChange(false)}
                className="font-semibold flex-1 h-11 rounded-md"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                form="acta-adjudicacion-form"
                disabled={readOnly}
                className="bg-navy hover:bg-navy-hover text-white font-semibold flex-1 h-11 rounded-md"
              >
                Guardar
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="sm:max-w-[400px] flex flex-col items-center justify-center p-8 gap-4 rounded-xl">
          <div className="w-16 h-16 rounded-full border-[3px] border-success flex items-center justify-center mb-2">
            <FaCheckCircle className="w-8 h-8 text-success" />
          </div>
          <DialogHeader className="text-center w-full space-y-2">
            <DialogTitle className="text-xl font-bold text-navy w-full text-center">
              ¡Excelente!
            </DialogTitle>
            <DialogDescription className="text-sm text-foreground w-full text-center">
              Ha completado la carga de datos de la adjudicación.
            </DialogDescription>
          </DialogHeader>
          <div className="w-full mt-4 flex flex-col items-center gap-3">
            <Button
              type="button"
              onClick={handleGenerarActa}
              disabled={readOnly}
              className="w-full sm:w-[200px] bg-navy hover:bg-navy-hover text-white font-bold h-11 rounded-md"
            >
              Generar acta
            </Button>
            <p className="w-full text-sm italic text-muted-foreground text-center">
              El sistema está listo para generar el acta de adjudicación.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

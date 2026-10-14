"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";

import { SiNoToggleField } from "@/components/features-components/GestionExpedientes/fase1/actividades-previas/SiNoToggleField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { MoneyInput } from "@/components/ui/money-input";
import { Textarea } from "@/components/ui/textarea";
import {
  INFORME_RECOMENDACION_DESCRIPTION,
  INFORME_RECOMENDACION_FIELD_COPY,
  INFORME_RECOMENDACION_SUBTITLE,
  INFORME_RECOMENDACION_SUCCESS_TITLE,
  INFORME_RECOMENDACION_TITLE,
} from "@/lib/constants/fase3InformeRecomendacion";
import {
  informeRecomendacionLocalSchema,
  type InformeRecomendacionLocalValues,
} from "@/lib/schemas/fase3GestionAdjudicacionSchema";
import type { InformeRecomendacionLocal } from "./types";

const inputClass =
  "rounded-lg border-slate-300 bg-white text-sm shadow-none focus-visible:ring-2 focus-visible:ring-navy/30";
const labelClass = "text-sm font-bold text-slate-700";
const legalClass = "text-[11px] italic leading-relaxed text-slate-500";
const textareaClass = `mt-3 min-h-[110px] ${inputClass}`;

interface InformeRecomendacionFormProps {
  defaultValues?: Omit<InformeRecomendacionLocal, "generado">;
  readOnly?: boolean;
  onBack: () => void;
  onSave: (values: Omit<InformeRecomendacionLocal, "generado">) => void;
}

function FieldCopy({ fieldKey }: { fieldKey: keyof typeof INFORME_RECOMENDACION_FIELD_COPY }) {
  const copy = INFORME_RECOMENDACION_FIELD_COPY[fieldKey];
  return (
    <>
      <p className={labelClass}>{copy.label}</p>
      {copy.legal ? <FormDescription className={legalClass}>{copy.legal}</FormDescription> : null}
    </>
  );
}

function toFormValues(
  defaults?: Omit<InformeRecomendacionLocal, "generado">
): InformeRecomendacionLocalValues {
  return {
    existeItemsSinOfertasAuAu: defaults?.existeItemsSinOfertasAuAu,
    itemsSinOfertasAuAu: defaults?.itemsSinOfertasAuAu ?? "",
    motivoItemsSinOfertasAuAu: defaults?.motivoItemsSinOfertasAuAu ?? "",
    actualizacionPresupuestoAuAu: defaults?.actualizacionPresupuestoAuAu,
    montoNuevoPresupuestoAuAu: defaults?.montoNuevoPresupuestoAuAu ?? "",
    justificacionActualizacionPresupuestoAuAu:
      defaults?.justificacionActualizacionPresupuestoAuAu ?? "",
    observacionFormalidadesAuAu: defaults?.observacionFormalidadesAuAu,
    omisionFormalidadesAuAu: defaults?.omisionFormalidadesAuAu ?? "",
    subsanacionActoAuAu: defaults?.subsanacionActoAuAu ?? "",
    datosActoSubsanacionAuAu: defaults?.datosActoSubsanacionAuAu ?? "",
  };
}

function normalizeSavedValues(
  values: InformeRecomendacionLocalValues
): Omit<InformeRecomendacionLocal, "generado"> {
  return {
    existeItemsSinOfertasAuAu: values.existeItemsSinOfertasAuAu,
    itemsSinOfertasAuAu:
      values.existeItemsSinOfertasAuAu === true ? values.itemsSinOfertasAuAu.trim() : "",
    motivoItemsSinOfertasAuAu:
      values.existeItemsSinOfertasAuAu === true ? values.motivoItemsSinOfertasAuAu.trim() : "",
    actualizacionPresupuestoAuAu: values.actualizacionPresupuestoAuAu,
    montoNuevoPresupuestoAuAu:
      values.actualizacionPresupuestoAuAu === true ? values.montoNuevoPresupuestoAuAu.trim() : "",
    justificacionActualizacionPresupuestoAuAu:
      values.actualizacionPresupuestoAuAu === true
        ? values.justificacionActualizacionPresupuestoAuAu.trim()
        : "",
    observacionFormalidadesAuAu: values.observacionFormalidadesAuAu,
    omisionFormalidadesAuAu:
      values.observacionFormalidadesAuAu === true ? values.omisionFormalidadesAuAu.trim() : "",
    subsanacionActoAuAu:
      values.observacionFormalidadesAuAu === true ? values.subsanacionActoAuAu.trim() : "",
    datosActoSubsanacionAuAu:
      values.observacionFormalidadesAuAu === true ? values.datosActoSubsanacionAuAu.trim() : "",
  };
}

export function InformeRecomendacionForm({
  defaultValues,
  readOnly = false,
  onBack,
  onSave,
}: InformeRecomendacionFormProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<Omit<
    InformeRecomendacionLocal,
    "generado"
  > | null>(null);

  const form = useForm<InformeRecomendacionLocalValues>({
    resolver: zodResolver(
      informeRecomendacionLocalSchema
    ) as Resolver<InformeRecomendacionLocalValues>,
    defaultValues: toFormValues(defaultValues),
    mode: "onSubmit",
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const inset = document.querySelector('[data-slot="sidebar-inset"]') as HTMLElement | null;
    if (inset) inset.scrollTop = 0;
    let node: HTMLElement | null = rootRef.current;
    while (node) {
      if (node.scrollTop > 0) node.scrollTop = 0;
      node = node.parentElement;
    }
    rootRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
  }, []);

  useEffect(() => {
    form.reset(toFormValues(defaultValues));
  }, [defaultValues, form]);

  const existeItemsSinOfertas = form.watch("existeItemsSinOfertasAuAu");
  const actualizacionPresupuesto = form.watch("actualizacionPresupuestoAuAu");
  const observacionFormalidades = form.watch("observacionFormalidadesAuAu");

  const handleGenerate = form.handleSubmit((values) => {
    setPendingValues(normalizeSavedValues(values));
    setSuccessOpen(true);
  });

  const handleConfirmSave = () => {
    if (!pendingValues) return;
    onSave(pendingValues);
    setSuccessOpen(false);
    setPendingValues(null);
  };

  return (
    <div ref={rootRef} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-10 border-border font-semibold text-color-subtitulos"
          onClick={onBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </div>

      <Card className="border border-border shadow-sm">
        <CardHeader className="border-b border-border bg-slate-50 px-6 py-4">
          <CardTitle className="text-[17px] font-bold text-color-titulos">
            {INFORME_RECOMENDACION_TITLE}
          </CardTitle>
          <p className="text-[12px] text-muted-foreground">{INFORME_RECOMENDACION_SUBTITLE}</p>
          <p className="pt-1 text-sm text-muted-foreground">{INFORME_RECOMENDACION_DESCRIPTION}</p>
        </CardHeader>

        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={handleGenerate} className="space-y-6">
              <FormField
                control={form.control}
                name="existeItemsSinOfertasAuAu"
                render={({ field }) => (
                  <FormItem className="rounded-lg border border-slate-200 p-5">
                    <FieldCopy fieldKey="existeItemsSinOfertasAuAu" />
                    <FormControl>
                      <SiNoToggleField
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value);
                          if (!value) {
                            form.setValue("itemsSinOfertasAuAu", "");
                            form.setValue("motivoItemsSinOfertasAuAu", "");
                          }
                        }}
                        disabled={readOnly}
                        className="mt-3 max-w-md"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {existeItemsSinOfertas === true ? (
                <>
                  <FormField
                    control={form.control}
                    name="itemsSinOfertasAuAu"
                    render={({ field }) => (
                      <FormItem className="rounded-lg border border-slate-200 p-5">
                        <FieldCopy fieldKey="itemsSinOfertasAuAu" />
                        <FormControl>
                          <Textarea
                            {...field}
                            disabled={readOnly}
                            className={textareaClass}
                            placeholder="Detalle los ítems o renglones sin ofertas válidas..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="motivoItemsSinOfertasAuAu"
                    render={({ field }) => (
                      <FormItem className="rounded-lg border border-slate-200 p-5">
                        <FieldCopy fieldKey="motivoItemsSinOfertasAuAu" />
                        <FormControl>
                          <Textarea
                            {...field}
                            disabled={readOnly}
                            className={textareaClass}
                            placeholder="Indique el motivo de la declaratoria de desierto..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              ) : null}

              <FormField
                control={form.control}
                name="actualizacionPresupuestoAuAu"
                render={({ field }) => (
                  <FormItem className="rounded-lg border border-slate-200 p-5">
                    <FieldCopy fieldKey="actualizacionPresupuestoAuAu" />
                    <FormControl>
                      <SiNoToggleField
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value);
                          if (!value) {
                            form.setValue("montoNuevoPresupuestoAuAu", "");
                            form.setValue("justificacionActualizacionPresupuestoAuAu", "");
                          }
                        }}
                        disabled={readOnly}
                        className="mt-3 max-w-md"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {actualizacionPresupuesto === true ? (
                <>
                  <FormField
                    control={form.control}
                    name="montoNuevoPresupuestoAuAu"
                    render={({ field }) => (
                      <FormItem className="rounded-lg border border-slate-200 p-5">
                        <FieldCopy fieldKey="montoNuevoPresupuestoAuAu" />
                        <FormControl>
                          <MoneyInput
                            value={field.value}
                            disabled={readOnly}
                            placeholder="Ej: 1.500.000,00"
                            className={`mt-3 max-w-sm ${inputClass} h-10`}
                            onValueChange={(clean) => field.onChange(clean)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="justificacionActualizacionPresupuestoAuAu"
                    render={({ field }) => (
                      <FormItem className="rounded-lg border border-slate-200 p-5">
                        <FieldCopy fieldKey="justificacionActualizacionPresupuestoAuAu" />
                        <FormControl>
                          <Textarea
                            {...field}
                            disabled={readOnly}
                            className={textareaClass}
                            placeholder="Justificación técnica del nuevo presupuesto base..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              ) : null}

              <FormField
                control={form.control}
                name="observacionFormalidadesAuAu"
                render={({ field }) => (
                  <FormItem className="rounded-lg border border-slate-200 p-5">
                    <FieldCopy fieldKey="observacionFormalidadesAuAu" />
                    <FormControl>
                      <SiNoToggleField
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value);
                          if (!value) {
                            form.setValue("omisionFormalidadesAuAu", "");
                            form.setValue("subsanacionActoAuAu", "");
                            form.setValue("datosActoSubsanacionAuAu", "");
                          }
                        }}
                        disabled={readOnly}
                        className="mt-3 max-w-md"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {observacionFormalidades === true ? (
                <>
                  <FormField
                    control={form.control}
                    name="omisionFormalidadesAuAu"
                    render={({ field }) => (
                      <FormItem className="rounded-lg border border-slate-200 p-5">
                        <FieldCopy fieldKey="omisionFormalidadesAuAu" />
                        <FormControl>
                          <Textarea
                            {...field}
                            disabled={readOnly}
                            className={textareaClass}
                            placeholder="Describa la omisión observada..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="subsanacionActoAuAu"
                    render={({ field }) => (
                      <FormItem className="rounded-lg border border-slate-200 p-5">
                        <FieldCopy fieldKey="subsanacionActoAuAu" />
                        <FormControl>
                          <Textarea
                            {...field}
                            disabled={readOnly}
                            className={textareaClass}
                            placeholder="Describa la decisión tomada..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="datosActoSubsanacionAuAu"
                    render={({ field }) => (
                      <FormItem className="rounded-lg border border-slate-200 p-5">
                        <FieldCopy fieldKey="datosActoSubsanacionAuAu" />
                        <FormControl>
                          <Textarea
                            {...field}
                            disabled={readOnly}
                            className={textareaClass}
                            placeholder="Número, fecha u otros datos del acto de subsanación..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              ) : null}

              {!readOnly ? (
                <div className="flex justify-end border-t border-border pt-5">
                  <Button
                    type="submit"
                    className="h-11 bg-navy px-8 font-semibold text-white hover:bg-navy-hover"
                  >
                    Generar informe
                  </Button>
                </div>
              ) : null}
            </form>
          </Form>
        </CardContent>
      </Card>

      <Dialog
        open={successOpen}
        onOpenChange={(open) => {
          setSuccessOpen(open);
          if (!open) setPendingValues(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-color-titulos">
              {INFORME_RECOMENDACION_SUCCESS_TITLE}
            </DialogTitle>
            <DialogDescription>
              Confirme para guardar el informe en el expediente y volver al hub de Fase 3.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSuccessOpen(false);
                setPendingValues(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="bg-navy text-white hover:bg-navy-hover"
              onClick={handleConfirmSave}
            >
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

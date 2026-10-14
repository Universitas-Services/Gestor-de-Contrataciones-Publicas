"use client";

import { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AlertTriangle, ArrowLeft } from "lucide-react";

import { SiNoToggleField } from "@/components/features-components/GestionExpedientes/fase1/actividades-previas/SiNoToggleField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { Textarea } from "@/components/ui/textarea";
import {
  ADJUDICACION_PARCIAL_DETALLE_TITLE,
  ADJUDICACION_PARCIAL_FIELD_COPY,
  ADJUDICACION_PARCIAL_SUBTITLE,
  ADJUDICACION_PARCIAL_TITLE,
  getAlcanceParcialLabel,
} from "@/lib/constants/fase3AdjudicacionParcial";
import {
  MOCK_CODIGOS_PARTIDA,
  joinPartidasSeleccionadas,
  parsePartidasSeleccionadas,
} from "@/lib/constants/fase3AdjudicacionTotal";
import {
  adjudicacionParcialLocalSchema,
  type AdjudicacionParcialLocalValues,
} from "@/lib/schemas/fase3GestionAdjudicacionSchema";
import { listarPresupuestoItems } from "@/services/fase1Service";
import { excedePresupuestoMensaje } from "./montoUtils";
import type { AdjudicacionParcialFormLocal } from "./types";

const inputClass =
  "h-10 rounded-lg border-slate-300 bg-white text-sm shadow-none focus-visible:ring-2 focus-visible:ring-navy/30";
const labelClass = "text-sm font-bold text-slate-700";
const legalClass = "text-[11px] italic leading-relaxed text-slate-500";

interface AdjudicacionParcialFormProps {
  expedienteId: string;
  oferenteNombre: string;
  oferenteRif?: string;
  representanteLegal?: string;
  tipoObjetoContratacion?: string | null;
  defaultValues?: AdjudicacionParcialFormLocal;
  readOnly?: boolean;
  /** Fase 1 exige garantía laboral: la mano de obra pasa a ser obligatoria. */
  manoObraRequerida?: boolean;
  onBack: () => void;
  onSave: (values: AdjudicacionParcialFormLocal) => void;
}

function FieldCopyBlock({ label, legal }: { label: string; legal: string }) {
  return (
    <>
      <p className={labelClass}>{label}</p>
      {legal ? <FormDescription className={legalClass}>{legal}</FormDescription> : null}
    </>
  );
}

export function AdjudicacionParcialForm({
  expedienteId,
  oferenteNombre,
  oferenteRif,
  representanteLegal,
  tipoObjetoContratacion,
  defaultValues,
  readOnly = false,
  manoObraRequerida = false,
  onBack,
  onSave,
}: AdjudicacionParcialFormProps) {
  const [codigosPartida, setCodigosPartida] = useState<string[]>([...MOCK_CODIGOS_PARTIDA]);
  const [loadingPartidas, setLoadingPartidas] = useState(true);
  const [presupuestoBase, setPresupuestoBase] = useState<number | null>(null);
  const alcanceLabel = getAlcanceParcialLabel(tipoObjetoContratacion);

  const form = useForm<AdjudicacionParcialLocalValues>({
    resolver: zodResolver(
      adjudicacionParcialLocalSchema
    ) as Resolver<AdjudicacionParcialLocalValues>,
    defaultValues: {
      oferenteAdjudicadoProcedimientoAuAu: defaultValues?.oferenteAdjudicadoProcedimientoAuAu,
      causaNoAdjudicadoAuAu: defaultValues?.causaNoAdjudicadoAuAu ?? "",
      cantidadRenglonesAuAu: defaultValues?.cantidadRenglonesAuAu ?? "",
      alcanceAdjudicacionParcialAuAu: defaultValues?.alcanceAdjudicacionParcialAuAu ?? "",
      partidasSeleccionadas: parsePartidasSeleccionadas(
        defaultValues?.partidasAdjudicadasParcialAuAu
      ),
      montoAdjudicadoParcialAuAu: defaultValues?.montoAdjudicadoParcialAuAu ?? "",
      plazoEjecucionOfertaParcialAuAu: defaultValues?.plazoEjecucionOfertaParcialAuAu ?? "",
      montoManoObraOfertadoAuAu: defaultValues?.montoManoObraOfertadoAuAu ?? "",
    },
    mode: "onSubmit",
  });

  const adjudicado = form.watch("oferenteAdjudicadoProcedimientoAuAu");

  useEffect(() => {
    form.reset({
      oferenteAdjudicadoProcedimientoAuAu: defaultValues?.oferenteAdjudicadoProcedimientoAuAu,
      causaNoAdjudicadoAuAu: defaultValues?.causaNoAdjudicadoAuAu ?? "",
      cantidadRenglonesAuAu: defaultValues?.cantidadRenglonesAuAu ?? "",
      alcanceAdjudicacionParcialAuAu: defaultValues?.alcanceAdjudicacionParcialAuAu ?? "",
      partidasSeleccionadas: parsePartidasSeleccionadas(
        defaultValues?.partidasAdjudicadasParcialAuAu
      ),
      montoAdjudicadoParcialAuAu: defaultValues?.montoAdjudicadoParcialAuAu ?? "",
      plazoEjecucionOfertaParcialAuAu: defaultValues?.plazoEjecucionOfertaParcialAuAu ?? "",
      montoManoObraOfertadoAuAu: defaultValues?.montoManoObraOfertadoAuAu ?? "",
    });
  }, [defaultValues, form]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingPartidas(true);
      try {
        const res = await listarPresupuestoItems(expedienteId, { limit: 200, page: 1 });
        const codes = Array.from(
          new Set(
            (res.items ?? []).map((item) => String(item.codigoPartida ?? "").trim()).filter(Boolean)
          )
        );
        if (!cancelled) {
          setCodigosPartida(codes.length > 0 ? codes : [...MOCK_CODIGOS_PARTIDA]);
          const total = Number(res.totales?.montoTotal);
          setPresupuestoBase(Number.isFinite(total) ? total : null);
        }
      } catch {
        if (!cancelled) setCodigosPartida([...MOCK_CODIGOS_PARTIDA]);
      } finally {
        if (!cancelled) setLoadingPartidas(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [expedienteId]);

  const montoAdjudicado = form.watch("montoAdjudicadoParcialAuAu");
  const avisoExcedePresupuesto = excedePresupuestoMensaje(montoAdjudicado, presupuestoBase);

  const handleSubmit = form.handleSubmit((values) => {
    const adjudicadoSi = values.oferenteAdjudicadoProcedimientoAuAu === true;
    const manoObra = values.montoManoObraOfertadoAuAu?.trim() ?? "";
    if (adjudicadoSi && manoObraRequerida && !manoObra) {
      form.setError("montoManoObraOfertadoAuAu", {
        message: "Indique el monto de mano de obra: el pliego exige garantía laboral",
      });
      return;
    }
    const aviso = excedePresupuestoMensaje(values.montoAdjudicadoParcialAuAu, presupuestoBase);
    if (aviso) toast.warning(aviso);
    onSave({
      oferenteAdjudicadoProcedimientoAuAu: values.oferenteAdjudicadoProcedimientoAuAu,
      causaNoAdjudicadoAuAu: adjudicadoSi ? "" : (values.causaNoAdjudicadoAuAu ?? ""),
      cantidadRenglonesAuAu: adjudicadoSi ? (values.cantidadRenglonesAuAu ?? "") : "",
      alcanceAdjudicacionParcialAuAu: adjudicadoSi
        ? (values.alcanceAdjudicacionParcialAuAu ?? "")
        : "",
      partidasAdjudicadasParcialAuAu: adjudicadoSi
        ? joinPartidasSeleccionadas(values.partidasSeleccionadas ?? [])
        : "",
      montoAdjudicadoParcialAuAu: adjudicadoSi ? (values.montoAdjudicadoParcialAuAu ?? "") : "",
      plazoEjecucionOfertaParcialAuAu: adjudicadoSi
        ? (values.plazoEjecucionOfertaParcialAuAu ?? "")
        : "",
      montoManoObraOfertadoAuAu: adjudicadoSi ? manoObra : "",
      snapshotOferente: {
        nombre: oferenteNombre,
        rif: oferenteRif ?? "",
        representanteLegal: representanteLegal ?? "",
      },
    });
  });

  const ctaLabel = adjudicado === false ? "Guardar" : "Guardar adjudicación";

  return (
    <div className="space-y-6">
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
            {ADJUDICACION_PARCIAL_TITLE}
          </CardTitle>
          <p className="text-[12px] text-muted-foreground">{ADJUDICACION_PARCIAL_SUBTITLE}</p>
          <p className="pt-1 text-sm font-bold text-navy">
            {oferenteNombre}
            {oferenteRif ? (
              <span className="ml-2 text-xs font-medium text-muted-foreground">{oferenteRif}</span>
            ) : null}
          </p>
        </CardHeader>

        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <FormField
                control={form.control}
                name="oferenteAdjudicadoProcedimientoAuAu"
                render={({ field }) => (
                  <FormItem className="rounded-lg border border-slate-200 p-5">
                    <FieldCopyBlock
                      label={
                        ADJUDICACION_PARCIAL_FIELD_COPY.oferenteAdjudicadoProcedimientoAuAu.label
                      }
                      legal={
                        ADJUDICACION_PARCIAL_FIELD_COPY.oferenteAdjudicadoProcedimientoAuAu.legal
                      }
                    />
                    <FormControl>
                      <SiNoToggleField
                        value={field.value}
                        onChange={field.onChange}
                        disabled={readOnly}
                        className="mt-3 max-w-md"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {adjudicado === false ? (
                <FormField
                  control={form.control}
                  name="causaNoAdjudicadoAuAu"
                  render={({ field }) => (
                    <FormItem className="rounded-lg border border-slate-200 p-5">
                      <FieldCopyBlock
                        label={ADJUDICACION_PARCIAL_FIELD_COPY.causaNoAdjudicadoAuAu.label}
                        legal={ADJUDICACION_PARCIAL_FIELD_COPY.causaNoAdjudicadoAuAu.legal}
                      />
                      <FormControl>
                        <Textarea
                          {...field}
                          disabled={readOnly}
                          rows={4}
                          placeholder="Resuma la causa de no adjudicación..."
                          className="mt-3"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}

              {adjudicado === true ? (
                <div className="space-y-6 rounded-lg border border-border p-5">
                  <div>
                    <h3 className="text-[15px] font-bold text-color-titulos">
                      {ADJUDICACION_PARCIAL_DETALLE_TITLE}
                    </h3>
                  </div>

                  <FormField
                    control={form.control}
                    name="cantidadRenglonesAuAu"
                    render={({ field }) => (
                      <FormItem className="rounded-lg border border-slate-200 p-5">
                        <FieldCopyBlock
                          label={ADJUDICACION_PARCIAL_FIELD_COPY.cantidadRenglonesAuAu.label}
                          legal={ADJUDICACION_PARCIAL_FIELD_COPY.cantidadRenglonesAuAu.legal}
                        />
                        <FormControl>
                          <Input
                            {...field}
                            disabled={readOnly}
                            placeholder="Ej: 3"
                            className={`mt-3 max-w-xs ${inputClass}`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="alcanceAdjudicacionParcialAuAu"
                    render={({ field }) => (
                      <FormItem className="rounded-lg border border-slate-200 p-5">
                        <FieldCopyBlock
                          label={alcanceLabel}
                          legal={
                            ADJUDICACION_PARCIAL_FIELD_COPY.alcanceAdjudicacionParcialAuAu.legal
                          }
                        />
                        <FormControl>
                          <Input
                            {...field}
                            disabled={readOnly}
                            placeholder="Ej: 1, 4, 7"
                            className={`mt-3 max-w-md ${inputClass}`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="partidasSeleccionadas"
                    render={({ field }) => (
                      <FormItem className="rounded-lg border border-slate-200 p-5">
                        <FieldCopyBlock
                          label={
                            ADJUDICACION_PARCIAL_FIELD_COPY.partidasAdjudicadasParcialAuAu.label
                          }
                          legal={
                            ADJUDICACION_PARCIAL_FIELD_COPY.partidasAdjudicadasParcialAuAu.legal
                          }
                        />
                        <FormControl>
                          <div className="mt-3 space-y-3">
                            {loadingPartidas ? (
                              <p className="text-sm text-muted-foreground">Cargando partidas...</p>
                            ) : (
                              codigosPartida.map((codigo) => {
                                const checked = field.value?.includes(codigo) ?? false;
                                return (
                                  <label
                                    key={codigo}
                                    className="flex cursor-pointer items-center gap-3 rounded-md border border-border bg-white px-3 py-2.5 hover:bg-slate-50"
                                  >
                                    <Checkbox
                                      checked={checked}
                                      disabled={readOnly}
                                      onCheckedChange={(next) => {
                                        const isOn = next === true;
                                        const current = field.value ?? [];
                                        field.onChange(
                                          isOn
                                            ? [...current, codigo]
                                            : current.filter((c) => c !== codigo)
                                        );
                                      }}
                                    />
                                    <span className="text-sm font-semibold text-color-titulos">
                                      {codigo}
                                    </span>
                                  </label>
                                );
                              })
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="montoAdjudicadoParcialAuAu"
                    render={({ field }) => (
                      <FormItem className="rounded-lg border border-slate-200 p-5">
                        <FieldCopyBlock
                          label={ADJUDICACION_PARCIAL_FIELD_COPY.montoAdjudicadoParcialAuAu.label}
                          legal={ADJUDICACION_PARCIAL_FIELD_COPY.montoAdjudicadoParcialAuAu.legal}
                        />
                        <FormControl>
                          <MoneyInput
                            value={field.value}
                            disabled={readOnly}
                            placeholder="Ej: 450.000,00"
                            className={`mt-3 max-w-sm ${inputClass}`}
                            onValueChange={(clean) => field.onChange(clean)}
                          />
                        </FormControl>
                        <FormMessage />
                        {avisoExcedePresupuesto ? (
                          <p className="mt-2 flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-[12px] font-medium text-amber-800">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                            {avisoExcedePresupuesto}
                          </p>
                        ) : null}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="plazoEjecucionOfertaParcialAuAu"
                    render={({ field }) => (
                      <FormItem className="rounded-lg border border-slate-200 p-5">
                        <FieldCopyBlock
                          label={
                            ADJUDICACION_PARCIAL_FIELD_COPY.plazoEjecucionOfertaParcialAuAu.label
                          }
                          legal={
                            ADJUDICACION_PARCIAL_FIELD_COPY.plazoEjecucionOfertaParcialAuAu.legal
                          }
                        />
                        <FormControl>
                          <Input
                            {...field}
                            disabled={readOnly}
                            inputMode="numeric"
                            placeholder="Ej: 60"
                            className={`mt-3 max-w-xs ${inputClass}`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="montoManoObraOfertadoAuAu"
                    render={({ field }) => (
                      <FormItem className="rounded-lg border border-slate-200 p-5">
                        <FieldCopyBlock
                          label={ADJUDICACION_PARCIAL_FIELD_COPY.montoManoObraOfertadoAuAu.label}
                          legal={ADJUDICACION_PARCIAL_FIELD_COPY.montoManoObraOfertadoAuAu.legal}
                        />
                        <FormControl>
                          <MoneyInput
                            value={field.value ?? ""}
                            disabled={readOnly}
                            placeholder="Ej: 200.000,00"
                            className={`mt-3 max-w-sm ${inputClass}`}
                            onValueChange={(clean) => field.onChange(clean)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ) : null}

              {!readOnly && adjudicado !== undefined ? (
                <div className="flex justify-end border-t border-border pt-5">
                  <Button
                    type="submit"
                    className="h-11 bg-navy px-8 font-semibold text-white hover:bg-navy-hover"
                  >
                    {ctaLabel}
                  </Button>
                </div>
              ) : null}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

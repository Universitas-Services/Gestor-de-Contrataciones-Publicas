"use client";

import { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AlertTriangle, ArrowLeft } from "lucide-react";

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
import {
  ADJUDICACION_TOTAL_FIELD_COPY,
  ADJUDICACION_TOTAL_SUBTITLE,
  ADJUDICACION_TOTAL_TITLE,
  MOCK_CODIGOS_PARTIDA,
  joinPartidasSeleccionadas,
  parsePartidasSeleccionadas,
} from "@/lib/constants/fase3AdjudicacionTotal";
import {
  adjudicacionTotalLocalSchema,
  type AdjudicacionTotalLocalValues,
} from "@/lib/schemas/fase3GestionAdjudicacionSchema";
import { listarPresupuestoItems } from "@/services/fase1Service";
import { excedePresupuestoMensaje } from "./montoUtils";
import type { AdjudicacionTotalFormLocal } from "./types";

const inputClass =
  "h-10 rounded-lg border-slate-300 bg-white text-sm shadow-none focus-visible:ring-2 focus-visible:ring-navy/30";
const labelClass = "text-sm font-bold text-slate-700";
const legalClass = "text-[11px] italic leading-relaxed text-slate-500";

interface AdjudicacionTotalFormProps {
  expedienteId: string;
  oferenteNombre: string;
  oferenteRif?: string;
  defaultValues?: AdjudicacionTotalFormLocal;
  readOnly?: boolean;
  /** Fase 1 exige garantía laboral: la mano de obra pasa a ser obligatoria. */
  manoObraRequerida?: boolean;
  onBack: () => void;
  onSave: (values: AdjudicacionTotalFormLocal) => void;
}

function FieldCopy({ fieldKey }: { fieldKey: keyof typeof ADJUDICACION_TOTAL_FIELD_COPY }) {
  const copy = ADJUDICACION_TOTAL_FIELD_COPY[fieldKey];
  return (
    <>
      <p className={labelClass}>{copy.label}</p>
      {copy.legal ? <FormDescription className={legalClass}>{copy.legal}</FormDescription> : null}
    </>
  );
}

export function AdjudicacionTotalForm({
  expedienteId,
  oferenteNombre,
  oferenteRif,
  defaultValues,
  readOnly = false,
  manoObraRequerida = false,
  onBack,
  onSave,
}: AdjudicacionTotalFormProps) {
  const [codigosPartida, setCodigosPartida] = useState<string[]>([...MOCK_CODIGOS_PARTIDA]);
  const [loadingPartidas, setLoadingPartidas] = useState(true);
  const [presupuestoBase, setPresupuestoBase] = useState<number | null>(null);

  const form = useForm<AdjudicacionTotalLocalValues>({
    resolver: zodResolver(adjudicacionTotalLocalSchema) as Resolver<AdjudicacionTotalLocalValues>,
    defaultValues: {
      partidasSeleccionadas: parsePartidasSeleccionadas(
        defaultValues?.partidasAdjudicadasTotalAuAu
      ),
      montoAdjudicadoTotalAuAu: defaultValues?.montoAdjudicadoTotalAuAu ?? "",
      plazoEjecucionOfertaGanadoraAuAu: defaultValues?.plazoEjecucionOfertaGanadoraAuAu ?? "",
      montoManoObraOfertadoAuAu: defaultValues?.montoManoObraOfertadoAuAu ?? "",
    },
    mode: "onSubmit",
  });

  useEffect(() => {
    form.reset({
      partidasSeleccionadas: parsePartidasSeleccionadas(
        defaultValues?.partidasAdjudicadasTotalAuAu
      ),
      montoAdjudicadoTotalAuAu: defaultValues?.montoAdjudicadoTotalAuAu ?? "",
      plazoEjecucionOfertaGanadoraAuAu: defaultValues?.plazoEjecucionOfertaGanadoraAuAu ?? "",
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

  const montoAdjudicado = form.watch("montoAdjudicadoTotalAuAu");
  const avisoExcedePresupuesto = excedePresupuestoMensaje(montoAdjudicado, presupuestoBase);

  const handleSubmit = form.handleSubmit((values) => {
    const manoObra = values.montoManoObraOfertadoAuAu?.trim() ?? "";
    if (manoObraRequerida && !manoObra) {
      form.setError("montoManoObraOfertadoAuAu", {
        message: "Indique el monto de mano de obra: el pliego exige garantía laboral",
      });
      return;
    }
    const aviso = excedePresupuestoMensaje(values.montoAdjudicadoTotalAuAu, presupuestoBase);
    if (aviso) toast.warning(aviso);
    onSave({
      partidasAdjudicadasTotalAuAu: joinPartidasSeleccionadas(values.partidasSeleccionadas),
      montoAdjudicadoTotalAuAu: values.montoAdjudicadoTotalAuAu,
      plazoEjecucionOfertaGanadoraAuAu: values.plazoEjecucionOfertaGanadoraAuAu,
      montoManoObraOfertadoAuAu: manoObra,
    });
  });

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
            {ADJUDICACION_TOTAL_TITLE}
          </CardTitle>
          <p className="text-[12px] text-muted-foreground">{ADJUDICACION_TOTAL_SUBTITLE}</p>
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
                name="partidasSeleccionadas"
                render={({ field }) => (
                  <FormItem className="rounded-lg border border-slate-200 p-5">
                    <FieldCopy fieldKey="partidasAdjudicadasTotalAuAu" />
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
                name="montoAdjudicadoTotalAuAu"
                render={({ field }) => (
                  <FormItem className="rounded-lg border border-slate-200 p-5">
                    <FieldCopy fieldKey="montoAdjudicadoTotalAuAu" />
                    <FormControl>
                      <MoneyInput
                        value={field.value}
                        disabled={readOnly}
                        placeholder="Ej: 1.500.000,00"
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
                name="plazoEjecucionOfertaGanadoraAuAu"
                render={({ field }) => (
                  <FormItem className="rounded-lg border border-slate-200 p-5">
                    <FieldCopy fieldKey="plazoEjecucionOfertaGanadoraAuAu" />
                    <FormControl>
                      <Input
                        {...field}
                        disabled={readOnly}
                        inputMode="numeric"
                        placeholder="Ej: 90"
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
                    <FieldCopy fieldKey="montoManoObraOfertadoAuAu" />
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

              {!readOnly ? (
                <div className="flex justify-end border-t border-border pt-5">
                  <Button
                    type="submit"
                    className="h-11 bg-navy px-8 font-semibold text-white hover:bg-navy-hover"
                  >
                    Guardar adjudicación
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

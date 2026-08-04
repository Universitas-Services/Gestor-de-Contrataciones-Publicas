"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DollarSign, Loader2, RefreshCw, Save } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { UniversitasAPI } from "@universitas/sdk-global";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { editarExpediente, type ExpedienteResponse } from "@/services/expedienteService";

let _universitasClient: UniversitasAPI | null = null;
function getClient(): UniversitasAPI {
  if (!_universitasClient) {
    _universitasClient = new UniversitasAPI(process.env.NEXT_PUBLIC_UNIVERSITAS_SDK_URL ?? "");
  }
  return _universitasClient;
}

function formatMoney(value: string | number | undefined | null): string {
  if (value == null || value === "") return "—";
  const n = typeof value === "number" ? value : Number.parseFloat(String(value));
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(iso: string): string {
  const d = new Date(iso.includes("T") ? iso : `${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function toFechaIsoDay(fecha: string): string {
  return fecha.includes("T") ? (fecha.split("T")[0] ?? fecha) : fecha;
}

function parseNum(value: string | number | undefined | null): number | null {
  if (value == null || value === "") return null;
  const n = typeof value === "number" ? value : Number.parseFloat(String(value));
  return Number.isFinite(n) ? n : null;
}

export interface MontosCalculados {
  tasaReferencialBcv: number;
  montoEstimadoBs: number;
  montoEstimadoDolar: number;
  valorUcauBase: number;
}

function resolveTasaFromExpediente(data: ExpedienteResponse): number | null {
  const raw = data.modalidad?.tasaReferencialBcv ?? data.tasaReferencialBcv;
  return parseNum(raw as string | number | undefined | null);
}

function calcularMontosConNuevaTasa(
  data: ExpedienteResponse,
  nuevaTasa: number,
  valorUcau: number
): MontosCalculados {
  const bsActual = parseNum(data.modalidad?.montoEstimadoBs) ?? 0;
  const usdActual = parseNum(data.modalidad?.montoEstimadoDolar) ?? 0;
  const tasaActual = resolveTasaFromExpediente(data) ?? nuevaTasa;

  const errUsdAnchor =
    Math.abs(bsActual - usdActual * tasaActual) / Math.max(Math.abs(bsActual), 1);
  const errBsAnchor =
    Math.abs(usdActual - bsActual / tasaActual) / Math.max(Math.abs(usdActual), 1);
  const anclaEnUsd = errUsdAnchor <= errBsAnchor;

  let montoEstimadoBs: number;
  let montoEstimadoDolar: number;

  if (anclaEnUsd) {
    montoEstimadoDolar = usdActual;
    montoEstimadoBs = usdActual * nuevaTasa;
  } else {
    montoEstimadoBs = bsActual;
    montoEstimadoDolar = bsActual / nuevaTasa;
  }

  return {
    tasaReferencialBcv: nuevaTasa,
    montoEstimadoBs,
    montoEstimadoDolar,
    valorUcauBase: valorUcau > 0 ? montoEstimadoBs / valorUcau : 0,
  };
}

async function fetchTasaParaFechaActa(fechaActaInicio: string): Promise<{
  tasa: number;
  usoTasaHoy: boolean;
}> {
  const fecha = toFechaIsoDay(fechaActaInicio);
  const hoy = format(new Date(), "yyyy-MM-dd");
  const esFechaFutura = fecha > hoy;

  if (esFechaFutura) {
    const bcvRes = await getClient().economia.getBCV();
    const tasa = bcvRes.data.usd;
    if (!tasa || !Number.isFinite(tasa)) {
      throw new Error("La tasa BCV del día actual no es válida.");
    }
    return { tasa, usoTasaHoy: true };
  }

  const bcvRes = await getClient().economia.getBCVHistorico(fecha);
  const tasa = bcvRes.data.usd;
  if (!tasa || !Number.isFinite(tasa)) {
    throw new Error("La tasa BCV obtenida no es válida.");
  }
  return { tasa, usoTasaHoy: false };
}

export interface MontoEstimadoCardProps {
  data: ExpedienteResponse;
  readOnly?: boolean;
  /** Solo gestión: botones de refrescar tasa y guardar. */
  enableRecalculoTasa?: boolean;
}

export function MontoEstimadoCard({
  data,
  readOnly = false,
  enableRecalculoTasa = false,
}: MontoEstimadoCardProps) {
  const router = useRouter();
  const [draft, setDraft] = useState<MontosCalculados | null>(null);
  const [isLoadingTasa, setIsLoadingTasa] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const saved = useMemo<MontosCalculados | null>(() => {
    const tasa = resolveTasaFromExpediente(data);
    const bs = parseNum(data.modalidad?.montoEstimadoBs);
    const usd = parseNum(data.modalidad?.montoEstimadoDolar);
    const ucau = parseNum(data.modalidad?.valorUcauBase);
    if (tasa == null && bs == null && usd == null && ucau == null) return null;
    return {
      tasaReferencialBcv: tasa ?? 0,
      montoEstimadoBs: bs ?? 0,
      montoEstimadoDolar: usd ?? 0,
      valorUcauBase: ucau ?? 0,
    };
  }, [data]);

  const display = draft ?? saved;
  const fechaActaRaw = typeof data.fechaActaInicio === "string" ? data.fechaActaInicio : null;
  const fechaActaDisplay = fechaActaRaw ? formatDate(fechaActaRaw) : null;
  const hasPendingChanges = Boolean(draft);
  const canRefresh = enableRecalculoTasa && !readOnly && Boolean(fechaActaRaw) && Boolean(saved);

  const handleRefreshTasa = async () => {
    if (!fechaActaRaw || !saved) return;

    setIsLoadingTasa(true);
    try {
      const [{ tasa, usoTasaHoy }, ucauRes] = await Promise.all([
        fetchTasaParaFechaActa(fechaActaRaw),
        getClient().economia.getUCAUU(),
      ]);
      const valorUcau = ucauRes.valor;
      if (!valorUcau || !Number.isFinite(valorUcau)) {
        throw new Error("El valor UCAU obtenido no es válido.");
      }

      const recalculado = calcularMontosConNuevaTasa(data, tasa, valorUcau);
      setDraft(recalculado);

      if (usoTasaHoy) {
        toast.info(
          "Aún no hay tasa BCV para la fecha del acta. Se usó la tasa del día de hoy para recalcular.",
          { duration: 6000 }
        );
      } else {
        toast.success("Tasa BCV obtenida. Revise los montos recalculados y guarde si aplica.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo obtener la tasa BCV.");
    } finally {
      setIsLoadingTasa(false);
    }
  };

  const handleSave = async () => {
    if (!draft) return;

    setIsSaving(true);
    try {
      await editarExpediente(data.id, {
        montoEstimadoBs: draft.montoEstimadoBs,
        montoEstimadoDolar: draft.montoEstimadoDolar,
        valorUcauBase: draft.valorUcauBase,
        tasaReferencialBcv: draft.tasaReferencialBcv,
      });
      toast.success("Montos actualizados correctamente.");
      setDraft(null);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudieron guardar los montos.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardHeader className="pb-2 pt-5 px-6">
        <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider font-inter">
          Monto estimado de contratación
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6 space-y-3">
        {(fechaActaDisplay || display?.tasaReferencialBcv != null) && (
          <div className="space-y-2 pb-2 border-b border-slate-100">
            {fechaActaDisplay && (
              <div>
                <p className="text-xs text-slate-400 font-inter italic">Fecha del acta de inicio</p>
                <p className="text-sm font-semibold text-heading-dark font-inter">
                  {fechaActaDisplay}
                </p>
              </div>
            )}
            {display && (
              <div>
                <p className="text-xs text-slate-400 font-inter italic">
                  Tasa referencial BCV (USD)
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-heading-dark font-inter tabular-nums">
                    {formatMoney(display.tasaReferencialBcv)}
                  </p>
                  {enableRecalculoTasa && !readOnly && (
                    <div className="ml-auto flex items-center gap-2 pr-0.5">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-navy disabled:cursor-not-allowed disabled:opacity-40"
                            disabled={!canRefresh || isLoadingTasa || isSaving}
                            onClick={() => void handleRefreshTasa()}
                            aria-label="Obtener tasa BCV de la fecha del acta"
                          >
                            {isLoadingTasa ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[220px] text-center text-xs">
                          Obtener tasa BCV de la fecha del acta y recalcular montos
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-navy disabled:cursor-not-allowed disabled:opacity-40"
                            disabled={!hasPendingChanges || isSaving || isLoadingTasa}
                            onClick={() => void handleSave()}
                            aria-label="Guardar montos recalculados"
                          >
                            {isSaving ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4" />
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[200px] text-center text-xs">
                          Guardar tasa y montos recalculados
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  )}
                </div>
                {hasPendingChanges && (
                  <p className="mt-1 text-[11px] text-amber-700 font-inter italic">
                    Montos recalculados pendientes de guardar.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
        <div>
          <p className="text-xs text-slate-400 font-inter italic">Valor UCAU</p>
          <p className="text-2xl font-bold text-heading-dark font-inter tabular-nums">
            {display ? formatMoney(display.valorUcauBase) : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400 font-inter italic">Bolívares (Bs.)</p>
          <p className="text-xl font-bold text-heading-dark font-inter tabular-nums">
            {display ? formatMoney(display.montoEstimadoBs) : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400 font-inter italic flex items-center gap-1">
            <DollarSign className="w-3 h-3" /> Dólares (USD)
          </p>
          <p className="text-lg font-bold text-heading-dark font-inter tabular-nums">
            $ {display ? formatMoney(display.montoEstimadoDolar) : "—"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

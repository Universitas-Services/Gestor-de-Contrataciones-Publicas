"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import {
  ChevronRight,
  Package,
  Wrench,
  HardHat,
  FileText,
  Pencil,
  CalendarDays,
  DollarSign,
  Save,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { ExpedienteResponse, CronogramaData } from "@/services/expedienteService";
import type { CronogramaFormValues } from "@/lib/schemas/expedienteSchema";
import type { TipoContratacionBackend } from "@/lib/schemas/expedienteSchema";
import { guardarCronograma } from "@/services/expedienteService";
import { isFechaEditable, moverFechaCronograma } from "@/lib/utils/cronogramaUtils";
import type { IEvent } from "./calendar/types";
import { PlanificacionStep } from "./steps/PlanificacionStep";

// ─── Helpers ───────────────────────────────────────────────────────────

const MODALIDAD_DISPLAY: Record<string, string> = {
  LICITACION_PUBLICA: "Licitación Pública",
  CONCURSO_ABIERTO: "Concurso Abierto",
  CONCURSO_CERRADO: "Concurso Cerrado",
  CONSULTA_PRECIOS: "Consulta de Precios",
  CONTRATACION_DIRECTA: "Contratación Directa",
  LICITACION_PUBLICA_ACTO_UNICO: "Concurso Abierto, Acto Único / Apertura Única",
};

const TIPO_DISPLAY: Record<string, string> = {
  BIENES: "Bienes",
  SERVICIOS: "Servicios",
  OBRAS: "Obras",
};

/** Ícono condicional según el tipo de contratación */
function TipoIcon({ tipo }: { tipo: string }) {
  if (tipo === "SERVICIOS") return <Wrench className="w-3.5 h-3.5" />;
  if (tipo === "OBRAS") return <HardHat className="w-3.5 h-3.5" />;
  return <Package className="w-3.5 h-3.5" />; // BIENES (default)
}

const TIPO_AREA: Record<string, string> = {
  AREA_JURIDICA: "Área Jurídica",
  AREA_TECNICA: "Área Técnica",
  AREA_ECONOMICA_FINANCIERA: "Área Económica-Financiera",
  SECRETARIO_A: "Secretario(a)",
};

const TIPO_MIEMBRO: Record<string, string> = {
  MIEMBRO_PRINCIPAL: "Principal",
  MIEMBRO_SUPLENTE: "Suplente",
  PRESIDENTE: "Presidente",
};

const ESTADO_STYLES: Record<string, { label: string; className: string }> = {
  BORRADOR: { label: "Borrador", className: "bg-amber-100 text-amber-700 border-amber-200" },
  ACTIVO: { label: "Activo", className: "bg-green-100 text-green-700 border-green-200" },
  PUBLICADO: { label: "Publicado", className: "bg-blue-100 text-blue-700 border-blue-200" },
  FINALIZADO: { label: "Finalizado", className: "bg-slate-100 text-slate-600 border-slate-200" },
  ANULADO: { label: "Anulado", className: "bg-red-100 text-red-700 border-red-200" },
};

const FASES = [
  "Fase 0: Ficha Técnica",
  "Fase 1: Preparatoria",
  "Fase 2: Gestión participantes",
  "Fase 3: Análisis y recomendaciones",
  "Fase 4: Decisión y formalización",
];

const EVENT_COLOR_VARS: Record<string, string> = {
  fechaLlamadoParticipar: "cal-llamado",
  fechaInicioDisponibilidadPliego: "cal-disponibilidad",
  fechaFinDisponibilidadPliego: "cal-disponibilidad",
  fechaSolicitudAclaratorias: "cal-solicitud-aclaratorias",
  fechaRespuestaAclaratorias: "cal-respuesta-aclaratorias",
  fechaModificacionPliego: "cal-modificaciones",
  fechaActoRecepcionAperturaSobres: "cal-recepcion",
  fechaLimiteEvaluacion: "cal-evaluacion",
  fechaLimiteAdjudicacion: "cal-adjudicacion",
  fechaLimiteNotificacion: "cal-notificacion",
  fechaLimiteGarantias: "cal-garantias",
  fechaLimiteFirmaContrato: "cal-firma",
};

const EVENT_TITLES: Record<string, string> = {
  fechaLlamadoParticipar: "Llamado a Participar",
  fechaInicioDisponibilidadPliego: "Disponibilidad del Pliego",
  fechaFinDisponibilidadPliego: "Fin Disponibilidad del Pliego",
  fechaSolicitudAclaratorias: "Límite para Solicitud de Aclaratorias",
  fechaRespuestaAclaratorias: "Límite para Respuesta de Aclaratorias",
  fechaModificacionPliego: "Límite para Modificaciones al Pliego",
  fechaActoRecepcionAperturaSobres: "Acto de Recepción de Ofertas",
  fechaLimiteEvaluacion: "Límite para Evaluación",
  fechaLimiteAdjudicacion: "Límite para Adjudicación",
  fechaLimiteNotificacion: "Límite para Notificación",
  fechaLimiteGarantias: "Límite para Consignar Garantías",
  fechaLimiteFirmaContrato: "Límite para la Firma del Contrato",
};

const PLIEGO_INICIO = "fechaInicioDisponibilidadPliego";
const PLIEGO_FIN = "fechaFinDisponibilidadPliego";

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(`${iso.split("T")[0]}T12:00:00`);
  return d.toLocaleDateString("es-VE", { day: "2-digit", month: "long", year: "numeric" });
}

function formatMoney(value: string | number | undefined | null): string {
  if (value == null || value === "") return "—";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "—";
  return num.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function cronogramaToEvents(cronograma: Record<string, unknown>): IEvent[] {
  const events: IEvent[] = [];
  const pInicio = cronograma[PLIEGO_INICIO];
  const pFin = cronograma[PLIEGO_FIN];
  if (pInicio && pFin) {
    events.push({
      id: "rango-pliego",
      title: "Disponibilidad del Pliego",
      startDate: (pInicio as string).split("T")[0],
      endDate: (pFin as string).split("T")[0],
      colorVar: "cal-disponibilidad",
      readonly: true,
    });
  }
  const SKIP = new Set([PLIEGO_INICIO, PLIEGO_FIN]);
  Object.entries(cronograma)
    .filter(
      ([key, value]) =>
        !SKIP.has(key) &&
        key.startsWith("fecha") &&
        typeof value === "string" &&
        (value as string).length > 0
    )
    .forEach(([key, value]) => {
      const dateStr = (value as string).split("T")[0];
      events.push({
        id: key,
        title: EVENT_TITLES[key] || key,
        startDate: dateStr,
        endDate: dateStr,
        colorVar: EVENT_COLOR_VARS[key] || "cal-llamado",
        readonly: !isFechaEditable(key),
      });
    });
  return events;
}

// ─── Component ─────────────────────────────────────────────────────────

interface Props {
  data: ExpedienteResponse;
}

export function ExpedienteDetalle({ data }: Props) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  // Estado del cronograma (editable)
  const rawCronograma = data.cronograma as CronogramaData | undefined;
  const [cronogramaData, setCronogramaData] = useState<CronogramaFormValues | null>(
    rawCronograma ? (rawCronograma as unknown as CronogramaFormValues) : null
  );
  const initialMonth = rawCronograma?.fechaLlamadoParticipar
    ? (() => {
        const d = new Date(`${rawCronograma.fechaLlamadoParticipar.split("T")[0]}T12:00:00`);
        return new Date(d.getFullYear(), d.getMonth(), 1);
      })()
    : new Date();

  const [calendarEvents, setCalendarEvents] = useState<IEvent[]>(
    cronogramaData ? cronogramaToEvents(cronogramaData as unknown as Record<string, unknown>) : []
  );

  // Datos del expediente
  const tipoRaw = data.modalidad?.tipoContratacion ?? "";
  const tipoLabel = TIPO_DISPLAY[tipoRaw] ?? tipoRaw;
  const modalidadLabel =
    MODALIDAD_DISPLAY[data.modalidad?.modalidadSeleccion ?? ""] ??
    data.modalidad?.modalidadSeleccion ??
    "—";
  const estado = ESTADO_STYLES[data.estatusProceso] ?? {
    label: data.estatusProceso,
    className: "bg-slate-100 text-slate-600 border-slate-200",
  };
  const shortId = data.id?.slice(0, 8).toUpperCase() ?? "—";

  const ucau =
    rawCronograma?.fechaLlamadoParticipar && data.modalidad
      ? parseFloat(data.modalidad.montoEstimadoBs) / parseFloat(data.modalidad.valorUcauBase)
      : null;

  // Solo miembros principales (PRESIDENTE o MIEMBRO_PRINCIPAL)
  const miembrosPrincipales = (data.comision?.miembros ?? []).filter(
    (m) => m.tipoMiembro === "PRESIDENTE" || m.tipoMiembro === "MIEMBRO_PRINCIPAL"
  );

  // ─── D&D handler ───────────────────────────────────────────────────
  const handleEventDrop = (eventId: string, diffInDays: number) => {
    if (!cronogramaData || diffInDays === 0) return;
    const tipo = (tipoRaw as TipoContratacionBackend) || "BIENES";
    const result = moverFechaCronograma(
      cronogramaData as unknown as Record<string, unknown>,
      eventId,
      diffInDays,
      tipo
    );
    if (!result.success) {
      if (result.errorMsg) toast.error(result.errorMsg);
      return;
    }
    if (result.warningMsg) toast.warning(result.warningMsg, { duration: 8000 });
    if (result.newCronograma) {
      setCronogramaData(result.newCronograma as CronogramaFormValues);
      setCalendarEvents(cronogramaToEvents(result.newCronograma));
    }
  };

  // ─── Guardar cronograma ───────────────────────────────────────────
  const handleGuardarCronograma = async () => {
    if (!cronogramaData) return;
    setIsSaving(true);
    try {
      await guardarCronograma(data.id, cronogramaData);
      toast.success("Cronograma actualizado exitosamente.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar el cronograma.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 pb-16">
      <div className="w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Breadcrumbs removidos a favor del Layout global */}

        <h1 className="text-[28px] font-bold text-heading-dark font-inter leading-tight">
          Información de expediente
        </h1>

        {/* ── Hero Card ── */}
        <Card className="bg-navy border-0 text-white overflow-hidden">
          <CardContent className="px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Lado izquierdo */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-2xl font-bold font-inter tracking-wide">EXP-{shortId}</h2>
                  <Badge
                    className={`${estado.className} text-xs font-semibold px-2.5 py-0.5 rounded-full border`}
                  >
                    {estado.label}
                  </Badge>
                </div>
                <div className="flex items-center gap-5 text-slate-300 text-sm flex-wrap">
                  {/* Ícono condicional según tipo */}
                  <span className="flex items-center gap-1.5">
                    <TipoIcon tipo={tipoRaw} />
                    Tipo: <span className="text-white font-medium ml-1">{tipoLabel}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    Modalidad: <span className="text-white font-medium ml-1">{modalidadLabel}</span>
                  </span>
                </div>
              </div>

              {/* Lado derecho: Progreso — barra verde usando CSS var */}
              <div className="min-w-[220px] space-y-2">
                <div className="flex justify-between text-sm text-slate-300">
                  <span>Progreso del Expediente</span>
                  <span className="font-bold text-white">15%</span>
                </div>
                {/* bg-slate-600 es el track, la barra interna usa --progress-bar definido en globals.css */}
                <Progress
                  value={15}
                  className="h-1.5 bg-slate-600 [&>div]:bg-[var(--progress-bar)]"
                />
                <p className="text-xs text-slate-400">Fase 0: Ficha Técnica en curso</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Tabs — letras azules, y cuadrante azul en fase activa, sin scroll horizontal ── */}
        <div className="w-full">
          <Tabs defaultValue="fase-0" className="w-full">
            {/* border-b-2 actúa como la barra azul separadora de todo el bloque. flex-wrap permite que caigan a otra línea si no caben para evitar scroll */}
            <TabsList className="w-full flex-wrap justify-start rounded-none border-b-2 border-navy bg-transparent h-auto p-0 gap-0">
              {FASES.map((fase, i) => (
                <TabsTrigger
                  key={i}
                  value={`fase-${i}`}
                  className={[
                    /* layout & reset */
                    "relative rounded-none px-1 sm:px-2 py-2 text-[12px] sm:text-[13px] font-medium transition-colors whitespace-nowrap",
                    /* inactivos */
                    "text-navy bg-transparent hover:bg-slate-100/50",
                    /* activo: bloque azul sólido con letras blancas, alineado a la base */
                    "data-[state=active]:bg-navy data-[state=active]:text-white",
                    /* para ocultar la línea de abajo en el activo (opcional) pero como está sobre la línea, el bg solid lo cubre */
                    "shadow-none data-[state=active]:shadow-none",
                    "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none",
                  ].join(" ")}
                >
                  {fase}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* ── Grid Principal ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Objeto del Procedimiento (2/3) */}
          <Card className="col-span-1 lg:col-span-2 border border-slate-200 shadow-sm">
            <CardHeader className="pb-2 pt-5 px-6">
              <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider font-inter">
                Objeto del Procedimiento
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <p className="text-slate-700 text-sm leading-relaxed font-inter">
                {data.descripcionObjeto || "—"}
              </p>
              <p className="text-xs text-slate-400 mt-3 font-inter italic">
                Código:{" "}
                <span className="font-mono font-semibold text-slate-600">
                  {data.codigoNomenclatura || "—"}
                </span>
              </p>
            </CardContent>
          </Card>

          {/* Monto Estimado (1/3) */}
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="pb-2 pt-5 px-6">
              <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider font-inter">
                Monto estimado de contratación
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-3">
              <div>
                <p className="text-xs text-slate-400 font-inter italic">Valor UCAU</p>
                <p className="text-2xl font-bold text-heading-dark font-inter tabular-nums">
                  {ucau != null ? formatMoney(ucau) : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-inter italic">Bolívares (Bs.)</p>
                <p className="text-xl font-bold text-heading-dark font-inter tabular-nums">
                  {formatMoney(data.modalidad?.montoEstimadoBs)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-inter italic flex items-center gap-1">
                  <DollarSign className="w-3 h-3" /> Dólares (USD)
                </p>
                <p className="text-lg font-bold text-heading-dark font-inter tabular-nums">
                  $ {formatMoney(data.modalidad?.montoEstimadoDolar)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Máxima Autoridad */}
          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="px-6 py-5">
              <p className="text-xs text-slate-400 font-inter italic mb-1">Máxima Autoridad</p>
              <p className="text-base font-semibold text-heading-dark font-inter">
                {data.autoridad?.nombreCompletoAutoridad ?? "—"}
              </p>
              <p className="text-xs text-slate-500 font-inter mt-0.5">
                {data.autoridad?.cargoOficialAutoridad ?? ""}
              </p>
            </CardContent>
          </Card>

          {/* Responsable Unidad Usuaria */}
          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="px-6 py-5">
              <p className="text-xs text-slate-400 font-inter italic mb-1">
                Responsable Unidad Usuaria
              </p>
              <p className="text-base font-semibold text-heading-dark font-inter">
                {data.unidadUsuaria?.nombreResponsableUnidadUsuaria ?? "—"}
              </p>
              <p className="text-xs text-slate-500 font-inter mt-0.5">
                {data.unidadUsuaria?.nombreUnidadUsuaria ?? ""}
              </p>
            </CardContent>
          </Card>

          {/* Fecha del Llamado */}
          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="px-6 py-5">
              <p className="text-xs text-slate-400 font-inter italic mb-1">Fecha del Llamado</p>
              <div className="flex items-center gap-2 mt-1">
                <CalendarDays className="w-4 h-4 text-navy" />
                <p className="text-base font-bold text-heading-dark font-inter">
                  {rawCronograma?.fechaLlamadoParticipar
                    ? formatDate(rawCronograma.fechaLlamadoParticipar)
                    : "—"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Comisión de Contrataciones — solo miembros principales */}
          <Card className="col-span-1 lg:col-span-3 border border-slate-200 shadow-sm">
            <CardHeader className="pb-2 pt-5 px-6">
              <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider font-inter flex items-center gap-2">
                <Users className="w-4 h-4" /> Comisión de Contrataciones
              </CardTitle>
              {data.comision?.denominacionComision && (
                <p className="text-xs text-slate-400 font-inter italic mt-1">
                  {data.comision.denominacionComision}
                </p>
              )}
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="flex flex-wrap gap-6">
                {miembrosPrincipales.map((m) => (
                  <div key={m.id} className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 bg-navy text-white text-xs font-bold">
                      <AvatarFallback className="bg-navy text-white text-xs font-bold">
                        {getInitials(m.nombreCompletoMiembro)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-heading-dark font-inter capitalize">
                        {m.nombreCompletoMiembro}
                      </p>
                      <p className="text-xs text-slate-400 font-inter italic">
                        {TIPO_AREA[m.areaRepresentacion] ?? m.areaRepresentacion} ·{" "}
                        {TIPO_MIEMBRO[m.tipoMiembro] ?? m.tipoMiembro}
                      </p>
                    </div>
                  </div>
                ))}
                {miembrosPrincipales.length === 0 && (
                  <p className="text-sm text-slate-400 italic font-inter">
                    Sin miembros principales registrados.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Botones de acción: Editar Ficha  ── */}
        <div className="flex justify-end">
          <Button
            onClick={() => router.push(`/elaboracion-expediente/${data.id}/editar`)}
            className="bg-navy hover:bg-navy-hover text-white font-inter font-semibold text-sm flex items-center gap-2 px-5 py-2.5 rounded-lg shadow-sm"
          >
            <Pencil className="w-4 h-4" />
            Editar Ficha
          </Button>
        </div>

        {/* ── Calendario de Actividades ── */}
        {/* El título y la navegación de meses ya los provee PlanificacionStep internamente. */}
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="px-6 pb-6 pt-4">
            <PlanificacionStep
              events={calendarEvents}
              initialMonth={initialMonth}
              onBack={() => {}}
              onFinish={() => {}}
              onEventDrop={handleEventDrop}
              isLoading={false}
              hideButtons
            />
          </CardContent>
        </Card>

        {/* ── Botón Guardar Cronograma — alineado a la derecha ── */}
        {cronogramaData && (
          <div className="flex justify-end">
            <Button
              onClick={handleGuardarCronograma}
              disabled={isSaving}
              className="bg-navy hover:bg-navy-hover text-white font-inter font-semibold text-sm flex items-center gap-2 px-5 py-2.5 rounded-lg shadow-sm"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Guardando..." : "Guardar cambios del cronograma"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

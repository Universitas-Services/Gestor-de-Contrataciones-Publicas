"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Package,
  Wrench,
  HardHat,
  FileText,
  Pencil,
  CalendarDays,
  Save,
  Users,
  Scale,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Fase1Panel } from "./fase-1/Fase1Panel";
import { Fase1InicialPanel } from "@/components/features-components/GestionExpedientes/fase1/Fase1InicialPanel";
import { Fase2Panel } from "@/components/features-components/GestionExpedientes/fase2/Fase2Panel";
import { Fase3Panel } from "./fase3/Fase3Panel";
import { Fase4Panel } from "./fase4/Fase4Panel";
import { EditarFichaModal } from "@/components/features-components/GestionExpedientes/EditarFichaModal";
import { MontoEstimadoCard } from "@/components/features-components/GestionExpedientes/MontoEstimadoCard";
import { useHeaderTitleOverride } from "@/components/shared/HeaderTitleContext";

import type {
  ExpedienteResponse,
  CronogramaData,
  UnidadContratanteData,
} from "@/services/expedienteService";
import type { CronogramaFormValues } from "@/lib/schemas/expedienteSchema";
import type { TipoContratacionBackend } from "@/lib/schemas/expedienteSchema";
import type { Fase1TabValue } from "@/types/fase1.types";
import { guardarCronograma } from "@/services/expedienteService";
import { obtenerUnidadContratante } from "@/services/unidadContratanteService";
import { isFechaEditable, moverFechaCronograma } from "@/lib/utils/cronogramaUtils";
import type { IEvent } from "./calendar/types";
import { PlanificacionStep } from "./steps/PlanificacionStep";
import { useDiasNoLaborables } from "@/hooks/useDiasNoLaborables";
import { useDeclaratoriaDesierto } from "@/hooks/useDeclaratoriaDesierto";
import { getYearRangeForCronograma } from "@/lib/utils/diasNoLaborablesUtils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  getFechaAnclaLabel,
  getModalidadDisplayLabel,
  isConsultaPrecios,
  isContratacionDirecta,
  isConcursoAbiertoActoUnico,
  isConcursoCerrado,
  isModalidadExcluida,
  muestraBloqueCausal,
  muestraUnidadContratante,
} from "@/lib/modalidades/modalidadDisplay";
import { putToCronogramaMe } from "@/lib/modalidades/mapCronogramaApi";
import { LEGEND_ITEMS_CD } from "@/lib/utils/cronogramaEventsCd";
import { LEGEND_ITEMS_CC } from "@/lib/utils/cronogramaEventsCc";
import { LEGEND_ITEMS_CP } from "@/lib/utils/cronogramaEventsCp";
import { PlanificacionModalidadesExcluidasStep } from "@/components/features-components/GestionExpedientes/steps/PlanificacionModalidadesExcluidasStep";

function resolveUcFromApi(
  raw: Record<string, unknown> | null | undefined
): UnidadContratanteData | null {
  if (!raw) return null;
  const id = raw.id != null ? String(raw.id) : "";
  const nombreUnidad =
    (raw.nombreUnidadContratante as string | undefined) ||
    (raw.nombre as string | undefined) ||
    undefined;
  const nombreResponsable =
    (raw.nombreResponsableUnidadContratante as string | undefined) ||
    (raw.nombreResponsableUnidad as string | undefined) ||
    undefined;
  const cargo =
    (raw.cargoResponsableUnidadContratante as string | undefined) ||
    (raw.cargoResponsable as string | undefined) ||
    undefined;
  if (!nombreUnidad && !nombreResponsable) return id ? { id } : null;
  return {
    id,
    nombreUnidadContratante: nombreUnidad,
    nombreResponsableUnidadContratante: nombreResponsable,
    cargoResponsableUnidadContratante: cargo,
  };
}

// ─── Helpers ───────────────────────────────────────────────────────────

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

const FASES_ELABORACION = [
  "Fase 0: Ficha Técnica",
  "Fase 1: Preparatoria",
  "Fase 2: Gestión participantes",
  "Fase 3: Análisis y recomendaciones",
  "Fase 4: Decisión y formalización",
];

const FASES_GESTION = [
  "Fase 0: Ficha Técnica",
  "Fase 1: Inicial",
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

// ─── Tabs desde query ?tab= ────────────────────────────────────────────

const VALID_FASE_TABS: Fase1TabValue[] = ["fase-0", "fase-1", "fase-2", "fase-3", "fase-4"];

function resolveTabFromParam(
  tabParam: string | null,
  fallback: Fase1TabValue = "fase-0"
): Fase1TabValue {
  if (!tabParam) return fallback;
  if (VALID_FASE_TABS.includes(tabParam as Fase1TabValue)) {
    return tabParam as Fase1TabValue;
  }
  const match = tabParam.match(/fase-?(\d+)/i);
  if (match) {
    const value = `fase-${match[1]}` as Fase1TabValue;
    if (VALID_FASE_TABS.includes(value)) return value;
  }
  return fallback;
}

// ─── Component ─────────────────────────────────────────────────────────

interface Props {
  data: ExpedienteResponse;
  initialTab?: Fase1TabValue;
  readOnly?: boolean;
  /** Base de ruta para tabs / editar. Default: ruta legacy. */
  basePath?: string;
}

export function ExpedienteDetalle({
  data,
  initialTab = "fase-0",
  readOnly = false,
  basePath = "/gestion-expedientes",
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setOverrideTitle } = useHeaderTitleOverride();
  const [activeTab, setActiveTab] = useState<Fase1TabValue>(() =>
    resolveTabFromParam(searchParams.get("tab"), initialTab)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [editarFichaOpen, setEditarFichaOpen] = useState(false);

  const enableDeclaratoriaDesierto = basePath === "/gestion-expedientes";
  const enableParticipantesEvaluacion = basePath === "/gestion-expedientes";
  const declaratoriaDesiertoSeed = useMemo(
    () =>
      enableDeclaratoriaDesierto
        ? {
            causalDeclaratoriaDesierto: data.causalDeclaratoriaDesierto,
            justificacionDeclaratoriaDesierto: data.justificacionDeclaratoriaDesierto,
            estatusProceso: data.estatusProceso,
          }
        : null,
    [
      enableDeclaratoriaDesierto,
      data.causalDeclaratoriaDesierto,
      data.justificacionDeclaratoriaDesierto,
      data.estatusProceso,
    ]
  );
  const { isDesierto } = useDeclaratoriaDesierto(
    enableDeclaratoriaDesierto ? data.id : "",
    declaratoriaDesiertoSeed
  );
  const fasesPosterioresBloqueadas = enableDeclaratoriaDesierto && isDesierto;
  const fasesLabels = useMemo(
    () => (basePath === "/gestion-expedientes" ? FASES_GESTION : FASES_ELABORACION),
    [basePath]
  );
  const isGestionFlow = basePath === "/gestion-expedientes";

  useEffect(() => {
    const nomenclatura = data.codigoNomenclatura?.trim();
    setOverrideTitle(nomenclatura || "Detalle del expediente");

    return () => {
      setOverrideTitle(null);
    };
  }, [data.codigoNomenclatura, setOverrideTitle]);

  useEffect(() => {
    setActiveTab(resolveTabFromParam(searchParams.get("tab"), initialTab));
  }, [searchParams, initialTab]);

  useEffect(() => {
    if (fasesPosterioresBloqueadas && (activeTab === "fase-3" || activeTab === "fase-4")) {
      setActiveTab("fase-2");
      router.replace(`${basePath}/${data.id}?tab=fase-2`, { scroll: false });
    }
  }, [fasesPosterioresBloqueadas, activeTab, basePath, data.id, router]);

  const handleTabChange = (value: string) => {
    const tab = value as Fase1TabValue;
    if (fasesPosterioresBloqueadas && (tab === "fase-3" || tab === "fase-4")) {
      toast.error(
        "El procedimiento fue declarado desierto. No es posible avanzar a las fases 3 y 4."
      );
      return;
    }
    setActiveTab(tab);
    router.replace(`${basePath}/${data.id}?tab=${tab}`, { scroll: false });
  };

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

  const cronogramaRange = useMemo(() => {
    if (!cronogramaData) {
      const year = new Date().getFullYear();
      return { desde: `${year}-01-01`, hasta: `${year + 1}-12-31` };
    }
    const fechas = Object.entries(cronogramaData)
      .filter(([key, value]) => key.startsWith("fecha") && typeof value === "string")
      .map(([, value]) => value as string);
    return getYearRangeForCronograma(fechas);
  }, [cronogramaData]);

  const { nonWorkingDays, feriadoDescriptions } = useDiasNoLaborables(
    cronogramaRange.desde,
    cronogramaRange.hasta
  );

  // Datos del expediente
  const tipoRaw = data.modalidad?.tipoContratacion ?? "";
  const tipoLabel = TIPO_DISPLAY[tipoRaw] ?? tipoRaw;
  const modalidadCode = data.modalidad?.modalidadSeleccion ?? "";
  const modalidadLabel = getModalidadDisplayLabel(modalidadCode);
  const fechaAnclaLabel = getFechaAnclaLabel(modalidadCode);
  const isCaActoUnico = isConcursoAbiertoActoUnico(modalidadCode);
  const isMe = isModalidadExcluida(modalidadCode);
  const comisionOmitida =
    isMe ||
    ((isContratacionDirecta(modalidadCode) || isConsultaPrecios(modalidadCode)) && !data.comision);
  const showComisionCard =
    isMe ||
    isContratacionDirecta(modalidadCode) ||
    isConsultaPrecios(modalidadCode) ||
    Boolean(data.comision);
  const legendItems = isContratacionDirecta(modalidadCode)
    ? LEGEND_ITEMS_CD
    : isConcursoCerrado(modalidadCode)
      ? LEGEND_ITEMS_CC
      : isConsultaPrecios(modalidadCode)
        ? LEGEND_ITEMS_CP
        : undefined;

  const causalTexto = (() => {
    if (isContratacionDirecta(modalidadCode) && data.causalProcedenciaCd) {
      const num = data.numeralCausalProcedenciaCd
        ? `Art. 101, Num. ${data.numeralCausalProcedenciaCd}: `
        : "";
      return `${num}${data.causalProcedenciaCd}`;
    }
    if (isConcursoCerrado(modalidadCode) && data.causalProcedenciaCc) {
      return String(data.causalProcedenciaCc);
    }
    if (isConsultaPrecios(modalidadCode) && data.causalProcedenciaCp) {
      return String(data.causalProcedenciaCp);
    }
    if (isMe && data.causalProcedenciaMe) {
      return String(data.causalProcedenciaMe);
    }
    return null;
  })();

  const showCausal = muestraBloqueCausal(modalidadCode) && Boolean(causalTexto);
  const showUc =
    muestraUnidadContratante(modalidadCode) &&
    Boolean(data.unidadContratante || data.unidadContratanteId);

  const ucFromData = useMemo(
    () =>
      resolveUcFromApi(data.unidadContratante as unknown as Record<string, unknown> | undefined),
    [data.unidadContratante]
  );
  const [ucResolved, setUcResolved] = useState<UnidadContratanteData | null>(ucFromData);
  const ucId = data.unidadContratanteId ?? ucFromData?.id;

  useEffect(() => {
    if (!showUc) {
      setUcResolved(null);
      return;
    }
    if (ucFromData?.nombreUnidadContratante || ucFromData?.nombreResponsableUnidadContratante) {
      setUcResolved(ucFromData);
      return;
    }
    if (!ucId) {
      setUcResolved(ucFromData);
      return;
    }
    let cancelled = false;
    obtenerUnidadContratante(ucId)
      .then((raw) => {
        if (cancelled) return;
        setUcResolved(resolveUcFromApi(raw as Record<string, unknown>) ?? { id: String(ucId) });
      })
      .catch(() => {
        if (!cancelled) setUcResolved(ucFromData);
      });
    return () => {
      cancelled = true;
    };
  }, [showUc, ucId, ucFromData]);

  const ucNombre =
    ucResolved?.nombreResponsableUnidadContratante || ucResolved?.nombreUnidadContratante || null;
  const ucSubtitulo =
    ucResolved?.nombreResponsableUnidadContratante && ucResolved?.nombreUnidadContratante
      ? ucResolved.nombreUnidadContratante
      : ucResolved?.cargoResponsableUnidadContratante || "";

  const cronogramaMe = useMemo(
    () => (isMe ? putToCronogramaMe(cronogramaData) : null),
    [isMe, cronogramaData]
  );
  // Mapear los estados de Swagger a los 3 visuales solicitados
  const getEstadoVisual = (estatus: string) => {
    switch (estatus) {
      case "CONTRATADO":
        return {
          label: "Contratado",
          className: "bg-slate-100 text-slate-700 border-slate-300",
        };
      case "ANULADO":
        return {
          label: "Anulado",
          className: "bg-red-100 text-red-700 border-red-300",
        };
      default:
        // BORRADOR, EN_PREPARACION, PUBLICADO, EN_EVALUACION, ADJUDICADO, etc. -> Activo
        return {
          label: "Activo",
          className: "bg-green-100 text-green-700 border-green-300",
        };
    }
  };
  const estado = getEstadoVisual(data.estatusProceso);
  const shortId = data.id?.slice(0, 8).toUpperCase() ?? "—";

  // Solo miembros principales (PRESIDENTE o MIEMBRO_PRINCIPAL)
  const miembrosPrincipales = (data.comision?.miembros ?? []).filter(
    (m) => m.tipoMiembro === "PRESIDENTE" || m.tipoMiembro === "MIEMBRO_PRINCIPAL"
  );

  // ─── D&D handler ───────────────────────────────────────────────────
  const handleEventDrop = (eventId: string, diffInDays: number) => {
    if (readOnly) return;
    if (!cronogramaData || diffInDays === 0) return;
    const tipo = (tipoRaw as TipoContratacionBackend) || "BIENES";
    const result = moverFechaCronograma(
      cronogramaData as unknown as Record<string, unknown>,
      eventId,
      diffInDays,
      tipo,
      nonWorkingDays
    );
    if (!result.success) {
      if (result.errorMsg) toast.error(result.errorMsg);
      return;
    }
    if (result.warningMsg) toast.warning(result.warningMsg, { duration: 8000 });
    if (result.newCronograma) {
      setCronogramaData(result.newCronograma as CronogramaFormValues);
      setCalendarEvents(cronogramaToEvents(result.newCronograma));
      setIsDirty(true);
    }
  };

  // ─── Guardar cronograma ───────────────────────────────────────────
  const handleGuardarCronograma = async () => {
    if (readOnly) return;
    if (!cronogramaData) return;
    setIsSaving(true);
    try {
      await guardarCronograma(data.id, cronogramaData);
      toast.success("Cronograma actualizado exitosamente.");
      setIsDirty(false);
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
                  <h2 className="text-2xl font-bold font-inter tracking-wide">
                    EXP-{data.codigoNomenclatura ?? shortId}
                  </h2>
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
                  <span>Progreso del expediente</span>
                  <span className="font-bold text-white">15%</span>
                </div>
                {/* bg-slate-600 es el track, la barra interna usa --progress-bar definido en globals.css */}
                <Progress
                  value={15}
                  className="h-1.5 bg-slate-600 [&>div]:bg-[var(--progress-bar)]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Tabs — una sola línea; texto truncado + tooltip con nombre completo ── */}
        <div className="w-full min-w-0">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full min-w-0">
            <TabsList className="flex h-11 w-full min-w-0 flex-nowrap gap-1 rounded-xl border border-slate-200/80 bg-slate-50 p-1 shadow-inner">
              {fasesLabels.map((fase, i) => {
                const tabValue = `fase-${i}` as Fase1TabValue;
                const isFaseBloqueada =
                  fasesPosterioresBloqueadas && (tabValue === "fase-3" || tabValue === "fase-4");
                const trigger = (
                  <TabsTrigger
                    value={tabValue}
                    disabled={isFaseBloqueada}
                    className={[
                      "relative h-full w-full min-w-0 flex-1 overflow-hidden rounded-lg border border-transparent px-2 text-[12px] font-semibold transition-all duration-200 ease-in-out sm:text-[13px]",
                      "justify-center bg-transparent text-slate-500 shadow-none after:hidden",
                      "hover:bg-white/80 hover:text-slate-700 hover:shadow-sm",
                      "data-[state=active]:border-navy/15 data-[state=active]:bg-navy data-[state=active]:text-white data-[state=active]:shadow-sm",
                      "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none",
                      isFaseBloqueada ? "cursor-not-allowed opacity-40" : "",
                    ].join(" ")}
                  >
                    <span className="block w-full truncate text-center">{fase}</span>
                  </TabsTrigger>
                );

                return (
                  <Tooltip key={i} delayDuration={200}>
                    <TooltipTrigger asChild>
                      {/* span: el trigger disabled no emite hover; además reparte el ancho entre pestañas */}
                      <span className="min-w-0 flex-1">{trigger}</span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-center text-xs">
                      <p className="font-medium">{fase}</p>
                      {isFaseBloqueada ? (
                        <p className="mt-1 text-muted-foreground">
                          Procedimiento declarado desierto: las fases 3 y 4 no están disponibles.
                        </p>
                      ) : null}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </TabsList>

            {/* ── TabsContent: Fase 0 — Ficha Técnica ── */}
            <TabsContent value="fase-0" className="mt-6">
              {/* ── Grid Principal ── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Objeto del Procedimiento (2/3) */}
                <Card className="col-span-1 min-w-0 overflow-hidden lg:col-span-2 border border-slate-200 shadow-sm">
                  <CardHeader className="pb-2 pt-5 px-6">
                    <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider font-inter">
                      Objeto del Procedimiento
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="min-w-0 px-6 pb-6">
                    <p className="break-words text-sm leading-relaxed text-slate-700 font-inter [overflow-wrap:anywhere]">
                      {data.descripcionObjeto || "—"}
                    </p>
                    <p className="text-xs text-slate-400 mt-3 font-inter italic">
                      Código:{" "}
                      <span className="font-mono font-semibold text-slate-600 break-all">
                        {data.codigoNomenclatura || "—"}
                      </span>
                    </p>
                  </CardContent>
                </Card>

                {/* Monto Estimado (1/3) */}
                <MontoEstimadoCard
                  data={data}
                  readOnly={readOnly}
                  enableRecalculoTasa={basePath === "/gestion-expedientes"}
                />

                {/* Causal legal — CC / CP / CD / ME cuando hay texto */}
                {showCausal && causalTexto && (
                  <Card className="col-span-1 lg:col-span-3 border border-slate-200 shadow-sm border-l-4 border-l-navy">
                    <CardContent className="px-6 py-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Scale className="w-4 h-4 text-navy shrink-0" />
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-inter">
                          Causal Legal de Procedencia
                        </p>
                      </div>
                      <p className="text-sm text-heading-dark font-inter leading-relaxed">
                        {causalTexto}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Actores + fecha ancla: 4 en línea cuando hay UC (CD/CP) */}
                <div
                  className={`col-span-1 lg:col-span-3 grid grid-cols-1 gap-3 ${
                    showUc ? "sm:grid-cols-2 lg:grid-cols-4" : "lg:grid-cols-3"
                  }`}
                >
                  <Card className="border border-slate-200 shadow-sm min-w-0">
                    <CardContent className="px-4 py-4">
                      <p className="text-xs text-slate-400 font-inter italic mb-1">
                        Máxima Autoridad
                      </p>
                      <p className="text-sm font-semibold text-heading-dark font-inter truncate">
                        {data.autoridad?.nombreCompletoAutoridad ?? "—"}
                      </p>
                      <p className="text-xs text-slate-500 font-inter mt-0.5 truncate">
                        {data.autoridad?.cargoOficialAutoridad ?? ""}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border border-slate-200 shadow-sm min-w-0">
                    <CardContent className="px-4 py-4">
                      <p className="text-xs text-slate-400 font-inter italic mb-1">
                        Responsable Unidad Usuaria
                      </p>
                      <p className="text-sm font-semibold text-heading-dark font-inter truncate">
                        {data.unidadUsuaria?.nombreResponsableUnidadUsuaria ?? "—"}
                      </p>
                      <p className="text-xs text-slate-500 font-inter mt-0.5 truncate">
                        {data.unidadUsuaria?.nombreUnidadUsuaria ?? ""}
                      </p>
                    </CardContent>
                  </Card>

                  {showUc && (
                    <Card className="border border-slate-200 shadow-sm min-w-0">
                      <CardContent className="px-4 py-4">
                        <p className="text-xs text-slate-400 font-inter italic mb-1">
                          Unidad Contratante
                        </p>
                        <p className="text-sm font-semibold text-heading-dark font-inter truncate">
                          {ucNombre ?? "—"}
                        </p>
                        {ucSubtitulo ? (
                          <p className="text-xs text-slate-500 font-inter mt-0.5 truncate">
                            {ucSubtitulo}
                          </p>
                        ) : null}
                      </CardContent>
                    </Card>
                  )}

                  <Card className="border border-slate-200 shadow-sm min-w-0">
                    <CardContent className="px-4 py-4">
                      <p className="text-xs text-slate-400 font-inter italic mb-1">
                        {fechaAnclaLabel}
                      </p>
                      <div className="flex items-center gap-2 mt-1 min-w-0">
                        <CalendarDays className="w-4 h-4 text-navy shrink-0" />
                        <p className="text-sm font-bold text-heading-dark font-inter truncate">
                          {rawCronograma?.fechaLlamadoParticipar
                            ? formatDate(rawCronograma.fechaLlamadoParticipar)
                            : "—"}
                        </p>
                      </div>
                      {basePath === "/gestion-expedientes" &&
                        !rawCronograma?.fechaLlamadoParticipar && (
                          <p className="mt-2 text-xs text-amber-700 font-inter">
                            Complete la fecha desde Editar ficha
                          </p>
                        )}
                    </CardContent>
                  </Card>
                </div>

                {/* Comisión de Contrataciones — miembros u omitida */}
                {showComisionCard && (
                  <Card
                    className={`col-span-1 lg:col-span-3 border border-slate-200 shadow-sm ${
                      comisionOmitida ? "bg-slate-50/80" : ""
                    }`}
                  >
                    <CardHeader className="pb-2 pt-5 px-6">
                      <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider font-inter flex items-center gap-2">
                        <Users className="w-4 h-4" /> Comisión de Contrataciones
                      </CardTitle>
                      {!comisionOmitida && data.comision?.denominacionComision && (
                        <p className="text-xs text-slate-400 font-inter italic mt-1">
                          {data.comision.denominacionComision}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className="px-6 pb-6">
                      {comisionOmitida ? (
                        <p className="text-sm text-slate-500 italic font-inter flex items-start gap-2">
                          <Info className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
                          <span>
                            Intervención de la Comisión <strong>omitida</strong>.
                            {isMe
                              ? " Adjudicación directa por la Máxima Autoridad según mandato de Ley."
                              : " No requerida por umbral UCAU para esta contratación."}
                          </span>
                        </p>
                      ) : (
                        <div className="flex min-w-0 flex-nowrap gap-3">
                          {miembrosPrincipales.map((m) => {
                            const areaLabel =
                              TIPO_AREA[m.areaRepresentacion] ?? m.areaRepresentacion;
                            const tipoLabel = TIPO_MIEMBRO[m.tipoMiembro] ?? m.tipoMiembro;
                            const rolLabel = `${areaLabel} · ${tipoLabel}`;

                            return (
                              <div key={m.id} className="flex min-w-0 flex-1 items-center gap-2">
                                <Avatar className="h-9 w-9 shrink-0 bg-navy text-white text-xs font-bold">
                                  <AvatarFallback className="bg-navy text-white text-xs font-bold">
                                    {getInitials(m.nombreCompletoMiembro)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <p className="truncate text-sm font-semibold text-heading-dark font-inter capitalize cursor-default">
                                        {m.nombreCompletoMiembro}
                                      </p>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs text-center text-xs capitalize">
                                      {m.nombreCompletoMiembro}
                                    </TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <p className="truncate text-xs text-slate-400 font-inter italic cursor-default">
                                        {rolLabel}
                                      </p>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs text-center text-xs">
                                      {rolLabel}
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              </div>
                            );
                          })}
                          {miembrosPrincipales.length === 0 && (
                            <p className="text-sm text-slate-400 italic font-inter">
                              Sin miembros principales registrados.
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* ── Botones de acción: cronograma + editar ficha ── */}
              {!readOnly && (
                <div className="flex justify-end gap-3 mt-6 mb-2">
                  {cronogramaData && !isMe && (
                    <Button
                      onClick={handleGuardarCronograma}
                      disabled={isSaving || !isDirty}
                      className="bg-navy hover:bg-navy-hover text-white font-inter font-semibold text-sm flex items-center gap-2 px-5 py-2.5 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? "Guardando..." : "Guardar cambios del cronograma"}
                    </Button>
                  )}
                  <Button
                    onClick={() => setEditarFichaOpen(true)}
                    className="bg-navy hover:bg-navy-hover text-white font-inter font-semibold text-sm flex items-center gap-2 px-5 py-2.5 rounded-lg shadow-sm"
                  >
                    <Pencil className="w-4 h-4" />
                    Editar ficha
                  </Button>
                </div>
              )}

              {/* ── Calendario o flujo lineal ME ── */}
              <Card className="border border-slate-200 shadow-sm">
                <CardContent className="px-6 pb-6 pt-4">
                  {isMe ? (
                    cronogramaMe ? (
                      <PlanificacionModalidadesExcluidasStep
                        cronograma={cronogramaMe}
                        onCronogramaChange={() => {}}
                        onBack={() => {}}
                        onFinish={() => {}}
                        readOnly
                        hideButtons
                      />
                    ) : (
                      <p className="text-sm text-slate-400 italic font-inter py-8 text-center">
                        Sin cronograma de flujo directo registrado.
                      </p>
                    )
                  ) : (
                    <PlanificacionStep
                      events={calendarEvents}
                      initialMonth={initialMonth}
                      onBack={() => {}}
                      onFinish={() => {}}
                      onEventDrop={readOnly ? undefined : handleEventDrop}
                      isLoading={false}
                      hideButtons
                      nonWorkingDays={nonWorkingDays}
                      feriadoDescriptions={feriadoDescriptions}
                      legendItems={legendItems}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fase-1" className="mt-6">
              {isCaActoUnico ? (
                isGestionFlow ? (
                  <Fase1InicialPanel
                    expedienteId={data.id}
                    fase1Creada={Boolean(data["fasePreparatoria"])}
                    readOnly={readOnly}
                    basePath={basePath}
                  />
                ) : (
                  <Fase1Panel
                    expedienteId={data.id}
                    fase1Creada={Boolean(data["fasePreparatoria"])}
                    readOnly={readOnly}
                    basePath={basePath}
                    tipoContratacion={
                      (data.modalidad?.tipoContratacion as TipoContratacionBackend | undefined) ??
                      undefined
                    }
                  />
                )
              ) : (
                <Card className="border border-slate-200 shadow-sm">
                  <CardContent className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
                    <Info className="h-8 w-8 text-slate-400" />
                    <p className="text-sm font-semibold text-slate-700">
                      {isGestionFlow ? "Fase inicial" : "Fase preparatoria"} disponible solo para
                      Concurso Abierto, Acto Único Apertura Única
                    </p>
                    <p className="max-w-md text-sm text-slate-500">
                      Este flujo de carga de datos de la{" "}
                      {isGestionFlow ? "fase inicial" : "fase preparatoria"} aplica únicamente a esa
                      modalidad. La modalidad actual es{" "}
                      <span className="font-medium text-slate-600">{modalidadLabel}</span>.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* ── TabsContent: Fase 2 — Gestión participantes ── */}
            <TabsContent value="fase-2" className="mt-6">
              <Fase2Panel
                expedienteId={data.id}
                readOnly={readOnly}
                enableDeclaratoriaDesierto={enableDeclaratoriaDesierto}
                enableParticipantesEvaluacion={enableParticipantesEvaluacion}
                basePath={basePath}
                declaratoriaDesiertoSeed={declaratoriaDesiertoSeed}
              />
            </TabsContent>

            {/* ── TabsContent: Fase 3 — Análisis y recomendaciones ── */}
            <TabsContent value="fase-3" className="mt-6">
              <Fase3Panel expedienteId={data.id} readOnly={readOnly} />
            </TabsContent>

            {/* ── TabsContent: Fase 4 — Decisión y formalización ── */}
            <TabsContent value="fase-4" className="mt-6">
              <Fase4Panel
                expedienteId={data.id}
                readOnly={readOnly}
                montoEstimadoBs={data.modalidad?.montoEstimadoBs}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {!readOnly && (
        <EditarFichaModal
          open={editarFichaOpen}
          onOpenChange={setEditarFichaOpen}
          expediente={data}
        />
      )}
    </div>
  );
}

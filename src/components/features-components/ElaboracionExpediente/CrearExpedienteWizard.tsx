"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import { DatosBasicosStep } from "./steps/DatosBasicosStep";
import { AnalisisModalidadStep } from "./steps/AnalisisModalidadStep";
import { ConfiguracionActoresStep } from "./steps/ConfiguracionActoresStep";
import { PlanificacionStep } from "./steps/PlanificacionStep";
import {
  datosBasicosSchema,
  VALOR_UCAU_ACTUAL,
  MODALIDAD_SUGERIDA,
  BASE_LEGAL,
} from "@/lib/schemas/expedienteSchema";
import type {
  DatosBasicosFormValues,
  ConfiguracionActoresFormValues,
  CronogramaFormValues,
} from "@/lib/schemas/expedienteSchema";
import type { AnalisisModalidad } from "@/types/expediente.types";
import {
  crearExpedienteBorrador,
  editarExpediente,
  guardarCronograma,
  obtenerExpediente,
} from "@/services/expedienteService";
import type { IEvent } from "./calendar/types";

// ─── Step meta ───────────────────────────────────────────────────────

const STEP_META = [
  {
    title: "Creación de nuevo expediente",
    description:
      "Ingrese los datos básicos del procedimiento para determinar la modalidad de contratación y calcular los lapsos legales.",
  },
  {
    title: "Análisis de modalidad sugerida",
    description:
      "Verifique los datos financieros calculados. El sistema ha determinado la modalidad legal aplicable basándose en el valor UCAU actual.",
  },
  {
    title: "Configuración de actores y tiempos",
    description:
      "Seleccione las autoridades que intervendrán en el procedimiento y defina la fecha del llamado para proyectar el cronograma.",
  },
  {
    title: "Planificación del procedimiento",
    description:
      "Visualice y ajuste los lapsos del procedimiento. Arrastre los eventos para modificar las fechas respetando las validaciones legales.",
  },
];

const TIPO_DISPLAY: Record<string, string> = {
  OBRAS: "Obras",
  BIENES: "Bienes",
  SERVICIOS: "Servicios",
};

// ─── CSS var suffix por campo del cronograma ─────────────────────────
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

// ─── Los campos de pliego se fusionan en un único evento de rango ────
const PLIEGO_INICIO = "fechaInicioDisponibilidadPliego";
const PLIEGO_FIN = "fechaFinDisponibilidadPliego";

function cronogramaToEvents(cronograma: Record<string, unknown>): IEvent[] {
  const events: IEvent[] = [];

  // Pliego: evento de rango inicio→fin
  const pInicio = cronograma[PLIEGO_INICIO];
  const pFin = cronograma[PLIEGO_FIN];
  if (pInicio && pFin) {
    events.push({
      id: "rango-pliego",
      title: "Disponibilidad del Pliego",
      startDate: (pInicio as string).split("T")[0],
      endDate: (pFin as string).split("T")[0],
      colorVar: "cal-disponibilidad",
    });
  }

  // Resto de campos (excluir pliego)
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
      });
    });

  return events;
}

// ─── Component ───────────────────────────────────────────────────────

export function CrearExpedienteWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Borrador creado en paso 2 "Confirmar"
  const [expedienteId, setExpedienteId] = useState<string | null>(null);

  // Datos calculados para el paso 2 (se recrean en cada paso 1 → 2)
  const [analisisData, setAnalisisData] = useState<AnalisisModalidad | null>(null);

  // Cronograma generado para paso 4
  const [cronogramaData, setCronogramaData] = useState<CronogramaFormValues | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<IEvent[]>([]);
  const [calendarInitialMonth, setCalendarInitialMonth] = useState<Date>(new Date(2026, 2, 1));

  // ─── Form Paso 1 (se mantiene vivo durante todo el wizard) ──────
  const datosBasicosForm = useForm<DatosBasicosFormValues>({
    resolver: zodResolver(datosBasicosSchema),
    defaultValues: {
      descripcionObjeto: "",
      codigoNomenclatura: "",
      tipoContratacion: undefined,
      montoEstimadoBs: undefined,
      montoEstimadoDolar: undefined,
    },
  });

  // ─── Navigation helpers ──────────────────────────────────────────
  const goToStep = (step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const buildAnalisis = (fd: DatosBasicosFormValues): AnalisisModalidad => ({
    objetoProceso: fd.descripcionObjeto,
    tipoContratacion: TIPO_DISPLAY[fd.tipoContratacion] ?? fd.tipoContratacion,
    montoUCAU: fd.montoEstimadoBs / VALOR_UCAU_ACTUAL,
    montoBs: fd.montoEstimadoBs,
    montoDolares: fd.montoEstimadoDolar,
    modalidadSugerida: MODALIDAD_SUGERIDA,
    baseLegal: BASE_LEGAL,
  });

  // ─── Paso 1 "Siguiente" — solo valida y navega, sin API ─────────
  const handleStep1Next = async (formData: DatosBasicosFormValues) => {
    setAnalisisData(buildAnalisis(formData));
    goToStep(2);
  };

  // ─── Paso 2 "Editar" — vuelve sin API (form RHF preserva datos) ─
  const handleStep2Edit = () => {
    goToStep(1);
  };

  // ─── Paso 2 "Confirmar" — POST /expedientes/borrador ────────────
  const handleStep2Confirm = async () => {
    setIsLoading(true);
    try {
      const formData = datosBasicosForm.getValues();

      // Si ya existe un expediente, lo editamos en lugar de crear otro
      if (expedienteId) {
        await editarExpediente(expedienteId, {
          descripcionObjeto: formData.descripcionObjeto,
          codigoNomenclatura: formData.codigoNomenclatura,
          tipoContratacion: formData.tipoContratacion,
          montoEstimadoBs: formData.montoEstimadoBs,
          montoEstimadoDolar: formData.montoEstimadoDolar,
          valorUcauBase: VALOR_UCAU_ACTUAL,
          modalidadSeleccion: "LICITACION_PUBLICA",
        });
        goToStep(3);
      } else {
        const result = await crearExpedienteBorrador(formData, VALOR_UCAU_ACTUAL);

        if (!result?.id) {
          console.error("API no devolvió ID:", result);
          toast.error("El servidor no devolvió el ID del expediente.");
          return;
        }

        setExpedienteId(result.id);
        toast.success("Borrador creado exitosamente");
        goToStep(3);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al crear el borrador");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Paso 3 "Crear Cronograma" — PATCH completo ─────────────────
  const handleStep3Next = async (actores: ConfiguracionActoresFormValues) => {
    if (!expedienteId) {
      toast.error("No se encontró el ID del expediente. Vuelva al paso anterior.");
      return;
    }

    setIsLoading(true);
    try {
      const fd = datosBasicosForm.getValues();

      await editarExpediente(expedienteId, {
        descripcionObjeto: fd.descripcionObjeto,
        codigoNomenclatura: fd.codigoNomenclatura,
        tipoContratacion: fd.tipoContratacion,
        montoEstimadoBs: fd.montoEstimadoBs,
        montoEstimadoDolar: fd.montoEstimadoDolar,
        valorUcauBase: VALOR_UCAU_ACTUAL,
        modalidadSeleccion: "LICITACION_PUBLICA",
        autoridadId: actores.autoridadId,
        comisionId: actores.comisionId,
        unidadUsuariaId: actores.unidadUsuariaId,
        autoridadFirmaComoDelegado: actores.autoridadFirmaComoDelegado,
        fechaLlamadoParticipar: actores.fechaLlamadoParticipar,
      });

      // Obtener el expediente actualizado (con cronograma generado por el backend)
      const expActualizado = await obtenerExpediente(expedienteId);
      const cronogramaGenerado = expActualizado.cronograma as CronogramaFormValues;

      if (!cronogramaGenerado) {
        throw new Error("El servidor no devolvió el cronograma calculado.");
      }

      setCronogramaData(cronogramaGenerado);

      // Transformar a eventos para el calendario visual
      const events = cronogramaToEvents(cronogramaGenerado);
      setCalendarEvents(events);

      const fechaInicio = new Date(`${actores.fechaLlamadoParticipar}T00:00:00`);
      setCalendarInitialMonth(new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), 1));

      toast.success("Expediente actualizado. Revise el cronograma.");
      goToStep(4);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al actualizar el expediente");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Paso 4 "Anterior" — navega sin API ──────────────────────────
  const handleStep4Back = () => {
    goToStep(3);
  };

  // ─── Paso 4 "Guardar Cronograma" ─────────────────────────────────
  // Recibe eventos editados o no, pero actualmente se guarda el cronograma calculado
  // por simplificación del calendario, se mantiene cronogramaData.
  const handleFinish = async () => {
    if (!expedienteId || !cronogramaData) {
      toast.error("Error interno: ID del expediente o cronograma perdidos.");
      return;
    }

    setIsLoading(true);
    try {
      await guardarCronograma(expedienteId, cronogramaData);
      toast.success("¡Cronograma guardado! Expediente creado exitosamente.");
      router.push("/elaboracion-expediente");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar el cronograma");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Drag & Drop Event ──────────────────────────────────────────
  const handleEventDrop = (eventId: string, diffInDays: number) => {
    if (!cronogramaData || diffInDays === 0) return;

    const addDays = (dateStr: string, days: number): string => {
      const date = new Date(`${dateStr.split("T")[0]}T00:00:00`);
      date.setDate(date.getDate() + days);
      return date.toISOString().split("T")[0];
    };

    const isWeekend = (dateStr: string): boolean => {
      const date = new Date(`${dateStr.split("T")[0]}T00:00:00`);
      const dow = date.getDay();
      return dow === 0 || dow === 6;
    };

    const newCronograma = { ...cronogramaData };

    if (eventId === "rango-pliego") {
      const pInicio = newCronograma[PLIEGO_INICIO] as string;
      const pFin = newCronograma[PLIEGO_FIN] as string;
      if (!pInicio || !pFin) return;

      const newInicio = addDays(pInicio, diffInDays);
      const newFin = addDays(pFin, diffInDays);

      if (isWeekend(newInicio) || isWeekend(newFin)) {
        toast.error("Las fechas del Pliego no pueden caer en fin de semana.");
        return;
      }

      (newCronograma as Record<string, unknown>)[PLIEGO_INICIO] = newInicio + "T00:00:00.000Z";
      (newCronograma as Record<string, unknown>)[PLIEGO_FIN] = newFin + "T00:00:00.000Z";
    } else {
      const currentVal = (newCronograma as Record<string, unknown>)[eventId] as string;
      if (!currentVal) return;

      const newVal = addDays(currentVal, diffInDays);
      if (isWeekend(newVal)) {
        toast.error("La fecha no puede caer en fin de semana.");
        return;
      }
      (newCronograma as Record<string, unknown>)[eventId] = newVal + "T00:00:00.000Z";
    }

    setCronogramaData(newCronograma);
    setCalendarEvents(cronogramaToEvents(newCronograma as Record<string, unknown>));
  };

  // ─── Render ───────────────────────────────────────────────────────
  const { title, description } = STEP_META[currentStep - 1];

  return (
    <Card className="mx-auto w-full max-w-4xl shadow-sm border-0 mb-16">
      <CardHeader className="px-10 pt-10 pb-6 border-b border-slate-200">
        <CardTitle className="text-[28px] font-bold text-heading-dark font-inter">
          {title}
        </CardTitle>
        <CardDescription className="text-slate-500 italic mt-1 font-inter text-base">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="px-10 pt-8 pb-10">
        {currentStep === 1 && (
          <DatosBasicosStep
            form={datosBasicosForm}
            onNext={handleStep1Next}
            isLoading={isLoading}
          />
        )}

        {currentStep === 2 && analisisData && (
          <AnalisisModalidadStep
            data={analisisData}
            onEdit={handleStep2Edit}
            onConfirm={handleStep2Confirm}
            isLoading={isLoading}
          />
        )}

        {currentStep === 3 && (
          <ConfiguracionActoresStep onFinish={handleStep3Next} isLoading={isLoading} />
        )}

        {currentStep === 4 && (
          <PlanificacionStep
            events={calendarEvents}
            initialMonth={calendarInitialMonth}
            onBack={handleStep4Back}
            onFinish={handleFinish}
            onEventDrop={handleEventDrop}
            isLoading={isLoading}
          />
        )}
      </CardContent>
    </Card>
  );
}

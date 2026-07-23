"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import { DatosBasicosStep } from "./steps/DatosBasicosStep";
import { AnalisisModalidadStep } from "./steps/AnalisisModalidadStep";
import { ConfiguracionActoresStep } from "./steps/ConfiguracionActoresStep";
import { PlanificacionStep } from "./steps/PlanificacionStep";
import { StepProgressBar } from "./steps/StepProgressBar";
import { datosBasicosSchema, MODALIDAD_SUGERIDA, BASE_LEGAL } from "@/lib/schemas/expedienteSchema";
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
import type { ExpedienteResponse } from "@/services/expedienteService";
import { UniversitasAPI } from "@universitas/sdk-global";
import { moverFechaCronograma, calcularFechasSugeridas } from "@/lib/utils/cronogramaUtils";
import { cronogramaToEvents } from "@/lib/utils/cronogramaEvents";
import type { IEvent } from "./calendar/types";
import { useDiasNoLaborables } from "@/hooks/useDiasNoLaborables";
import { getYearRangeForCronograma } from "@/lib/utils/diasNoLaborablesUtils";

// ─── Step meta ───────────────────────────────────────────────────────

const STEP_META_CREAR = [
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

const STEP_META_EDITAR = [
  {
    title: "Editar datos del expediente",
    description:
      "Modifique los datos básicos del procedimiento. El cronograma se edita directamente desde la vista de detalle.",
  },
  {
    title: "Análisis de modalidad",
    description: "Verifique los datos financieros actualizados.",
  },
  {
    title: "Configuración de actores",
    description: "Actualice las autoridades que intervendrán en el procedimiento.",
  },
];

const TIPO_DISPLAY: Record<string, string> = {
  OBRAS: "Obras",
  BIENES: "Bienes",
  SERVICIOS: "Servicios",
};

// ─── Lazy Universitas SDK client ─────────────────────────────────────────────
// El SDK solo se instancia cuando se invoca por primera vez (en runtime),
// no durante la importación del módulo (build-time). Evita el crash en Vercel.
let _universitasClientWizard: UniversitasAPI | null = null;
function getClient(): UniversitasAPI {
  if (!_universitasClientWizard) {
    _universitasClientWizard = new UniversitasAPI(
      process.env.NEXT_PUBLIC_UNIVERSITAS_SDK_URL ?? ""
    );
  }
  return _universitasClientWizard;
}

// ─── Props ───────────────────────────────────────────────────────────

export interface CrearExpedienteWizardProps {
  /** ID del expediente ya existente (modo edición) */
  expedienteId?: string;
  /** Datos precargados del expediente (modo edición) */
  datosIniciales?: ExpedienteResponse;
  /** Activa el modo edición (omite el paso 4 de cronograma) */
  modoEdicion?: boolean;
  readOnly?: boolean;
  /** Ruta canónica del módulo (default: elaboracion, legacy). */
  basePath?: string;
}

// ─── Component ───────────────────────────────────────────────────────

export function CrearExpedienteWizard({
  expedienteId: expedienteIdProp,
  datosIniciales,
  modoEdicion = false,
  readOnly = false,
  basePath = "/elaboracion-expediente",
}: CrearExpedienteWizardProps = {}) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const STEP_META = modoEdicion ? STEP_META_EDITAR : STEP_META_CREAR;

  // En modo edición el ID llega como prop, en creación se recibe del servidor
  const [expedienteId, setExpedienteId] = useState<string | null>(expedienteIdProp ?? null);

  // Datos calculados para el paso 2 (se recrean en cada paso 1 → 2)
  const [analisisData, setAnalisisData] = useState<AnalisisModalidad | null>(null);

  // Cronograma generado para paso 4
  const [cronogramaData, setCronogramaData] = useState<CronogramaFormValues | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<IEvent[]>([]);
  const [calendarInitialMonth, setCalendarInitialMonth] = useState<Date>(new Date(2026, 2, 1));

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

  // ─── Form Paso 1 (se mantiene vivo durante todo el wizard) ──────
  const datosBasicosForm = useForm<DatosBasicosFormValues>({
    resolver: zodResolver(datosBasicosSchema),
    defaultValues: {
      descripcionObjeto: datosIniciales?.descripcionObjeto ?? "",
      codigoNomenclatura: datosIniciales?.codigoNomenclatura ?? "",
      tipoContratacion:
        (datosIniciales?.modalidad
          ?.tipoContratacion as DatosBasicosFormValues["tipoContratacion"]) ?? undefined,
      montoEstimadoBs: datosIniciales?.modalidad?.montoEstimadoBs
        ? parseFloat(datosIniciales.modalidad.montoEstimadoBs)
        : undefined,
    },
  });

  // ─── Navigation helpers ────────────────────────────────────────────────────
  const goToStep = (step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const buildAnalisisBase = (fd: DatosBasicosFormValues): AnalisisModalidad => ({
    objetoProceso: fd.descripcionObjeto,
    tipoContratacion: TIPO_DISPLAY[fd.tipoContratacion] ?? fd.tipoContratacion,
    montoBs: fd.montoEstimadoBs,
    montoDolares: null,
    montoUCAU: null,
    tasaBcvUsd: null,
    valorUcau: null,
    modalidadSugerida: MODALIDAD_SUGERIDA,
    baseLegal: BASE_LEGAL,
    isLoadingRates: true,
  });

  // ─── Paso 1 "Siguiente" — valida, navega y dispara SDK en paralelo ─
  const handleStep1Next = async (formData: DatosBasicosFormValues) => {
    if (readOnly) return;
    const base = buildAnalisisBase(formData);
    setAnalisisData(base);
    goToStep(2);

    // Fetch BCV + UCAU in parallel without blocking navigation
    try {
      const [bcvRes, ucauRes] = await Promise.all([
        getClient().economia.getBCV(),
        getClient().economia.getUCAUU(),
      ]);
      const tasaBcvUsd: number = bcvRes.data.usd;
      const valorUcau: number = ucauRes.valor;

      setAnalisisData((prev) =>
        prev
          ? {
              ...prev,
              tasaBcvUsd,
              valorUcau,
              montoDolares: formData.montoEstimadoBs / tasaBcvUsd,
              montoUCAU: formData.montoEstimadoBs / valorUcau,
              isLoadingRates: false,
            }
          : prev
      );
    } catch {
      setAnalisisData((prev) => (prev ? { ...prev, isLoadingRates: false } : prev));
      toast.error(
        "No se pudieron obtener las tasas del SDK. Los montos en $ y UCAU no estarán disponibles."
      );
    }
  };

  // ─── Paso 2 "Editar" — vuelve sin API (form RHF preserva datos) ─
  const handleStep2Edit = () => {
    goToStep(1);
  };

  // ─── Paso 2 "Confirmar" — POST borrador o PATCH si ya existe ────
  const handleStep2Confirm = async () => {
    if (readOnly) return;
    setIsLoading(true);
    try {
      const formData = datosBasicosForm.getValues();

      // Si ya existe un expediente (creación que retrocedió, o modo edición), usamos PATCH
      if (expedienteId) {
        await editarExpediente(expedienteId, {
          descripcionObjeto: formData.descripcionObjeto,
          codigoNomenclatura: formData.codigoNomenclatura,
          tipoContratacion: formData.tipoContratacion,
          montoEstimadoBs: formData.montoEstimadoBs,
          montoEstimadoDolar: analisisData?.montoDolares ?? undefined,
          valorUcauBase: analisisData?.montoUCAU ?? undefined,
          modalidadSeleccion: "LICITACION_PUBLICA",
        });
        goToStep(3);
      } else {
        // Modo creación: POST para crear el borrador
        const result = await crearExpedienteBorrador(
          formData,
          analisisData?.montoUCAU ?? undefined,
          analisisData?.montoDolares ?? undefined
        );

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

  // ─── Paso 3 "Siguiente" — PATCH completo + navegación ───────────
  const handleStep3Next = async (actores: ConfiguracionActoresFormValues) => {
    if (readOnly) return;
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
        montoEstimadoDolar: analisisData?.montoDolares ?? undefined,
        valorUcauBase: analisisData?.montoUCAU ?? undefined,
        modalidadSeleccion: "LICITACION_PUBLICA",
        autoridadId: actores.autoridadId,
        comisionId: actores.comisionId,
        unidadUsuariaId: actores.unidadUsuariaId,
        autoridadFirmaComoDelegado: actores.autoridadFirmaComoDelegado,
        fechaLlamadoParticipar: actores.fechaLlamadoParticipar,
      });

      // ── Modo edición: volver al detalle sin pasar al cronograma ──
      if (modoEdicion) {
        toast.success("Expediente actualizado correctamente.");
        router.push(`${basePath}/${expedienteId}`);
        return;
      }

      // ── Modo creación: cargar cronograma del backend y avanzar ───
      const expActualizado = await obtenerExpediente(expedienteId);
      let cronogramaGenerado = expActualizado.cronograma as CronogramaFormValues;

      if (!cronogramaGenerado) {
        throw new Error("El servidor no devolvió el cronograma calculado.");
      }

      // Parche: sobrescribir con cascada lógica del frontend
      const fechasLogicasFront = calcularFechasSugeridas(
        actores.fechaLlamadoParticipar,
        fd.tipoContratacion,
        nonWorkingDays
      );
      cronogramaGenerado = { ...cronogramaGenerado, ...fechasLogicasFront };

      setCronogramaData(cronogramaGenerado);
      setCalendarEvents(cronogramaToEvents(cronogramaGenerado));

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

  // ─── Paso 4 "Guardar Cronograma" — PUT cronograma → detalle ──────
  const handleFinish = async () => {
    if (readOnly) return;
    if (!expedienteId || !cronogramaData) {
      toast.error("Error interno: ID del expediente o cronograma perdidos.");
      return;
    }

    setIsLoading(true);
    try {
      await guardarCronograma(expedienteId, cronogramaData);
      toast.success("¡Cronograma guardado! Expediente creado exitosamente.");
      router.push(`${basePath}/${expedienteId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar el cronograma");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Drag & Drop Event ──────────────────────────────────────────
  const handleEventDrop = (eventId: string, diffInDays: number) => {
    if (readOnly) return;
    if (!cronogramaData || diffInDays === 0) return;

    const tipo = datosBasicosForm.getValues("tipoContratacion");
    const result = moverFechaCronograma(cronogramaData, eventId, diffInDays, tipo, nonWorkingDays);

    if (!result.success) {
      if (result.errorMsg) toast.error(result.errorMsg);
      return;
    }

    if (result.warningMsg) {
      toast.warning(result.warningMsg, { duration: 8000 });
    }

    if (result.newCronograma) {
      setCronogramaData(result.newCronograma as CronogramaFormValues);
      setCalendarEvents(cronogramaToEvents(result.newCronograma as Record<string, unknown>));
    }
  };

  // ─── Render ───────────────────────────────────────────────────────
  const { title, description } = STEP_META[currentStep - 1] ?? STEP_META[0];

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
        <StepProgressBar
          currentStep={currentStep}
          totalSteps={modoEdicion ? 3 : 4}
          modoEdicion={modoEdicion}
        />

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

        {/* Paso 4 solo se muestra en modo creación */}
        {currentStep === 4 && !modoEdicion && (
          <PlanificacionStep
            events={calendarEvents}
            initialMonth={calendarInitialMonth}
            onBack={handleStep4Back}
            onFinish={handleFinish}
            onEventDrop={handleEventDrop}
            isLoading={isLoading}
            nonWorkingDays={nonWorkingDays}
            feriadoDescriptions={feriadoDescriptions}
          />
        )}
      </CardContent>
    </Card>
  );
}

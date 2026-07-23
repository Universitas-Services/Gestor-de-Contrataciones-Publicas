"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { StepProgressBar } from "./steps/StepProgressBar";
import { CalculoModalidadStep } from "./steps/CalculoModalidadStep";
import { DetallesConcursoAbiertoStep } from "./steps/DetallesConcursoAbiertoStep";
import { DetallesContratacionDirectaStep } from "./steps/DetallesContratacionDirectaStep";
import { DetallesConcursoCerradoStep } from "./steps/DetallesConcursoCerradoStep";
import { DetallesConsultaPreciosStep } from "./steps/DetallesConsultaPreciosStep";
import { DetallesModalidadesExcluidasStep } from "./steps/DetallesModalidadesExcluidasStep";
import { ActoresTiemposStep } from "./steps/ActoresTiemposStep";
import { ActoresContratacionDirectaStep } from "./steps/ActoresContratacionDirectaStep";
import { ActoresConcursoCerradoStep } from "./steps/ActoresConcursoCerradoStep";
import { ActoresConsultaPreciosStep } from "./steps/ActoresConsultaPreciosStep";
import { ActoresModalidadesExcluidasStep } from "./steps/ActoresModalidadesExcluidasStep";
import { PasoStubStep } from "./steps/PasoStubStep";
import { PlanificacionModalidadesExcluidasStep } from "./steps/PlanificacionModalidadesExcluidasStep";
import { PlanificacionStep } from "@/components/features-components/ElaboracionExpediente/steps/PlanificacionStep";
import type {
  ActoresConsultaPreciosFormValues,
  ActoresConcursoCerradoFormValues,
  ActoresContratacionDirectaFormValues,
  ActoresModalidadesExcluidasFormValues,
  CronogramaConsultaPreciosFormValues,
  CronogramaConcursoCerradoFormValues,
  CronogramaContratacionDirectaFormValues,
  CronogramaModalidadesExcluidasFormValues,
  DetallesConsultaPreciosFormValues,
  DetallesConcursoAbiertoFormValues,
  DetallesConcursoCerradoFormValues,
  DetallesContratacionDirectaFormValues,
  DetallesModalidadesExcluidasFormValues,
  DictamenModalidadResult,
} from "@/lib/schemas/gestionExpedienteSchema";
import type {
  ConfiguracionActoresFormValues,
  CronogramaFormValues,
  DatosBasicosFormValues,
} from "@/lib/schemas/expedienteSchema";
import type { IEvent } from "@/components/features-components/ElaboracionExpediente/calendar/types";
import { calcularFechasSugeridas, moverFechaCronograma } from "@/lib/utils/cronogramaUtils";
import { cronogramaToEvents } from "@/lib/utils/cronogramaEvents";
import {
  calcularFechasSugeridasCd,
  moverFechaCronogramaCd,
} from "@/lib/modalidades/cronogramaContratacionDirecta";
import { cronogramaCdToEvents, LEGEND_ITEMS_CD } from "@/lib/utils/cronogramaEventsCd";
import {
  calcularFechasSugeridasCc,
  moverFechaCronogramaCc,
} from "@/lib/modalidades/cronogramaConcursoCerrado";
import { cronogramaCcToEvents, LEGEND_ITEMS_CC } from "@/lib/utils/cronogramaEventsCc";
import {
  calcularFechasSugeridasCp,
  moverFechaCronogramaCp,
} from "@/lib/modalidades/cronogramaConsultaPrecios";
import { cronogramaCpToEvents, LEGEND_ITEMS_CP } from "@/lib/utils/cronogramaEventsCp";
import { calcularFechasSugeridasMe } from "@/lib/modalidades/cronogramaModalidadesExcluidas";
import {
  apiToCronogramaCc,
  apiToCronogramaCd,
  apiToCronogramaCp,
  apiToCronogramaMe,
  cronogramaCcToPut,
  cronogramaCdToPut,
  cronogramaCpToPut,
  cronogramaMeToPut,
} from "@/lib/modalidades/mapCronogramaApi";
import { requiereComisionPorUmbral } from "@/lib/modalidades/requiereComisionPorUmbral";
import { requiereComisionConsultaPrecios } from "@/lib/modalidades/requiereComisionConsultaPrecios";
import { useDiasNoLaborables } from "@/hooks/useDiasNoLaborables";
import {
  crearBorradorConcursoCerrado,
  crearBorradorConsultaPrecios,
  crearBorradorContratacionDirecta,
  crearBorradorModalidadExcluida,
  crearExpedienteBorrador,
  editarExpediente,
  generarCronogramaConcursoCerrado,
  generarCronogramaConsultaPrecios,
  generarCronogramaContratacionDirecta,
  generarCronogramaModalidadExcluida,
  guardarCronograma,
  obtenerExpediente,
} from "@/services/expedienteService";

const STEP_META_BASE = [
  {
    title: "Creación de nuevo expediente",
    description:
      "Ingrese los datos básicos del procedimiento para determinar la modalidad de contratación y calcular los lapsos legales.",
  },
  {
    title: "Especificaciones del procedimiento",
    description: "Complete las especificaciones técnicas y administrativas del expediente.",
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
] as const;

const STEP_META_CA_PASO2 = {
  title: "Especificaciones del procedimiento competitivo",
  description:
    "Determine el tipo de acto a celebrar y registre los datos de identificación oficial del expediente para esta contratación.",
} as const;

const STEP_META_CD_PASO2 = {
  title: "Causal de Contratación Directa",
  description:
    "Determine la justificación legal (Artículo 101 LCP) seleccionando el numeral correspondiente.",
} as const;

const STEP_META_CD_PASO3 = {
  title: "Configuración de actores y emisión de invitación",
  description:
    "Seleccione las autoridades responsables de coordinar este procedimiento. El sistema evaluará el monto estimado para determinar si es obligatoria la intervención de la Comisión de Contrataciones.",
} as const;

const STEP_META_CC_PASO2 = {
  title: "Especificaciones del Procedimiento (Concurso Cerrado)",
  description:
    "Determine la justificación legal (Art. 85 LCP) y registre los datos de identificación oficial del expediente.",
} as const;

const STEP_META_CC_PASO3 = {
  title: "Configuración de actores y tiempos",
  description:
    "Seleccione las autoridades que intervendrán en el procedimiento y defina la fecha del llamado para proyectar el cronograma.",
} as const;

const STEP_META_CC_PASO4 = {
  title: "Planificación del procedimiento",
  description:
    "Visualice y ajuste los lapsos del procedimiento. El sistema ha calculado el cronograma aplicando las reglas de días hábiles vigentes (Art. 85 y 87 LCP).",
} as const;

const STEP_META_CP_PASO2 = {
  title: "Especificaciones del procedimiento (Consulta de Precios)",
  description:
    "Seleccione la justificación legal (Art. 96 LCP) y registre los datos de identificación oficial del expediente.",
} as const;

const STEP_META_CP_PASO3 = {
  title: "Configuración de actores y emisión de invitaciones",
  description:
    "Seleccione las autoridades responsables. En esta modalidad, la Unidad Contratante coordina el procedimiento y la intervención de la Comisión dependerá del umbral financiero.",
} as const;

const STEP_META_CP_PASO4 = {
  title: "Planificación del Procedimiento",
  description:
    "Visualice y ajuste los lapsos procesales. Al ser una modalidad expedita, el sistema ha proyectado las fechas en días hábiles estrictos (omitiendo fines de semana y feriados).",
} as const;

const STEP_META_ME_PASO2 = {
  title: "Justificación y objeto (Modalidad Excluida)",
  description:
    "Seleccione el fundamento legal que excluye este procedimiento (Art. 4 o 5 LCP) y defina los datos básicos del expediente.",
} as const;

const STEP_META_ME_PASO3 = {
  title: "Configuración de Actores y Tiempos",
  description:
    "Designe las autoridades competentes. Por mandato legal, la adjudicación es directa por la Máxima Autoridad, omitiendo la intervención de la Comisión de Contrataciones.",
} as const;

const STEP_META_ME_PASO4 = {
  title: "Planificación Administrativa (Flujo Directo)",
  description:
    "Verifique el flujo del procedimiento. Al estar excluido de las modalidades estándar, los lapsos de publicidad y evaluación colegiada se omiten, pasando a la formalización directa.",
} as const;

export interface CrearExpedienteWizardProps {
  readOnly?: boolean;
}

export function CrearExpedienteWizard({ readOnly = false }: CrearExpedienteWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [expedienteId, setExpedienteId] = useState<string | null>(null);
  const [dictamenPaso1, setDictamenPaso1] = useState<DictamenModalidadResult | null>(null);
  const [detallesPaso2, setDetallesPaso2] = useState<DetallesConcursoAbiertoFormValues | null>(
    null
  );
  const [detallesContratacionDirecta, setDetallesContratacionDirecta] =
    useState<DetallesContratacionDirectaFormValues | null>(null);
  const [detallesConcursoCerrado, setDetallesConcursoCerrado] =
    useState<DetallesConcursoCerradoFormValues | null>(null);
  const [detallesConsultaPrecios, setDetallesConsultaPrecios] =
    useState<DetallesConsultaPreciosFormValues | null>(null);
  const [detallesModalidadesExcluidas, setDetallesModalidadesExcluidas] =
    useState<DetallesModalidadesExcluidasFormValues | null>(null);
  const [actoresPaso3, setActoresPaso3] = useState<ConfiguracionActoresFormValues | null>(null);
  const [actoresContratacionDirecta, setActoresContratacionDirecta] =
    useState<ActoresContratacionDirectaFormValues | null>(null);
  const [actoresConcursoCerrado, setActoresConcursoCerrado] =
    useState<ActoresConcursoCerradoFormValues | null>(null);
  const [actoresConsultaPrecios, setActoresConsultaPrecios] =
    useState<ActoresConsultaPreciosFormValues | null>(null);
  const [actoresModalidadesExcluidas, setActoresModalidadesExcluidas] =
    useState<ActoresModalidadesExcluidasFormValues | null>(null);
  const [cronogramaData, setCronogramaData] = useState<CronogramaFormValues | null>(null);
  const [cronogramaCd, setCronogramaCd] = useState<CronogramaContratacionDirectaFormValues | null>(
    null
  );
  const [cronogramaCc, setCronogramaCc] = useState<CronogramaConcursoCerradoFormValues | null>(
    null
  );
  const [cronogramaCp, setCronogramaCp] = useState<CronogramaConsultaPreciosFormValues | null>(
    null
  );
  const [cronogramaMe, setCronogramaMe] = useState<CronogramaModalidadesExcluidasFormValues | null>(
    null
  );
  const [calendarEvents, setCalendarEvents] = useState<IEvent[]>([]);
  const [calendarInitialMonth, setCalendarInitialMonth] = useState(() => new Date());

  const isConcursoAbierto = dictamenPaso1?.modalidadSeleccion === "CONCURSO_ABIERTO";
  const isContratacionDirecta = dictamenPaso1?.modalidadSeleccion === "CONTRATACION_DIRECTA";
  const isConcursoCerrado = dictamenPaso1?.modalidadSeleccion === "CONCURSO_CERRADO";
  const isConsultaPrecios = dictamenPaso1?.modalidadSeleccion === "CONSULTA_PRECIOS";
  const isModalidadesExcluidas = dictamenPaso1?.modalidadSeleccion === "MODALIDADES_EXCLUIDAS";
  const isAperturaUnica =
    isConcursoAbierto &&
    (detallesPaso2?.modalidadConcursoAbierto === "ACTO_UNICO_APERTURA_UNICA" ||
      detallesPaso2 == null);

  const feriadosRange = useMemo(() => {
    const year = new Date().getFullYear();
    return {
      desde: `${year - 1}-01-01`,
      hasta: `${year + 5}-12-31`,
    };
  }, []);

  const { nonWorkingDays, feriadoDescriptions } = useDiasNoLaborables(
    feriadosRange.desde,
    feriadosRange.hasta
  );

  const meta = useMemo(() => {
    if (currentStep === 2 && isConcursoAbierto) {
      return STEP_META_CA_PASO2;
    }
    if (currentStep === 2 && isContratacionDirecta) {
      return STEP_META_CD_PASO2;
    }
    if (currentStep === 2 && isConcursoCerrado) {
      return STEP_META_CC_PASO2;
    }
    if (currentStep === 2 && isConsultaPrecios) {
      return STEP_META_CP_PASO2;
    }
    if (currentStep === 2 && isModalidadesExcluidas) {
      return STEP_META_ME_PASO2;
    }
    if (currentStep === 3 && isContratacionDirecta) {
      return STEP_META_CD_PASO3;
    }
    if (currentStep === 3 && isConcursoCerrado) {
      return STEP_META_CC_PASO3;
    }
    if (currentStep === 3 && isConsultaPrecios) {
      return STEP_META_CP_PASO3;
    }
    if (currentStep === 3 && isModalidadesExcluidas) {
      return STEP_META_ME_PASO3;
    }
    if (currentStep === 4 && isConcursoCerrado) {
      return STEP_META_CC_PASO4;
    }
    if (currentStep === 4 && isConsultaPrecios) {
      return STEP_META_CP_PASO4;
    }
    if (currentStep === 4 && isModalidadesExcluidas) {
      return STEP_META_ME_PASO4;
    }
    return STEP_META_BASE[currentStep - 1] ?? STEP_META_BASE[0];
  }, [
    currentStep,
    isConcursoAbierto,
    isContratacionDirecta,
    isConcursoCerrado,
    isConsultaPrecios,
    isModalidadesExcluidas,
  ]);

  const goToStep = (step: number) => {
    setCurrentStep(step);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePaso1Complete = (dictamen: DictamenModalidadResult) => {
    setDictamenPaso1(dictamen);
    goToStep(2);
  };

  /** POST/PATCH borrador (misma modalidad backend LICITACION_PUBLICA = apertura única). */
  const persistBorradorAperturaUnica = async (detalles: DetallesConcursoAbiertoFormValues) => {
    if (!dictamenPaso1) throw new Error("Faltan datos del análisis de modalidad.");

    const formData: DatosBasicosFormValues = {
      descripcionObjeto: detalles.descripcionObjeto,
      codigoNomenclatura: detalles.codigoNomenclatura,
      tipoContratacion: dictamenPaso1.tipoContratacion,
      montoEstimadoBs: dictamenPaso1.montoEstimadoBs,
    };

    if (expedienteId) {
      await editarExpediente(expedienteId, {
        descripcionObjeto: formData.descripcionObjeto,
        codigoNomenclatura: formData.codigoNomenclatura,
        tipoContratacion: formData.tipoContratacion,
        montoEstimadoBs: formData.montoEstimadoBs,
        montoEstimadoDolar: dictamenPaso1.montoEstimadoDolar,
        valorUcauBase: dictamenPaso1.valorUcauBase,
        modalidadSeleccion: "LICITACION_PUBLICA",
      });
      return expedienteId;
    }

    const result = await crearExpedienteBorrador(
      formData,
      dictamenPaso1.valorUcauBase,
      dictamenPaso1.montoEstimadoDolar
    );

    if (!result?.id) {
      throw new Error("El servidor no devolvió el ID del expediente.");
    }

    setExpedienteId(result.id);
    return result.id;
  };

  const handlePaso2Complete = async (data: DetallesConcursoAbiertoFormValues) => {
    if (readOnly) return;
    setDetallesPaso2(data);

    if (data.modalidadConcursoAbierto !== "ACTO_UNICO_APERTURA_UNICA") {
      goToStep(3);
      return;
    }

    setIsLoading(true);
    try {
      await persistBorradorAperturaUnica(data);
      toast.success("Borrador creado exitosamente");
      goToStep(3);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al crear el borrador");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaso2ContratacionDirectaComplete = (data: DetallesContratacionDirectaFormValues) => {
    if (readOnly) return;
    setDetallesContratacionDirecta(data);
    goToStep(3);
  };

  const handlePaso2ConcursoCerradoComplete = async (data: DetallesConcursoCerradoFormValues) => {
    if (readOnly) return;
    if (!dictamenPaso1) {
      toast.error("Faltan datos del análisis de modalidad.");
      return;
    }
    setDetallesConcursoCerrado(data);
    setIsLoading(true);
    try {
      if (!expedienteId) {
        const result = await crearBorradorConcursoCerrado({
          descripcionObjeto: data.descObjetoContratacionCc,
          codigoNomenclatura: data.codNomenclaturaProcesoCc,
          tipoContratacion: dictamenPaso1.tipoContratacion,
          montoEstimadoBs: dictamenPaso1.montoEstimadoBs,
          montoEstimadoDolar: dictamenPaso1.montoEstimadoDolar,
          valorUcauBase: dictamenPaso1.valorUcauBase,
        });
        if (!result?.id) throw new Error("El servidor no devolvió el ID del expediente.");
        setExpedienteId(result.id);
      } else {
        await editarExpediente(expedienteId, {
          descripcionObjeto: data.descObjetoContratacionCc,
          codigoNomenclatura: data.codNomenclaturaProcesoCc,
          tipoContratacion: dictamenPaso1.tipoContratacion,
          montoEstimadoBs: dictamenPaso1.montoEstimadoBs,
          montoEstimadoDolar: dictamenPaso1.montoEstimadoDolar,
          valorUcauBase: dictamenPaso1.valorUcauBase,
        });
      }
      toast.success("Borrador de Concurso Cerrado creado exitosamente");
      goToStep(3);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al crear el borrador");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaso2ConsultaPreciosComplete = (data: DetallesConsultaPreciosFormValues) => {
    if (readOnly) return;
    setDetallesConsultaPrecios(data);
    goToStep(3);
  };

  const handlePaso2ModalidadesExcluidasComplete = async (
    data: DetallesModalidadesExcluidasFormValues
  ) => {
    if (readOnly) return;
    if (!dictamenPaso1) {
      toast.error("Faltan datos del análisis de modalidad.");
      return;
    }
    setDetallesModalidadesExcluidas(data);
    setIsLoading(true);
    try {
      if (!expedienteId) {
        const result = await crearBorradorModalidadExcluida({
          descripcionObjeto: data.descObjetoContratacionMe,
          codigoNomenclatura: data.codNomenclaturaProcesoMe,
          tipoContratacion: dictamenPaso1.tipoContratacion,
          montoEstimadoBs: dictamenPaso1.montoEstimadoBs,
          montoEstimadoDolar: dictamenPaso1.montoEstimadoDolar,
          valorUcauBase: dictamenPaso1.valorUcauBase,
        });
        if (!result?.id) throw new Error("El servidor no devolvió el ID del expediente.");
        setExpedienteId(result.id);
      } else {
        await editarExpediente(expedienteId, {
          descripcionObjeto: data.descObjetoContratacionMe,
          codigoNomenclatura: data.codNomenclaturaProcesoMe,
          tipoContratacion: dictamenPaso1.tipoContratacion,
          montoEstimadoBs: dictamenPaso1.montoEstimadoBs,
          montoEstimadoDolar: dictamenPaso1.montoEstimadoDolar,
          valorUcauBase: dictamenPaso1.valorUcauBase,
        });
      }
      toast.success("Borrador de Modalidad Excluida creado exitosamente");
      goToStep(3);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al crear el borrador");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaso3ContratacionDirectaComplete = async (
    data: ActoresContratacionDirectaFormValues
  ) => {
    if (readOnly) return;
    if (!dictamenPaso1 || !detallesContratacionDirecta) {
      toast.error("Faltan datos del procedimiento de Contratación Directa.");
      return;
    }
    setActoresContratacionDirecta(data);
    setIsLoading(true);

    try {
      let id = expedienteId;
      if (!id) {
        const result = await crearBorradorContratacionDirecta({
          descripcionObjeto: detallesContratacionDirecta.descObjetoContratacionCd,
          codigoNomenclatura: detallesContratacionDirecta.codNomenclaturaProcesoCd,
          tipoContratacion: dictamenPaso1.tipoContratacion,
          montoEstimadoBs: dictamenPaso1.montoEstimadoBs,
          montoEstimadoDolar: dictamenPaso1.montoEstimadoDolar,
          valorUcauBase: dictamenPaso1.valorUcauBase,
          numeralCausalProcedenciaCd: detallesContratacionDirecta.numeralCausalProcedenciaCd,
          causalProcedenciaCd: detallesContratacionDirecta.causalProcedenciaCd,
          unidadContratanteId: data.unidadContratanteId,
        });
        if (!result?.id) throw new Error("El servidor no devolvió el ID del expediente.");
        id = result.id;
        setExpedienteId(id);
      }

      const patch: Parameters<typeof editarExpediente>[1] = {
        autoridadId: data.autoridadId,
        unidadUsuariaId: data.unidadUsuariaId,
        autoridadFirmaComoDelegado: data.autoridadFirmaComoDelegado,
      };
      if (
        requiereComisionPorUmbral(dictamenPaso1.tipoContratacion, dictamenPaso1.valorUcauBase) &&
        data.comisionId
      ) {
        patch.comisionId = data.comisionId;
      }
      await editarExpediente(id, patch);

      let fechas = calcularFechasSugeridasCd(data.fecEnvioInvitacionCd, nonWorkingDays);
      try {
        const api = await generarCronogramaContratacionDirecta({
          fechaEnvioInvitacion: data.fecEnvioInvitacionCd,
        });
        fechas = apiToCronogramaCd(api);
      } catch {
        toast.warning("No se pudo obtener el cronograma del servidor; se usó el cálculo local.");
      }

      setCronogramaCd(fechas);
      setCalendarEvents(cronogramaCdToEvents(fechas));
      const fechaInicio = new Date(`${data.fecEnvioInvitacionCd}T00:00:00`);
      setCalendarInitialMonth(new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), 1));
      goToStep(4);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar actores");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaso3ConcursoCerradoComplete = async (data: ActoresConcursoCerradoFormValues) => {
    if (readOnly) return;
    if (!dictamenPaso1 || !detallesConcursoCerrado) {
      toast.error("Faltan datos del procedimiento de Concurso Cerrado.");
      return;
    }
    setActoresConcursoCerrado(data);
    setIsLoading(true);

    try {
      let id = expedienteId;
      if (!id) {
        const result = await crearBorradorConcursoCerrado({
          descripcionObjeto: detallesConcursoCerrado.descObjetoContratacionCc,
          codigoNomenclatura: detallesConcursoCerrado.codNomenclaturaProcesoCc,
          tipoContratacion: dictamenPaso1.tipoContratacion,
          montoEstimadoBs: dictamenPaso1.montoEstimadoBs,
          montoEstimadoDolar: dictamenPaso1.montoEstimadoDolar,
          valorUcauBase: dictamenPaso1.valorUcauBase,
        });
        if (!result?.id) throw new Error("El servidor no devolvió el ID del expediente.");
        id = result.id;
        setExpedienteId(id);
      }

      await editarExpediente(id, {
        autoridadId: data.autoridadId,
        comisionId: data.comisionId,
        unidadUsuariaId: data.unidadUsuariaId,
        autoridadFirmaComoDelegado: data.autoridadFirmaComoDelegado,
      });

      let fechas = calcularFechasSugeridasCc(
        data.fecEnvioInvitacionCc,
        dictamenPaso1.tipoContratacion,
        nonWorkingDays
      );
      try {
        const api = await generarCronogramaConcursoCerrado({
          tipoContratacion: dictamenPaso1.tipoContratacion,
          fechaEnvioInvitacion: data.fecEnvioInvitacionCc,
        });
        fechas = apiToCronogramaCc(api);
      } catch {
        toast.warning("No se pudo obtener el cronograma del servidor; se usó el cálculo local.");
      }

      setCronogramaCc(fechas);
      setCalendarEvents(cronogramaCcToEvents(fechas));
      const fechaInicio = new Date(`${data.fecEnvioInvitacionCc}T00:00:00`);
      setCalendarInitialMonth(new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), 1));
      goToStep(4);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar actores");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaso3ConsultaPreciosComplete = async (data: ActoresConsultaPreciosFormValues) => {
    if (readOnly) return;
    if (!dictamenPaso1 || !detallesConsultaPrecios) {
      toast.error("Faltan datos del procedimiento de Consulta de Precios.");
      return;
    }
    setActoresConsultaPrecios(data);
    setIsLoading(true);

    try {
      let id = expedienteId;
      if (!id) {
        const result = await crearBorradorConsultaPrecios({
          descripcionObjeto: detallesConsultaPrecios.descObjetoContratacionCp,
          codigoNomenclatura: detallesConsultaPrecios.codNomenclaturaProcesoCp,
          tipoContratacion: dictamenPaso1.tipoContratacion,
          montoEstimadoBs: dictamenPaso1.montoEstimadoBs,
          montoEstimadoDolar: dictamenPaso1.montoEstimadoDolar,
          valorUcauBase: dictamenPaso1.valorUcauBase,
          unidadContratanteId: data.unidadContratanteId,
        });
        if (!result?.id) throw new Error("El servidor no devolvió el ID del expediente.");
        id = result.id;
        setExpedienteId(id);
      }

      const patch: Parameters<typeof editarExpediente>[1] = {
        autoridadId: data.autoridadId,
        unidadUsuariaId: data.unidadUsuariaId,
        autoridadFirmaComoDelegado: data.autoridadFirmaComoDelegado,
      };
      if (
        requiereComisionConsultaPrecios(
          dictamenPaso1.tipoContratacion,
          dictamenPaso1.valorUcauBase
        ) &&
        data.comisionId
      ) {
        patch.comisionId = data.comisionId;
      }
      await editarExpediente(id, patch);

      let fechas = calcularFechasSugeridasCp(
        data.fecEnvioInvitacionCp,
        dictamenPaso1.tipoContratacion,
        nonWorkingDays
      );
      try {
        const api = await generarCronogramaConsultaPrecios({
          tipoContratacion: dictamenPaso1.tipoContratacion,
          fechaEnvioInvitacion: data.fecEnvioInvitacionCp,
        });
        fechas = apiToCronogramaCp(api);
      } catch {
        toast.warning("No se pudo obtener el cronograma del servidor; se usó el cálculo local.");
      }

      setCronogramaCp(fechas);
      setCalendarEvents(cronogramaCpToEvents(fechas));
      const fechaInicio = new Date(`${data.fecEnvioInvitacionCp}T00:00:00`);
      setCalendarInitialMonth(new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), 1));
      goToStep(4);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar actores");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaso3ModalidadesExcluidasComplete = async (
    data: ActoresModalidadesExcluidasFormValues
  ) => {
    if (readOnly) return;
    if (!dictamenPaso1 || !detallesModalidadesExcluidas) {
      toast.error("Faltan datos del procedimiento de Modalidades Excluidas.");
      return;
    }
    setActoresModalidadesExcluidas(data);
    setIsLoading(true);

    try {
      let id = expedienteId;
      if (!id) {
        const result = await crearBorradorModalidadExcluida({
          descripcionObjeto: detallesModalidadesExcluidas.descObjetoContratacionMe,
          codigoNomenclatura: detallesModalidadesExcluidas.codNomenclaturaProcesoMe,
          tipoContratacion: dictamenPaso1.tipoContratacion,
          montoEstimadoBs: dictamenPaso1.montoEstimadoBs,
          montoEstimadoDolar: dictamenPaso1.montoEstimadoDolar,
          valorUcauBase: dictamenPaso1.valorUcauBase,
        });
        if (!result?.id) throw new Error("El servidor no devolvió el ID del expediente.");
        id = result.id;
        setExpedienteId(id);
      }

      await editarExpediente(id, {
        autoridadId: data.autoridadId,
        unidadUsuariaId: data.unidadUsuariaId,
        autoridadFirmaComoDelegado: data.autoridadFirmaComoDelegado,
      });

      let fechas = calcularFechasSugeridasMe(data.fecInicioProcedimientoMe, nonWorkingDays);
      try {
        const api = await generarCronogramaModalidadExcluida({
          fechaInicioProcedimiento: data.fecInicioProcedimientoMe,
        });
        fechas = apiToCronogramaMe(api);
      } catch {
        toast.warning("No se pudo obtener el cronograma del servidor; se usó el cálculo local.");
      }

      setCronogramaMe(fechas);
      goToStep(4);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar actores");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaso3Complete = async (data: ConfiguracionActoresFormValues) => {
    if (readOnly) return;
    setActoresPaso3(data);

    if (!isConcursoAbierto || !dictamenPaso1 || !detallesPaso2) {
      goToStep(4);
      return;
    }

    if (detallesPaso2.modalidadConcursoAbierto !== "ACTO_UNICO_APERTURA_UNICA") {
      goToStep(4);
      return;
    }

    setIsLoading(true);
    try {
      let id = expedienteId;
      if (!id) {
        id = await persistBorradorAperturaUnica(detallesPaso2);
      }

      await editarExpediente(id, {
        descripcionObjeto: detallesPaso2.descripcionObjeto,
        codigoNomenclatura: detallesPaso2.codigoNomenclatura,
        tipoContratacion: dictamenPaso1.tipoContratacion,
        montoEstimadoBs: dictamenPaso1.montoEstimadoBs,
        montoEstimadoDolar: dictamenPaso1.montoEstimadoDolar,
        valorUcauBase: dictamenPaso1.valorUcauBase,
        modalidadSeleccion: "LICITACION_PUBLICA",
        autoridadId: data.autoridadId,
        comisionId: data.comisionId,
        unidadUsuariaId: data.unidadUsuariaId,
        autoridadFirmaComoDelegado: data.autoridadFirmaComoDelegado,
        fechaLlamadoParticipar: data.fechaLlamadoParticipar,
      });

      const expActualizado = await obtenerExpediente(id);
      let cronogramaGenerado = expActualizado.cronograma as CronogramaFormValues | null;

      const fechasLogicasFront = calcularFechasSugeridas(
        data.fechaLlamadoParticipar,
        dictamenPaso1.tipoContratacion,
        nonWorkingDays
      );

      cronogramaGenerado = {
        ...(cronogramaGenerado ?? ({} as CronogramaFormValues)),
        ...fechasLogicasFront,
      };

      setCronogramaData(cronogramaGenerado);
      setCalendarEvents(
        cronogramaToEvents(cronogramaGenerado as unknown as Record<string, unknown>)
      );

      const fechaInicio = new Date(`${data.fechaLlamadoParticipar}T00:00:00`);
      setCalendarInitialMonth(new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), 1));

      toast.success("Expediente actualizado. Revise el cronograma.");
      goToStep(4);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al actualizar el expediente");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventDrop = (eventId: string, diffInDays: number) => {
    if (readOnly) return;
    if (!cronogramaData || !dictamenPaso1 || diffInDays === 0) return;
    if (detallesPaso2?.modalidadConcursoAbierto !== "ACTO_UNICO_APERTURA_UNICA") return;

    const result = moverFechaCronograma(
      cronogramaData,
      eventId,
      diffInDays,
      dictamenPaso1.tipoContratacion,
      nonWorkingDays
    );

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

  const handleEventDropCd = (eventId: string, diffInDays: number) => {
    if (readOnly) return;
    if (!cronogramaCd || diffInDays === 0) return;

    const result = moverFechaCronogramaCd(cronogramaCd, eventId, diffInDays, nonWorkingDays);

    if (!result.success) {
      if (result.errorMsg) toast.error(result.errorMsg);
      return;
    }

    if (result.newCronograma) {
      setCronogramaCd(result.newCronograma);
      setCalendarEvents(cronogramaCdToEvents(result.newCronograma));
    }
  };

  const handleEventDropCc = (eventId: string, diffInDays: number) => {
    if (readOnly) return;
    if (!cronogramaCc || !dictamenPaso1 || diffInDays === 0) return;

    const result = moverFechaCronogramaCc(
      cronogramaCc,
      eventId,
      diffInDays,
      dictamenPaso1.tipoContratacion,
      nonWorkingDays
    );

    if (!result.success) {
      if (result.errorMsg) toast.error(result.errorMsg);
      return;
    }

    if (result.newCronograma) {
      setCronogramaCc(result.newCronograma);
      setCalendarEvents(cronogramaCcToEvents(result.newCronograma));
    }
  };

  const handleEventDropCp = (eventId: string, diffInDays: number) => {
    if (readOnly) return;
    if (!cronogramaCp || !dictamenPaso1 || diffInDays === 0) return;

    const result = moverFechaCronogramaCp(
      cronogramaCp,
      eventId,
      diffInDays,
      dictamenPaso1.tipoContratacion,
      nonWorkingDays
    );

    if (!result.success) {
      if (result.errorMsg) toast.error(result.errorMsg);
      return;
    }

    if (result.newCronograma) {
      setCronogramaCp(result.newCronograma);
      setCalendarEvents(cronogramaCpToEvents(result.newCronograma));
    }
  };

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
      router.push(`/gestion-expedientes/${expedienteId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar el cronograma");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinishCd = async () => {
    if (readOnly) return;
    if (!expedienteId || !dictamenPaso1 || !detallesContratacionDirecta || !cronogramaCd) {
      toast.error("Faltan datos del procedimiento de Contratación Directa.");
      return;
    }

    setIsLoading(true);
    try {
      await guardarCronograma(
        expedienteId,
        cronogramaCdToPut(cronogramaCd, dictamenPaso1.tipoContratacion, nonWorkingDays)
      );
      const cod = detallesContratacionDirecta.codNomenclaturaProcesoCd;
      toast.success("¡Expediente de Contratación Directa creado!", {
        description: `La Ficha Técnica para el procedimiento ${cod} ha sido generada. Los plazos y actores han sido registrados.`,
      });
      router.push(`/gestion-expedientes/${expedienteId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar el cronograma");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinishCc = async () => {
    if (readOnly) return;
    if (!expedienteId || !dictamenPaso1 || !detallesConcursoCerrado || !cronogramaCc) {
      toast.error("Faltan datos del procedimiento de Concurso Cerrado.");
      return;
    }

    setIsLoading(true);
    try {
      await guardarCronograma(
        expedienteId,
        cronogramaCcToPut(cronogramaCc, dictamenPaso1.tipoContratacion, nonWorkingDays)
      );
      const cod = detallesConcursoCerrado.codNomenclaturaProcesoCc;
      toast.success("¡Expediente creado exitosamente!", {
        description: `La Ficha técnica para el procedimiento ${cod} ha sido generada. Los plazos legales y actores han sido registrados.`,
      });
      router.push(`/gestion-expedientes/${expedienteId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar el cronograma");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinishCp = async () => {
    if (readOnly) return;
    if (!expedienteId || !dictamenPaso1 || !detallesConsultaPrecios || !cronogramaCp) {
      toast.error("Faltan datos del procedimiento de Consulta de Precios.");
      return;
    }

    setIsLoading(true);
    try {
      await guardarCronograma(
        expedienteId,
        cronogramaCpToPut(cronogramaCp, dictamenPaso1.tipoContratacion, nonWorkingDays)
      );
      const cod = detallesConsultaPrecios.codNomenclaturaProcesoCp;
      toast.success("¡Expediente creado exitosamente!", {
        description: `La Ficha técnica para el procedimiento ${cod} ha sido generada. Los plazos legales y actores han sido registrados.`,
      });
      router.push(`/gestion-expedientes/${expedienteId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar el cronograma");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinishMe = async () => {
    if (readOnly) return;
    if (!expedienteId || !dictamenPaso1 || !detallesModalidadesExcluidas || !cronogramaMe) {
      toast.error("Faltan datos del procedimiento de Modalidades Excluidas.");
      return;
    }

    setIsLoading(true);
    try {
      await guardarCronograma(
        expedienteId,
        cronogramaMeToPut(cronogramaMe, dictamenPaso1.tipoContratacion, nonWorkingDays)
      );
      const cod = detallesModalidadesExcluidas.codNomenclaturaProcesoMe;
      toast.success("¡Expediente creado exitosamente!", {
        description: `La Ficha técnica para el procedimiento ${cod} ha sido generada. Los plazos legales y actores han sido registrados.`,
      });
      router.push(`/gestion-expedientes/${expedienteId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar el cronograma");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-4xl shadow-sm border-0 mb-16">
      <CardHeader className="px-10 pt-10 pb-6 border-b border-slate-200">
        <CardTitle className="text-[28px] font-bold text-heading-dark font-inter">
          {meta.title}
        </CardTitle>
        <CardDescription className="text-slate-500 italic mt-1 font-inter text-base">
          {meta.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="px-10 pt-8 pb-10 min-w-0 overflow-x-hidden">
        <StepProgressBar currentStep={currentStep} />

        {currentStep === 1 && (
          <CalculoModalidadStep
            initialDictamen={dictamenPaso1}
            onComplete={handlePaso1Complete}
            readOnly={readOnly}
          />
        )}

        {currentStep === 2 &&
          (isConcursoAbierto ? (
            <DetallesConcursoAbiertoStep
              initialValues={detallesPaso2}
              onBack={() => goToStep(1)}
              onNext={handlePaso2Complete}
              readOnly={readOnly || isLoading}
            />
          ) : isContratacionDirecta ? (
            <DetallesContratacionDirectaStep
              initialValues={detallesContratacionDirecta}
              onBack={() => goToStep(1)}
              onNext={handlePaso2ContratacionDirectaComplete}
              readOnly={readOnly}
            />
          ) : isConcursoCerrado ? (
            <DetallesConcursoCerradoStep
              initialValues={detallesConcursoCerrado}
              onBack={() => goToStep(1)}
              onNext={handlePaso2ConcursoCerradoComplete}
              readOnly={readOnly || isLoading}
            />
          ) : isConsultaPrecios ? (
            <DetallesConsultaPreciosStep
              initialValues={detallesConsultaPrecios}
              onBack={() => goToStep(1)}
              onNext={handlePaso2ConsultaPreciosComplete}
              readOnly={readOnly}
            />
          ) : isModalidadesExcluidas ? (
            <DetallesModalidadesExcluidasStep
              initialValues={detallesModalidadesExcluidas}
              onBack={() => goToStep(1)}
              onNext={handlePaso2ModalidadesExcluidasComplete}
              readOnly={readOnly || isLoading}
            />
          ) : (
            <PasoStubStep
              title="Especificaciones"
              onBack={() => goToStep(1)}
              onNext={() => goToStep(3)}
            />
          ))}

        {currentStep === 3 &&
          (isConcursoAbierto ? (
            <ActoresTiemposStep
              initialValues={actoresPaso3}
              onBack={() => goToStep(2)}
              onNext={handlePaso3Complete}
              readOnly={readOnly || isLoading}
            />
          ) : isContratacionDirecta && dictamenPaso1 ? (
            <ActoresContratacionDirectaStep
              tipoContratacion={dictamenPaso1.tipoContratacion}
              valorUcauBase={dictamenPaso1.valorUcauBase}
              initialValues={actoresContratacionDirecta}
              onBack={() => goToStep(2)}
              onNext={handlePaso3ContratacionDirectaComplete}
              readOnly={readOnly || isLoading}
            />
          ) : isConcursoCerrado ? (
            <ActoresConcursoCerradoStep
              initialValues={actoresConcursoCerrado}
              onBack={() => goToStep(2)}
              onNext={handlePaso3ConcursoCerradoComplete}
              readOnly={readOnly || isLoading}
            />
          ) : isConsultaPrecios && dictamenPaso1 ? (
            <ActoresConsultaPreciosStep
              tipoContratacion={dictamenPaso1.tipoContratacion}
              valorUcauBase={dictamenPaso1.valorUcauBase}
              initialValues={actoresConsultaPrecios}
              onBack={() => goToStep(2)}
              onNext={handlePaso3ConsultaPreciosComplete}
              readOnly={readOnly || isLoading}
            />
          ) : isModalidadesExcluidas ? (
            <ActoresModalidadesExcluidasStep
              initialValues={actoresModalidadesExcluidas}
              onBack={() => goToStep(2)}
              onNext={handlePaso3ModalidadesExcluidasComplete}
              readOnly={readOnly || isLoading}
            />
          ) : (
            <PasoStubStep
              title="Actores y tiempos"
              onBack={() => goToStep(2)}
              onNext={() => goToStep(4)}
            />
          ))}

        {currentStep === 4 &&
          (isAperturaUnica &&
          detallesPaso2?.modalidadConcursoAbierto === "ACTO_UNICO_APERTURA_UNICA" ? (
            <PlanificacionStep
              events={calendarEvents}
              initialMonth={calendarInitialMonth}
              onBack={() => goToStep(3)}
              onFinish={handleFinish}
              onEventDrop={handleEventDrop}
              isLoading={isLoading}
              nonWorkingDays={nonWorkingDays}
              feriadoDescriptions={feriadoDescriptions}
            />
          ) : isContratacionDirecta ? (
            <PlanificacionStep
              events={calendarEvents}
              initialMonth={calendarInitialMonth}
              onBack={() => goToStep(3)}
              onFinish={handleFinishCd}
              onEventDrop={handleEventDropCd}
              isLoading={isLoading}
              nonWorkingDays={nonWorkingDays}
              feriadoDescriptions={feriadoDescriptions}
              finishLabel="Validar y crear expediente"
              legendItems={LEGEND_ITEMS_CD}
            />
          ) : isConcursoCerrado ? (
            <PlanificacionStep
              events={calendarEvents}
              initialMonth={calendarInitialMonth}
              onBack={() => goToStep(3)}
              onFinish={handleFinishCc}
              onEventDrop={handleEventDropCc}
              isLoading={isLoading}
              nonWorkingDays={nonWorkingDays}
              feriadoDescriptions={feriadoDescriptions}
              finishLabel="Validar y crear expediente"
              legendItems={LEGEND_ITEMS_CC}
            />
          ) : isConsultaPrecios ? (
            <PlanificacionStep
              events={calendarEvents}
              initialMonth={calendarInitialMonth}
              onBack={() => goToStep(3)}
              onFinish={handleFinishCp}
              onEventDrop={handleEventDropCp}
              isLoading={isLoading}
              nonWorkingDays={nonWorkingDays}
              feriadoDescriptions={feriadoDescriptions}
              finishLabel="Validar y crear expediente"
              legendItems={LEGEND_ITEMS_CP}
            />
          ) : isModalidadesExcluidas && cronogramaMe ? (
            <PlanificacionModalidadesExcluidasStep
              cronograma={cronogramaMe}
              onCronogramaChange={setCronogramaMe}
              onBack={() => goToStep(3)}
              onFinish={handleFinishMe}
              isLoading={isLoading}
              readOnly={readOnly}
            />
          ) : (
            <PasoStubStep title="Cronograma" onBack={() => goToStep(3)} />
          ))}
      </CardContent>
    </Card>
  );
}

import type { Expediente, AnalisisModalidad } from "@/types/expediente.types";
import type { IEvent } from "@/components/features-components/ElaboracionExpediente/calendar/types";

/**
 * Datos mock para la tabla del Panel de Expedientes
 */
export const EXPEDIENTES_MOCK: Expediente[] = [
  {
    id: "1",
    nomenclatura: "Exp-001-AU-AU",
    objetoContrato: "Compra de papelería",
    tipo: "Bienes",
    modalidad: "Concurso Abierto Acto Único / Apertura Única",
    progreso: 80,
    fase: "Fase 3",
  },
  {
    id: "2",
    nomenclatura: "Exp-002-AS-SD",
    objetoContrato: "Servicio de Limpieza",
    tipo: "Servicios",
    modalidad: "Contratación Directa",
    progreso: 45,
    fase: "Fase 2",
  },
  {
    id: "3",
    nomenclatura: "Exp-003-CP-OA",
    objetoContrato: "Construcción Sede Central",
    tipo: "Obras",
    modalidad: "Consulta de Precios",
    progreso: 15,
    fase: "Fase 1",
  },
  {
    id: "4",
    nomenclatura: "Exp-004-CA-SD",
    objetoContrato: "Auditoría de Sistemas",
    tipo: "Servicios",
    modalidad: "Concurso Cerrado",
    progreso: 90,
    fase: "Fase 4",
  },
  {
    id: "5",
    nomenclatura: "Exp-001-AU-AU",
    objetoContrato: "Compra de papelería",
    tipo: "Bienes",
    modalidad: "Concurso Abierto Acto Único / Apertura Única",
    progreso: 80,
    fase: "Fase 3",
  },
  {
    id: "6",
    nomenclatura: "Exp-003-CP-OA",
    objetoContrato: "Construcción Sede Central",
    tipo: "Obras",
    modalidad: "Consulta de Precios",
    progreso: 15,
    fase: "Fase 1",
  },
];

/**
 * Resultado mock del análisis de modalidad (Paso 2)
 */
export const ANALISIS_MODALIDAD_MOCK: AnalisisModalidad = {
  objetoProceso:
    "Adquisición de insumos médicos y quirúrgicos para el fortalecimiento de la red hospitalaria regional, correspondiente al primer cuatrimestre del año fiscal en curso. Incluye reactivos de laboratorio y material descartable.",
  tipoContratacion: "Bienes",
  montoUCAU: 112.5,
  montoBs: 4500000,
  montoDolares: 125000,
  modalidadSugerida: "Concurso Abierto, acto único, apertura única",
  baseLegal: "Artículo 78, Numeral [1], DLCP",
};

/**
 * Opciones mock para los selects del Paso 3
 */
export const AUTORIDADES_MOCK = [
  { value: "autoridad-1", label: "Dr. Juan Pérez - Director General" },
  { value: "autoridad-2", label: "Ing. María González - Directora Adjunta" },
  { value: "autoridad-3", label: "Lic. Carlos Rodríguez - Delegado" },
];

export const COMISIONES_MOCK = [
  { value: "comision-1", label: "Comisión de Contrataciones Nro. 001" },
  { value: "comision-2", label: "Comisión de Contrataciones Nro. 002" },
  { value: "comision-3", label: "Comisión de Contrataciones Nro. 003" },
];

export const UNIDADES_USUARIAS_MOCK = [
  { value: "unidad-1", label: "Unidad de Administración y Finanzas" },
  { value: "unidad-2", label: "Unidad de Tecnología de la Información" },
  { value: "unidad-3", label: "Unidad de Recursos Humanos" },
  { value: "unidad-4", label: "Unidad de Planificación y Presupuesto" },
];

/**
 * Opciones de tipo de contratación para el Select del Paso 1
 */
export const TIPOS_CONTRATACION_OPTIONS = [
  { value: "Bienes", label: "Bienes" },
  { value: "Servicios", label: "Servicios" },
  { value: "Obras", label: "Obras" },
];

/**
 * Cronograma mock para el Paso 4 — Planificación del Procedimiento
 * Corresponde al calendario de Marzo 2026 de la imagen de referencia
 */
export const CRONOGRAMA_MOCK: IEvent[] = [
  {
    id: "ev-1",
    title: "Disponibilidad del Pliego",
    startDate: "2026-03-02",
    endDate: "2026-03-07",
    color: "orange",
  },
  {
    id: "ev-2",
    title: "Apertura de Actividades",
    startDate: "2026-03-05",
    endDate: "2026-03-05",
    color: "green",
  },
  {
    id: "ev-3",
    title: "Modificaciones al Pliego",
    startDate: "2026-03-09",
    endDate: "2026-03-09",
    color: "blue",
  },
  {
    id: "ev-4",
    title: "Disponibilidad del Pliego",
    startDate: "2026-03-09",
    endDate: "2026-03-09",
    color: "orange",
  },
  {
    id: "ev-5",
    title: "Recepción de Aclaraciones",
    startDate: "2026-03-10",
    endDate: "2026-03-11",
    color: "purple",
  },
  {
    id: "ev-6",
    title: "Recepción de Ofertas",
    startDate: "2026-03-11",
    endDate: "2026-03-13",
    color: "red",
  },
  {
    id: "ev-7",
    title: "Evaluación",
    startDate: "2026-03-18",
    endDate: "2026-03-19",
    color: "red",
  },
  {
    id: "ev-8",
    title: "Adjudicación",
    startDate: "2026-03-24",
    endDate: "2026-03-25",
    color: "yellow",
  },
  {
    id: "ev-9",
    title: "Notificación",
    startDate: "2026-03-26",
    endDate: "2026-03-26",
    color: "yellow",
  },
];

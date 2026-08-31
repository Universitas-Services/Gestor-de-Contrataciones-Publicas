export type CalificacionFinancieraFormStatus = "draft" | "completed";

export type TresRangosMode = "ascendente" | "inverso";

export interface TresRangosValues {
  rangoMaximo: number;
  puntajeMaximo: number | null;
  rangoMedioDesde: number;
  rangoMedioHasta: number;
  puntajeMedio: number | null;
  rangoMinimo: number;
  puntajeMinimo: number | null;
}

export interface CalificacionFinancieraFormValues {
  criterioCalifFinanDescapitalAuAu: boolean | undefined;
  puntajeMaximoDescapitalAuAu: number | null;
  criterioCalifFinanSolvenciaAuAu: boolean | undefined;
  solvencia: TresRangosValues;
  criterioCalifFinanRotacionAuAu: boolean | undefined;
  rotacion: TresRangosValues;
  criterioCalifFinanRendimientoAuAu: boolean | undefined;
  rendimiento: TresRangosValues;
  criterioCalifFinanRentabilidadAuAu: boolean | undefined;
  rentabilidad: TresRangosValues;
  criterioCalifFinanEndeudamientoAuAu: boolean | undefined;
  endeudamiento: TresRangosValues;
  puntuacionMinimaCalifFinancieraAuAu: number;
}

export interface CalificacionFinancieraStoredForm {
  values: CalificacionFinancieraFormValues;
  status: CalificacionFinancieraFormStatus;
}

export const CALIFICACION_FINANCIERA_WIZARD_TITLE = "Matriz calificación financiera";
export const CALIFICACION_FINANCIERA_ALERT =
  "Parámetros de Evaluación: Seleccione los criterios financieros que aplicarán a este proceso. Los valores sugeridos corresponden a los estándares del Servicio Nacional de Contrataciones (SNC). Puede modificarlos si el proceso requiere mayor rigurosidad.";

export const CALIFICACION_FINANCIERA_DRAFT_LABEL = "Guardar borrador";
export const CALIFICACION_FINANCIERA_SUBMIT_LABEL = "Guardar Calificación Financiera";
export const CALIFICACION_FINANCIERA_SUBMIT_HINT =
  "¿Están todos los criterios necesarios? Confirma tu selección antes de guardar.";

export const CALIFICACION_FINANCIERA_SUCCESS_TITLE = "Calificación financiera guardada";
export const CALIFICACION_FINANCIERA_SUCCESS_DESCRIPTION =
  "La matriz de calificación financiera ha sido configurada exitosamente.";

export function getCalificacionFinancieraFormStorageKey(expedienteId: string): string {
  return `calificacion-financiera-form:${expedienteId}`;
}

export const SNC_DEFAULTS = {
  descapitalPuntaje: 20,
  solvencia: {
    rangoMaximo: 1.1,
    puntajeMaximo: 20,
    rangoMedioDesde: 1.0,
    rangoMedioHasta: 1.09,
    puntajeMedio: 10,
    rangoMinimo: 1.0,
    puntajeMinimo: 0,
  },
  rotacion: {
    rangoMaximo: 12,
    puntajeMaximo: 20,
    rangoMedioDesde: 6,
    rangoMedioHasta: 11.99,
    puntajeMedio: 10,
    rangoMinimo: 6,
    puntajeMinimo: 0,
  },
  rendimiento: {
    rangoMaximo: 0.05,
    puntajeMaximo: 20,
    rangoMedioDesde: 0.01,
    rangoMedioHasta: 0.0499,
    puntajeMedio: 10,
    rangoMinimo: 0.01,
    puntajeMinimo: 0,
  },
  rentabilidad: {
    rangoMaximo: 0.1,
    puntajeMaximo: 20,
    rangoMedioDesde: 0.02,
    rangoMedioHasta: 0.0999,
    puntajeMedio: 10,
    rangoMinimo: 0.02,
    puntajeMinimo: 0,
  },
  endeudamiento: {
    rangoMaximo: 0.7,
    puntajeMaximo: 20,
    rangoMedioDesde: 0.71,
    rangoMedioHasta: 1.2,
    puntajeMedio: 10,
    rangoMinimo: 1.2,
    puntajeMinimo: 0,
  },
  puntuacionMinima: 60,
} as const;

/** Rangos SNC como sugerencia; puntajes vacíos para que el usuario los asigne. */
function createEmptyTresRangos(snc: (typeof SNC_DEFAULTS)["solvencia"]): TresRangosValues {
  return {
    rangoMaximo: snc.rangoMaximo,
    rangoMedioDesde: snc.rangoMedioDesde,
    rangoMedioHasta: snc.rangoMedioHasta,
    rangoMinimo: snc.rangoMinimo,
    puntajeMaximo: null,
    puntajeMedio: null,
    puntajeMinimo: null,
  };
}

export const TOTAL_PUNTAJE_MAXIMO = 100;

export const CALIFICACION_FINANCIERA_SUMA_EXCEDIDA =
  "La suma de los puntajes máximos de los criterios activos no puede superar 100 puntos.";

export function getTotalPuntajeMaximoActivos(values: CalificacionFinancieraFormValues): number {
  let total = 0;
  if (values.criterioCalifFinanDescapitalAuAu === true) {
    total += values.puntajeMaximoDescapitalAuAu ?? 0;
  }
  if (values.criterioCalifFinanSolvenciaAuAu === true) {
    total += values.solvencia.puntajeMaximo ?? 0;
  }
  if (values.criterioCalifFinanRotacionAuAu === true) {
    total += values.rotacion.puntajeMaximo ?? 0;
  }
  if (values.criterioCalifFinanRendimientoAuAu === true) {
    total += values.rendimiento.puntajeMaximo ?? 0;
  }
  if (values.criterioCalifFinanRentabilidadAuAu === true) {
    total += values.rentabilidad.puntajeMaximo ?? 0;
  }
  if (values.criterioCalifFinanEndeudamientoAuAu === true) {
    total += values.endeudamiento.puntajeMaximo ?? 0;
  }
  return Math.round(total * 100) / 100;
}

export function createDefaultCalificacionFinancieraValues(): CalificacionFinancieraFormValues {
  return {
    criterioCalifFinanDescapitalAuAu: undefined,
    puntajeMaximoDescapitalAuAu: null,
    criterioCalifFinanSolvenciaAuAu: undefined,
    solvencia: createEmptyTresRangos(SNC_DEFAULTS.solvencia),
    criterioCalifFinanRotacionAuAu: undefined,
    rotacion: createEmptyTresRangos(SNC_DEFAULTS.rotacion),
    criterioCalifFinanRendimientoAuAu: undefined,
    rendimiento: createEmptyTresRangos(SNC_DEFAULTS.rendimiento),
    criterioCalifFinanRentabilidadAuAu: undefined,
    rentabilidad: createEmptyTresRangos(SNC_DEFAULTS.rentabilidad),
    criterioCalifFinanEndeudamientoAuAu: undefined,
    endeudamiento: createEmptyTresRangos(SNC_DEFAULTS.endeudamiento),
    puntuacionMinimaCalifFinancieraAuAu: SNC_DEFAULTS.puntuacionMinima,
  };
}

export type CriterioFinancieroId =
  | "descapital"
  | "solvencia"
  | "rotacion"
  | "rendimiento"
  | "rentabilidad"
  | "endeudamiento";

export interface CriterioFinancieroMeta {
  id: CriterioFinancieroId;
  toggleKey:
    | "criterioCalifFinanDescapitalAuAu"
    | "criterioCalifFinanSolvenciaAuAu"
    | "criterioCalifFinanRotacionAuAu"
    | "criterioCalifFinanRendimientoAuAu"
    | "criterioCalifFinanRentabilidadAuAu"
    | "criterioCalifFinanEndeudamientoAuAu";
  title: string;
  pregunta: string;
  basamentoLegal: string;
  aspectoLabel: string;
  aspectoHint: string;
  mode?: TresRangosMode;
  unitSuffix?: string;
  showPercentHint?: boolean;
  inverseRibbon?: boolean;
}

export const CRITERIOS_FINANCIEROS_META: CriterioFinancieroMeta[] = [
  {
    id: "descapital",
    toggleKey: "criterioCalifFinanDescapitalAuAu",
    title: "Estado de Descapitalización",
    pregunta:
      "¿Desea activar la verificación del estado de descapitalización del oferente como criterio de calificación financiera?",
    basamentoLegal: "Artículos 67 RLCP; Providencias SNC.",
    aspectoLabel: "Empresa en proceso de descapitalización",
    aspectoHint: "Patrimonio Neto < 50% × Capital Social",
  },
  {
    id: "solvencia",
    toggleKey: "criterioCalifFinanSolvenciaAuAu",
    title: "Solvencia",
    pregunta:
      "¿Desea incluir el indicador de Solvencia (Activo Circulante/Pasivo Circulante) en la matriz de calificación, de conformidad con los estándares del Servicio Nacional de Contratistas?",
    basamentoLegal: "Artículos 67 RLCP; Parámetros SNC.",
    aspectoLabel: "Solvencia",
    aspectoHint: "Activo Circulante / Pasivo Circulante",
    mode: "ascendente",
  },
  {
    id: "rotacion",
    toggleKey: "criterioCalifFinanRotacionAuAu",
    title: "Rotación de Cuentas por Cobrar",
    pregunta:
      "¿Desea incluir el indicador de Rotación de Cuentas por Cobrar en la matriz de calificación para evaluar la eficiencia en la gestión de cobros y liquidez operativa del oferente?",
    basamentoLegal: "Artículo 67 RLCP; Parámetros SNC.",
    aspectoLabel: "Rotación cuentas por cobrar",
    aspectoHint: "Ventas / Cuentas por Cobrar",
    mode: "ascendente",
    unitSuffix: "veces",
  },
  {
    id: "rendimiento",
    toggleKey: "criterioCalifFinanRendimientoAuAu",
    title: "Rendimiento sobre Activos (ROA)",
    pregunta:
      "¿Desea incluir el indicador de Rendimiento sobre Activos ROA (Utilidad Neta/Activo Total) en la matriz de calificación para medir la eficacia del oferente en la generación de beneficios mediante el uso de sus activos?",
    basamentoLegal: "Artículo 67 RLCP; Parámetros SNC.",
    aspectoLabel: "Rendimiento sobre Activos ROA",
    aspectoHint: "Utilidad Neta / Activo Total",
    mode: "ascendente",
    showPercentHint: true,
  },
  {
    id: "rentabilidad",
    toggleKey: "criterioCalifFinanRentabilidadAuAu",
    title: "Rentabilidad del Patrimonio (ROE)",
    pregunta:
      "¿Desea incluir el indicador de Rentabilidad del Patrimonio ROE (Utilidad Neta/Patrimonio) en la matriz de calificación para evaluar la capacidad de la empresa de generar utilidades a favor de sus accionistas y su solidez de capital?",
    basamentoLegal: "Artículo 67 RLCP; Parámetros SNC.",
    aspectoLabel: "Rentabilidad del Patrimonio ROE",
    aspectoHint: "Utilidad Neta / Patrimonio",
    mode: "ascendente",
    showPercentHint: true,
  },
  {
    id: "endeudamiento",
    toggleKey: "criterioCalifFinanEndeudamientoAuAu",
    title: "Endeudamiento",
    pregunta:
      "¿Desea incluir el indicador de Endeudamiento (Pasivo Total/Activo Total) en la matriz de calificación para determinar qué porcentaje de los activos del oferente está comprometido con terceros y medir su autonomía financiera?",
    basamentoLegal: "Artículo 67 RLCP; Parámetros SNC.",
    aspectoLabel: "Endeudamiento",
    aspectoHint: "Pasivo Total / Activo Total",
    mode: "inverso",
    inverseRibbon: true,
  },
];

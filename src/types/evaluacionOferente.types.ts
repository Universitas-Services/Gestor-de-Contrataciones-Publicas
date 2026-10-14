export type ChecklistSiNo = "SI" | "NO";

export type RecaudoSobreEvaluacion = 1 | 2;

/** Módulos del menú de evaluación (Concurso Abierto · Apertura Única). */
export type EvaluacionModuloId = "legal" | "financiera" | "tecnica" | "evaluacion" | "promocion";

export type ResultadoFinalEvaluacion =
  | "pendiente"
  | "en_evaluacion"
  | "descalificado"
  | "calificado";

export interface RecaudoCotejoItem {
  id: string;
  sobre: RecaudoSobreEvaluacion;
  pregunta: string;
  etiquetaCorta: string;
  /** Si false (p. ej. VAN), no entra en el dictamen ni es obligatorio al confirmar. */
  eliminatorio: boolean;
  personalizado?: boolean;
}

export interface RecaudoCotejoRespuesta {
  consignado?: ChecklistSiNo;
  observacion: string;
}

export interface CalificacionLegalEvaluacionValues {
  items: Record<string, RecaudoCotejoRespuesta>;
  justificacion: string;
  indVerificadoGarantia: boolean | null;
  indVerificadoCrs: boolean | null;
  obsVerificadoGarantia: string;
  obsVerificadoCrs: string;
}

/** Criterios de la plantilla financiera (snapshot Fase 1). */
export type CriterioFinancieroEvalId =
  | "descapital"
  | "solvencia"
  | "rotacion"
  | "rendimiento"
  | "rentabilidad"
  | "endeudamiento";

export type BandaFinanciera = "max" | "medio" | "min";

export interface TresRangosPlantilla {
  rangoMaximo: number;
  puntajeMaximo: number;
  rangoMedioDesde: number;
  rangoMedioHasta: number;
  puntajeMedio: number;
  rangoMinimo: number;
  puntajeMinimo: number;
}

export interface CriterioFinancieroPlantillaDescapital {
  id: "descapital";
  kind: "descapital";
  titulo: string;
  pregunta: string;
  basamentoLegal: string;
  puntajeMaximo: number;
}

export interface CriterioFinancieroPlantillaIndice {
  id: Exclude<CriterioFinancieroEvalId, "descapital">;
  kind: "indice";
  titulo: string;
  pregunta: string;
  basamentoLegal: string;
  aspectoHint: string;
  mode: "ascendente" | "inverso";
  rangos: TresRangosPlantilla;
}

export type CriterioFinancieroPlantilla =
  | CriterioFinancieroPlantillaDescapital
  | CriterioFinancieroPlantillaIndice;

export interface PlantillaFinanciera {
  puntuacionMinima: number;
  criterios: CriterioFinancieroPlantilla[];
}

export interface CriterioFinancieroRespuesta {
  /** Descapital: SI/NO. Índices: string del input (permite tipado parcial). */
  valor?: ChecklistSiNo | string;
}

export interface CalificacionFinancieraEvaluacionValues {
  criterios: Record<string, CriterioFinancieroRespuesta>;
  justificacion: string;
}

/** Criterios técnicos (snapshot Fase 1). Modo A: rangos > 1; Modo B: rangos === 1. */
export interface RangoTecnicoPlantilla {
  id: string;
  descripcion: string;
  puntaje: number;
}

export interface CriterioTecnicoPlantilla {
  id: string;
  nombre: string;
  descripcion: string;
  /** Ponderación máxima del criterio (suma de criterios = 100). */
  ponderacion: number;
  rangos: RangoTecnicoPlantilla[];
}

export interface PlantillaTecnica {
  puntuacionMinima: number;
  criterios: CriterioTecnicoPlantilla[];
}

export interface CriterioTecnicoRespuesta {
  rangoIdSeleccionado?: string;
  /** Decimal(5,2); en Modo A se autocompleta al elegir rango. */
  puntuacionObtenida?: number | null;
  /** Sustento físico de la oferta. Varchar(255). */
  valorObtenido: string;
}

export interface CalificacionTecnicaEvaluacionValues {
  criterios: Record<string, CriterioTecnicoRespuesta>;
  justificacion: string;
}

/** Alias: mismos criterios Modo A/B que calificación técnica (snapshot Fase 1 evaluación). */
export type CriterioEvaluacionPlantilla = CriterioTecnicoPlantilla;
export type CriterioEvaluacionRespuesta = CriterioTecnicoRespuesta;

export interface LadoEvaluacionPlantilla {
  puntuacionMinima: number;
  /** Suma de ponderaciones del lado (peso en la bolsa de 100). */
  maxPuntos: number;
  criterios: CriterioEvaluacionPlantilla[];
}

export interface PlantillaEvaluacion {
  tecnica: LadoEvaluacionPlantilla;
  economica: LadoEvaluacionPlantilla;
}

export interface EvaluacionLadoFormValues {
  criterios: Record<string, CriterioEvaluacionRespuesta>;
  justificacion: string;
}

export interface EvaluacionPuntajeEvaluacionValues {
  tecnica: EvaluacionLadoFormValues;
  economica: EvaluacionLadoFormValues;
  /** Primera…Sexta Opción; solo si ambos lados CUMPLE. */
  posicionPrelacion: string;
}

/** Snapshot Actividades Previas · Paso 4 (promoción económica). */
export interface PlantillaPromocion {
  activa: boolean;
  requiereVan: boolean;
  /** Máximo pts bono VAN parametrizado en Fase 1 (puntajeVan). */
  puntajeVanMax: number;
  indPrefLocal: boolean;
  puntuacionBonoLocal: number;
  indBonoSujeto: boolean;
  puntuacionBonoSujeto: number;
}

export interface PromocionEconomicaEvaluacionValues {
  consignoDeclaracionVan?: boolean;
  valVanOferente: number | null;
  ptsBonoVan: number | null;
  aplicaPrefLocal?: boolean;
  aplicaBonoSujeto?: boolean;
  ptsBonoLocal: number;
  ptsBonoSujeto: number;
  totalPuntosPromocion: number;
  puntuacionFinalConBonos: number;
  calculado: boolean;
}

export interface EvaluacionOferenteBannerData {
  nombreProveedor: string;
  rif: string;
  montoOfertaBs: number | null;
}

export interface EvaluacionOferentePersistedState {
  resultadoFinal: ResultadoFinalEvaluacion;
  legalSubmitted: boolean;
  oferenteCalificadoLegal: boolean | null;
  legalForm: CalificacionLegalEvaluacionValues;
  financieraSubmitted: boolean;
  oferenteCalificadoFinanciera: boolean | null;
  financieraForm: CalificacionFinancieraEvaluacionValues;
  tecnicaSubmitted: boolean;
  oferenteCalificadoTecnica: boolean | null;
  tecnicaForm: CalificacionTecnicaEvaluacionValues;
  evaluacionSubmitted: boolean;
  oferenteEvaluadoTecnico: boolean | null;
  oferenteEvaluadoEconomico: boolean | null;
  evaluacionForm: EvaluacionPuntajeEvaluacionValues;
  promocionSubmitted: boolean;
  promocionForm: PromocionEconomicaEvaluacionValues;
  unlocked: {
    financiera: boolean;
    tecnica: boolean;
    evaluacion: boolean;
    promocion: boolean;
  };
  activeModulo: EvaluacionModuloId;
}

/** Acción de los PATCH /evaluacion-fase3/{id}/hub/{modulo}. */
export type HubPatchAction = "draft" | "confirm";

export type HubModuloPatchId = "legal" | "financiera" | "tecnica" | "evaluacion" | "promocion";

/** Envelope GET/PATCH del hub (API Nest). */
export interface HubEvaluacionResponse {
  evaluacionId: string;
  expedienteId: string;
  modalidad: string;
  banner: EvaluacionOferenteBannerData;
  resultadoFinal: ResultadoFinalEvaluacion;
  activeModulo: EvaluacionModuloId;
  unlocked: EvaluacionOferentePersistedState["unlocked"];
  plantillaLegal: { items: RecaudoCotejoItem[] };
  legal: {
    submitted: boolean;
    oferenteCalificadoLegal: boolean | null;
    form: {
      items: Record<string, { consignado?: ChecklistSiNo | null; observacion?: string }>;
      justificacion: string;
      indVerificadoGarantia?: boolean | null;
      indVerificadoCrs?: boolean | null;
      obsVerificadoGarantia?: string | null;
      obsVerificadoCrs?: string | null;
    };
  };
  plantillaFinanciera: PlantillaFinanciera;
  financiera: {
    submitted: boolean;
    oferenteCalificadoFinanciera: boolean | null;
    total: number | null;
    form: CalificacionFinancieraEvaluacionValues;
  };
  plantillaTecnica: PlantillaTecnica;
  tecnica: {
    submitted: boolean;
    oferenteCalificadoTecnica: boolean | null;
    total: number | null;
    form: CalificacionTecnicaEvaluacionValues;
  };
  plantillaEvaluacion: PlantillaEvaluacion;
  evaluacion: {
    submitted: boolean;
    oferenteEvaluadoTecnico: boolean | null;
    oferenteEvaluadoEconomico: boolean | null;
    totalTecnico: number | null;
    totalEconomico: number | null;
    notaBase: number | null;
    form: EvaluacionPuntajeEvaluacionValues;
  };
  plantillaPromocion: PlantillaPromocion | null;
  promocion: {
    submitted: boolean;
    totalPuntosPromocion: number | null;
    puntuacionFinalConBonos: number | null;
    form: {
      consignoDeclaracionVan?: boolean;
      valVanOferente?: number | null;
      ptsBonoVan?: number | null;
      aplicaPrefLocal?: boolean;
      aplicaBonoSujeto?: boolean;
    };
  } | null;
}

/** Plantillas + estado listos para la página del hub. */
export interface HubPageModel {
  banner: EvaluacionOferenteBannerData;
  plantillaLegal: RecaudoCotejoItem[];
  plantillaFinanciera: PlantillaFinanciera;
  plantillaTecnica: PlantillaTecnica;
  plantillaEvaluacion: PlantillaEvaluacion;
  plantillaPromocion: PlantillaPromocion | null;
  state: EvaluacionOferentePersistedState;
  notaBase: number | null;
}

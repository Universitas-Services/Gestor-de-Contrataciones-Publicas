export type CaracterAdjudicacion = "TOTAL" | "PARCIAL";

export interface AdjudicacionTotalFormLocal {
  /** Códigos marcados unidos por coma (Varchar mock / API futuro). */
  partidasAdjudicadasTotalAuAu: string;
  montoAdjudicadoTotalAuAu: string;
  plazoEjecucionOfertaGanadoraAuAu: string;
  montoManoObraOfertadoAuAu: string;
}

export interface AdjudicacionParcialFormLocal {
  oferenteAdjudicadoProcedimientoAuAu: boolean | undefined;
  causaNoAdjudicadoAuAu: string;
  cantidadRenglonesAuAu: string;
  alcanceAdjudicacionParcialAuAu: string;
  partidasAdjudicadasParcialAuAu: string;
  montoAdjudicadoParcialAuAu: string;
  plazoEjecucionOfertaParcialAuAu: string;
  montoManoObraOfertadoAuAu: string;
  /** Snapshot mock para cableado futuro a tb_adjudicacion. */
  snapshotOferente?: {
    nombre: string;
    rif: string;
    representanteLegal: string;
  };
}

export interface DictamenOferenteLocal {
  evaluacionId: string;
  guardado: boolean;
  total?: AdjudicacionTotalFormLocal;
  parcial?: AdjudicacionParcialFormLocal;
  /** Carácter TOTAL: causa registrada para un calificado que no es Primera Opción. */
  causaNoAdjudicado?: string;
  notificacionGenerada?: boolean;
}

export interface InformeRecomendacionLocal {
  existeItemsSinOfertasAuAu: boolean | undefined;
  itemsSinOfertasAuAu: string;
  motivoItemsSinOfertasAuAu: string;
  actualizacionPresupuestoAuAu: boolean | undefined;
  montoNuevoPresupuestoAuAu: string;
  justificacionActualizacionPresupuestoAuAu: string;
  observacionFormalidadesAuAu: boolean | undefined;
  omisionFormalidadesAuAu: string;
  subsanacionActoAuAu: string;
  datosActoSubsanacionAuAu: string;
  generado: boolean;
}

export interface Fase3GestionPersistedState {
  caracterAdjudicacionAuAu: CaracterAdjudicacion | null;
  dictamenes: Record<string, DictamenOferenteLocal>;
  informe: InformeRecomendacionLocal;
  documentoAdjudicacionGenerado: boolean;
}

export const EMPTY_TOTAL_FORM: AdjudicacionTotalFormLocal = {
  partidasAdjudicadasTotalAuAu: "",
  montoAdjudicadoTotalAuAu: "",
  plazoEjecucionOfertaGanadoraAuAu: "",
  montoManoObraOfertadoAuAu: "",
};

export const EMPTY_PARCIAL_FORM: AdjudicacionParcialFormLocal = {
  oferenteAdjudicadoProcedimientoAuAu: undefined,
  causaNoAdjudicadoAuAu: "",
  cantidadRenglonesAuAu: "",
  alcanceAdjudicacionParcialAuAu: "",
  partidasAdjudicadasParcialAuAu: "",
  montoAdjudicadoParcialAuAu: "",
  plazoEjecucionOfertaParcialAuAu: "",
  montoManoObraOfertadoAuAu: "",
};

export const EMPTY_INFORME: InformeRecomendacionLocal = {
  existeItemsSinOfertasAuAu: undefined,
  itemsSinOfertasAuAu: "",
  motivoItemsSinOfertasAuAu: "",
  actualizacionPresupuestoAuAu: undefined,
  montoNuevoPresupuestoAuAu: "",
  justificacionActualizacionPresupuestoAuAu: "",
  observacionFormalidadesAuAu: undefined,
  omisionFormalidadesAuAu: "",
  subsanacionActoAuAu: "",
  datosActoSubsanacionAuAu: "",
  generado: false,
};

export function createEmptyFase3State(): Fase3GestionPersistedState {
  return {
    caracterAdjudicacionAuAu: null,
    dictamenes: {},
    informe: { ...EMPTY_INFORME },
    documentoAdjudicacionGenerado: false,
  };
}

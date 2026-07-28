/** Payload PATCH /evaluacion-fase3/{id}/sobre1 (gestión — 13 ítems) */
export interface Sobre1Payload {
  cartaManifestacionVoluntad: boolean;
  obsCartaManifestacionVoluntad: string;
  cartaAutorizacion: boolean;
  obsCartaAutorizacion: string;
  docConstitutivo: boolean;
  obsDocConstitutivo: string;
  copiaRifVigente: boolean;
  obsCopiaRifVigente: string;
  certificadoRnc: boolean;
  obsCertificadoRnc: string;
  solvenciaLaboral: boolean;
  obsSolvenciaLaboral: string;
  declaracionSociosNoInhabilitados: boolean;
  obsDeclaracionSociosNoInhabilitados: string;
  declaracionNoDeudas: boolean;
  obsDeclaracionNoDeudas: string;
  declaracionNoImpedimentosLcp: boolean;
  obsDeclaracionNoImpedimentosLcp: string;
  declaracionInfoFinanciera: boolean;
  obsDeclaracionInfoFinanciera: string;
  relacionServiciosPrestados: boolean;
  obsRelacionServiciosPrestados: string;
  evaluacionDesempenio: boolean;
  obsEvaluacionDesempenio: string;
  referenciasComerciales: boolean;
  obsReferenciasComerciales: string;
}

/** Payload PATCH /sobre2 — solo checklist (1.er uso en gestión — 11 ítems) */
export interface Sobre2ChecklistPayload {
  ofertaTecnicoEconomica: boolean;
  obsOfertaTecnicoEconomica: string;
  cartaOferta: boolean;
  obsCartaOferta: string;
  declaracionCapacidadFinanciera: boolean;
  obsDeclaracionCapacidadFinanciera: string;
  declaracionCompromisoRespSocial: boolean;
  obsDeclaracionCompromisoRespSocial: string;
  garantiaMantenimientoOferta: boolean;
  obsGarantiaMantenimientoOferta: string;
  declaracionAutocalculoVan: boolean;
  obsDeclaracionAutocalculoVan: string;
  cartaNotificaciones: boolean;
  obsCartaNotificaciones: string;
  garantiaFielCumpl: boolean;
  obsGarantiaFielCumpl: string;
  cartaCompromiso: boolean;
  obsCartaCompromiso: string;
  fianzaLaboral: boolean;
  obsFianzaLaboral: string;
  experienciaPersonalTecnico: boolean;
  obsExperienciaPersonalTecnico: string;
}

/** Payload PATCH /evaluacion-fase3/{id}/calificacion (Página 1 — gestión) */
export interface CalificacionPayload {
  oferenteCalificadoLegal: boolean;
  justificacionCalificadoLegal: string;
  indiceLiquidez: number;
  indiceSolvencia: number;
  oferenteCalificadoFinanciera: boolean;
  justificacionCalificadaFinanciera: string;
  actividadComercial: number;
  relacionSuministros: number;
  referenciasComercialesPuntaje: number;
  oferenteCalificadoTecnica: boolean;
  justificacionCalificadoTecnica: string;
  oferenteCalificado: boolean;
  motivoDescalificacion: string;
  itemsDescalificacion: string;
}

/** Campos de evaluación técnica de matriz que van en PATCH /calificacion (no en /sobre2) */
export interface CalificacionEvaluacionTecnicaPayload {
  oferenteEvaluadoTecnico: boolean;
  justificacionEvaluadoTecnico: string;
}

/** Payload PATCH /sobre2 — matriz / evaluación (2.º uso en gestión) */
export interface Sobre2EvaluacionPayload {
  criterio1Evaluacion: string;
  puntuacionCriterio1: number;
  criterio2Evaluacion: string;
  puntuacionCriterio2: number;
  criterio3Evaluacion: string;
  puntuacionCriterio3: number;
  criterio4Evaluacion: string;
  puntuacionCriterio4: number;
  montoOfertaBs: number;
  porcentajeVan?: number;
  posicionPrelacion: string;
  oferenteCalificado: true;
  motivoDescalificacion: "";
}

export type ChecklistSiNo = "SI" | "NO";

export interface ChecklistItemDef {
  id: number;
  texto: string;
  field: string;
  obsField: string;
}

export type EstadoMicromoduloApi = "PENDIENTE" | "BORRADOR" | "COMPLETADO";

export type EstadoDocumentoApi = "BLOQUEADO" | "DISPONIBLE" | "GENERADO" | "DESACTUALIZADO";

export type MicromoduloApiSlug =
  | "actividades-previas"
  | "llamado"
  | "aspectos-generales"
  | "modelo-contrato"
  | "calificacion-legal"
  | "calificacion-financiera"
  | "calificacion-tecnica"
  | "evaluacion-tecnica-economica";

export type MicromoduloProgresoApiKey =
  | MicromoduloApiSlug
  | "especificaciones-tecnicas"
  | "presupuesto-base";

export interface FasePreparatoriaProgresoResponse {
  modalidad?: string;
  micromodulos: Record<MicromoduloProgresoApiKey, EstadoMicromoduloApi>;
  documentos: Record<
    "actividades-previas" | "pliego" | "acta-inicio" | "llamado",
    EstadoDocumentoApi
  >;
  pliegoReady: boolean;
  pliegoMissing: string[];
  phaseComplete: boolean;
  totales?: {
    itemsPresupuesto?: number;
    especificacionesCargadas?: boolean;
  };
}

export interface MicromoduloBaseResponse {
  estado: EstadoMicromoduloApi;
  modulo?: string;
  etiqueta?: string;
  /** Payload del micromódulo (nombre real del API). */
  datos?: Record<string, unknown>;
  /** Alias legacy. */
  data?: Record<string, unknown>;
}

export type ActividadesPreviasApiResponse = MicromoduloBaseResponse & Record<string, unknown>;

export type LlamadoApiResponse = MicromoduloBaseResponse & Record<string, unknown>;

export type AspectosGeneralesApiResponse = MicromoduloBaseResponse & Record<string, unknown>;

export interface ModeloContratoApiData {
  clauses?: Array<{
    instanceId: string;
    /** Posición ordinal femenina para el documento: "primera", "segunda", … */
    order: string;
    titulo: string;
    cuerpoHtml: string;
    kind: string;
    origen: string;
    id?: string;
    codigo?: string;
    basamentoLegal?: string;
    variablesSugeridas?: string[];
  }>;
}

export interface ModeloContratoApiResponse extends MicromoduloBaseResponse {
  /** Alias legacy; el payload real suele venir en `datos`. */
  data?: ModeloContratoApiData;
}

export interface CalificacionLegalPersonalizadoApi {
  id: string;
  sobre: number;
  descripcion: string;
  exigido: boolean;
  tieneModelo: boolean;
  archivoModeloUrl?: string;
}

export interface CalificacionLegalApiData {
  exigidos?: Record<string, boolean>;
  sustitutos?: Record<string, boolean>;
  personalizados?: CalificacionLegalPersonalizadoApi[];
}

export interface CalificacionLegalApiResponse extends MicromoduloBaseResponse {
  /** Alias legacy; el payload real suele venir en `datos`. */
  data?: CalificacionLegalApiData;
}

export interface CalificacionFinancieraRangosApi {
  rangoMaximo?: number;
  puntajeMaximo?: number | null;
  rangoMedioDesde?: number;
  rangoMedioHasta?: number;
  puntajeMedio?: number | null;
  rangoMinimo?: number;
  puntajeMinimo?: number | null;
}

export interface CalificacionFinancieraApiData {
  criterioCalifFinanDescapital?: boolean;
  puntajeMaximoDescapital?: number | null;
  criterioCalifFinanSolvencia?: boolean;
  rangosSolvencia?: CalificacionFinancieraRangosApi;
  criterioCalifFinanRotacion?: boolean;
  rangosRotacion?: CalificacionFinancieraRangosApi;
  criterioCalifFinanRendimiento?: boolean;
  rangosRendimiento?: CalificacionFinancieraRangosApi;
  criterioCalifFinanRentabilidad?: boolean;
  rangosRentabilidad?: CalificacionFinancieraRangosApi;
  criterioCalifFinanEndeudamiento?: boolean;
  rangosEndeudamiento?: CalificacionFinancieraRangosApi;
  puntuacionMinimaCalifFinanciera?: number;
}

export interface CalificacionFinancieraApiResponse extends MicromoduloBaseResponse {
  /** Alias legacy; el payload real suele venir en `datos`. */
  data?: CalificacionFinancieraApiData;
}

export interface CriterioTecnicoRangoApi {
  descripcion?: string;
  puntaje?: number;
  id?: string;
  rangoCriterioCalificacionTecnicaAuAu?: string;
  puntuacionRangoCriterioCalificacionTecnicaAuAu?: number;
}

export interface CriterioTecnicoApi {
  id?: string;
  nombre?: string;
  puntuacion?: number;
  descripcion?: string;
  descCriterioCalificacionTecnicaAuAu?: string;
  criterioCalificacionTecnicaAuAu?: string;
  puntuacionCriterioCalificacionTecnicaAuAu?: number;
  rangos?: CriterioTecnicoRangoApi[];
}

export interface CalificacionTecnicaApiData {
  criterios?: CriterioTecnicoApi[];
  puntuacionMinimaCalifTecnica?: number;
  puntuacionMinimaCalifTecnicaAuAu?: number;
}

export interface CalificacionTecnicaApiResponse extends MicromoduloBaseResponse {
  /** Alias legacy; el payload real suele venir en `datos`. */
  data?: CalificacionTecnicaApiData;
}

export interface EvaluacionBloqueApi {
  criterios?: Array<Record<string, unknown>>;
  puntuacionMinima?: number;
}

export interface EvaluacionTecnicaEconomicaApiData {
  tecnica?: EvaluacionBloqueApi;
  economica?: EvaluacionBloqueApi;
}

export interface EvaluacionTecnicaEconomicaApiResponse extends MicromoduloBaseResponse {
  /** Alias legacy; el payload real suele venir en `datos`. */
  data?: EvaluacionTecnicaEconomicaApiData;
}

export interface EspecificacionesTecnicasArchivoApi {
  id?: string;
  fasePreparatoriaId?: string;
  fileName?: string;
  nombreArchivo?: string;
  mimeType?: string;
  sizeBytes?: number;
  tamanoBytes?: number;
  storageKey?: string;
  url?: string;
  archivoUrl?: string;
  uploadedAt?: string;
  uploadedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface EspecificacionesTecnicasApiResponse {
  estado?: EstadoMicromoduloApi;
  archivo?: EspecificacionesTecnicasArchivoApi | null;
  /** Compatibilidad con formas planas (legacy / POST). */
  id?: string;
  fileName?: string;
  nombreArchivo?: string;
  mimeType?: string;
  sizeBytes?: number;
  tamanoBytes?: number;
  url?: string;
  archivoUrl?: string;
  uploadedAt?: string;
  uploadedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubirModeloRecaudoResponse {
  archivoModeloUrl: string;
}

export interface CuentaBancariaEnteApi {
  id: string;
  enteId?: string;
  bancoPago: string;
  numeroCuenta: string;
  tipoCuenta: string;
  titularPago: string;
  rifPago: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface CrearCuentaBancariaEntePayload {
  bancoPago: string;
  numeroCuenta: string;
  tipoCuenta: string;
  titularPago: string;
  rifPago: string;
}

export type ActualizarCuentaBancariaEntePayload = Partial<CrearCuentaBancariaEntePayload>;

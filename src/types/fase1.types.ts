export type Fase1TabValue = "fase-0" | "fase-1" | "fase-2" | "fase-3" | "fase-4";

export interface PresupuestoItemBase {
  descripcionItem: string;
  codigoPartida: string;
  unidadMedida: string;
  cantidadRequerida: number;
  precioUnitarioEstimado: number;
}

export interface PresupuestoItemRecord extends PresupuestoItemBase {
  id: string;
  totalItems: number;
}

export type CrearPresupuestoItemPayload = PresupuestoItemBase;

export interface CrearPresupuestoItemResponse {
  id?: string;
  descripcionItem?: string;
  codigoPartida?: string;
  unidadMedida?: string;
  cantidadRequerida?: number;
  precioUnitarioEstimado?: number;
  totalItems?: number;
  [key: string]: unknown;
}

export interface CrearOActualizarFase1Payload {
  datosActoAutorizacionInicio: string;
  fechaActaInicio: string;
  detallesTecnicosCalidad: string;
  alcanceCantidadesObra: string;
  justificacionVentajas: string;
  origenCrsRegistro: boolean;
  diasValidezOferta: number;
  autoridadAclaratorias: string;
  normativaLegal: string;
  diasVigenciaGarantiaExtension: number;
  objetivosEspecificos1: string;
  objetivosEspecificos2: string;
  objetivosEspecificos3: string;
  direccionRetiroPliego: string;
  horarioRetiroPliego: string;
  pliegoGratuito: boolean;
  costoPliegoBs?: number;
  bancoPagoPliego?: string;
  cuentaPagoPliego?: string;
  titularPagoPliego?: string;
  horaActoRecepAper: string;
  condicionPlurianual: string;
  viabilidadContratoMarco: string;
}

export interface Fase1Response {
  id?: string;
  expedienteId?: string;
  [key: string]: unknown;
}

export interface Fase1StepMeta {
  number: number;
  title: string;
}

export interface Fase1FieldCopy {
  label: string;
  description: string;
  placeholder?: string;
}

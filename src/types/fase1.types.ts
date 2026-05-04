export type Fase1TabValue = "fase-0" | "fase-1" | "fase-2" | "fase-3" | "fase-4";

export type PresupuestoNumericValue = number | string;

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
export type ActualizarPresupuestoItemPayload = PresupuestoItemBase;

export interface CrearPresupuestoItemResponse {
  id?: string;
  descripcionItem?: string;
  codigoPartida?: string;
  unidadMedida?: string;
  cantidadRequerida?: PresupuestoNumericValue;
  precioUnitarioEstimado?: PresupuestoNumericValue;
  totalItem?: PresupuestoNumericValue;
  totalItems?: PresupuestoNumericValue;
  [key: string]: unknown;
}

export type ActualizarPresupuestoItemResponse = CrearPresupuestoItemResponse;

export interface ListarPresupuestoItemsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PresupuestoItemApiRecord {
  id: string;
  expedienteId: string;
  descripcionItem: string;
  codigoPartida: string;
  unidadMedida: string;
  cantidadRequerida: PresupuestoNumericValue;
  precioUnitarioEstimado: PresupuestoNumericValue;
  totalItem?: PresupuestoNumericValue;
  totalItems?: PresupuestoNumericValue;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface PresupuestoItemsMeta {
  total: number;
  page: number;
  lastPage: number;
}

export interface PresupuestoItemsTotals {
  subtotal: number;
  porcentajeIvaAplicado: number;
  montoIva: number;
  montoTotal: number;
}

export interface ListarPresupuestoItemsResponse {
  items: PresupuestoItemRecord[];
  meta: PresupuestoItemsMeta;
  totales: PresupuestoItemsTotals;
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

export interface FasePreparatoriaDetalleResponse {
  id: string;
  expedienteId: string;
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
  costoPliegoBs?: number | string;
  bancoPagoPliego?: string;
  cuentaPagoPliego?: string;
  titularPagoPliego?: string;
  horaActoRecepAper: string;
  correoComision?: string;
  telefonoComision?: string;
  condicionPlurianual: string;
  viabilidadContratoMarco: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy?: string;
  updatedBy?: string | null;
  version?: number;
  [key: string]: unknown;
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

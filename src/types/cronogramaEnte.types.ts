import type { PaginationMetadata } from "./user-management.types";

export interface DiaNoLaborable {
  id: string;
  enteId: string;
  esRecurrente: boolean;
  fecha: string | null;
  fechaRecurrente: string | null;
  descripcion: string;
  createdAt: string;
  updatedAt: string;
}

export interface CrearDiaNoLaborablePayload {
  esRecurrente: boolean;
  fecha?: string;
  fechaRecurrente?: string;
  descripcion: string;
}

export interface ActualizarDiaNoLaborablePayload {
  esRecurrente?: boolean;
  fecha?: string;
  fechaRecurrente?: string;
  descripcion?: string;
}

export interface CampoAfectadoConflicto {
  campo: string;
  etiqueta: string;
  fechaAnterior: string;
}

export interface ConflictoDetectado {
  expedienteId: string;
  codigoNomenclatura: string;
  descripcionObjeto: string;
  estatusProceso: string;
  camposAfectados: CampoAfectadoConflicto[];
}

export interface CrearDiaNoLaborableResponse {
  diaNoLaborable: DiaNoLaborable;
  conflictosDetectados: ConflictoDetectado[];
  totalConflictos: number;
}

export interface CrearDiasBulkPayload {
  dias: CrearDiaNoLaborablePayload[];
}

export interface CrearDiasBulkResponse {
  diasCreados: DiaNoLaborable[];
  conflictosDetectados: ConflictoDetectado[];
  totalConflictos: number;
}

export interface ListarDiasNoLaborablesResponse {
  data: DiaNoLaborable[];
  meta: PaginationMetadata;
}

export interface DiaNoLaborableRango {
  fecha: string;
  descripcion: string;
  tipo: string;
  esRecurrente: boolean;
}

export interface DiasNoLaborablesRangoResponse {
  diasNoLaborables: DiaNoLaborableRango[];
  finesDeSemana: string[];
  resumen: {
    totalDiasNoLaborables: number;
    totalDiasHabiles: number;
    totalFestivosEnte: number;
    totalFinesDesemana: number;
  };
}

export interface CronogramaAlertaExpediente {
  id?: string;
  codigoNomenclatura?: string;
}

export interface CronogramaAlertaCronograma {
  expediente?: CronogramaAlertaExpediente;
}

export interface CronogramaAlerta {
  id: string;
  cronogramaId: string;
  diaNoLaborableId: string;
  campoAfectado: string;
  fechaConflicto: string;
  resuelta: boolean;
  resueltaPor?: string | null;
  resueltaEn?: string | null;
  createdAt: string;
  diaNoLaborable?: Pick<DiaNoLaborable, "descripcion">;
  cronograma?: CronogramaAlertaCronograma;
}

export interface EliminarDiaNoLaborableResponse {
  message: string;
}

import type { TipoContratacionBackend } from "@/lib/schemas/expedienteSchema";

/**
 * Consulta de Precios — Comisión obligatoria si valor_ucau_base supera:
 * BIENES/SERVICIOS: 2.500 UCAU | OBRAS: 10.000 UCAU
 */
const UMBRALES_COMISION_CP: Record<TipoContratacionBackend, number> = {
  BIENES: 2_500,
  SERVICIOS: 2_500,
  OBRAS: 10_000,
};

export function getUmbralComisionCp(tipo: TipoContratacionBackend): number {
  return UMBRALES_COMISION_CP[tipo];
}

export function requiereComisionConsultaPrecios(
  tipoContratacion: TipoContratacionBackend,
  valorUcauBase: number
): boolean {
  return valorUcauBase > getUmbralComisionCp(tipoContratacion);
}

import type { TipoContratacionBackend } from "@/lib/schemas/expedienteSchema";

/**
 * Art. 103 LCP — la Comisión de Contrataciones es obligatoria solo si
 * valor_ucau_base supera el umbral según el tipo de contratación.
 */
const UMBRALES_COMISION_UCAU: Record<TipoContratacionBackend, number> = {
  BIENES: 5_000,
  SERVICIOS: 10_000,
  OBRAS: 20_000,
};

export function getUmbralComisionUcau(tipo: TipoContratacionBackend): number {
  return UMBRALES_COMISION_UCAU[tipo];
}

export function requiereComisionPorUmbral(
  tipoContratacion: TipoContratacionBackend,
  valorUcauBase: number
): boolean {
  return valorUcauBase > getUmbralComisionUcau(tipoContratacion);
}

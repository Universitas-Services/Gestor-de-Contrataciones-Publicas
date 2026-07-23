import type { TipoContratacionBackend } from "@/lib/schemas/expedienteSchema";
import type { ModalidadSeleccionGestion } from "@/lib/schemas/gestionExpedienteSchema";

export interface ModalidadSugeridaResult {
  label: string;
  baseLegal: string;
  modalidadSeleccion: ModalidadSeleccionGestion;
}

const CONCURSO_ABIERTO: ModalidadSugeridaResult = {
  label: "Concurso Abierto",
  baseLegal: "Artículos 55 y 78, DLCP",
  modalidadSeleccion: "CONCURSO_ABIERTO",
};

const CONCURSO_CERRADO: ModalidadSugeridaResult = {
  label: "Concurso Cerrado",
  baseLegal: "Artículo 85, DLCP",
  modalidadSeleccion: "CONCURSO_CERRADO",
};

const CONSULTA_PRECIOS: ModalidadSugeridaResult = {
  label: "Consulta de Precios",
  baseLegal: "Artículo 96, DLCP",
  modalidadSeleccion: "CONSULTA_PRECIOS",
};

/**
 * Determina la modalidad sugerida según tipo de contratación y umbrales UCAU (DLCP).
 */
export function resolveModalidadSugerida(
  tipoContratacion: TipoContratacionBackend,
  valorUcauBase: number
): ModalidadSugeridaResult {
  if (tipoContratacion === "BIENES") {
    if (valorUcauBase <= 5000) return CONSULTA_PRECIOS;
    if (valorUcauBase <= 20000) return CONCURSO_CERRADO;
    return CONCURSO_ABIERTO;
  }

  if (tipoContratacion === "SERVICIOS") {
    if (valorUcauBase <= 10000) return CONSULTA_PRECIOS;
    if (valorUcauBase <= 30000) return CONCURSO_CERRADO;
    return CONCURSO_ABIERTO;
  }

  // OBRAS
  if (valorUcauBase <= 20000) return CONSULTA_PRECIOS;
  if (valorUcauBase <= 50000) return CONCURSO_CERRADO;
  return CONCURSO_ABIERTO;
}

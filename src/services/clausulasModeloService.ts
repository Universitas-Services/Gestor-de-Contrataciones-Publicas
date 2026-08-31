import { CLAUSULAS_GENERICAS_SEED, type ClausulaBase } from "@/lib/constants/modeloContrato";

/**
 * Stub: hoy retorna seed local.
 * TODO: reemplazar por GET al backend de cláusulas genéricas del modelo de contrato.
 */
export async function listarClausulasGenericas(): Promise<ClausulaBase[]> {
  return CLAUSULAS_GENERICAS_SEED.map((clause) => ({ ...clause }));
}

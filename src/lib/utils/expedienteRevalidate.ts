import { revalidatePath } from "next/cache";

/**
 * Bases de app para expedientes mientras conviven el flujo legacy y el nuevo.
 * Al cutover, dejar solo "/gestion-expedientes".
 */
export const EXPEDIENTE_APP_BASE_PATHS = [
  "/elaboracion-expediente",
  "/gestion-expedientes",
] as const;

/** Revalida el listado en ambas rutas. */
export function revalidateExpedienteList(): void {
  for (const base of EXPEDIENTE_APP_BASE_PATHS) {
    revalidatePath(base);
  }
}

/**
 * Revalida detalle (y subrutas opcionales) en ambas rutas.
 * Ej: revalidateExpedienteDetail(id) → /…/{id}
 *     revalidateExpedienteDetail(id, "contrato") → /…/{id}/contrato
 */
export function revalidateExpedienteDetail(expedienteId: string, ...extraSegments: string[]): void {
  const suffix = extraSegments.length > 0 ? `/${extraSegments.join("/")}` : "";
  for (const base of EXPEDIENTE_APP_BASE_PATHS) {
    revalidatePath(`${base}/${expedienteId}${suffix}`);
  }
}

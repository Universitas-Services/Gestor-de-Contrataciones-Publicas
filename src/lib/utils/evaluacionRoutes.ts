/**
 * Resuelve la base de rutas de evaluación según la URL actual.
 * Elaboración conserva /elaboracion-expediente; gestión usa /gestion-expedientes.
 */
export function resolveEvaluacionBasePath(pathname: string | null): string {
  if (pathname?.startsWith("/gestion-expedientes")) {
    return "/gestion-expedientes";
  }
  return "/elaboracion-expediente";
}

/** Tab al que volver tras el wizard de evaluación */
export function resolveEvaluacionReturnTab(basePath: string): string {
  return basePath === "/gestion-expedientes" ? "fase-2" : "fase-3";
}

export function evaluacionPath(
  basePath: string,
  expedienteId: string,
  evaluacionId: string,
  step: "sobre-1" | "sobre-2" | "calificacion" | "matriz"
): string {
  return `${basePath}/${expedienteId}/evaluacion/${evaluacionId}/${step}`;
}

export function expedienteTabPath(basePath: string, expedienteId: string, tab: string): string {
  return `${basePath}/${expedienteId}?tab=${tab}`;
}

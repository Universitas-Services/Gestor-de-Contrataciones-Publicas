import { expedienteTabPath } from "@/lib/utils/evaluacionRoutes";

export function actividadesPreviasPath(basePath: string, expedienteId: string): string {
  return `${basePath}/${expedienteId}/actividades-previas`;
}

export function especificacionesTecnicasPath(basePath: string, expedienteId: string): string {
  return `${basePath}/${expedienteId}/especificaciones-tecnicas`;
}

export function llamadoPublicoPath(basePath: string, expedienteId: string): string {
  return `${basePath}/${expedienteId}/llamado`;
}

export function aspectosGeneralesPath(basePath: string, expedienteId: string): string {
  return `${basePath}/${expedienteId}/aspectos-generales`;
}

export function modeloContratoPath(basePath: string, expedienteId: string): string {
  return `${basePath}/${expedienteId}/modelo-contrato`;
}

export function calificacionLegalPath(basePath: string, expedienteId: string): string {
  return `${basePath}/${expedienteId}/calificacion-legal`;
}

export function calificacionFinancieraPath(basePath: string, expedienteId: string): string {
  return `${basePath}/${expedienteId}/calificacion-financiera`;
}

export function calificacionTecnicaPath(basePath: string, expedienteId: string): string {
  return `${basePath}/${expedienteId}/calificacion-tecnica`;
}

export function evaluacionTecnicaEconomicaPath(basePath: string, expedienteId: string): string {
  return `${basePath}/${expedienteId}/evaluacion-tecnica-economica`;
}

export function expedienteFase1TabPath(basePath: string, expedienteId: string): string {
  return expedienteTabPath(basePath, expedienteId, "fase-1");
}

export function getActividadesPreviasFormStorageKey(expedienteId: string): string {
  return `actividades-previas-form:${expedienteId}`;
}

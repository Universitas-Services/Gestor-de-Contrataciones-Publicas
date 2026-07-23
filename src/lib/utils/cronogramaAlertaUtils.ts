import type { CronogramaAlerta } from "@/types/cronogramaEnte.types";

export function getCronogramaAlertaTitle(alerta: CronogramaAlerta): string {
  const codigo = alerta.cronograma?.expediente?.codigoNomenclatura ?? "Expediente";
  return `Conflicto en ${codigo}`;
}

export function getCronogramaAlertaDescription(alerta: CronogramaAlerta): string {
  const feriado = alerta.diaNoLaborable?.descripcion ?? "Día no laborable";
  const fecha = alerta.fechaConflicto?.split("T")[0] ?? "";
  return `El feriado "${feriado}" afectó ${alerta.campoAfectado}${fecha ? ` (${fecha})` : ""}.`;
}

export function getCronogramaAlertaExpedienteHref(alerta: CronogramaAlerta): string | null {
  const expedienteId = alerta.cronograma?.expediente?.id;
  if (expedienteId) {
    return `/elaboracion-expediente/${expedienteId}`;
  }
  return null;
}

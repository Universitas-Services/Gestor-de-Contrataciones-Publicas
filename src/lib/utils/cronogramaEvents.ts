import { isFechaEditable } from "@/lib/utils/cronogramaUtils";
import type { IEvent } from "@/components/features-components/ElaboracionExpediente/calendar/types";

const EVENT_COLOR_VARS: Record<string, string> = {
  fechaLlamadoParticipar: "cal-llamado",
  fechaInicioDisponibilidadPliego: "cal-disponibilidad",
  fechaFinDisponibilidadPliego: "cal-disponibilidad",
  fechaSolicitudAclaratorias: "cal-solicitud-aclaratorias",
  fechaRespuestaAclaratorias: "cal-respuesta-aclaratorias",
  fechaModificacionPliego: "cal-modificaciones",
  fechaActoRecepcionAperturaSobres: "cal-recepcion",
  fechaLimiteEvaluacion: "cal-evaluacion",
  fechaLimiteAdjudicacion: "cal-adjudicacion",
  fechaLimiteNotificacion: "cal-notificacion",
  fechaLimiteGarantias: "cal-garantias",
  fechaLimiteFirmaContrato: "cal-firma",
};

const EVENT_TITLES: Record<string, string> = {
  fechaLlamadoParticipar: "Llamado a Participar",
  fechaInicioDisponibilidadPliego: "Disponibilidad del Pliego",
  fechaFinDisponibilidadPliego: "Fin Disponibilidad del Pliego",
  fechaSolicitudAclaratorias: "Límite para Solicitud de Aclaratorias",
  fechaRespuestaAclaratorias: "Límite para Respuesta de Aclaratorias",
  fechaModificacionPliego: "Límite para Modificaciones al Pliego",
  fechaActoRecepcionAperturaSobres: "Acto de Recepción de Ofertas",
  fechaLimiteEvaluacion: "Límite para Evaluación",
  fechaLimiteAdjudicacion: "Límite para Adjudicación",
  fechaLimiteNotificacion: "Límite para Notificación",
  fechaLimiteGarantias: "Límite para Consignar Garantías",
  fechaLimiteFirmaContrato: "Límite para la Firma del Contrato",
};

const PLIEGO_INICIO = "fechaInicioDisponibilidadPliego";
const PLIEGO_FIN = "fechaFinDisponibilidadPliego";

/** Convierte un cronograma (campos fecha*) a eventos del calendario de procedimiento. */
export function cronogramaToEvents(cronograma: Record<string, unknown>): IEvent[] {
  const events: IEvent[] = [];

  const pInicio = cronograma[PLIEGO_INICIO];
  const pFin = cronograma[PLIEGO_FIN];
  if (pInicio && pFin) {
    events.push({
      id: "rango-pliego",
      title: "Disponibilidad del Pliego",
      startDate: (pInicio as string).split("T")[0],
      endDate: (pFin as string).split("T")[0],
      colorVar: "cal-disponibilidad",
      readonly: true,
    });
  }

  const SKIP = new Set([PLIEGO_INICIO, PLIEGO_FIN]);
  Object.entries(cronograma)
    .filter(
      ([key, value]) =>
        !SKIP.has(key) &&
        key.startsWith("fecha") &&
        typeof value === "string" &&
        (value as string).length > 0
    )
    .forEach(([key, value]) => {
      const dateStr = (value as string).split("T")[0];
      events.push({
        id: key,
        title: EVENT_TITLES[key] || key,
        startDate: dateStr,
        endDate: dateStr,
        colorVar: EVENT_COLOR_VARS[key] || "cal-llamado",
        readonly: !isFechaEditable(key),
      });
    });

  return events;
}

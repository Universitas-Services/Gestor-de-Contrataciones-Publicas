import { isFechaEditableCc } from "@/lib/modalidades/cronogramaConcursoCerrado";
import type { CronogramaConcursoCerradoFormValues } from "@/lib/schemas/gestionExpedienteSchema";
import type { IEvent } from "@/components/features-components/ElaboracionExpediente/calendar/types";

const EVENT_META: Partial<
  Record<keyof CronogramaConcursoCerradoFormValues, { title: string; colorVar: string }>
> = {
  fecEnvioInvitacionCc: {
    title: "Envío de Invitaciones a Participar",
    colorVar: "cal-llamado",
  },
  fecSolicitudAclaratoriasCc: {
    title: "Límite para Solicitud de Aclaratorias",
    colorVar: "cal-solicitud-aclaratorias",
  },
  fecRespuestaAclaratoriasCc: {
    title: "Límite para Respuesta a Aclaratorias",
    colorVar: "cal-respuesta-aclaratorias",
  },
  fecModificPliegoCc: {
    title: "Límite para Modificaciones al Pliego",
    colorVar: "cal-modificaciones",
  },
  fecActoRecepAperSobresCc: {
    title: "Acto de Recepción y Apertura de Sobres",
    colorVar: "cal-recepcion",
  },
  fecLimiteEvaluacionCc: {
    title: "Límite para Evaluación y Recomendación",
    colorVar: "cal-evaluacion",
  },
  fecLimiteAdjudicacionCc: {
    title: "Límite para Adjudicación",
    colorVar: "cal-adjudicacion",
  },
  fecLimiteNotificacionCc: {
    title: "Límite para Notificación",
    colorVar: "cal-notificacion",
  },
  fecLimiteGarantiasCc: {
    title: "Límite para Consignar Garantías",
    colorVar: "cal-garantias",
  },
  fecLimiteFirmaContratoCc: {
    title: "Límite para la Firma del Contrato",
    colorVar: "cal-firma",
  },
};

export const LEGEND_ITEMS_CC: { label: string; colorVar: string }[] = [
  { label: "Disponibilidad del Pliego", colorVar: "cal-disponibilidad" },
  { label: "Límite para Solicitud de Aclaratorias", colorVar: "cal-solicitud-aclaratorias" },
  { label: "Límite para Respuesta a Aclaratorias", colorVar: "cal-respuesta-aclaratorias" },
  { label: "Límite para Modificaciones al Pliego", colorVar: "cal-modificaciones" },
  { label: "Acto de Recepción y Apertura de Sobres", colorVar: "cal-recepcion" },
  { label: "Límite para Evaluación y Recomendación", colorVar: "cal-evaluacion" },
  { label: "Límite para Adjudicación", colorVar: "cal-adjudicacion" },
  { label: "Límite para Notificación", colorVar: "cal-notificacion" },
  { label: "Límite para Consignar Garantías", colorVar: "cal-garantias" },
  { label: "Límite para la Firma del Contrato", colorVar: "cal-firma" },
];

const SKIP_POINT = new Set(["fecInicioDisponibilidadPliegoCc", "fecFinDisponibilidadPliegoCc"]);

export function cronogramaCcToEvents(cronograma: CronogramaConcursoCerradoFormValues): IEvent[] {
  const events: IEvent[] = [];

  const pInicio = cronograma.fecInicioDisponibilidadPliegoCc;
  const pFin = cronograma.fecFinDisponibilidadPliegoCc;
  if (pInicio && pFin) {
    events.push({
      id: "rango-pliego",
      title: "Disponibilidad del Pliego",
      startDate: pInicio.split("T")[0],
      endDate: pFin.split("T")[0],
      colorVar: "cal-disponibilidad",
      readonly: true,
    });
  }

  (Object.keys(EVENT_META) as (keyof typeof EVENT_META)[]).forEach((key) => {
    if (SKIP_POINT.has(key)) return;
    const value = cronograma[key as keyof CronogramaConcursoCerradoFormValues];
    const meta = EVENT_META[key];
    if (!value || !meta) return;
    const dateStr = value.split("T")[0];
    events.push({
      id: key,
      title: meta.title,
      startDate: dateStr,
      endDate: dateStr,
      colorVar: meta.colorVar,
      readonly: !isFechaEditableCc(key),
    });
  });

  return events;
}

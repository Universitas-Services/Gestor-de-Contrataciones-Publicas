import { isFechaEditableCp } from "@/lib/modalidades/cronogramaConsultaPrecios";
import type { CronogramaConsultaPreciosFormValues } from "@/lib/schemas/gestionExpedienteSchema";
import type { IEvent } from "@/components/features-components/ElaboracionExpediente/calendar/types";

const EVENT_META: Record<
  keyof CronogramaConsultaPreciosFormValues,
  { title: string; colorVar: string; inLegend: boolean }
> = {
  fecEnvioInvitacionCp: {
    title: "Envío de Invitaciones a presentar oferta",
    colorVar: "cal-llamado",
    inLegend: false,
  },
  fecSolicitudAclaratoriasCp: {
    title: "Límite para Solicitud de Aclaratorias",
    colorVar: "cal-solicitud-aclaratorias",
    inLegend: true,
  },
  fecRespuestaAclaratoriasCp: {
    title: "Límite para Respuesta a Aclaratorias",
    colorVar: "cal-respuesta-aclaratorias",
    inLegend: true,
  },
  fecRecepcionOfertasCp: {
    title: "Límite para Recepción de Ofertas",
    colorVar: "cal-recepcion",
    inLegend: true,
  },
  fecLimiteNotificacionCp: {
    title: "Límite para Evaluación, Recomendación, Adjudicación y Notificación",
    colorVar: "cal-notificacion",
    inLegend: true,
  },
  fecLimiteGarantiasCp: {
    title: "Límite para Consignar Garantías",
    colorVar: "cal-garantias",
    inLegend: true,
  },
  fecLimiteFirmaContratoCp: {
    title: "Límite para la Firma del Contrato",
    colorVar: "cal-firma",
    inLegend: true,
  },
};

export const LEGEND_ITEMS_CP: { label: string; colorVar: string }[] = (
  Object.keys(EVENT_META) as (keyof CronogramaConsultaPreciosFormValues)[]
)
  .filter((key) => EVENT_META[key].inLegend)
  .map((key) => ({
    label: EVENT_META[key].title,
    colorVar: EVENT_META[key].colorVar,
  }));

export function cronogramaCpToEvents(cronograma: CronogramaConsultaPreciosFormValues): IEvent[] {
  return (Object.keys(EVENT_META) as (keyof CronogramaConsultaPreciosFormValues)[]).map((key) => {
    const dateStr = cronograma[key].split("T")[0];
    const meta = EVENT_META[key];
    return {
      id: key,
      title: meta.title,
      startDate: dateStr,
      endDate: dateStr,
      colorVar: meta.colorVar,
      readonly: !isFechaEditableCp(key),
    };
  });
}

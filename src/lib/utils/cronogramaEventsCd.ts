import { isFechaEditableCd } from "@/lib/modalidades/cronogramaContratacionDirecta";
import type { CronogramaContratacionDirectaFormValues } from "@/lib/schemas/gestionExpedienteSchema";
import type { IEvent } from "@/components/features-components/ElaboracionExpediente/calendar/types";

/**
 * Etiquetas CD (brief Tabla Dinámica de Lapsos Legales _cd).
 * ids = variables camelCase equivalentes a fec_*_cd.
 */
const EVENT_META: Record<
  keyof CronogramaContratacionDirectaFormValues,
  { title: string; colorVar: string; inLegend: boolean }
> = {
  fecEnvioInvitacionCd: {
    title: "Fecha de Emisión de la Solicitud de Oferta / Invitación",
    colorVar: "cal-llamado",
    inLegend: true,
  },
  fecRecepcionOfertaCd: {
    title: "Fecha Límite para Recepción de la Oferta Definitiva",
    colorVar: "cal-recepcion",
    inLegend: true,
  },
  fecLimiteAdjudicacionCd: {
    title: "Límite para Evaluación y Adjudicación",
    colorVar: "cal-adjudicacion",
    inLegend: true,
  },
  fecLimiteNotificacionCd: {
    title: "Límite para Notificación",
    colorVar: "cal-notificacion",
    inLegend: true,
  },
  fecLimiteGarantiasCd: {
    title: "Límite para Consignar Garantías",
    colorVar: "cal-garantias",
    inLegend: true,
  },
  fecLimiteFirmaContratoCd: {
    title: "Límite para la Firma del Contrato",
    colorVar: "cal-firma",
    inLegend: true,
  },
};

export const LEGEND_ITEMS_CD: { label: string; colorVar: string }[] = (
  Object.keys(EVENT_META) as (keyof CronogramaContratacionDirectaFormValues)[]
)
  .filter((key) => EVENT_META[key].inLegend)
  .map((key) => ({
    label: EVENT_META[key].title,
    colorVar: EVENT_META[key].colorVar,
  }));

export function cronogramaCdToEvents(
  cronograma: CronogramaContratacionDirectaFormValues
): IEvent[] {
  return (Object.keys(EVENT_META) as (keyof CronogramaContratacionDirectaFormValues)[]).map(
    (key) => {
      const dateStr = cronograma[key].split("T")[0];
      const meta = EVENT_META[key];
      return {
        id: key,
        title: meta.title,
        startDate: dateStr,
        endDate: dateStr,
        colorVar: meta.colorVar,
        readonly: !isFechaEditableCd(key),
      };
    }
  );
}

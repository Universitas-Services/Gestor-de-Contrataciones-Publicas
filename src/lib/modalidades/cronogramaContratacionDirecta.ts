import { addBusinessDays, formatIsoDate } from "@/lib/utils/cronogramaUtils";
import { isNonWorkingDay } from "@/lib/utils/diasNoLaborablesUtils";
import type { CronogramaContratacionDirectaFormValues } from "@/lib/schemas/gestionExpedienteSchema";

export type CronogramaCd = CronogramaContratacionDirectaFormValues;

export interface MoverFechaCdResult {
  success: boolean;
  newCronograma?: CronogramaCd;
  errorMsg?: string;
}

const MAX_GARANTIAS_DESDE_NOTIF = 5;
const MAX_FIRMA_DESDE_NOTIF = 8;

function parseDate(iso: string): Date {
  return new Date(`${iso.split("T")[0]}T00:00:00`);
}

function addCalendarDays(dateStr: string, days: number): string {
  const date = parseDate(dateStr);
  date.setDate(date.getDate() + days);
  return formatIsoDate(date);
}

/**
 * Genera el cronograma abreviado de Contratación Directa.
 * Ancla: fecEnvioInvitacionCd (Hito Cero).
 */
export function calcularFechasSugeridasCd(
  fecEnvioInvitacionCd: string,
  feriados?: Set<string>
): CronogramaCd {
  const invitacion = parseDate(fecEnvioInvitacionCd);
  const recepcion = addBusinessDays(invitacion, 1, feriados);
  const adjudicacion = addBusinessDays(recepcion, 2, feriados);
  const notificacion = addBusinessDays(adjudicacion, 1, feriados);
  const garantias = addBusinessDays(notificacion, MAX_GARANTIAS_DESDE_NOTIF, feriados);
  const firma = addBusinessDays(notificacion, MAX_FIRMA_DESDE_NOTIF, feriados);

  return {
    fecEnvioInvitacionCd: formatIsoDate(invitacion),
    fecRecepcionOfertaCd: formatIsoDate(recepcion),
    fecLimiteAdjudicacionCd: formatIsoDate(adjudicacion),
    fecLimiteNotificacionCd: formatIsoDate(notificacion),
    fecLimiteGarantiasCd: formatIsoDate(garantias),
    fecLimiteFirmaContratoCd: formatIsoDate(firma),
  };
}

export function isFechaEditableCd(key: string): boolean {
  return key !== "fecEnvioInvitacionCd";
}

function validarSecuenciaCd(c: CronogramaCd): string | null {
  const invitacion = parseDate(c.fecEnvioInvitacionCd);
  const recepcion = parseDate(c.fecRecepcionOfertaCd);
  const adjudicacion = parseDate(c.fecLimiteAdjudicacionCd);
  const notificacion = parseDate(c.fecLimiteNotificacionCd);
  const garantias = parseDate(c.fecLimiteGarantiasCd);
  const firma = parseDate(c.fecLimiteFirmaContratoCd);

  if (recepcion < invitacion) {
    return "La recepción de oferta no puede ser anterior a la emisión de la invitación.";
  }
  if (adjudicacion < recepcion) {
    return "La adjudicación no puede ser anterior a la recepción de la oferta.";
  }
  if (notificacion < adjudicacion) {
    return "La notificación no puede ser anterior a la adjudicación.";
  }
  if (garantias < notificacion) {
    return "Las garantías no pueden ser anteriores a la notificación.";
  }
  if (firma < notificacion) {
    return "La firma del contrato no puede ser anterior a la notificación.";
  }

  const maxGarantias = addBusinessDays(notificacion, MAX_GARANTIAS_DESDE_NOTIF);
  if (garantias > maxGarantias) {
    return `El límite de garantías no puede exceder 5 días hábiles desde la notificación (máx. ${formatIsoDate(maxGarantias)}).`;
  }

  const maxFirma = addBusinessDays(notificacion, MAX_FIRMA_DESDE_NOTIF);
  if (firma > maxFirma) {
    return `El límite de firma no puede exceder 8 días hábiles desde la notificación (máx. ${formatIsoDate(maxFirma)}).`;
  }

  return null;
}

/** Tras mover recepción o notificación, re-sugiere hitos posteriores rígidos/sugeridos. */
function aplicarCascadaCd(c: CronogramaCd, movedKey: string, feriados?: Set<string>): CronogramaCd {
  const next = { ...c };

  if (movedKey === "fecRecepcionOfertaCd") {
    const recepcion = parseDate(next.fecRecepcionOfertaCd);
    next.fecLimiteAdjudicacionCd = formatIsoDate(addBusinessDays(recepcion, 2, feriados));
    const adj = parseDate(next.fecLimiteAdjudicacionCd);
    next.fecLimiteNotificacionCd = formatIsoDate(addBusinessDays(adj, 1, feriados));
    const notif = parseDate(next.fecLimiteNotificacionCd);
    next.fecLimiteGarantiasCd = formatIsoDate(
      addBusinessDays(notif, MAX_GARANTIAS_DESDE_NOTIF, feriados)
    );
    next.fecLimiteFirmaContratoCd = formatIsoDate(
      addBusinessDays(notif, MAX_FIRMA_DESDE_NOTIF, feriados)
    );
  }

  if (movedKey === "fecLimiteAdjudicacionCd") {
    const adj = parseDate(next.fecLimiteAdjudicacionCd);
    next.fecLimiteNotificacionCd = formatIsoDate(addBusinessDays(adj, 1, feriados));
    const notif = parseDate(next.fecLimiteNotificacionCd);
    next.fecLimiteGarantiasCd = formatIsoDate(
      addBusinessDays(notif, MAX_GARANTIAS_DESDE_NOTIF, feriados)
    );
    next.fecLimiteFirmaContratoCd = formatIsoDate(
      addBusinessDays(notif, MAX_FIRMA_DESDE_NOTIF, feriados)
    );
  }

  if (movedKey === "fecLimiteNotificacionCd") {
    const notif = parseDate(next.fecLimiteNotificacionCd);
    next.fecLimiteGarantiasCd = formatIsoDate(
      addBusinessDays(notif, MAX_GARANTIAS_DESDE_NOTIF, feriados)
    );
    next.fecLimiteFirmaContratoCd = formatIsoDate(
      addBusinessDays(notif, MAX_FIRMA_DESDE_NOTIF, feriados)
    );
  }

  return next;
}

export function moverFechaCronogramaCd(
  cronogramaActual: CronogramaCd,
  eventId: string,
  diffInDays: number,
  feriados?: Set<string>
): MoverFechaCdResult {
  if (!cronogramaActual || diffInDays === 0) {
    return { success: false, errorMsg: "No hay cambios a aplicar." };
  }

  if (!isFechaEditableCd(eventId)) {
    return {
      success: false,
      errorMsg: "La fecha de emisión de la invitación es el Hito Cero y no se puede mover.",
    };
  }

  if (!(eventId in cronogramaActual)) {
    return { success: false, errorMsg: "Clave de fecha no encontrada." };
  }

  const currentVal = cronogramaActual[eventId as keyof CronogramaCd];
  const newVal = addCalendarDays(currentVal, diffInDays);
  const newDate = parseDate(newVal);

  if (isNonWorkingDay(newDate, feriados)) {
    return { success: false, errorMsg: "La fecha no puede caer en un día no laborable." };
  }

  const invitacion = parseDate(cronogramaActual.fecEnvioInvitacionCd);
  if (newDate < invitacion) {
    return {
      success: false,
      errorMsg: "Ninguna fecha puede ser anterior a la emisión de la invitación.",
    };
  }

  // Tope rígido al arrastrar garantías / firma
  if (eventId === "fecLimiteGarantiasCd") {
    const notif = parseDate(cronogramaActual.fecLimiteNotificacionCd);
    const max = addBusinessDays(notif, MAX_GARANTIAS_DESDE_NOTIF, feriados);
    if (newDate > max) {
      return {
        success: false,
        errorMsg: `Garantías: máximo 5 días hábiles desde la notificación (${formatIsoDate(max)}).`,
      };
    }
    if (newDate < notif) {
      return {
        success: false,
        errorMsg: "Garantías no pueden ser anteriores a la notificación.",
      };
    }
  }

  if (eventId === "fecLimiteFirmaContratoCd") {
    const notif = parseDate(cronogramaActual.fecLimiteNotificacionCd);
    const max = addBusinessDays(notif, MAX_FIRMA_DESDE_NOTIF, feriados);
    if (newDate > max) {
      return {
        success: false,
        errorMsg: `Firma: máximo 8 días hábiles desde la notificación (${formatIsoDate(max)}).`,
      };
    }
    if (newDate < notif) {
      return {
        success: false,
        errorMsg: "La firma no puede ser anterior a la notificación.",
      };
    }
  }

  let next: CronogramaCd = {
    ...cronogramaActual,
    [eventId]: newVal,
  };

  next = aplicarCascadaCd(next, eventId, feriados);

  const seqError = validarSecuenciaCd(next);
  if (seqError) {
    return { success: false, errorMsg: seqError };
  }

  return { success: true, newCronograma: next };
}

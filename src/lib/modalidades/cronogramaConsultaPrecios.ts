import type { TipoContratacionBackend } from "@/lib/schemas/expedienteSchema";
import type { CronogramaConsultaPreciosFormValues } from "@/lib/schemas/gestionExpedienteSchema";
import { addBusinessDays, countBusinessDays, formatIsoDate } from "@/lib/utils/cronogramaUtils";
import { isNonWorkingDay } from "@/lib/utils/diasNoLaborablesUtils";

export type CronogramaCp = CronogramaConsultaPreciosFormValues;

export interface MoverFechaCpResult {
  success: boolean;
  newCronograma?: CronogramaCp;
  errorMsg?: string;
}

/** Mínimo días hábiles invitación → recepción de ofertas. */
const PLAZO_MIN_RECEPCION: Record<TipoContratacionBackend, number> = {
  BIENES: 4,
  SERVICIOS: 5,
  OBRAS: 6,
};

/** Máximo días hábiles recepción → notificación integral (eval/adj/notif). */
const PLAZO_NOTIF_DESDE_RECEPCION: Record<TipoContratacionBackend, number> = {
  BIENES: 8,
  SERVICIOS: 9,
  OBRAS: 10,
};

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

function recalcDesdeRecepcion(
  recepcionIso: string,
  tipo: TipoContratacionBackend,
  feriados?: Set<string>
): Pick<
  CronogramaCp,
  | "fecRespuestaAclaratoriasCp"
  | "fecRecepcionOfertasCp"
  | "fecLimiteNotificacionCp"
  | "fecLimiteGarantiasCp"
  | "fecLimiteFirmaContratoCp"
> {
  const recepcion = parseDate(recepcionIso);
  const notif = addBusinessDays(recepcion, PLAZO_NOTIF_DESDE_RECEPCION[tipo], feriados);

  return {
    fecRespuestaAclaratoriasCp: formatIsoDate(addBusinessDays(recepcion, -1, feriados)),
    fecRecepcionOfertasCp: formatIsoDate(recepcion),
    fecLimiteNotificacionCp: formatIsoDate(notif),
    fecLimiteGarantiasCp: formatIsoDate(
      addBusinessDays(notif, MAX_GARANTIAS_DESDE_NOTIF, feriados)
    ),
    fecLimiteFirmaContratoCp: formatIsoDate(
      addBusinessDays(notif, MAX_FIRMA_DESDE_NOTIF, feriados)
    ),
  };
}

/**
 * Cronograma Consulta de Precios. Ancla: fecEnvioInvitacionCp.
 */
export function calcularFechasSugeridasCp(
  fecEnvioInvitacionCp: string,
  tipo: TipoContratacionBackend,
  feriados?: Set<string>
): CronogramaCp {
  const invitacion = parseDate(fecEnvioInvitacionCp);
  const minRecepcion = PLAZO_MIN_RECEPCION[tipo];
  const recepcion = addBusinessDays(invitacion, minRecepcion, feriados);
  const rest = recalcDesdeRecepcion(formatIsoDate(recepcion), tipo, feriados);

  return {
    fecEnvioInvitacionCp: formatIsoDate(invitacion),
    fecSolicitudAclaratoriasCp: formatIsoDate(addBusinessDays(invitacion, 1, feriados)),
    ...rest,
  };
}

export function isFechaEditableCp(key: string): boolean {
  return key !== "fecEnvioInvitacionCp";
}

function validarSecuenciaCp(c: CronogramaCp): string | null {
  const invitacion = parseDate(c.fecEnvioInvitacionCp);
  const solicitud = parseDate(c.fecSolicitudAclaratoriasCp);
  const respuesta = parseDate(c.fecRespuestaAclaratoriasCp);
  const recepcion = parseDate(c.fecRecepcionOfertasCp);
  const notif = parseDate(c.fecLimiteNotificacionCp);
  const garantias = parseDate(c.fecLimiteGarantiasCp);
  const firma = parseDate(c.fecLimiteFirmaContratoCp);

  if (solicitud < invitacion) {
    return "La solicitud de aclaratorias no puede ser anterior a la invitación.";
  }
  if (respuesta >= recepcion) {
    return "La respuesta de aclaratorias debe ser anterior a la recepción de ofertas.";
  }
  if (recepcion <= invitacion) {
    return "La recepción de ofertas debe ser posterior a la invitación.";
  }
  if (notif <= recepcion) {
    return "La notificación debe ser posterior a la recepción de ofertas.";
  }
  if (garantias < notif) {
    return "Las garantías no pueden ser anteriores a la notificación.";
  }
  if (firma < notif) {
    return "La firma no puede ser anterior a la notificación.";
  }

  return null;
}

export function moverFechaCronogramaCp(
  cronogramaActual: CronogramaCp,
  eventId: string,
  diffInDays: number,
  tipo: TipoContratacionBackend,
  feriados?: Set<string>
): MoverFechaCpResult {
  if (!cronogramaActual || diffInDays === 0) {
    return { success: false, errorMsg: "No hay cambios a aplicar." };
  }

  if (!isFechaEditableCp(eventId)) {
    return {
      success: false,
      errorMsg: "La fecha de envío de invitaciones es el Hito Cero y no se puede mover.",
    };
  }

  if (!(eventId in cronogramaActual)) {
    return { success: false, errorMsg: "Clave de fecha no encontrada." };
  }

  const currentVal = cronogramaActual[eventId as keyof CronogramaCp];
  const newVal = addCalendarDays(currentVal, diffInDays);
  const newDate = parseDate(newVal);

  if (isNonWorkingDay(newDate, feriados)) {
    return { success: false, errorMsg: "La fecha no puede caer en un día no laborable." };
  }

  const invitacion = parseDate(cronogramaActual.fecEnvioInvitacionCp);
  if (newDate < invitacion) {
    return {
      success: false,
      errorMsg: "Ninguna fecha puede ser anterior a la emisión de las invitaciones.",
    };
  }

  if (eventId === "fecRecepcionOfertasCp") {
    const minDays = PLAZO_MIN_RECEPCION[tipo];
    const diffHabiles = countBusinessDays(invitacion, newDate, feriados) - 1;
    if (diffHabiles < minDays) {
      const minLegal = addBusinessDays(invitacion, minDays, feriados);
      return {
        success: false,
        errorMsg: `La recepción de ofertas no puede ser inferior a ${minDays} días hábiles desde la invitación (mín. ${formatIsoDate(minLegal)}).`,
      };
    }
  }

  if (eventId === "fecLimiteGarantiasCp") {
    const notif = parseDate(cronogramaActual.fecLimiteNotificacionCp);
    const max = addBusinessDays(notif, MAX_GARANTIAS_DESDE_NOTIF, feriados);
    if (newDate > max) {
      return {
        success: false,
        errorMsg: `Garantías: máximo 5 días hábiles desde la notificación (${formatIsoDate(max)}).`,
      };
    }
    if (newDate < notif) {
      return { success: false, errorMsg: "Garantías no pueden ser anteriores a la notificación." };
    }
  }

  if (eventId === "fecLimiteFirmaContratoCp") {
    const notif = parseDate(cronogramaActual.fecLimiteNotificacionCp);
    const max = addBusinessDays(notif, MAX_FIRMA_DESDE_NOTIF, feriados);
    if (newDate > max) {
      return {
        success: false,
        errorMsg: `Firma: máximo 8 días hábiles desde la notificación (${formatIsoDate(max)}).`,
      };
    }
    if (newDate < notif) {
      return { success: false, errorMsg: "La firma no puede ser anterior a la notificación." };
    }
  }

  let next: CronogramaCp = {
    ...cronogramaActual,
    [eventId]: newVal,
  };

  if (eventId === "fecRecepcionOfertasCp") {
    const rest = recalcDesdeRecepcion(newVal, tipo, feriados);
    next = { ...next, ...rest, fecRecepcionOfertasCp: newVal };
  }

  if (eventId === "fecLimiteNotificacionCp") {
    const notif = parseDate(newVal);
    next.fecLimiteGarantiasCp = formatIsoDate(
      addBusinessDays(notif, MAX_GARANTIAS_DESDE_NOTIF, feriados)
    );
    next.fecLimiteFirmaContratoCp = formatIsoDate(
      addBusinessDays(notif, MAX_FIRMA_DESDE_NOTIF, feriados)
    );
  }

  const seqError = validarSecuenciaCp(next);
  if (seqError) {
    return { success: false, errorMsg: seqError };
  }

  return { success: true, newCronograma: next };
}

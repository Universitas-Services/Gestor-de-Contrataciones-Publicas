import type { TipoContratacionBackend } from "@/lib/schemas/expedienteSchema";
import type { CronogramaConcursoCerradoFormValues } from "@/lib/schemas/gestionExpedienteSchema";
import { addBusinessDays, countBusinessDays, formatIsoDate } from "@/lib/utils/cronogramaUtils";
import { isNonWorkingDay } from "@/lib/utils/diasNoLaborablesUtils";

export type CronogramaCc = CronogramaConcursoCerradoFormValues;

export interface MoverFechaCcResult {
  success: boolean;
  newCronograma?: CronogramaCc;
  errorMsg?: string;
}

/** Mínimo días hábiles invitación → acto (Art. 85 LCP). */
const PLAZO_MIN_ACTO: Record<TipoContratacionBackend, number> = {
  BIENES: 5,
  SERVICIOS: 6,
  OBRAS: 7,
};

/** Días hábiles desde acto → evaluación / adjudicación / notificación (Art. 87). */
const PLAZOS_POST_ACTO: Record<
  TipoContratacionBackend,
  { eval: number; adj: number; notif: number }
> = {
  BIENES: { eval: 4, adj: 6, notif: 8 },
  SERVICIOS: { eval: 5, adj: 8, notif: 10 },
  OBRAS: { eval: 5, adj: 9, notif: 11 },
};

/** Días hábiles invitación → solicitud de aclaratorias. */
const PLAZO_SOLICITUD_ACLARATORIAS: Record<TipoContratacionBackend, number> = {
  BIENES: 2,
  SERVICIOS: 3,
  OBRAS: 3,
};

const MAX_EXTRA_ACTO = 15;
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

function recalcDesdeActo(
  invitacionIso: string,
  actoIso: string,
  tipo: TipoContratacionBackend,
  feriados?: Set<string>
): Omit<
  CronogramaCc,
  "fecEnvioInvitacionCc" | "fecInicioDisponibilidadPliegoCc" | "fecSolicitudAclaratoriasCc"
> {
  const acto = parseDate(actoIso);
  const plazos = PLAZOS_POST_ACTO[tipo];
  const notif = addBusinessDays(acto, plazos.notif, feriados);

  return {
    fecFinDisponibilidadPliegoCc: formatIsoDate(addBusinessDays(acto, -1, feriados)),
    fecRespuestaAclaratoriasCc: formatIsoDate(addBusinessDays(acto, -1, feriados)),
    fecModificPliegoCc: formatIsoDate(addBusinessDays(acto, -2, feriados)),
    fecActoRecepAperSobresCc: formatIsoDate(acto),
    fecLimiteEvaluacionCc: formatIsoDate(addBusinessDays(acto, plazos.eval, feriados)),
    fecLimiteAdjudicacionCc: formatIsoDate(addBusinessDays(acto, plazos.adj, feriados)),
    fecLimiteNotificacionCc: formatIsoDate(notif),
    fecLimiteGarantiasCc: formatIsoDate(
      addBusinessDays(notif, MAX_GARANTIAS_DESDE_NOTIF, feriados)
    ),
    fecLimiteFirmaContratoCc: formatIsoDate(
      addBusinessDays(notif, MAX_FIRMA_DESDE_NOTIF, feriados)
    ),
  };
}

/**
 * Genera el cronograma de Concurso Cerrado.
 * Ancla: fecEnvioInvitacionCc (Hito Cero).
 */
export function calcularFechasSugeridasCc(
  fecEnvioInvitacionCc: string,
  tipo: TipoContratacionBackend,
  feriados?: Set<string>
): CronogramaCc {
  const invitacion = parseDate(fecEnvioInvitacionCc);
  const minActo = PLAZO_MIN_ACTO[tipo];
  const acto = addBusinessDays(invitacion, minActo, feriados);
  const actoIso = formatIsoDate(acto);
  const rest = recalcDesdeActo(fecEnvioInvitacionCc, actoIso, tipo, feriados);

  return {
    fecEnvioInvitacionCc: formatIsoDate(invitacion),
    fecInicioDisponibilidadPliegoCc: formatIsoDate(invitacion),
    fecSolicitudAclaratoriasCc: formatIsoDate(
      addBusinessDays(invitacion, PLAZO_SOLICITUD_ACLARATORIAS[tipo], feriados)
    ),
    ...rest,
  };
}

export function isFechaEditableCc(key: string): boolean {
  const readonly = new Set([
    "fecEnvioInvitacionCc",
    "fecInicioDisponibilidadPliegoCc",
    "rango-pliego",
  ]);
  return !readonly.has(key);
}

function validarSecuenciaCc(c: CronogramaCc): string | null {
  const get = (k: keyof CronogramaCc) => parseDate(c[k]);

  const invitacion = get("fecEnvioInvitacionCc");
  const inicioPliego = get("fecInicioDisponibilidadPliegoCc");
  const solicitud = get("fecSolicitudAclaratoriasCc");
  const modific = get("fecModificPliegoCc");
  const respuesta = get("fecRespuestaAclaratoriasCc");
  const finPliego = get("fecFinDisponibilidadPliegoCc");
  const acto = get("fecActoRecepAperSobresCc");
  const evalFecha = get("fecLimiteEvaluacionCc");
  const adj = get("fecLimiteAdjudicacionCc");
  const notif = get("fecLimiteNotificacionCc");
  const garantias = get("fecLimiteGarantiasCc");
  const firma = get("fecLimiteFirmaContratoCc");

  if (inicioPliego.getTime() !== invitacion.getTime() && inicioPliego < invitacion) {
    return "El inicio de disponibilidad del pliego no puede ser anterior a la invitación.";
  }
  if (solicitud < invitacion) {
    return "La solicitud de aclaratorias no puede ser anterior a la invitación.";
  }
  if (finPliego >= acto) {
    return "El fin de disponibilidad del pliego debe ser al menos 1 día hábil antes del acto.";
  }
  if (modific >= acto) {
    return "Las modificaciones al pliego deben ser anteriores al acto.";
  }
  if (respuesta >= acto) {
    return "La respuesta de aclaratorias debe ser anterior al acto.";
  }
  if (evalFecha <= acto) {
    return "La evaluación debe ser posterior al acto de recepción.";
  }
  if (adj <= evalFecha) {
    return "La adjudicación debe ser posterior a la evaluación.";
  }
  if (notif <= adj) {
    return "La notificación debe ser posterior a la adjudicación.";
  }
  if (garantias < notif) {
    return "Las garantías no pueden ser anteriores a la notificación.";
  }
  if (firma < notif) {
    return "La firma no puede ser anterior a la notificación.";
  }

  return null;
}

export function moverFechaCronogramaCc(
  cronogramaActual: CronogramaCc,
  eventId: string,
  diffInDays: number,
  tipo: TipoContratacionBackend,
  feriados?: Set<string>
): MoverFechaCcResult {
  if (!cronogramaActual || diffInDays === 0) {
    return { success: false, errorMsg: "No hay cambios a aplicar." };
  }

  if (!isFechaEditableCc(eventId) || eventId === "rango-pliego") {
    return {
      success: false,
      errorMsg: "Este hito no se puede mover directamente en el calendario.",
    };
  }

  if (!(eventId in cronogramaActual)) {
    return { success: false, errorMsg: "Clave de fecha no encontrada." };
  }

  const currentVal = cronogramaActual[eventId as keyof CronogramaCc];
  const newVal = addCalendarDays(currentVal, diffInDays);
  const newDate = parseDate(newVal);

  if (isNonWorkingDay(newDate, feriados)) {
    return { success: false, errorMsg: "La fecha no puede caer en un día no laborable." };
  }

  const invitacion = parseDate(cronogramaActual.fecEnvioInvitacionCc);
  if (newDate < invitacion) {
    return {
      success: false,
      errorMsg: "Ninguna fecha puede ser anterior a la emisión de las invitaciones.",
    };
  }

  if (eventId === "fecActoRecepAperSobresCc") {
    const minDays = PLAZO_MIN_ACTO[tipo];
    const diffHabiles = countBusinessDays(invitacion, newDate, feriados) - 1;
    if (diffHabiles < minDays) {
      const minLegal = addBusinessDays(invitacion, minDays, feriados);
      return {
        success: false,
        errorMsg: `El Acto de Recepción no puede ser inferior a ${minDays} días hábiles desde la invitación (mín. ${formatIsoDate(minLegal)}).`,
      };
    }
    const minLegal = addBusinessDays(invitacion, minDays, feriados);
    const maxLegal = addBusinessDays(minLegal, MAX_EXTRA_ACTO, feriados);
    if (newDate > maxLegal) {
      return {
        success: false,
        errorMsg: `El Acto de Recepción no puede exceder 15 días hábiles adicionales al mínimo legal (máx. ${formatIsoDate(maxLegal)}).`,
      };
    }
  }

  if (eventId === "fecLimiteGarantiasCc") {
    const notif = parseDate(cronogramaActual.fecLimiteNotificacionCc);
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

  if (eventId === "fecLimiteFirmaContratoCc") {
    const notif = parseDate(cronogramaActual.fecLimiteNotificacionCc);
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

  let next: CronogramaCc = {
    ...cronogramaActual,
    [eventId]: newVal,
  };

  // Cascada al mover acto: recalcula pliego fin + posteriores
  if (eventId === "fecActoRecepAperSobresCc") {
    const rest = recalcDesdeActo(next.fecEnvioInvitacionCc, newVal, tipo, feriados);
    next = {
      ...next,
      ...rest,
      fecActoRecepAperSobresCc: newVal,
    };
  }

  // Cascada al mover notificación: garantías y firma
  if (eventId === "fecLimiteNotificacionCc") {
    const notif = parseDate(newVal);
    next.fecLimiteGarantiasCc = formatIsoDate(
      addBusinessDays(notif, MAX_GARANTIAS_DESDE_NOTIF, feriados)
    );
    next.fecLimiteFirmaContratoCc = formatIsoDate(
      addBusinessDays(notif, MAX_FIRMA_DESDE_NOTIF, feriados)
    );
  }

  const seqError = validarSecuenciaCc(next);
  if (seqError) {
    return { success: false, errorMsg: seqError };
  }

  return { success: true, newCronograma: next };
}

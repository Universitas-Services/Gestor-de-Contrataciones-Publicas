import type { CronogramaFormValues, TipoContratacionBackend } from "@/lib/schemas/expedienteSchema";
import type {
  CronogramaConsultaPreciosFormValues,
  CronogramaConcursoCerradoFormValues,
  CronogramaContratacionDirectaFormValues,
  CronogramaModalidadesExcluidasFormValues,
} from "@/lib/schemas/gestionExpedienteSchema";
import {
  PLAZO_MIN_ACTO_RECEPCION,
  addBusinessDays,
  formatIsoDate,
} from "@/lib/utils/cronogramaUtils";

function dateOnly(value: string | undefined | null, fallback: string): string {
  if (!value) return fallback.split("T")[0];
  return value.split("T")[0];
}

function parseDate(iso: string): Date {
  return new Date(`${iso.split("T")[0]}T00:00:00`);
}

function maxIso(a: string, b: string): string {
  const aDate = dateOnly(a, b);
  const bDate = dateOnly(b, a);
  return parseDate(aDate) >= parseDate(bDate) ? aDate : bDate;
}

/**
 * El PUT /cronograma valida reglas de Concurso Abierto (Art. 67.1).
 * Modalidades cortas (CD/CP/ME) deben rellenar los 12 campos sin romper ese mínimo.
 * La UI sigue mostrando el cronograma real de la modalidad; solo se adapta el payload.
 */
function adaptPutToCaValidation(
  raw: CronogramaFormValues,
  tipo: TipoContratacionBackend,
  feriados?: Set<string>
): CronogramaFormValues {
  const llamado = dateOnly(raw.fechaLlamadoParticipar, raw.fechaLlamadoParticipar);
  const minActoIso = formatIsoDate(
    addBusinessDays(parseDate(llamado), PLAZO_MIN_ACTO_RECEPCION[tipo], feriados)
  );

  const acto = maxIso(raw.fechaActoRecepcionAperturaSobres, minActoIso);

  // Hitos previos al acto: entre llamado y acto (inclusive hacia atrás)
  let inicioPliego = dateOnly(raw.fechaInicioDisponibilidadPliego, llamado);
  if (parseDate(inicioPliego) < parseDate(llamado)) inicioPliego = llamado;
  if (parseDate(inicioPliego) > parseDate(acto)) inicioPliego = llamado;

  let finPliego = dateOnly(raw.fechaFinDisponibilidadPliego, acto);
  if (parseDate(finPliego) > parseDate(acto)) finPliego = acto;
  if (parseDate(finPliego) < parseDate(inicioPliego)) finPliego = inicioPliego;

  let solicitud = dateOnly(raw.fechaSolicitudAclaratorias, llamado);
  if (parseDate(solicitud) < parseDate(llamado)) solicitud = llamado;
  if (parseDate(solicitud) > parseDate(acto)) solicitud = llamado;

  let modificacion = dateOnly(raw.fechaModificacionPliego, finPliego);
  if (parseDate(modificacion) > parseDate(acto)) modificacion = finPliego;
  if (parseDate(modificacion) < parseDate(solicitud)) modificacion = solicitud;

  let respuesta = dateOnly(raw.fechaRespuestaAclaratorias, acto);
  if (parseDate(respuesta) > parseDate(acto)) respuesta = acto;
  if (parseDate(respuesta) < parseDate(modificacion)) respuesta = modificacion;

  // Hitos posteriores: no anteriores al acto
  const evaluacion = maxIso(raw.fechaLimiteEvaluacion, acto);
  const adjudicacion = maxIso(raw.fechaLimiteAdjudicacion, evaluacion);
  const notificacion = maxIso(raw.fechaLimiteNotificacion, adjudicacion);
  const garantias = maxIso(raw.fechaLimiteGarantias, notificacion);
  const firma = maxIso(raw.fechaLimiteFirmaContrato, notificacion);

  return {
    fechaLlamadoParticipar: llamado,
    fechaInicioDisponibilidadPliego: inicioPliego,
    fechaFinDisponibilidadPliego: finPliego,
    fechaSolicitudAclaratorias: solicitud,
    fechaRespuestaAclaratorias: respuesta,
    fechaModificacionPliego: modificacion,
    fechaActoRecepcionAperturaSobres: acto,
    fechaLimiteEvaluacion: evaluacion,
    fechaLimiteAdjudicacion: adjudicacion,
    fechaLimiteNotificacion: notificacion,
    fechaLimiteGarantias: garantias,
    fechaLimiteFirmaContrato: firma,
  };
}

/** Rellena los 12 campos estándar exigidos por PUT /cronograma. */
function fillCronograma12(
  partial: Partial<CronogramaFormValues> & { ancla: string }
): CronogramaFormValues {
  const a = dateOnly(partial.ancla, partial.ancla);
  const pick = (v: string | undefined, fb: string) => dateOnly(v, fb);

  return {
    fechaLlamadoParticipar: pick(partial.fechaLlamadoParticipar, a),
    fechaInicioDisponibilidadPliego: pick(partial.fechaInicioDisponibilidadPliego, a),
    fechaFinDisponibilidadPliego: pick(
      partial.fechaFinDisponibilidadPliego,
      pick(partial.fechaActoRecepcionAperturaSobres, a)
    ),
    fechaSolicitudAclaratorias: pick(partial.fechaSolicitudAclaratorias, a),
    fechaRespuestaAclaratorias: pick(
      partial.fechaRespuestaAclaratorias,
      pick(partial.fechaActoRecepcionAperturaSobres, a)
    ),
    fechaModificacionPliego: pick(
      partial.fechaModificacionPliego,
      pick(partial.fechaActoRecepcionAperturaSobres, a)
    ),
    fechaActoRecepcionAperturaSobres: pick(partial.fechaActoRecepcionAperturaSobres, a),
    fechaLimiteEvaluacion: pick(
      partial.fechaLimiteEvaluacion,
      pick(partial.fechaLimiteAdjudicacion, a)
    ),
    fechaLimiteAdjudicacion: pick(partial.fechaLimiteAdjudicacion, a),
    fechaLimiteNotificacion: pick(
      partial.fechaLimiteNotificacion,
      pick(partial.fechaLimiteAdjudicacion, a)
    ),
    fechaLimiteGarantias: pick(partial.fechaLimiteGarantias, a),
    fechaLimiteFirmaContrato: pick(partial.fechaLimiteFirmaContrato, a),
  };
}

// ─── API generar → form UI ───────────────────────────────────────────

export function apiToCronogramaCd(
  api: Record<string, string>
): CronogramaContratacionDirectaFormValues {
  const ancla = dateOnly(api.fechaEnvioInvitacion, "");
  return {
    fecEnvioInvitacionCd: ancla,
    fecRecepcionOfertaCd: dateOnly(api.fechaRecepcionOferta, ancla),
    fecLimiteAdjudicacionCd: dateOnly(api.fechaLimiteAdjudicacion, ancla),
    fecLimiteNotificacionCd: dateOnly(api.fechaLimiteNotificacion, ancla),
    fecLimiteGarantiasCd: dateOnly(api.fechaLimiteGarantias, ancla),
    fecLimiteFirmaContratoCd: dateOnly(api.fechaLimiteFirmaContrato, ancla),
  };
}

export function apiToCronogramaCc(
  api: Record<string, string>
): CronogramaConcursoCerradoFormValues {
  const ancla = dateOnly(api.fechaEnvioInvitacion, "");
  return {
    fecEnvioInvitacionCc: ancla,
    fecInicioDisponibilidadPliegoCc: dateOnly(api.fechaInicioDisponibilidadPliego, ancla),
    fecFinDisponibilidadPliegoCc: dateOnly(api.fechaFinDisponibilidadPliego, ancla),
    fecSolicitudAclaratoriasCc: dateOnly(api.fechaSolicitudAclaratorias, ancla),
    fecRespuestaAclaratoriasCc: dateOnly(api.fechaRespuestaAclaratorias, ancla),
    fecModificPliegoCc: dateOnly(api.fechaModificacionPliego, ancla),
    fecActoRecepAperSobresCc: dateOnly(api.fechaActoRecepcionAperturaSobres, ancla),
    fecLimiteEvaluacionCc: dateOnly(api.fechaLimiteEvaluacion, ancla),
    fecLimiteAdjudicacionCc: dateOnly(api.fechaLimiteAdjudicacion, ancla),
    fecLimiteNotificacionCc: dateOnly(api.fechaLimiteNotificacion, ancla),
    fecLimiteGarantiasCc: dateOnly(api.fechaLimiteGarantias, ancla),
    fecLimiteFirmaContratoCc: dateOnly(api.fechaLimiteFirmaContrato, ancla),
  };
}

export function apiToCronogramaCp(
  api: Record<string, string>
): CronogramaConsultaPreciosFormValues {
  const ancla = dateOnly(api.fechaEnvioInvitacion, "");
  return {
    fecEnvioInvitacionCp: ancla,
    fecSolicitudAclaratoriasCp: dateOnly(api.fechaSolicitudAclaratorias, ancla),
    fecRespuestaAclaratoriasCp: dateOnly(api.fechaRespuestaAclaratorias, ancla),
    fecRecepcionOfertasCp: dateOnly(api.fechaRecepcionOfertas, ancla),
    fecLimiteNotificacionCp: dateOnly(api.fechaLimiteNotificacion, ancla),
    fecLimiteGarantiasCp: dateOnly(api.fechaLimiteGarantias, ancla),
    fecLimiteFirmaContratoCp: dateOnly(api.fechaLimiteFirmaContrato, ancla),
  };
}

export function apiToCronogramaMe(
  api: Record<string, string>
): CronogramaModalidadesExcluidasFormValues {
  const ancla = dateOnly(api.fechaInicioProcedimiento, "");
  return {
    fecInicioProcedimientoMe: ancla,
    fecVerificacionRecaudosMe: dateOnly(api.fechaVerificacionRecaudos, ancla),
    fecLimiteAdjudicacionMe: dateOnly(api.fechaLimiteAdjudicacion, ancla),
    fecLimiteGarantiasMe: dateOnly(api.fechaLimiteGarantias, ancla),
    fecLimiteFirmaContratoMe: dateOnly(api.fechaLimiteFirmaContrato, ancla),
  };
}

// ─── Form UI → 12 campos PUT ─────────────────────────────────────────

export function cronogramaCdToPut(
  c: CronogramaContratacionDirectaFormValues,
  tipo: TipoContratacionBackend,
  feriados?: Set<string>
): CronogramaFormValues {
  const raw = fillCronograma12({
    ancla: c.fecEnvioInvitacionCd,
    fechaLlamadoParticipar: c.fecEnvioInvitacionCd,
    fechaInicioDisponibilidadPliego: c.fecEnvioInvitacionCd,
    fechaFinDisponibilidadPliego: c.fecRecepcionOfertaCd,
    fechaSolicitudAclaratorias: c.fecEnvioInvitacionCd,
    fechaRespuestaAclaratorias: c.fecRecepcionOfertaCd,
    fechaModificacionPliego: c.fecRecepcionOfertaCd,
    fechaActoRecepcionAperturaSobres: c.fecRecepcionOfertaCd,
    fechaLimiteEvaluacion: c.fecLimiteAdjudicacionCd,
    fechaLimiteAdjudicacion: c.fecLimiteAdjudicacionCd,
    fechaLimiteNotificacion: c.fecLimiteNotificacionCd,
    fechaLimiteGarantias: c.fecLimiteGarantiasCd,
    fechaLimiteFirmaContrato: c.fecLimiteFirmaContratoCd,
  });
  return adaptPutToCaValidation(raw, tipo, feriados);
}

export function cronogramaCcToPut(
  c: CronogramaConcursoCerradoFormValues,
  tipo: TipoContratacionBackend,
  feriados?: Set<string>
): CronogramaFormValues {
  const raw = fillCronograma12({
    ancla: c.fecEnvioInvitacionCc,
    fechaLlamadoParticipar: c.fecEnvioInvitacionCc,
    fechaInicioDisponibilidadPliego: c.fecInicioDisponibilidadPliegoCc,
    fechaFinDisponibilidadPliego: c.fecFinDisponibilidadPliegoCc,
    fechaSolicitudAclaratorias: c.fecSolicitudAclaratoriasCc,
    fechaRespuestaAclaratorias: c.fecRespuestaAclaratoriasCc,
    fechaModificacionPliego: c.fecModificPliegoCc,
    fechaActoRecepcionAperturaSobres: c.fecActoRecepAperSobresCc,
    fechaLimiteEvaluacion: c.fecLimiteEvaluacionCc,
    fechaLimiteAdjudicacion: c.fecLimiteAdjudicacionCc,
    fechaLimiteNotificacion: c.fecLimiteNotificacionCc,
    fechaLimiteGarantias: c.fecLimiteGarantiasCc,
    fechaLimiteFirmaContrato: c.fecLimiteFirmaContratoCc,
  });
  return adaptPutToCaValidation(raw, tipo, feriados);
}

export function cronogramaCpToPut(
  c: CronogramaConsultaPreciosFormValues,
  tipo: TipoContratacionBackend,
  feriados?: Set<string>
): CronogramaFormValues {
  const raw = fillCronograma12({
    ancla: c.fecEnvioInvitacionCp,
    fechaLlamadoParticipar: c.fecEnvioInvitacionCp,
    fechaInicioDisponibilidadPliego: c.fecEnvioInvitacionCp,
    fechaFinDisponibilidadPliego: c.fecRecepcionOfertasCp,
    fechaSolicitudAclaratorias: c.fecSolicitudAclaratoriasCp,
    fechaRespuestaAclaratorias: c.fecRespuestaAclaratoriasCp,
    fechaModificacionPliego: c.fecRecepcionOfertasCp,
    fechaActoRecepcionAperturaSobres: c.fecRecepcionOfertasCp,
    fechaLimiteEvaluacion: c.fecLimiteNotificacionCp,
    fechaLimiteAdjudicacion: c.fecLimiteNotificacionCp,
    fechaLimiteNotificacion: c.fecLimiteNotificacionCp,
    fechaLimiteGarantias: c.fecLimiteGarantiasCp,
    fechaLimiteFirmaContrato: c.fecLimiteFirmaContratoCp,
  });
  return adaptPutToCaValidation(raw, tipo, feriados);
}

/**
 * ME: fechaVerificacionRecaudos no se persiste en el PUT actual.
 * Se mapean inicio / adjudicación / garantías / firma; el resto se rellena.
 */
export function cronogramaMeToPut(
  c: CronogramaModalidadesExcluidasFormValues,
  tipo: TipoContratacionBackend,
  feriados?: Set<string>
): CronogramaFormValues {
  const raw = fillCronograma12({
    ancla: c.fecInicioProcedimientoMe,
    fechaLlamadoParticipar: c.fecInicioProcedimientoMe,
    fechaInicioDisponibilidadPliego: c.fecInicioProcedimientoMe,
    fechaFinDisponibilidadPliego: c.fecVerificacionRecaudosMe,
    fechaSolicitudAclaratorias: c.fecInicioProcedimientoMe,
    fechaRespuestaAclaratorias: c.fecVerificacionRecaudosMe,
    fechaModificacionPliego: c.fecVerificacionRecaudosMe,
    fechaActoRecepcionAperturaSobres: c.fecVerificacionRecaudosMe,
    fechaLimiteEvaluacion: c.fecLimiteAdjudicacionMe,
    fechaLimiteAdjudicacion: c.fecLimiteAdjudicacionMe,
    fechaLimiteNotificacion: c.fecLimiteAdjudicacionMe,
    fechaLimiteGarantias: c.fecLimiteGarantiasMe,
    fechaLimiteFirmaContrato: c.fecLimiteFirmaContratoMe,
  });
  return adaptPutToCaValidation(raw, tipo, feriados);
}

/** Invierte el mapeo PUT → form ME para mostrar el flujo lineal en detalle. */
export function putToCronogramaMe(
  c: Partial<CronogramaFormValues> | CronogramaFormValues | null | undefined
): CronogramaModalidadesExcluidasFormValues | null {
  if (!c?.fechaLlamadoParticipar) return null;
  const ancla = dateOnly(c.fechaLlamadoParticipar, "");
  return {
    fecInicioProcedimientoMe: ancla,
    fecVerificacionRecaudosMe: dateOnly(c.fechaActoRecepcionAperturaSobres, ancla),
    fecLimiteAdjudicacionMe: dateOnly(c.fechaLimiteAdjudicacion, ancla),
    fecLimiteGarantiasMe: dateOnly(c.fechaLimiteGarantias, ancla),
    fecLimiteFirmaContratoMe: dateOnly(c.fechaLimiteFirmaContrato, ancla),
  };
}

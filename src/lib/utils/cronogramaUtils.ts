import type { TipoContratacionBackend } from "@/lib/schemas/expedienteSchema";

/**
 * Suma N días hábiles (lunes–viernes) a una fecha base.
 * No incluye feriados (MVP).
 */
export function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const dow = result.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return result;
}

/**
 * Cuenta los días hábiles entre dos fechas (inclusive de startDate).
 */
export function countBusinessDays(from: Date, to: Date): number {
  let count = 0;
  const cur = new Date(from);
  while (cur <= to) {
    const dow = cur.getDay();
    if (dow !== 0 && dow !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

/**
 * Convierte yyyy-MM-dd a Date (sin corrección de zona horaria).
 */
export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Formatea una Date a "yyyy-MM-dd".
 */
export function formatIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ─── Plazos mínimos para el Acto de Recepción (Art. 67.1 LCP) ───────

export const PLAZO_MIN_ACTO_RECEPCION: Record<TipoContratacionBackend, number> = {
  BIENES: 7,
  SERVICIOS: 9,
  OBRAS: 11,
};

// ─── Plazos máximos para Adjudicación (Art. 81.1 LCP) ─────────────

export const PLAZO_MAX_ADJUDICACION: Record<TipoContratacionBackend, number> = {
  BIENES: 9,
  SERVICIOS: 12,
  OBRAS: 16,
};

export interface FechasSugeridas {
  fechaLlamadoParticipar: string;
  fechaInicioDisponibilidadPliego: string;
  fechaFinDisponibilidadPliego: string;
  fechaSolicitudAclaratorias: string;
  fechaRespuestaAclaratorias: string;
  fechaModificacionPliego: string;
  fechaActoRecepcionAperturaSobres: string;
  fechaLimiteEvaluacion: string;
  fechaLimiteAdjudicacion: string;
  fechaLimiteNotificacion: string;
  fechaLimiteGarantias: string;
  fechaLimiteFirmaContrato: string;
}

/**
 * Calcula las fechas sugeridas del cronograma a partir del llamado y el tipo.
 * Toda la lógica es en días hábiles (lunes–viernes, sin feriados).
 */
export function calcularFechasSugeridas(
  fechaLlamadoIso: string,
  tipo: TipoContratacionBackend
): FechasSugeridas {
  const llamado = parseIsoDate(fechaLlamadoIso);

  // Disponibilidad del pliego: Art. 65 DLCP → mismo día del llamado al día antes del acto
  const inicioDisponibilidad = new Date(llamado);
  const finDisponibilidad = addBusinessDays(llamado, PLAZO_MIN_ACTO_RECEPCION[tipo] - 2);

  // Acto de recepción: PLAZO_MIN días hábiles desde el llamado
  const actoRecepcion = addBusinessDays(llamado, PLAZO_MIN_ACTO_RECEPCION[tipo]);

  // Solicitud aclaratorias: mínimo 3 días hábiles desde inicio disponibilidad
  const solicitudAclaratorias = addBusinessDays(inicioDisponibilidad, 3);

  // Respuesta aclaratorias: hasta 1 día hábil antes del acto
  const respuestaAclaratorias = addBusinessDays(actoRecepcion, -1);

  // Modificaciones al pliego: hasta 2 días hábiles antes del acto
  const modificacionPliego = addBusinessDays(actoRecepcion, -2);

  // Evaluación: 3 días hábiles desde el acto
  const limiteEvaluacion = addBusinessDays(actoRecepcion, 3);

  // Adjudicación: PLAZO_MAX días desde acto (sugerido al máximo)
  const limiteAdjudicacion = addBusinessDays(actoRecepcion, PLAZO_MAX_ADJUDICACION[tipo]);

  // Notificación: +2 días hábiles tras adjudicación
  const limiteNotificacion = addBusinessDays(limiteAdjudicacion, 2);

  // Garantías: máximo 5 días hábiles post-notificación
  const limiteGarantias = addBusinessDays(limiteNotificacion, 5);

  // Firma del contrato: máximo 8 días hábiles post-notificación
  const limiteFirmaContrato = addBusinessDays(limiteNotificacion, 8);

  return {
    fechaLlamadoParticipar: fechaLlamadoIso,
    fechaInicioDisponibilidadPliego: formatIsoDate(inicioDisponibilidad),
    fechaFinDisponibilidadPliego: formatIsoDate(finDisponibilidad),
    fechaSolicitudAclaratorias: formatIsoDate(solicitudAclaratorias),
    fechaRespuestaAclaratorias: formatIsoDate(respuestaAclaratorias),
    fechaModificacionPliego: formatIsoDate(modificacionPliego),
    fechaActoRecepcionAperturaSobres: formatIsoDate(actoRecepcion),
    fechaLimiteEvaluacion: formatIsoDate(limiteEvaluacion),
    fechaLimiteAdjudicacion: formatIsoDate(limiteAdjudicacion),
    fechaLimiteNotificacion: formatIsoDate(limiteNotificacion),
    fechaLimiteGarantias: formatIsoDate(limiteGarantias),
    fechaLimiteFirmaContrato: formatIsoDate(limiteFirmaContrato),
  };
}

// ─── Validaciones legales ─────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  /** Error bloqueante — debe corregirse antes de guardar */
  errors: string[];
  /** Advertencias — el usuario puede continuar tras confirmar */
  warnings: string[];
}

export function validarCronograma(
  fechas: FechasSugeridas,
  tipo: TipoContratacionBackend
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const llamado = parseIsoDate(fechas.fechaLlamadoParticipar);
  const actoRecepcion = parseIsoDate(fechas.fechaActoRecepcionAperturaSobres);
  const adjudicacion = parseIsoDate(fechas.fechaLimiteAdjudicacion);
  const solicitudAclaratorias = parseIsoDate(fechas.fechaSolicitudAclaratorias);
  const respuestaAclaratorias = parseIsoDate(fechas.fechaRespuestaAclaratorias);
  const modificacionPliego = parseIsoDate(fechas.fechaModificacionPliego);
  const evaluacion = parseIsoDate(fechas.fechaLimiteEvaluacion);
  const notificacion = parseIsoDate(fechas.fechaLimiteNotificacion);
  const garantias = parseIsoDate(fechas.fechaLimiteGarantias);
  const firma = parseIsoDate(fechas.fechaLimiteFirmaContrato);

  // ─── Val. 1: Plazo mínimo del Acto de Recepción ─────────────────
  const diasHabilesHastaActo = countBusinessDays(llamado, actoRecepcion) - 1;
  const minActo = PLAZO_MIN_ACTO_RECEPCION[tipo];
  if (diasHabilesHastaActo < minActo) {
    const tipoLabel = { BIENES: "Bienes", SERVICIOS: "Servicios", OBRAS: "Obras" }[tipo];
    errors.push(
      `¡Atención! La fecha del Acto de Recepción no puede ser inferior a ${minActo} días hábiles desde el llamado para contratos de ${tipoLabel}. ` +
        `La fecha mínima permitida es el ${formatIsoDate(addBusinessDays(llamado, minActo))}, según el Art. 67.1 de la LCP.`
    );
  }

  // ─── Val. 2: Plazo máximo de Adjudicación ────────────────────────
  const diasHabilesHastaAdj = countBusinessDays(actoRecepcion, adjudicacion) - 1;
  const maxAdj = PLAZO_MAX_ADJUDICACION[tipo];
  if (diasHabilesHastaAdj > maxAdj) {
    const tipoLabel = { BIENES: "Bienes", SERVICIOS: "Servicios", OBRAS: "Obras" }[tipo];
    warnings.push(
      `Advertencia: La fecha límite para la Adjudicación excede el plazo máximo de ${maxAdj} días hábiles recomendado para ${tipoLabel} por el Art. 81.1 de la LCP. ` +
        `¿Desea continuar? (Se requerirá justificación en el expediente).`
    );
  }

  // ─── Val. 3: Coherencia cronológica ──────────────────────────────
  const secuencia: [string, Date][] = [
    ["Llamado a Participar", llamado],
    ["Solicitud de Aclaratorias", solicitudAclaratorias],
    ["Respuesta de Aclaratorias", respuestaAclaratorias],
    ["Modificaciones al Pliego", modificacionPliego],
    ["Acto de Recepción", actoRecepcion],
    ["Evaluación", evaluacion],
    ["Adjudicación", adjudicacion],
    ["Notificación", notificacion],
    ["Garantías", garantias],
    ["Firma de Contrato", firma],
  ];

  for (let i = 1; i < secuencia.length; i++) {
    const [prevLabel, prevDate] = secuencia[i - 1];
    const [currLabel, currDate] = secuencia[i];
    if (currDate < prevDate) {
      errors.push(
        `Error: La fecha de "${currLabel}" (${formatIsoDate(currDate)}) no puede ser anterior a la fecha de "${prevLabel}" (${formatIsoDate(prevDate)}).`
      );
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

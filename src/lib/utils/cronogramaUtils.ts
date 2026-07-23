import type { TipoContratacionBackend } from "@/lib/schemas/expedienteSchema";
import {
  addWorkingDays,
  countWorkingDays,
  ensureWorkingDay,
  formatIsoDate,
  isNonWorkingDay,
  isWeekend,
  parseIsoDate,
} from "@/lib/utils/diasNoLaborablesUtils";

export { formatIsoDate, isWeekend, parseIsoDate };

/**
 * Suma N días hábiles (lunes–viernes, excluyendo feriados del ente si se proveen).
 */
export function addBusinessDays(date: Date, days: number, feriados?: Set<string>): Date {
  return addWorkingDays(date, days, feriados);
}

/**
 * Cuenta los días hábiles entre dos fechas (inclusive de startDate).
 */
export function countBusinessDays(from: Date, to: Date, feriados?: Set<string>): number {
  return countWorkingDays(from, to, feriados);
}

export function ensureBusinessDay(date: Date, feriados?: Set<string>): Date {
  return ensureWorkingDay(date, feriados);
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
 * Toda la lógica es en días hábiles (lunes–viernes, excluyendo feriados del ente).
 */
export function calcularFechasSugeridas(
  fechaLlamadoIso: string,
  tipo: TipoContratacionBackend,
  feriados?: Set<string>
): FechasSugeridas {
  const llamado = parseIsoDate(fechaLlamadoIso);

  // Acto de recepción: PLAZO_MIN días hábiles desde el llamado
  const actoRecepcion = addBusinessDays(llamado, PLAZO_MIN_ACTO_RECEPCION[tipo], feriados);

  // Disponibilidad del pliego: Art. 65 DLCP → mismo día del llamado hasta 1 día antes del acto
  const inicioDisponibilidad = new Date(llamado);
  const finDisponibilidad = addBusinessDays(actoRecepcion, -1, feriados);

  // Solicitud aclaratorias: mínimo 3 días hábiles desde inicio disponibilidad
  const solicitudAclaratorias = addBusinessDays(inicioDisponibilidad, 3, feriados);

  // Modificaciones al pliego: 1 día hábil después de solicitud (Límite máximo: Acto-2)
  const modificacionPliego = addBusinessDays(solicitudAclaratorias, 1, feriados);

  // Respuesta aclaratorias: 1 día hábil después de modificaciones (Límite máximo: Acto-1)
  const respuestaAclaratorias = addBusinessDays(modificacionPliego, 1, feriados);

  // Evaluación: 3 días hábiles desde el acto
  const limiteEvaluacion = addBusinessDays(actoRecepcion, 3, feriados);

  // Adjudicación: PLAZO_MAX días desde acto (sugerido al máximo)
  const limiteAdjudicacion = addBusinessDays(actoRecepcion, PLAZO_MAX_ADJUDICACION[tipo], feriados);

  // Notificación: +2 días hábiles tras adjudicación
  const limiteNotificacion = addBusinessDays(limiteAdjudicacion, 2, feriados);

  // Garantías: máximo 5 días hábiles post-notificación
  const limiteGarantias = addBusinessDays(limiteNotificacion, 5, feriados);

  // Firma del contrato: máximo 8 días hábiles post-notificación
  const limiteFirmaContrato = addBusinessDays(limiteNotificacion, 8, feriados);

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
  tipo: TipoContratacionBackend,
  feriados?: Set<string>
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
  const diasHabilesHastaActo = countBusinessDays(llamado, actoRecepcion, feriados) - 1;
  const minActo = PLAZO_MIN_ACTO_RECEPCION[tipo];
  if (diasHabilesHastaActo < minActo) {
    const tipoLabel = { BIENES: "Bienes", SERVICIOS: "Servicios", OBRAS: "Obras" }[tipo];
    errors.push(
      `¡Atención! La fecha del Acto de Recepción no puede ser inferior a ${minActo} días hábiles desde el llamado para contratos de ${tipoLabel}. ` +
        `La fecha mínima permitida es el ${formatIsoDate(addBusinessDays(llamado, minActo, feriados))}, según el Art. 67.1 de la LCP.`
    );
  }

  // ─── Val. 2: Plazo máximo de Adjudicación ────────────────────────
  const diasHabilesHastaAdj = countBusinessDays(actoRecepcion, adjudicacion, feriados) - 1;
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

// ─── Lógica de Interfaz y Drag & Drop (Calendario) ──────────────────────

export function isFechaEditable(key: string): boolean {
  // Lista de campos que no se pueden mover visualmente en el calendario
  const readonlyFields = ["fechaLlamadoParticipar", "fechaInicioDisponibilidadPliego"];
  return !readonlyFields.includes(key);
}

export interface MoverFechaResult {
  success: boolean;
  newCronograma?: Record<string, unknown>;
  errorMsg?: string;
  warningMsg?: string;
}

function validarSecuenciaGlobal(cronograma: Record<string, unknown>): string | null {
  const getD = (key: string) => {
    const s = cronograma[key] as string;
    return s ? new Date(`${s.split("T")[0]}T00:00:00`) : new Date(0);
  };

  const secuencia: [string, Date][] = [
    ["Llamado a Participar", getD("fechaLlamadoParticipar")],
    ["Inicio de Disponibilidad del Pliego", getD("fechaInicioDisponibilidadPliego")],
    ["Solicitud de Aclaratorias", getD("fechaSolicitudAclaratorias")],
    ["Modificaciones al Pliego", getD("fechaModificacionPliego")],
    ["Respuesta de Aclaratorias", getD("fechaRespuestaAclaratorias")],
    ["Fin de Disponibilidad del Pliego", getD("fechaFinDisponibilidadPliego")],
    ["Acto de Recepción", getD("fechaActoRecepcionAperturaSobres")],
    ["Evaluación", getD("fechaLimiteEvaluacion")],
    ["Adjudicación", getD("fechaLimiteAdjudicacion")],
    ["Notificación", getD("fechaLimiteNotificacion")],
    ["Garantías", getD("fechaLimiteGarantias")],
    ["Firma de Contrato", getD("fechaLimiteFirmaContrato")],
  ];

  for (let i = 1; i < secuencia.length; i++) {
    const [prevLabel, prevDate] = secuencia[i - 1];
    const [currLabel, currDate] = secuencia[i];

    if (prevDate.getTime() === 0 || currDate.getTime() === 0) continue;

    // Casos excepcionales donde las fases pueden ocurrir el mismo día exacto
    const isLlamadoEInicio =
      prevLabel === "Llamado a Participar" && currLabel === "Inicio de Disponibilidad del Pliego";
    const isGarantiasYFirma = prevLabel === "Garantías" && currLabel === "Firma de Contrato";
    const canBeSameDay = isLlamadoEInicio || isGarantiasYFirma;

    if (canBeSameDay) {
      if (currDate < prevDate) {
        return `Error: La fecha para "${currLabel}" (${formatIsoDate(currDate)}) no puede ser anterior a la fecha de "${prevLabel}" (${formatIsoDate(prevDate)}).`;
      }
    } else {
      // El resto de la cadena debe ser estrictamente secuencial (celdas distintas)
      if (currDate <= prevDate) {
        return `Error: La fecha para "${currLabel}" (${formatIsoDate(currDate)}) debe ser posterior a la fecha de "${prevLabel}" (${formatIsoDate(prevDate)}).`;
      }
    }
  }
  return null;
}

export function moverFechaCronograma(
  cronogramaActual: Record<string, unknown>,
  eventId: string,
  diffInDays: number,
  tipoContratacion: TipoContratacionBackend,
  feriados?: Set<string>
): MoverFechaResult {
  if (!cronogramaActual || diffInDays === 0) {
    return { success: false, errorMsg: "No hay cambios a aplicar." };
  }

  // 1. Validación de edición base
  const isPliegoRango = eventId === "rango-pliego";
  if (!isFechaEditable(eventId) || isPliegoRango) {
    return {
      success: false,
      errorMsg: "Este hito no se puede mover directamente en el calendario.",
    };
  }

  const addDaysSimple = (dateStr: string, days: number): string => {
    if (!dateStr) return "";
    const date = new Date(`${dateStr.split("T")[0]}T00:00:00`);
    if (isNaN(date.getTime())) return dateStr.split("T")[0];

    date.setDate(date.getDate() + days);

    if (isNaN(date.getTime())) return dateStr.split("T")[0];
    return date.toISOString().split("T")[0];
  };

  const checkNonWorkingDay = (dateStr: string): boolean => {
    const date = new Date(`${dateStr.split("T")[0]}T00:00:00`);
    return isNonWorkingDay(date, feriados);
  };

  // Clonar original
  const newCronograma = { ...cronogramaActual };

  // 1.5. Capturar fecha base de Llamado a Participar
  const llamadoStr = newCronograma["fechaLlamadoParticipar"] as string;
  const llamadoDate = llamadoStr ? new Date(`${llamadoStr.split("T")[0]}T00:00:00`) : new Date(0);

  const checkBeforeLlamado = (dateStr: string): boolean => {
    const date = new Date(`${dateStr.split("T")[0]}T00:00:00`);
    return date < llamadoDate;
  };

  // 2. Desplazamiento simple (Solo hitos individuales)
  const currentVal = newCronograma[eventId] as string;
  if (!currentVal) return { success: false, errorMsg: "Clave de fecha no encontrada." };

  const newVal = addDaysSimple(currentVal, diffInDays);

  if (checkBeforeLlamado(newVal)) {
    return {
      success: false,
      errorMsg: "Ninguna fecha puede ser anterior al Llamado a Participar.",
    };
  }

  if (checkNonWorkingDay(newVal)) {
    return { success: false, errorMsg: "La fecha no puede caer en un día no laborable." };
  }

  // 4. TODO: Validaciones futuras más restrictivas
  if (eventId === "fechaSolicitudAclaratorias") {
    const newDate = new Date(`${newVal.split("T")[0]}T00:00:00`);
    const diffHabiles = countBusinessDays(llamadoDate, newDate, feriados) - 1;
    if (diffHabiles < 3) {
      return {
        success: false,
        errorMsg:
          "El Límite para Solicitud de Aclaratorias debe ser mínimo 3 días hábiles después del Llamado a Participar.",
      };
    }
  }

  if (eventId === "fechaModificacionPliego") {
    const actoStr = newCronograma["fechaActoRecepcionAperturaSobres"] as string;
    if (actoStr) {
      const actoDate = new Date(`${actoStr.split("T")[0]}T00:00:00`);
      const newDateMod = new Date(`${newVal.split("T")[0]}T00:00:00`);
      const diffHabiles = countBusinessDays(newDateMod, actoDate, feriados) - 1;
      if (diffHabiles < 2) {
        return {
          success: false,
          errorMsg:
            "El Límite para Modificaciones al Pliego debe ser al menos 2 días hábiles antes del Acto de Recepción.",
        };
      }
    }
  }

  if (eventId === "fechaRespuestaAclaratorias") {
    const actoStr = newCronograma["fechaActoRecepcionAperturaSobres"] as string;
    if (actoStr) {
      const actoDate = new Date(`${actoStr.split("T")[0]}T00:00:00`);
      const newDateResp = new Date(`${newVal.split("T")[0]}T00:00:00`);
      const diffHabiles = countBusinessDays(newDateResp, actoDate, feriados) - 1;
      if (diffHabiles < 1) {
        return {
          success: false,
          errorMsg:
            "El Límite para Respuesta de Aclaratorias debe ser al menos 1 día hábil antes del Acto de Recepción.",
        };
      }
    }
  }

  if (eventId === "fechaActoRecepcionAperturaSobres") {
    const minDays = PLAZO_MIN_ACTO_RECEPCION[tipoContratacion];
    const newDateActo = new Date(`${newVal.split("T")[0]}T00:00:00`);
    const diffHabiles = countBusinessDays(llamadoDate, newDateActo, feriados) - 1;

    if (diffHabiles < minDays) {
      const labels: Record<string, string> = {
        BIENES: "Bienes",
        SERVICIOS: "Servicios",
        OBRAS: "Obras",
      };
      const tipoLabel = labels[tipoContratacion] || tipoContratacion;
      const minLegalDate = addBusinessDays(llamadoDate, minDays, feriados);
      return {
        success: false,
        errorMsg: `¡Atención! La fecha del Acto de Recepción no puede ser inferior a ${minDays} días hábiles desde la publicación del llamado para contratos de ${tipoLabel}. La fecha mínima permitida es el ${formatIsoDate(minLegalDate)}, según el Art. 67.1 de la LCP.`,
      };
    }

    // LÍMITE MÁXIMO: 15 días hábiles después del mínimo legal
    const minLegalDate = addBusinessDays(llamadoDate, minDays);
    const maxLegalDate = addBusinessDays(minLegalDate, 15, feriados);
    if (newDateActo > maxLegalDate) {
      return {
        success: false,
        errorMsg: `¡Atención! La fecha del Acto de Recepción no puede exceder los 15 días hábiles adicionales al plazo mínimo legal. La fecha máxima permitida es el ${formatIsoDate(maxLegalDate)}.`,
      };
    }
  }

  if (eventId === "fechaLimiteEvaluacion") {
    const actoStr = newCronograma["fechaActoRecepcionAperturaSobres"] as string;
    if (actoStr) {
      const actoDate = new Date(`${actoStr.split("T")[0]}T00:00:00`);
      const newDateEval = new Date(`${newVal.split("T")[0]}T00:00:00`);
      const diffHabiles = countBusinessDays(actoDate, newDateEval, feriados) - 1;

      const minEval = tipoContratacion === "BIENES" ? 5 : tipoContratacion === "SERVICIOS" ? 7 : 10;

      if (diffHabiles < minEval) {
        const labels: Record<string, string> = {
          BIENES: "Bienes",
          SERVICIOS: "Servicios",
          OBRAS: "Obras",
        };
        const tipoLabel = labels[tipoContratacion] || tipoContratacion;
        return {
          success: false,
          errorMsg: `El Límite para Evaluación para ${tipoLabel} debe ser al menos ${minEval} días hábiles después del Acto de Recepción.`,
        };
      }
    }
  }

  if (eventId === "fechaLimiteAdjudicacion") {
    const actoStr = newCronograma["fechaActoRecepcionAperturaSobres"] as string;
    if (actoStr) {
      const actoDate = new Date(`${actoStr.split("T")[0]}T00:00:00`);
      const newDateAdj = new Date(`${newVal.split("T")[0]}T00:00:00`);
      const diffHabiles = countBusinessDays(actoDate, newDateAdj, feriados) - 1;

      const maxAdj = PLAZO_MAX_ADJUDICACION[tipoContratacion];

      if (diffHabiles > maxAdj) {
        const labels: Record<string, string> = {
          BIENES: "Bienes",
          SERVICIOS: "Servicios",
          OBRAS: "Obras",
        };
        const tipoLabel = labels[tipoContratacion] || tipoContratacion;
        return {
          success: true,
          newCronograma: { ...newCronograma, [eventId]: newVal + "T00:00:00.000Z" },
          warningMsg: `Advertencia: La fecha límite para la Adjudicación excede el plazo máximo de ${maxAdj} días recomendado para ${tipoLabel} por el Art. 81.1 de la LCP. ¿Desea continuar? (Se requerirá justificación en el expediente).`,
        };
      }
    }
  }

  if (eventId === "fechaLimiteNotificacion") {
    const adjStr = newCronograma["fechaLimiteAdjudicacion"] as string;
    if (adjStr) {
      const adjDate = new Date(`${adjStr.split("T")[0]}T00:00:00`);
      const newDateNotif = new Date(`${newVal.split("T")[0]}T00:00:00`);
      const diffHabiles = countBusinessDays(adjDate, newDateNotif, feriados) - 1;
      if (diffHabiles < 2) {
        return {
          success: false,
          errorMsg:
            "El Límite para Notificación debe ser al menos 2 días hábiles después de la Adjudicación.",
        };
      }
    }
  }

  if (eventId === "fechaLimiteGarantias") {
    const notifStr = newCronograma["fechaLimiteNotificacion"] as string;
    if (notifStr) {
      const notifDate = new Date(`${notifStr.split("T")[0]}T00:00:00`);
      const newDateGarantia = new Date(`${newVal.split("T")[0]}T00:00:00`);
      const diffHabiles = countBusinessDays(notifDate, newDateGarantia, feriados) - 1;
      if (diffHabiles > 5) {
        return {
          success: false,
          errorMsg:
            "El Límite para Consignar Garantías no puede exceder los 5 días hábiles después de la Notificación.",
        };
      }
      if (diffHabiles < 0) {
        return {
          success: false,
          errorMsg: "El Límite para Consignar Garantías no puede ser anterior a la Notificación.",
        };
      }
    }
  }

  if (eventId === "fechaLimiteFirmaContrato") {
    const notifStr = newCronograma["fechaLimiteNotificacion"] as string;
    if (notifStr) {
      const notifDate = new Date(`${notifStr.split("T")[0]}T00:00:00`);
      const newDateFirma = new Date(`${newVal.split("T")[0]}T00:00:00`);
      const diffHabiles = countBusinessDays(notifDate, newDateFirma, feriados) - 1;
      if (diffHabiles > 8) {
        return {
          success: false,
          errorMsg:
            "El Límite para la Firma del Contrato no puede exceder los 8 días hábiles después de la Notificación.",
        };
      }
      if (diffHabiles < 0) {
        return {
          success: false,
          errorMsg: "El Límite para la Firma del Contrato no puede ser anterior a la Notificación.",
        };
      }
    }
  }

  newCronograma[eventId] = newVal + "T00:00:00.000Z";

  // ─── LÓGICA DE CASCADA (PUSH) ──────────────────────────────────

  // Función auxiliar para mover una fecha y formatearla asegurando día hábil
  const shift = (key: string, days: number) => {
    const val = newCronograma[key] as string;
    if (val) {
      let pushDate = new Date(`${addDaysSimple(val, days)}T00:00:00`);
      // Si cae en fin de semana, empujar al Lunes
      if (isNonWorkingDay(pushDate, feriados)) {
        pushDate = ensureBusinessDay(pushDate, feriados);
      }
      newCronograma[key] = formatIsoDate(pushDate) + "T00:00:00.000Z";
    }
  };

  if (eventId === "fechaActoRecepcionAperturaSobres") {
    // 1. Ajustar Fin de Pliego automático (Siempre 1 día hábil antes del Acto)
    const actoDate = new Date(`${newVal.split("T")[0]}T00:00:00`);
    const finPliegoDate = addBusinessDays(actoDate, -1, feriados);
    newCronograma["fechaFinDisponibilidadPliego"] = formatIsoDate(finPliegoDate) + "T00:00:00.000Z";

    // 2. Desplazar hacia adelante todas las fechas posteriores
    shift("fechaLimiteEvaluacion", diffInDays);
    shift("fechaLimiteAdjudicacion", diffInDays);
    shift("fechaLimiteNotificacion", diffInDays);
    shift("fechaLimiteGarantias", diffInDays);
    shift("fechaLimiteFirmaContrato", diffInDays);
  }

  if (eventId === "fechaLimiteNotificacion") {
    // Desplazar Garantías y Firma al mover Notificación
    shift("fechaLimiteGarantias", diffInDays);
    shift("fechaLimiteFirmaContrato", diffInDays);
  }

  // 4.5 Verificar Secuencia Universal (Coherencia Cronológica)
  const errorSecuencia = validarSecuenciaGlobal(newCronograma);
  if (errorSecuencia) {
    return { success: false, errorMsg: errorSecuencia };
  }

  // 5. Retorno Seguro
  return { success: true, newCronograma };
}

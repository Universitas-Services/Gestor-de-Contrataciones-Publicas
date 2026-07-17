import type { CronogramaModalidadesExcluidasFormValues } from "@/lib/schemas/gestionExpedienteSchema";
import { addBusinessDays, countBusinessDays, formatIsoDate } from "@/lib/utils/cronogramaUtils";
import { isNonWorkingDay } from "@/lib/utils/diasNoLaborablesUtils";

export type CronogramaMe = CronogramaModalidadesExcluidasFormValues;

export interface ActualizarFechaMeResult {
  success: boolean;
  newCronograma?: CronogramaMe;
  errorMsg?: string;
}

/** Sugerencia por defecto: inicio + 2 hábiles (rango 1–2). */
const DIAS_VERIFICACION_DEFAULT = 2;
const MIN_DIAS_VERIFICACION = 1;
const MAX_DIAS_VERIFICACION = 2;

/** Adjudicación: +1 hábil desde verificación. */
const DIAS_ADJUDICACION_DESDE_VERIFICACION = 1;

const MAX_GARANTIAS_DESDE_ADJ = 5;
const MAX_FIRMA_DESDE_ADJ = 8;

function parseDate(iso: string): Date {
  return new Date(`${iso.split("T")[0]}T00:00:00`);
}

function recalcDesdeAdjudicacion(
  adjudicacionIso: string,
  feriados?: Set<string>
): Pick<CronogramaMe, "fecLimiteGarantiasMe" | "fecLimiteFirmaContratoMe"> {
  const adj = parseDate(adjudicacionIso);
  return {
    fecLimiteGarantiasMe: formatIsoDate(addBusinessDays(adj, MAX_GARANTIAS_DESDE_ADJ, feriados)),
    fecLimiteFirmaContratoMe: formatIsoDate(addBusinessDays(adj, MAX_FIRMA_DESDE_ADJ, feriados)),
  };
}

function recalcDesdeVerificacion(
  verificacionIso: string,
  feriados?: Set<string>
): Pick<
  CronogramaMe,
  "fecLimiteAdjudicacionMe" | "fecLimiteGarantiasMe" | "fecLimiteFirmaContratoMe"
> {
  const verificacion = parseDate(verificacionIso);
  const adjudicacion = addBusinessDays(
    verificacion,
    DIAS_ADJUDICACION_DESDE_VERIFICACION,
    feriados
  );
  const adjIso = formatIsoDate(adjudicacion);
  return {
    fecLimiteAdjudicacionMe: adjIso,
    ...recalcDesdeAdjudicacion(adjIso, feriados),
  };
}

/**
 * Cronograma Modalidades Excluidas. Ancla: fecInicioProcedimientoMe.
 */
export function calcularFechasSugeridasMe(
  fecInicioProcedimientoMe: string,
  feriados?: Set<string>
): CronogramaMe {
  const inicio = parseDate(fecInicioProcedimientoMe);
  const verificacion = addBusinessDays(inicio, DIAS_VERIFICACION_DEFAULT, feriados);
  const verificacionIso = formatIsoDate(verificacion);

  return {
    fecInicioProcedimientoMe: formatIsoDate(inicio),
    fecVerificacionRecaudosMe: verificacionIso,
    ...recalcDesdeVerificacion(verificacionIso, feriados),
  };
}

export type FechaEditableMe =
  | "fecVerificacionRecaudosMe"
  | "fecLimiteAdjudicacionMe"
  | "fecLimiteGarantiasMe"
  | "fecLimiteFirmaContratoMe";

export function isFechaEditableMe(key: string): key is FechaEditableMe {
  return (
    key === "fecVerificacionRecaudosMe" ||
    key === "fecLimiteAdjudicacionMe" ||
    key === "fecLimiteGarantiasMe" ||
    key === "fecLimiteFirmaContratoMe"
  );
}

/**
 * Actualiza una fecha del flujo lineal ME y aplica cascada / topes.
 */
export function actualizarFechaCronogramaMe(
  cronogramaActual: CronogramaMe,
  key: FechaEditableMe,
  nuevaFechaIso: string,
  feriados?: Set<string>
): ActualizarFechaMeResult {
  const fechaIso = nuevaFechaIso.split("T")[0];
  const nueva = parseDate(fechaIso);

  if (Number.isNaN(nueva.getTime())) {
    return { success: false, errorMsg: "Fecha inválida." };
  }

  if (isNonWorkingDay(nueva, feriados)) {
    return {
      success: false,
      errorMsg: "La fecha seleccionada no es un día hábil.",
    };
  }

  const inicio = parseDate(cronogramaActual.fecInicioProcedimientoMe);
  let next: CronogramaMe = { ...cronogramaActual };

  if (key === "fecVerificacionRecaudosMe") {
    if (nueva < inicio) {
      return {
        success: false,
        errorMsg: "La verificación no puede ser anterior al inicio del procedimiento.",
      };
    }

    const diasDesdeInicio = countBusinessDays(inicio, nueva, feriados) - 1;
    if (diasDesdeInicio < MIN_DIAS_VERIFICACION) {
      return {
        success: false,
        errorMsg: `La verificación debe ser al menos ${MIN_DIAS_VERIFICACION} día(s) hábil(es) después del inicio.`,
      };
    }
    if (diasDesdeInicio > MAX_DIAS_VERIFICACION) {
      return {
        success: false,
        errorMsg: `La verificación sugerida es de máximo ${MAX_DIAS_VERIFICACION} días hábiles desde el inicio.`,
      };
    }

    next.fecVerificacionRecaudosMe = fechaIso;
    next = { ...next, ...recalcDesdeVerificacion(fechaIso, feriados) };
  } else if (key === "fecLimiteAdjudicacionMe") {
    const verificacion = parseDate(cronogramaActual.fecVerificacionRecaudosMe);
    if (nueva <= verificacion) {
      return {
        success: false,
        errorMsg: "La adjudicación debe ser posterior a la verificación de recaudos.",
      };
    }

    next.fecLimiteAdjudicacionMe = fechaIso;
    next = { ...next, ...recalcDesdeAdjudicacion(fechaIso, feriados) };
  } else if (key === "fecLimiteGarantiasMe") {
    const adj = parseDate(cronogramaActual.fecLimiteAdjudicacionMe);
    if (nueva < adj) {
      return {
        success: false,
        errorMsg: "Las garantías no pueden ser anteriores a la adjudicación.",
      };
    }
    const max = addBusinessDays(adj, MAX_GARANTIAS_DESDE_ADJ, feriados);
    if (nueva > max) {
      return {
        success: false,
        errorMsg: `El plazo máximo de garantías es ${MAX_GARANTIAS_DESDE_ADJ} días hábiles desde la adjudicación.`,
      };
    }
    next.fecLimiteGarantiasMe = fechaIso;
  } else if (key === "fecLimiteFirmaContratoMe") {
    const adj = parseDate(cronogramaActual.fecLimiteAdjudicacionMe);
    if (nueva < adj) {
      return {
        success: false,
        errorMsg: "La firma no puede ser anterior a la adjudicación.",
      };
    }
    const max = addBusinessDays(adj, MAX_FIRMA_DESDE_ADJ, feriados);
    if (nueva > max) {
      return {
        success: false,
        errorMsg: `El plazo máximo de firma es ${MAX_FIRMA_DESDE_ADJ} días hábiles desde la adjudicación.`,
      };
    }
    next.fecLimiteFirmaContratoMe = fechaIso;
  }

  return { success: true, newCronograma: next };
}

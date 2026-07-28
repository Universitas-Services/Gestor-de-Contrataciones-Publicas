import {
  isConcursoCerrado,
  isConsultaPrecios,
  isContratacionDirecta,
  isModalidadExcluida,
} from "@/lib/modalidades/modalidadDisplay";
import {
  apiToCronogramaCc,
  apiToCronogramaCd,
  apiToCronogramaCp,
  apiToCronogramaMe,
  cronogramaCcToPut,
  cronogramaCdToPut,
  cronogramaCpToPut,
  cronogramaMeToPut,
} from "@/lib/modalidades/mapCronogramaApi";
import { calcularFechasSugeridasCc } from "@/lib/modalidades/cronogramaConcursoCerrado";
import { calcularFechasSugeridasCd } from "@/lib/modalidades/cronogramaContratacionDirecta";
import { calcularFechasSugeridasCp } from "@/lib/modalidades/cronogramaConsultaPrecios";
import { calcularFechasSugeridasMe } from "@/lib/modalidades/cronogramaModalidadesExcluidas";
import type { CronogramaFormValues, TipoContratacionBackend } from "@/lib/schemas/expedienteSchema";
import { calcularFechasSugeridas } from "@/lib/utils/cronogramaUtils";
import {
  generarCronogramaConcursoCerrado,
  generarCronogramaConsultaPrecios,
  generarCronogramaContratacionDirecta,
  generarCronogramaModalidadExcluida,
} from "@/services/expedienteService";

export interface CompletarCronogramaResult {
  cronograma: CronogramaFormValues;
  /** True si falló el endpoint de generación y se usó el cálculo local. */
  usedLocalFallback: boolean;
}

function resolveTipoContratacion(raw?: string | null): TipoContratacionBackend {
  if (raw === "BIENES" || raw === "SERVICIOS" || raw === "OBRAS") return raw;
  throw new Error("El expediente no tiene un tipo de contratación válido.");
}

/**
 * Genera el payload PUT de cronograma a partir de la fecha ancla,
 * según la modalidad (mismo camino que el wizard de creación).
 */
export async function completarCronogramaDesdeFechaAncla(params: {
  modalidadCode?: string | null;
  tipoContratacion?: string | null;
  fechaAncla: string;
  feriados?: Set<string>;
}): Promise<CompletarCronogramaResult> {
  const fecha = params.fechaAncla.split("T")[0];
  const tipo = resolveTipoContratacion(params.tipoContratacion);
  const feriados = params.feriados;
  const code = params.modalidadCode;

  if (isContratacionDirecta(code)) {
    let fechas = calcularFechasSugeridasCd(fecha, feriados);
    let usedLocalFallback = false;
    try {
      const api = await generarCronogramaContratacionDirecta({
        fechaEnvioInvitacion: fecha,
      });
      fechas = apiToCronogramaCd(api);
    } catch {
      usedLocalFallback = true;
    }
    return {
      cronograma: cronogramaCdToPut(fechas, tipo, feriados),
      usedLocalFallback,
    };
  }

  if (isConcursoCerrado(code)) {
    let fechas = calcularFechasSugeridasCc(fecha, tipo, feriados);
    let usedLocalFallback = false;
    try {
      const api = await generarCronogramaConcursoCerrado({
        tipoContratacion: tipo,
        fechaEnvioInvitacion: fecha,
      });
      fechas = apiToCronogramaCc(api);
    } catch {
      usedLocalFallback = true;
    }
    return {
      cronograma: cronogramaCcToPut(fechas, tipo, feriados),
      usedLocalFallback,
    };
  }

  if (isConsultaPrecios(code)) {
    let fechas = calcularFechasSugeridasCp(fecha, tipo, feriados);
    let usedLocalFallback = false;
    try {
      const api = await generarCronogramaConsultaPrecios({
        tipoContratacion: tipo,
        fechaEnvioInvitacion: fecha,
      });
      fechas = apiToCronogramaCp(api);
    } catch {
      usedLocalFallback = true;
    }
    return {
      cronograma: cronogramaCpToPut(fechas, tipo, feriados),
      usedLocalFallback,
    };
  }

  if (isModalidadExcluida(code)) {
    let fechas = calcularFechasSugeridasMe(fecha, feriados);
    let usedLocalFallback = false;
    try {
      const api = await generarCronogramaModalidadExcluida({
        fechaInicioProcedimiento: fecha,
      });
      fechas = apiToCronogramaMe(api);
    } catch {
      usedLocalFallback = true;
    }
    return {
      cronograma: cronogramaMeToPut(fechas, tipo, feriados),
      usedLocalFallback,
    };
  }

  // Concurso Abierto / LICITACION_PUBLICA (y fallback genérico)
  const fechas = calcularFechasSugeridas(fecha, tipo, feriados);
  return {
    cronograma: fechas as CronogramaFormValues,
    usedLocalFallback: false,
  };
}

import type { ContratoFormValues } from "@/lib/schemas/contratoSchema";
import type {
  ContratoFormalizadoPayload,
  ContratoFormalizadoResponse,
} from "@/services/expedienteService";
import {
  formatNumberToDecimalInput,
  parseDecimalInputToNumber,
} from "@/lib/utils/adjudicacionMapper";

function parseApiNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = parseDecimalInputToNumber(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function parseApiInteger(value: unknown): number | null {
  const n = parseApiNumber(value);
  if (n == null) return null;
  return Math.trunc(n);
}

function booleanToSiNo(value: boolean | null | undefined): "SI" | "NO" | null {
  if (value === true) return "SI";
  if (value === false) return "NO";
  return null;
}

function requireNumber(value: number | null, label: string): number {
  if (value == null || !Number.isFinite(value)) {
    throw new Error(`${label} no es válido`);
  }
  return value;
}

function requireSiNo(value: "SI" | "NO" | null, label: string): boolean {
  if (value !== "SI" && value !== "NO") {
    throw new Error(`${label}: seleccione SI o NO`);
  }
  return value === "SI";
}

export function parseContratoFormalizadoApiResponse(
  json: unknown
): ContratoFormalizadoResponse | null {
  if (!json || typeof json !== "object") return null;

  const record = json as Record<string, unknown>;
  const raw =
    record.data != null && typeof record.data === "object"
      ? (record.data as Record<string, unknown>)
      : record;

  const fechaInicioVigencia = raw.fechaInicioVigencia;
  const fechaFinVigencia = raw.fechaFinVigencia;
  const montoContratoBs = parseApiNumber(raw.montoContratoBs);
  const plazoEjecucionDias = parseApiInteger(raw.plazoEjecucionDias);
  const plazoGarantiaCalidadFuncionamiento = raw.plazoGarantiaCalidadFuncionamiento;
  const nombreSupervisor = raw.nombreSupervisor;
  const cedulaSupervisor = raw.cedulaSupervisor;
  const cargoSupervisor = raw.cargoSupervisor;
  const criterioAceptacionContrato = raw.criterioAceptacionContrato;
  const plazoConsignacionFacturas = parseApiInteger(raw.plazoConsignacionFacturas);
  const montoFielCumplimientoBs = parseApiNumber(raw.montoFielCumplimientoBs);
  const requiereGarantiaLaboral = raw.requiereGarantiaLaboral;
  const porcentajeGarantiaLaboral = parseApiNumber(raw.porcentajeGarantiaLaboral);
  const montoGarantiaLaboralBs = parseApiNumber(raw.montoGarantiaLaboralBs);
  const polizaResponsabilidadCivil = raw.polizaResponsabilidadCivil;
  const porcentajeResponsabilidadCivil = parseApiNumber(raw.porcentajeResponsabilidadCivil);
  const montoResponsabilidadCivilBs = parseApiNumber(raw.montoResponsabilidadCivilBs);
  const anticipoContrato = raw.anticipoContrato;
  const formaCumplimientoCrs = raw.formaCumplimientoCrs;
  const unidadRespCumplimientoCrs = raw.unidadRespCumplimientoCrs;
  const porcentajeMultaDiaria = parseApiNumber(raw.porcentajeMultaDiaria);
  const baseCalculoMultaDiaria = parseApiNumber(raw.baseCalculoMultaDiaria);
  const plazoRegularizarIncumplimiento = raw.plazoRegularizarIncumplimiento;
  const porcentajeProcedimientoRescision = parseApiNumber(raw.porcentajeProcedimientoRescision);
  const formulaAjustePrecios = raw.formulaAjustePrecios;
  const evaluacionDesempeno = raw.evaluacionDesempeno;
  const garantiaPostEjecucion = raw.garantiaPostEjecucion;
  const lugarTribunal = raw.lugarTribunal;

  if (
    typeof fechaInicioVigencia !== "string" ||
    typeof fechaFinVigencia !== "string" ||
    montoContratoBs == null ||
    plazoEjecucionDias == null ||
    typeof plazoGarantiaCalidadFuncionamiento !== "string" ||
    typeof nombreSupervisor !== "string" ||
    typeof cedulaSupervisor !== "string" ||
    typeof cargoSupervisor !== "string" ||
    typeof criterioAceptacionContrato !== "string" ||
    plazoConsignacionFacturas == null ||
    montoFielCumplimientoBs == null ||
    typeof requiereGarantiaLaboral !== "boolean" ||
    porcentajeGarantiaLaboral == null ||
    montoGarantiaLaboralBs == null ||
    typeof polizaResponsabilidadCivil !== "boolean" ||
    porcentajeResponsabilidadCivil == null ||
    montoResponsabilidadCivilBs == null ||
    typeof anticipoContrato !== "boolean" ||
    typeof formaCumplimientoCrs !== "string" ||
    typeof unidadRespCumplimientoCrs !== "string" ||
    porcentajeMultaDiaria == null ||
    baseCalculoMultaDiaria == null ||
    typeof plazoRegularizarIncumplimiento !== "string" ||
    porcentajeProcedimientoRescision == null ||
    typeof formulaAjustePrecios !== "string" ||
    typeof evaluacionDesempeno !== "string" ||
    typeof garantiaPostEjecucion !== "string" ||
    typeof lugarTribunal !== "string"
  ) {
    return null;
  }

  return {
    fechaInicioVigencia,
    fechaFinVigencia,
    montoContratoBs,
    plazoEjecucionDias,
    plazoGarantiaCalidadFuncionamiento,
    nombreSupervisor,
    cedulaSupervisor,
    cargoSupervisor,
    criterioAceptacionContrato,
    plazoConsignacionFacturas,
    montoFielCumplimientoBs,
    requiereGarantiaLaboral,
    porcentajeGarantiaLaboral,
    montoGarantiaLaboralBs,
    polizaResponsabilidadCivil,
    porcentajeResponsabilidadCivil,
    montoResponsabilidadCivilBs,
    anticipoContrato,
    formaCumplimientoCrs,
    unidadRespCumplimientoCrs,
    porcentajeMultaDiaria,
    baseCalculoMultaDiaria,
    plazoRegularizarIncumplimiento,
    porcentajeProcedimientoRescision,
    formulaAjustePrecios,
    evaluacionDesempeno,
    garantiaPostEjecucion,
    lugarTribunal,
    id: typeof raw.id === "string" ? raw.id : undefined,
    expedienteId: typeof raw.expedienteId === "string" ? raw.expedienteId : undefined,
  };
}

export function toContratoFormalizadoPayload(
  values: ContratoFormValues
): ContratoFormalizadoPayload {
  const montoContratoBs = requireNumber(
    parseDecimalInputToNumber(values.montoContratacionConIva),
    "Monto del contrato"
  );
  const plazoEjecucionDias = requireNumber(
    parseDecimalInputToNumber(values.plazoEjecucionDiasAuAu),
    "Plazo de ejecución"
  );
  const plazoConsignacionFacturas = requireNumber(
    parseDecimalInputToNumber(values.plazoConsignarFacturasDias),
    "Plazo para consignar facturas"
  );
  const montoFielCumplimientoBs = requireNumber(
    parseDecimalInputToNumber(values.montoFielCumplimientoBsAuAu),
    "Monto de fiel cumplimiento"
  );
  const porcentajeGarantiaLaboral = requireNumber(
    parseDecimalInputToNumber(values.porcentajeGarantiaLaboralAuAu),
    "Porcentaje de garantía laboral"
  );
  const montoGarantiaLaboralBs = requireNumber(
    parseDecimalInputToNumber(values.montoGarantiaLaboralBsAuAu),
    "Monto de garantía laboral"
  );
  const porcentajeResponsabilidadCivil = requireNumber(
    parseDecimalInputToNumber(values.porcentajeResponsabilidadCivilAuAu),
    "Porcentaje de responsabilidad civil"
  );
  const montoResponsabilidadCivilBs = requireNumber(
    parseDecimalInputToNumber(values.montoResponsabilidadCivilBsAuAu),
    "Monto de responsabilidad civil"
  );
  const porcentajeMultaDiaria = requireNumber(
    parseDecimalInputToNumber(values.porcentajeMultaDiaria),
    "Porcentaje de multa diaria"
  );
  const baseCalculoMultaDiaria = requireNumber(
    parseDecimalInputToNumber(values.baseCalculoMulta),
    "Base de cálculo de multa"
  );
  const plazoRegularizacion = parseDecimalInputToNumber(values.plazoRegularizacionDias);
  const porcentajeProcedimientoRescision = requireNumber(
    parseDecimalInputToNumber(values.porcentajeRescision),
    "Porcentaje de rescisión"
  );

  return {
    fechaInicioVigencia: values.fechaInicioVigencia.trim(),
    fechaFinVigencia: values.fechaFinVigencia.trim(),
    montoContratoBs,
    plazoEjecucionDias: Math.trunc(plazoEjecucionDias),
    plazoGarantiaCalidadFuncionamiento: values.plazoGarantiaCalidad.trim(),
    nombreSupervisor: values.nombreSupervisor.trim(),
    cedulaSupervisor: values.cedulaSupervisor.trim(),
    cargoSupervisor: values.cargoSupervisor.trim(),
    criterioAceptacionContrato: values.criterioAceptacionContratoAuAu.trim(),
    plazoConsignacionFacturas: Math.trunc(plazoConsignacionFacturas),
    montoFielCumplimientoBs,
    requiereGarantiaLaboral: requireSiNo(values.requiereGarantiaLaboralAuAu, "Garantía laboral"),
    porcentajeGarantiaLaboral,
    montoGarantiaLaboralBs,
    polizaResponsabilidadCivil: requireSiNo(
      values.polizaResponsabilidadCivilAuAu,
      "Póliza de responsabilidad civil"
    ),
    porcentajeResponsabilidadCivil,
    montoResponsabilidadCivilBs,
    anticipoContrato: requireSiNo(values.anticipoContratoAuAu, "Anticipo del contrato"),
    formaCumplimientoCrs: values.formaCumplimientoCrsAuAu.trim(),
    unidadRespCumplimientoCrs: values.unidadRespCumplimientoCrsAuAu.trim(),
    porcentajeMultaDiaria,
    baseCalculoMultaDiaria,
    plazoRegularizarIncumplimiento: Number.isFinite(plazoRegularizacion)
      ? String(Math.trunc(plazoRegularizacion))
      : values.plazoRegularizacionDias.trim(),
    porcentajeProcedimientoRescision,
    formulaAjustePrecios: values.formulaPolinomica.trim(),
    evaluacionDesempeno: values.criteriosEvaluacionDesempeno.trim(),
    garantiaPostEjecucion: values.garantiaPostEjecucionAuAu.trim(),
    lugarTribunal: values.fueroExclusivoCiudad.trim(),
  };
}

export function toContratoFormValues(data: ContratoFormalizadoResponse): ContratoFormValues {
  return {
    fechaInicioVigencia: data.fechaInicioVigencia,
    fechaFinVigencia: data.fechaFinVigencia,
    montoContratacionConIva: formatNumberToDecimalInput(data.montoContratoBs),
    plazoEjecucionDiasAuAu: formatNumberToDecimalInput(data.plazoEjecucionDias),
    plazoGarantiaCalidad: data.plazoGarantiaCalidadFuncionamiento,
    nombreSupervisor: data.nombreSupervisor,
    cedulaSupervisor: data.cedulaSupervisor,
    cargoSupervisor: data.cargoSupervisor,
    criterioAceptacionContratoAuAu: data.criterioAceptacionContrato,
    plazoConsignarFacturasDias: formatNumberToDecimalInput(data.plazoConsignacionFacturas),
    montoFielCumplimientoBsAuAu: formatNumberToDecimalInput(data.montoFielCumplimientoBs),
    requiereGarantiaLaboralAuAu: booleanToSiNo(data.requiereGarantiaLaboral),
    porcentajeGarantiaLaboralAuAu: formatNumberToDecimalInput(data.porcentajeGarantiaLaboral),
    montoGarantiaLaboralBsAuAu: formatNumberToDecimalInput(data.montoGarantiaLaboralBs),
    polizaResponsabilidadCivilAuAu: booleanToSiNo(data.polizaResponsabilidadCivil),
    porcentajeResponsabilidadCivilAuAu: formatNumberToDecimalInput(
      data.porcentajeResponsabilidadCivil
    ),
    montoResponsabilidadCivilBsAuAu: formatNumberToDecimalInput(data.montoResponsabilidadCivilBs),
    anticipoContratoAuAu: booleanToSiNo(data.anticipoContrato),
    formaCumplimientoCrsAuAu: data.formaCumplimientoCrs,
    unidadRespCumplimientoCrsAuAu: data.unidadRespCumplimientoCrs,
    porcentajeMultaDiaria: formatNumberToDecimalInput(data.porcentajeMultaDiaria),
    baseCalculoMulta: formatNumberToDecimalInput(data.baseCalculoMultaDiaria),
    plazoRegularizacionDias: data.plazoRegularizarIncumplimiento,
    porcentajeRescision: formatNumberToDecimalInput(data.porcentajeProcedimientoRescision),
    formulaPolinomica: data.formulaAjustePrecios,
    criteriosEvaluacionDesempeno: data.evaluacionDesempeno,
    garantiaPostEjecucionAuAu: data.garantiaPostEjecucion,
    fueroExclusivoCiudad: data.lugarTribunal,
  };
}

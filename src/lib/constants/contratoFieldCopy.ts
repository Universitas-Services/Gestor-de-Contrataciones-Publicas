import type { TipoContratacionBackend } from "@/lib/schemas/expedienteSchema";
import type { ContratoFormValues } from "@/lib/schemas/contratoSchema";

export const CONTRATO_WIZARD_STEPS = [
  {
    id: 1,
    key: "A" as const,
    label: "Tiempos y montos",
    title: "Sección A: Tiempos de ejecución y montos",
    subtitle: "Defina el periodo de vigencia del contrato",
  },
  {
    id: 2,
    key: "B" as const,
    label: "Supervisión y pago",
    title: "Sección B: Supervisión, aceptación y pago",
    subtitle: "Supervisión, aceptación y pago de contrato.",
  },
  {
    id: 3,
    key: "C" as const,
    label: "Finanzas y RS",
    title: "Sección C: Finanzas contractuales y compromiso social",
    subtitle: "Active las garantías opcionales según corresponda al procedimiento",
  },
  {
    id: 4,
    key: "D" as const,
    label: "Penalidades y cierre",
    title: "Sección D: Penalidades, ajustes y cierre legal",
    subtitle: "Active las garantías opcionales según corresponda al procedimiento",
  },
] as const;

export const CONTRATO_FIELDS_BY_STEP: Record<number, string[]> = {
  1: [
    "fechaInicioVigencia",
    "fechaFinVigencia",
    "montoContratacionConIva",
    "plazoEjecucionDiasAuAu",
    "plazoGarantiaCalidad",
  ],
  2: [
    "nombreSupervisor",
    "cedulaSupervisor",
    "cargoSupervisor",
    "criterioAceptacionContratoAuAu",
    "plazoConsignarFacturasDias",
  ],
  3: [
    "montoFielCumplimientoBsAuAu",
    "requiereGarantiaLaboralAuAu",
    "porcentajeGarantiaLaboralAuAu",
    "montoGarantiaLaboralBsAuAu",
    "polizaResponsabilidadCivilAuAu",
    "porcentajeResponsabilidadCivilAuAu",
    "montoResponsabilidadCivilBsAuAu",
    "anticipoContratoAuAu",
    "formaCumplimientoCrsAuAu",
    "unidadRespCumplimientoCrsAuAu",
  ],
  4: [
    "porcentajeMultaDiaria",
    "baseCalculoMulta",
    "plazoRegularizacionDias",
    "porcentajeRescision",
    "formulaPolinomica",
    "criteriosEvaluacionDesempeno",
    "garantiaPostEjecucionAuAu",
    "fueroExclusivoCiudad",
  ],
};

export function getContratoFieldsForStep(step: number): (keyof ContratoFormValues)[] {
  return (CONTRATO_FIELDS_BY_STEP[step] as (keyof ContratoFormValues)[] | undefined) ?? [];
}

export function getPlazoEjecucionCopy(tipo: TipoContratacionBackend) {
  const map = {
    BIENES: {
      label:
        "Indique días hábiles para la entrega de bienes de acuerdo a lo indicado en la oferta presentada.",
      legal: "Artículos 118.1, 127 LCP; 5 NORMAS DE CONTROL INTERNO SUNAI.",
    },
    SERVICIOS: {
      label:
        "Indique días hábiles para la prestación de servicios de acuerdo a lo indicado en la oferta presentada.",
      legal: "Artículos 118.1, 127 LCP; 5 NORMAS DE CONTROL INTERNO SUNAI.",
    },
    OBRAS: {
      label:
        "Indique días hábiles para la ejecución de obras de acuerdo a lo indicado en la oferta presentada.",
      legal: "Artículos 118.1, 127 LCP; 5 NORMAS DE CONTROL INTERNO SUNAI.",
    },
  } as const;
  return map[tipo];
}

export function getCriterioAceptacionCopy(tipo: TipoContratacionBackend) {
  const map = {
    BIENES: {
      label:
        "Describa los criterios de aceptación y los procedimientos de verificación para autorizar los pagos en cada entrega de Bienes.",
      legal:
        "Artículos 141, 166.7 LCP; 17, 18, 22, 65 LCC; 38.5, 91.1.9.29 LOCGR; 36 NORMAS DE CONTROL INTERNO SUNAI",
    },
    SERVICIOS: {
      label:
        "Describa los criterios de aceptación y los procedimientos de verificación para autorizar los pagos del Servicio contratado.",
      legal:
        "Artículos 141, 166.7 LCP; 17, 18, 22, 65 LCC; 38.5, 91.1.9.29 LOCGR; 36 NORMAS DE CONTROL INTERNO SUNAI",
    },
    OBRAS: {
      label:
        "Describa los criterios de aceptación y los procedimientos de verificación para autorizar los pagos de la ejecución de la Obra.",
      legal:
        "Artículos 141, 166.7 LCP; 17, 18, 22, 65 LCC; 38.5, 91.1.9.29 LOCGR; 36 NORMAS DE CONTROL INTERNO SUNAI",
    },
  } as const;
  return map[tipo];
}

export function getGarantiaPostEjecucionCopy(tipo: TipoContratacionBackend) {
  const map = {
    BIENES: {
      label:
        "Indique plazo de garantía para reclamar defectos post-entrega del Bien el cual será de (número) días continuos contados desde la recepción formal por el ente contratante.",
      legal: "Artículos 116.3 LCP, 127 RLCP; 19 NORMAS DE CONTROL INTERNO SUNAI.",
    },
    SERVICIOS: {
      label:
        "Indique plazo de garantía para reclamar defectos post-entrega en la prestación del servicio el cual será de (número) días continuos contados desde la recepción formal por el ente contratante.",
      legal: "Artículos 116.3 LCP, 127 RLCP; 19 NORMAS DE CONTROL INTERNO SUNAI.",
    },
    OBRAS: {
      label:
        "Indique plazo de garantía para reclamar defectos post-entrega en la ejecución de la obra el cual será de (número) días continuos contados desde la recepción formal por el ente contratante.",
      legal: "Artículos 116.3 LCP, 127 RLCP; 19 NORMAS DE CONTROL INTERNO SUNAI.",
    },
  } as const;
  return map[tipo];
}

import type { LlamadoPublicoFormInputValues } from "@/lib/schemas/llamadoPublicoSchema";

export const LLAMADO_PUBLICO_WIZARD_TITLE = "Configuración del llamado Público";

export const LLAMADO_PUBLICO_WIZARD_SUBTITLE =
  "Defina los detalles logísticos para la disponibilidad y adquisición del Pliego de Condiciones.";

export const LLAMADO_PUBLICO_DRAFT_LABEL = "Guardar borrador";
export const LLAMADO_PUBLICO_SUBMIT_LABEL = "Configurar el llamado";
export const LLAMADO_PUBLICO_SUBMIT_DISABLED_TOOLTIP =
  "Faltan campos por llenar. Completa el formulario para habilitar esta acción.";

export const LLAMADO_PUBLICO_SUCCESS_TITLE = "¡Información cargada!";
export const LLAMADO_PUBLICO_SUCCESS_DESCRIPTION =
  "Los datos logísticos del llamado han sido registrados exitosamente";

export const LLAMADO_PUBLICO_SECTIONS = {
  A: {
    badge: "A",
    title: "Objetivos del procedimiento",
    description:
      "Describa tres objetivos específicos relacionados con el objeto del procedimiento de contratación.",
    legal: "Artículos 80.6 LCP; 107.1 RLCP; 3 NORMAS DE CONTROL INTERNO SUNAI.",
  },
  B: {
    badge: "B",
    title: "Disponibilidad del pliego",
    description: "",
    legal: "",
  },
  C: {
    badge: "C",
    title: "Logística del acto",
    description: "",
    legal: "",
  },
} as const;

export const LLAMADO_PUBLICO_FIELD_COPY = {
  objetivosEspecificosLlamado1AuAu: {
    label: "Objetivo 1",
    placeholder: "Objetivo 1",
  },
  objetivosEspecificosLlamado2AuAu: {
    label: "Objetivo 2",
    placeholder: "Objetivo 2",
  },
  objetivosEspecificosLlamado3AuAu: {
    label: "Objetivo 3",
    placeholder: "Objetivo 3",
  },
  direccionRetiroPliegoAuAu: {
    label:
      "Indique la dirección exacta de la dependencia donde estará disponible el pliego de condiciones (si es física).",
    description: "Artículos 80.3 LCP; 7 NORMAS DE CONTROL INTERNO SUNAI.",
  },
  horarioRetiroPliegoAuAu: {
    label: "Indique el horario de atención para la disponibilidad del pliego.",
    description: "Artículos 80.3 LCP; 7 NORMAS DE CONTROL INTERNO SUNAI.",
    placeholder: "Ejemplo: 08:00am a 12:00m y 01:00pm a 04:00pm",
  },
  pliegoCostoAuAu: {
    label: "¿El pliego de condiciones tendrá un costo?",
    description: "Artículo 80.3.6 LCP; 3 NORMAS DE CONTROL INTERNO SUNAI.",
  },
  pagoPliego: {
    title: "Indique los datos para el pago del pliego.",
    description: "Artículos 80.3.6 LCP; 3 NORMAS DE CONTROL INTERNO SUNAI.",
  },
  costoPliegoBsAuAu: {
    label: "Indique el costo en bolívares (Bs) del pliego de condiciones.",
    description: "Ejemplo: 2.000,00",
    placeholder: "2.000,00",
  },
  bancoPagoPliegoAuAu: {
    label: "Indique el nombre del Banco para el pago del pliego.",
    description: "Ejemplo: Banco de Venezuela",
  },
  rifPagoPliegoAuAu: {
    label: "Indique el RIF para el pago del pliego.",
    description: "Ejemplo: J-12345678-9",
  },
  cuentaPagoPliegoAuAu: {
    label: "Indique el número de la cuenta para el pago del pliego.",
    description: "Ejemplo: 0102-0123-45-1234567890",
  },
  titularPagoPliegoAuAu: {
    label: "Indique el nombre del Titular de la cuenta para el pago del pliego.",
    description: "Ejemplo: Gobernación del Estado Lara",
  },
  horaActoRecepAperAuAu: {
    label:
      "Indique la hora del acto de recepción y apertura de las manifestaciones de voluntad de participar, documentos de calificación y ofertas.",
    description: "Artículos 78.1, 80.4 LCP; 96 RLCP; 3 NORMAS DE CONTROL INTERNO SUNAI.",
    placeholder: "Ejemplo: 10:00am",
  },
} as const;

export function getLlamadoPublicoFormStorageKey(expedienteId: string): string {
  return `llamado-publico-form:${expedienteId}`;
}

export function createLlamadoPublicoDefaultValues(
  direccionEnteDefault = ""
): LlamadoPublicoFormInputValues {
  return {
    objetivosEspecificosLlamado1AuAu: "",
    objetivosEspecificosLlamado2AuAu: "",
    objetivosEspecificosLlamado3AuAu: "",
    direccionRetiroPliegoAuAu: direccionEnteDefault,
    horarioRetiroPliegoAuAu: "",
    pliegoCostoAuAu: undefined,
    costoPliegoBsAuAu: "",
    bancoPagoPliegoAuAu: "",
    rifPagoPliegoAuAu: "",
    cuentaPagoPliegoAuAu: "",
    titularPagoPliegoAuAu: "",
    horaActoRecepAperAuAu: "",
  };
}

export type LlamadoPublicoFormStatus = "draft" | "completed";

export interface LlamadoPublicoStoredForm {
  values: LlamadoPublicoFormInputValues;
  status: LlamadoPublicoFormStatus;
}

import * as z from "zod";

const siNoField = z
  .union([z.enum(["SI", "NO"]), z.null()])
  .refine((val) => val === "SI" || val === "NO", { message: "Seleccione SI o NO" });

const numericField = (label: string) =>
  z
    .string()
    .min(1, { message: `${label} es requerido` })
    .regex(/^[\d.,]+$/, { message: "Solo se permiten valores numéricos" });

const textField = (label: string, max: number) =>
  z
    .string()
    .min(1, { message: `${label} es requerido` })
    .max(max, { message: `Máximo ${max} caracteres` });

const dateField = (label: string) => z.string().min(1, { message: `${label} es requerida` });

function parsePercentValue(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  if (!normalized) return null;
  const n = Number.parseFloat(normalized);
  return Number.isFinite(n) ? n : null;
}

const percentField = (label: string) =>
  z
    .string()
    .min(1, { message: `${label} es requerido` })
    .regex(/^[\d.,]+$/, { message: "Solo se permiten valores numéricos" })
    .refine(
      (val) => {
        const pct = parsePercentValue(val);
        return pct !== null && pct >= 0 && pct <= 100;
      },
      { message: "Debe ser un porcentaje entre 0 y 100" }
    );

export const contratoFormSchema = z.object({
  fechaInicioVigencia: dateField("La fecha de inicio"),
  fechaFinVigencia: dateField("La fecha de finalización"),
  montoContratacionConIva: numericField("El monto de contratación"),
  plazoEjecucionDiasAuAu: numericField("El plazo de ejecución"),
  plazoGarantiaCalidad: dateField("El plazo de garantía"),

  nombreSupervisor: textField("El nombre del supervisor", 200),
  cedulaSupervisor: z
    .string()
    .min(1, { message: "La cédula del supervisor es requerida" })
    .regex(
      /^[EV]-[0-9]{1,8}$|^[EV][0-9]{1,8}$/,
      "Debe comenzar con E o V seguido de máximo 8 números"
    ),
  cargoSupervisor: textField("El cargo del supervisor", 150),
  criterioAceptacionContratoAuAu: textField("Los criterios de aceptación", 500),
  plazoConsignarFacturasDias: numericField("El plazo para consignar facturas"),

  montoFielCumplimientoBsAuAu: numericField("El monto de la garantía de fiel cumplimiento"),
  requiereGarantiaLaboralAuAu: siNoField,
  porcentajeGarantiaLaboralAuAu: percentField("El porcentaje de garantía laboral"),
  montoGarantiaLaboralBsAuAu: numericField("El monto de garantía laboral"),
  polizaResponsabilidadCivilAuAu: siNoField,
  porcentajeResponsabilidadCivilAuAu: percentField("El porcentaje de la póliza"),
  montoResponsabilidadCivilBsAuAu: numericField("El monto de la póliza"),
  anticipoContratoAuAu: siNoField,
  formaCumplimientoCrsAuAu: textField("La forma de cumplimiento del CRS", 500),
  unidadRespCumplimientoCrsAuAu: textField("La unidad responsable del CRS", 300),

  porcentajeMultaDiaria: numericField("El porcentaje de multa diaria"),
  baseCalculoMulta: textField("La base de cálculo", 300),
  plazoRegularizacionDias: numericField("El plazo de regularización"),
  porcentajeRescision: numericField("El porcentaje de rescisión"),
  formulaPolinomica: textField("La fórmula polinómica", 500),
  criteriosEvaluacionDesempeno: textField("Los criterios de evaluación", 1000),
  garantiaPostEjecucionAuAu: textField("La garantía post-ejecución", 500),
  fueroExclusivoCiudad: textField("El fuero exclusivo", 150),
});

/** Valores del formulario (incluye SÍ/NO sin seleccionar como "") */
export type ContratoFormValues = z.input<typeof contratoFormSchema>;

export const contratoFormDefaultValues: ContratoFormValues = {
  fechaInicioVigencia: "",
  fechaFinVigencia: "",
  montoContratacionConIva: "",
  plazoEjecucionDiasAuAu: "",
  plazoGarantiaCalidad: "",
  nombreSupervisor: "",
  cedulaSupervisor: "",
  cargoSupervisor: "",
  criterioAceptacionContratoAuAu: "",
  plazoConsignarFacturasDias: "",
  montoFielCumplimientoBsAuAu: "",
  requiereGarantiaLaboralAuAu: null,
  porcentajeGarantiaLaboralAuAu: "",
  montoGarantiaLaboralBsAuAu: "",
  polizaResponsabilidadCivilAuAu: null,
  porcentajeResponsabilidadCivilAuAu: "",
  montoResponsabilidadCivilBsAuAu: "",
  anticipoContratoAuAu: null,
  formaCumplimientoCrsAuAu: "",
  unidadRespCumplimientoCrsAuAu: "",
  porcentajeMultaDiaria: "",
  baseCalculoMulta: "",
  plazoRegularizacionDias: "",
  porcentajeRescision: "",
  formulaPolinomica: "",
  criteriosEvaluacionDesempeno: "",
  garantiaPostEjecucionAuAu: "",
  fueroExclusivoCiudad: "",
};

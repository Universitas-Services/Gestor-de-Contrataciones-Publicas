import { z } from "zod";

const MAX_TEXT_100 = 100;
const MAX_TEXT_255 = 255;
const MAX_TEXT_500 = 500;
const MAX_TEXT_1000 = 1000;

function parseDecimalString(value: string) {
  const normalized = value.trim().replace(/\./g, "").replace(",", ".");
  return Number(normalized);
}

function requiredText(message: string, maxLength = MAX_TEXT_255) {
  return z
    .string({ message })
    .trim()
    .min(1, message)
    .max(maxLength, `Maximo ${maxLength} caracteres`);
}

function requiredInteger(message: string) {
  return z
    .string({ message })
    .trim()
    .min(1, message)
    .refine((value) => /^\d+$/.test(value), "Debe ingresar un numero entero")
    .refine((value) => Number(value) > 0, "Debe ser mayor a cero")
    .transform((value) => Number(value));
}

function requiredDecimal(message: string) {
  return z
    .string({ message })
    .trim()
    .min(1, message)
    .refine((value) => !Number.isNaN(parseDecimalString(value)), "Debe ingresar un numero valido")
    .refine((value) => parseDecimalString(value) > 0, "Debe ser mayor a cero")
    .transform((value) => parseDecimalString(value));
}

const optionalText = (maxLength: number) =>
  z
    .string()
    .max(maxLength, `Maximo ${maxLength} caracteres`)
    .transform((value) => {
      const trimmed = value.trim();
      return trimmed === "" ? undefined : trimmed;
    });

const optionalDecimal = z
  .string()
  .transform((value) => value.trim())
  .refine((value) => value === "" || !Number.isNaN(parseDecimalString(value)), {
    message: "Debe ingresar un numero valido",
  })
  .refine((value) => value === "" || parseDecimalString(value) > 0, {
    message: "Debe ser mayor a cero",
  })
  .transform((value) => (value === "" ? undefined : parseDecimalString(value)));

const optionalBankAccount = z
  .string()
  .transform((value) => value.trim())
  .refine((value) => value === "" || /^\d{4}-\d{4}-\d{2}-\d{10}$/.test(value), {
    message: "Debe ingresar una cuenta bancaria valida",
  })
  .transform((value) => (value === "" ? undefined : value));

export const productoItemSchema = z.object({
  descripcionItem: requiredText("La descripcion del item es requerida"),
  codigoPartida: requiredText("La partida presupuestaria es requerida", 50),
  unidadMedida: requiredText("La unidad de medida es requerida", 50),
  cantidadRequerida: requiredDecimal("La cantidad es requerida"),
  precioUnitarioEstimado: requiredDecimal("El precio unitario es requerido"),
});

export type ProductoItemFormInputValues = z.input<typeof productoItemSchema>;
export type ProductoItemFormValues = z.output<typeof productoItemSchema>;

export const fase1FormSchema = z
  .object({
    datosActoAutorizacionInicio: requiredText("Los datos del acto administrativo son requeridos"),
    fechaActaInicio: requiredText("La fecha del acta de inicio es requerida", 50),
    detallesTecnicosCalidad: requiredText(
      "Las caracteristicas tecnicas son requeridas",
      MAX_TEXT_1000
    ),
    alcanceCantidadesObra: requiredText("Las cantidades o alcance son requeridos", MAX_TEXT_1000),
    justificacionVentajas: requiredText("La justificacion de ventajas es requerida", MAX_TEXT_500),
    origenCrsRegistro: z.boolean().optional(),
    diasValidezOferta: requiredInteger("Los dias de validez de la oferta son requeridos"),
    autoridadAclaratorias: requiredText("La autoridad encargada de aclaratorias es requerida"),
    normativaLegal: z
      .array(
        z
          .string()
          .trim()
          .min(1, "La normativa no puede estar vacia")
          .max(MAX_TEXT_500, `Maximo ${MAX_TEXT_500} caracteres`)
      )
      .default([]),
    diasVigenciaGarantiaExtension: requiredInteger(
      "Los dias de vigencia de la garantia son requeridos"
    ),
    objetivosEspecificos1: requiredText("El objetivo especifico 1 es requerido"),
    objetivosEspecificos2: requiredText("El objetivo especifico 2 es requerido"),
    objetivosEspecificos3: requiredText("El objetivo especifico 3 es requerido"),
    direccionRetiroPliego: requiredText("La direccion de retiro del pliego es requerida"),
    horarioRetiroPliego: requiredText("El horario de retiro del pliego es requerido"),
    pliegoGratuito: z.boolean().optional(),
    costoPliegoBs: optionalDecimal,
    bancoPagoPliego: optionalText(MAX_TEXT_100),
    cuentaPagoPliego: optionalBankAccount,
    titularPagoPliego: optionalText(MAX_TEXT_100),
    horaActoRecepAper: requiredText("La hora del acto de recepcion y apertura es requerida", 50),
    condicionPlurianual: z.boolean().optional(),
    viabilidadContratoMarco: z.boolean().optional(),
    justificacionContratoMarco: optionalText(MAX_TEXT_100),
  })
  .superRefine((data, ctx) => {
    if (data.origenCrsRegistro === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["origenCrsRegistro"],
        message:
          "Debe indicar si el proyecto de responsabilidad social tiene origen en el registro",
      });
    }

    if (data.pliegoGratuito === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["pliegoGratuito"],
        message: "Debe indicar si el pliego de condiciones tendra costo",
      });
    }

    if (data.pliegoGratuito === false) {
      if (data.costoPliegoBs == null) {
        ctx.addIssue({
          code: "custom",
          path: ["costoPliegoBs"],
          message: "El costo del pliego es requerido",
        });
      }

      if (!data.bancoPagoPliego) {
        ctx.addIssue({
          code: "custom",
          path: ["bancoPagoPliego"],
          message: "El banco para el pago del pliego es requerido",
        });
      }

      if (!data.cuentaPagoPliego) {
        ctx.addIssue({
          code: "custom",
          path: ["cuentaPagoPliego"],
          message: "La cuenta para el pago del pliego es requerida",
        });
      }

      if (!data.titularPagoPliego) {
        ctx.addIssue({
          code: "custom",
          path: ["titularPagoPliego"],
          message: "El titular de la cuenta es requerido",
        });
      }
    }

    if (data.condicionPlurianual === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["condicionPlurianual"],
        message: "Debe indicar si la contratacion es de ejecucion plurianual",
      });
    }

    if (data.viabilidadContratoMarco === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["viabilidadContratoMarco"],
        message: "Debe indicar si se opto por agrupar esta contratacion o usar un contrato marco",
      });
    }

    if (data.viabilidadContratoMarco === true && !data.justificacionContratoMarco) {
      ctx.addIssue({
        code: "custom",
        path: ["justificacionContratoMarco"],
        message: "La evaluacion sobre el contrato marco es requerida",
      });
    }
  });

export type Fase1FormInputValues = z.input<typeof fase1FormSchema>;
export type Fase1PayloadFormValues = z.output<typeof fase1FormSchema>;

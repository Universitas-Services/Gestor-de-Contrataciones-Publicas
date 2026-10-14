import { z } from "zod";

const MAX_TEXT_100 = 100;
const MAX_TEXT_255 = 255;

function parseDecimalString(value: string) {
  const normalized = value.trim().replace(/\./g, "").replace(",", ".");
  return Number(normalized);
}

function requiredText(message: string, maxLength = MAX_TEXT_255) {
  return z
    .string({ message })
    .trim()
    .min(1, message)
    .max(maxLength, `Máximo ${maxLength} caracteres`);
}

function optionalText(maxLength: number) {
  return z
    .string()
    .max(maxLength, `Máximo ${maxLength} caracteres`)
    .transform((value) => value.trim());
}

function optionalDecimal() {
  return z
    .string()
    .transform((value) => value.trim())
    .refine((value) => value === "" || !Number.isNaN(parseDecimalString(value)), {
      message: "Debe ingresar un número válido",
    })
    .refine((value) => value === "" || parseDecimalString(value) > 0, {
      message: "Debe ser mayor a cero",
    });
}

function optionalBankAccount() {
  return z
    .string()
    .transform((value) => value.trim())
    .refine((value) => value === "" || /^\d{4}-\d{4}-\d{2}-\d{10}$/.test(value), {
      message: "Debe ingresar una cuenta bancaria válida",
    });
}

function requiredBoolean(message: string) {
  return z
    .boolean()
    .optional()
    .refine((value) => value === true || value === false, { message });
}

function optionalRifJg() {
  return z.string().transform((value) => value.trim().toUpperCase());
}

export const llamadoPublicoFormSchema = z
  .object({
    objetivosEspecificosLlamado1AuAu: requiredText("El objetivo 1 es requerido"),
    objetivosEspecificosLlamado2AuAu: requiredText("El objetivo 2 es requerido"),
    objetivosEspecificosLlamado3AuAu: requiredText("El objetivo 3 es requerido"),
    direccionRetiroPliegoAuAu: requiredText("La dirección de retiro del pliego es requerida"),
    horarioRetiroPliegoAuAu: requiredText("El horario de retiro del pliego es requerido"),
    pliegoCostoAuAu: requiredBoolean("Debe indicar si el pliego de condiciones tendrá un costo"),
    costoPliegoBsAuAu: optionalDecimal(),
    bancoPagoPliegoAuAu: optionalText(MAX_TEXT_100),
    rifPagoPliegoAuAu: optionalRifJg(),
    cuentaPagoPliegoAuAu: optionalBankAccount(),
    titularPagoPliegoAuAu: optionalText(MAX_TEXT_100),
    horaActoRecepAperAuAu: requiredText(
      "La hora del acto de recepción y apertura es requerida",
      50
    ),
  })
  .superRefine((data, ctx) => {
    if (data.pliegoCostoAuAu !== true) return;

    if (!data.costoPliegoBsAuAu) {
      ctx.addIssue({
        code: "custom",
        path: ["costoPliegoBsAuAu"],
        message: "El costo del pliego es requerido",
      });
    }

    if (!data.bancoPagoPliegoAuAu) {
      ctx.addIssue({
        code: "custom",
        path: ["bancoPagoPliegoAuAu"],
        message: "El banco para el pago del pliego es requerido",
      });
    }

    if (!data.rifPagoPliegoAuAu || !/^[JG]-\d{8}-\d$/.test(data.rifPagoPliegoAuAu)) {
      ctx.addIssue({
        code: "custom",
        path: ["rifPagoPliegoAuAu"],
        message: "El RIF debe tener formato J-00000000-0 o G-00000000-0",
      });
    }

    if (!data.cuentaPagoPliegoAuAu) {
      ctx.addIssue({
        code: "custom",
        path: ["cuentaPagoPliegoAuAu"],
        message: "La cuenta para el pago del pliego es requerida",
      });
    }

    if (!data.titularPagoPliegoAuAu) {
      ctx.addIssue({
        code: "custom",
        path: ["titularPagoPliegoAuAu"],
        message: "El titular de la cuenta es requerido",
      });
    }
  });

export type LlamadoPublicoFormValues = z.infer<typeof llamadoPublicoFormSchema>;

export type LlamadoPublicoFormInputValues = {
  objetivosEspecificosLlamado1AuAu: string;
  objetivosEspecificosLlamado2AuAu: string;
  objetivosEspecificosLlamado3AuAu: string;
  direccionRetiroPliegoAuAu: string;
  horarioRetiroPliegoAuAu: string;
  pliegoCostoAuAu: boolean | undefined;
  costoPliegoBsAuAu: string;
  bancoPagoPliegoAuAu: string;
  rifPagoPliegoAuAu: string;
  cuentaPagoPliegoAuAu: string;
  titularPagoPliegoAuAu: string;
  horaActoRecepAperAuAu: string;
};

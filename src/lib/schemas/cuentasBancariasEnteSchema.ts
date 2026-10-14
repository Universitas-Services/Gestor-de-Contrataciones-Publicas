import { z } from "zod";

import {
  BANCO_PAGO_PLIEGO_MAX,
  TITULAR_PAGO_PLIEGO_MAX,
} from "@/lib/constants/cuentasBancariasEnte";

const requiredText = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, { message: `${label} es requerido.` })
    .max(max, { message: `${label} no puede superar ${max} caracteres.` });

/** RIF J|G-########-# */
const rifPagoPliegoSchema = z
  .string()
  .trim()
  .regex(/^[JG]-\d{8}-\d$/, {
    message: "Indique un RIF válido (J|G-########-#).",
  });

/** Misma regla que Llamado Público / Fase 1: ####-####-##-########## (20 dígitos). */
const requiredBankAccount = z
  .string()
  .trim()
  .min(1, { message: "El número de cuenta es requerido." })
  .refine((value) => /^\d{4}-\d{4}-\d{2}-\d{10}$/.test(value), {
    message: "Debe ingresar una cuenta bancaria válida",
  });

export const cuentaBancariaEnteFormSchema = z.object({
  bancoPagoPliego: requiredText("El nombre del banco", BANCO_PAGO_PLIEGO_MAX),
  cuentaPagoPliego: requiredBankAccount,
  titularPagoPliego: requiredText("El titular de la cuenta", TITULAR_PAGO_PLIEGO_MAX),
  rifPagoPliego: rifPagoPliegoSchema,
  tipoCuentaPagoPliego: z.enum(["corriente", "ahorro"], {
    message: "Seleccione el tipo de cuenta.",
  }),
});

export type CuentaBancariaEnteFormSchemaValues = z.infer<typeof cuentaBancariaEnteFormSchema>;

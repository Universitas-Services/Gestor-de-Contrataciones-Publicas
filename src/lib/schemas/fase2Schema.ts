import * as z from "zod";

// ─── Adquirente Schema ──────────────────────────────────────────────

export const adquirenteSchema = z.object({
  fechaAdquisicion: z.string().min(1, { message: "La fecha de adquisición es requerida" }),
  nombreEmpresa: z
    .string()
    .min(3, { message: "El nombre de la empresa debe tener al menos 3 caracteres" })
    .max(150, { message: "Máximo 150 caracteres permitidos" }),
  domicilioFiscal: z
    .string()
    .min(1, { message: "El domicilio fiscal es requerido" })
    .max(250, { message: "Máximo 250 caracteres permitidos" }),
  telefono: z
    .string()
    .min(1, { message: "El teléfono de contacto es requerido" })
    .regex(/^\d{4}-\d{7}$/, "Debe seleccionar un código y escribir 7 números"),
  correo: z
    .string()
    .min(1, { message: "El correo es requerido" })
    .email({ message: "Ingrese un correo electrónico válido" })
    .max(100, { message: "Máximo 100 caracteres permitidos" }),
  referenciaDeposito: z
    .string()
    .max(20, { message: "Máximo 20 caracteres permitidos" })
    .regex(/^[a-zA-Z0-9]*$/, "Solo caracteres alfanuméricos")
    .optional()
    .or(z.literal("")),
});

export type AdquirenteFormValues = z.infer<typeof adquirenteSchema>;

// ─── Oferente Schema ────────────────────────────────────────────────

export const oferenteSchema = z.object({
  rif: z
    .string()
    .min(1, { message: "El RIF es requerido" })
    .regex(/^[JGVEP]-\d{8}-?\d?$/, "Formato de RIF inválido (Ej: J-12345678-9)"),
  nombreEmpresa: z
    .string()
    .min(3, { message: "El nombre de la empresa debe tener al menos 3 caracteres" })
    .max(150, { message: "Máximo 150 caracteres permitidos" }),
  representanteLegal: z
    .string()
    .min(1, { message: "El nombre del representante legal es requerido" })
    .max(150, { message: "Máximo 150 caracteres permitidos" }),
  cedulaRepresentante: z
    .string()
    .min(1, { message: "La cédula del representante es requerida" })
    .regex(
      /^[EV]-[0-9]{1,8}$|^[EV][0-9]{1,8}$/,
      "Debe comenzar con E o V seguido de máximo 8 números"
    ),
  registroMercantil: z
    .string()
    .max(250, { message: "Máximo 250 caracteres permitidos" })
    .optional()
    .or(z.literal("")),
  cantidadSobres: z
    .string()
    .min(1, { message: "La cantidad de sobres es requerida" })
    .max(5, { message: "Máximo 5 caracteres permitidos" }),
  montoOferta: z
    .string()
    .min(1, { message: "El monto de la oferta es requerido" })
    .max(50, { message: "Máximo 50 caracteres permitidos" })
    .regex(/^[0-9]+(\.[0-9]+)?$/, "El monto debe ser numérico"),
});

export type OferenteFormValues = z.infer<typeof oferenteSchema>;

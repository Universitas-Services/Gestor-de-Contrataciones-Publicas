import * as z from "zod";

// ─── Adquirente Schema ──────────────────────────────────────────────

export const adquirenteSchema = z.object({
  fechaAdquisicion: z.string().min(1, { message: "La fecha de adquisición es requerida" }),
  nombreEmpresa: z
    .string()
    .min(3, { message: "El nombre de la empresa debe tener al menos 3 caracteres" }),
  domicilioFiscal: z.string().min(1, { message: "El domicilio fiscal es requerido" }),
  telefono: z.string().min(1, { message: "El teléfono de contacto es requerido" }),
  correo: z.string().email({ message: "Ingrese un correo electrónico válido" }),
  referenciaDeposito: z.string().optional(),
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
    .min(3, { message: "El nombre de la empresa debe tener al menos 3 caracteres" }),
  representanteLegal: z
    .string()
    .min(1, { message: "El nombre del representante legal es requerido" }),
  cedulaRepresentante: z.string().min(1, { message: "La cédula del representante es requerida" }),
  registroMercantil: z.string().optional(),
  cantidadSobres: z.string().min(1, { message: "La cantidad de sobres es requerida" }),
  montoOferta: z.string().min(1, { message: "El monto de la oferta es requerido" }),
});

export type OferenteFormValues = z.infer<typeof oferenteSchema>;

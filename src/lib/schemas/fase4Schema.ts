import * as z from "zod";

const montoField = (label: string) =>
  z
    .string()
    .min(1, { message: `${label} es requerido` })
    .regex(/^[\d.,]+$/, { message: "Solo se permiten valores numéricos" });

export const actaAdjudicacionSchema = z.object({
  montoContratacionConIva: montoField("El monto de contratación"),
  partidaPresupuestaria: z
    .string()
    .min(1, { message: "La partida presupuestaria es requerida" })
    .max(100, { message: "Máximo 100 caracteres permitidos" }),
  montoResponsabilidadSocial: montoField("El monto de responsabilidad social"),
  referenciaRecomendacion: z
    .string()
    .min(10, { message: "Desarrolle una referencia de al menos 10 caracteres" })
    .max(2000, { message: "Máximo 2000 caracteres permitidos" }),
});

export type ActaAdjudicacionFormValues = z.infer<typeof actaAdjudicacionSchema>;

import { z } from "zod";

const descripcionSchema = z.string().trim().min(1, "La descripción es obligatoria").max(200);

export const feriadoRecurrenteSchema = z.object({
  esRecurrente: z.literal(true),
  fechaRecurrente: z.string().regex(/^\d{2}-\d{2}$/, "Use el formato MM-DD (ej. 12-25)"),
  descripcion: descripcionSchema,
});

export const feriadoEspecificoSchema = z.object({
  esRecurrente: z.literal(false),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use el formato YYYY-MM-DD"),
  descripcion: descripcionSchema,
});

export const feriadoFormSchema = z.discriminatedUnion("esRecurrente", [
  feriadoRecurrenteSchema,
  feriadoEspecificoSchema,
]);

export type FeriadoFormValues = z.infer<typeof feriadoFormSchema>;

export const bulkFeriadosSchema = z.object({
  descripcion: z.string().trim().min(1, "La descripción es obligatoria").max(200),
  fechas: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).min(1, "Seleccione al menos un día"),
});

export type BulkFeriadosFormValues = z.infer<typeof bulkFeriadosSchema>;

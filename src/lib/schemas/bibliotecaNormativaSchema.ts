import { z } from "zod";

export const bibliotecaNormativaFormSchema = z.object({
  textoNormativaCompleto: z
    .string()
    .trim()
    .min(10, "La normativa debe tener al menos 10 caracteres.")
    .max(10000, "La normativa no puede superar 10.000 caracteres."),
});

export type BibliotecaNormativaFormValues = z.infer<typeof bibliotecaNormativaFormSchema>;

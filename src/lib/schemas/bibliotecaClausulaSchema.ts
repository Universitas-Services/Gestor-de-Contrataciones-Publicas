import { z } from "zod";

export const bibliotecaClausulaFormSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(3, "El título debe tener al menos 3 caracteres.")
    .max(200, "El título no puede superar 200 caracteres."),
  cuerpo: z
    .string()
    .trim()
    .min(10, "El cuerpo debe tener al menos 10 caracteres.")
    .max(20000, "El cuerpo no puede superar 20.000 caracteres."),
});

export type BibliotecaClausulaFormValues = z.infer<typeof bibliotecaClausulaFormSchema>;

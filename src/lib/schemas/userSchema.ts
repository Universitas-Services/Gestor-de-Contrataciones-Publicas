import { z } from "zod";

/**
 * Esquema de validación para la creación de un nuevo usuario
 */
export const userSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre es requerido")
    .max(50, "El nombre no puede exceder los 50 caracteres"),
  apellido: z
    .string()
    .min(1, "El apellido es requerido")
    .max(50, "El apellido no puede exceder los 50 caracteres"),
  email: z
    .string()
    .min(1, "El correo electrónico es requerido")
    .email("Ingrese un correo electrónico válido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "Debe incluir al menos una mayúscula")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Debe incluir al menos un carácter especial"),
  rol: z.enum(["EJECUTOR", "VISUALIZADOR"], {
    message: "Seleccione un rol válido",
  }),
});

/**
 * Tipo inferido del esquema de usuario
 */
export type UserFormValues = z.infer<typeof userSchema>;

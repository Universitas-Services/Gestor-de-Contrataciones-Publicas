import { z } from "zod";

export const strongPasswordSchema = z
  .string()
  .min(8, "La nueva contrasena debe tener al menos 8 caracteres")
  .max(25, "La nueva contrasena debe tener un maximo de 25 caracteres")
  .regex(/[A-Z]/, "Debe contener al menos una mayuscula")
  .regex(/[a-z]/, "Debe contener al menos una minuscula")
  .regex(/\d/, "Debe contener al menos un numero")
  .regex(/[\W_]/, "Debe contener al menos un caracter especial");

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "La contrasena actual es obligatoria"),
    newPassword: strongPasswordSchema,
    confirmPassword: z.string().min(1, "Debes confirmar tu nueva contrasena"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contrasenas no coinciden",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "La nueva contrasena no puede ser igual a la anterior",
    path: ["newPassword"],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

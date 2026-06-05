import { z } from "zod";

import { strongPasswordSchema } from "./changePasswordSchema";

export const changeUserPasswordSchema = z.object({
  currentPassword: z.string().min(1, "La contrasena actual del administrador es obligatoria"),
  newPassword: strongPasswordSchema,
});

export type ChangeUserPasswordFormValues = z.infer<typeof changeUserPasswordSchema>;

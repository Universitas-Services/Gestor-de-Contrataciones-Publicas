"use server";

import { getServerToken } from "@/lib/auth/session";
import type { ChangePasswordPayload } from "@/types/ente.types";

/**
 * Servicio para cambio de contraseña
 * "use server" → corre en el servidor, lee la cookie HttpOnly con el JWT
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * POST /auth/change-password
 * Permite a un usuario autenticado cambiar su contraseña proporcionando la contraseña actual y la nueva contraseña.
 */
export const cambiarContrasena = async (
  payload: ChangePasswordPayload
): Promise<{ message: string }> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/auth/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    if (response.status === 401) {
      throw new Error("No autorizado o contraseña actual incorrecta");
    }

    throw new Error(errorData?.message ?? "Error al cambiar la contraseña");
  }

  const text = await response.text();
  return { message: text || "Contraseña actualizada correctamente" };
};

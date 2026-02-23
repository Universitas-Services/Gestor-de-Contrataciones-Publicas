"use server";

import { getServerToken } from "@/lib/auth/session";
import type { LoginResponse } from "@/types/auth.types";
import type { ChangePasswordPayload } from "@/types/ente.types";

/**
 * Servicio de autenticación
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * POST /auth/login
 * Permite a un usuario iniciar sesión proporcionando email y contraseña.
 */
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    if (response.status === 401) {
      throw new Error("Credenciales inválidas o usuario inactivo");
    }

    throw new Error(errorData?.message ?? "Error al iniciar sesión");
  }

  return response.json();
};

/**
 * POST /auth/change-password
 * Usado exclusivamente por el rol Admin_Ente en el flujo de primer login.
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

"use server";

import { getServerToken } from "@/lib/auth/session";
import type { LoginResponse } from "@/types/auth.types";
import type { ChangePasswordPayload, ChangeUserPasswordPayload } from "@/types/ente.types";

/**
 * Servicio de autenticacion
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * POST /auth/login
 * Permite a un usuario iniciar sesion proporcionando email y contrasena.
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
      throw new Error("Credenciales invalidas o usuario inactivo");
    }

    throw new Error(errorData?.message ?? "Error al iniciar sesion");
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
      throw new Error("No autorizado o contrasena actual incorrecta");
    }

    throw new Error(errorData?.message ?? "Error al cambiar la contrasena");
  }

  const text = await response.text();
  return { message: text || "Contrasena actualizada correctamente" };
};

/**
 * POST /auth/change-user-password
 * Permite al Admin_Ente cambiar la contrasena de un usuario operativo.
 */
export const cambiarContrasenaDeUsuario = async (
  payload: ChangeUserPasswordPayload
): Promise<{ message: string }> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/auth/change-user-password`, {
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
      throw new Error("No autorizado o contrasena actual incorrecta");
    }

    throw new Error(errorData?.message ?? "Error al cambiar la contrasena del usuario");
  }

  const text = await response.text();
  return { message: text || "Contrasena del usuario actualizada correctamente" };
};

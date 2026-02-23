"use server";

import { login } from "@/lib/auth/auth";
import { getDashboardRoute } from "@/lib/constants/routes";
import { ROLES } from "@/types/role.types";
import type { LoginCredentials } from "@/types/user.types";

interface LoginActionResult {
  success: boolean;
  error?: string;
  redirectUrl?: string;
}

export async function loginAction(credentials: LoginCredentials): Promise<LoginActionResult> {
  const result = await login(credentials);

  if (result.success && result.user) {
    const { role, cambioPasswordDefault, datosConfirmados } = result.user;

    // Lógica de redirección especial para Admin_Ente (flujo de primer login)
    if (role === ROLES.ENTE) {
      // Si no ha cambiado su contraseña temporal → Cambiar Contraseña
      if (!cambioPasswordDefault) {
        return {
          success: true,
          redirectUrl: "/admin_ente/cambiar-contrasena",
        };
      }

      // Si cambió contraseña pero no ha completado datos del ente → Completar Ente
      if (!datosConfirmados) {
        return {
          success: true,
          redirectUrl: "/admin_ente/completar-ente",
        };
      }
    }

    // Caso normal: redirigir al dashboard del rol correspondiente
    return {
      success: true,
      redirectUrl: getDashboardRoute(result.user.role),
    };
  }

  return {
    success: false,
    error: result.error || "Error al iniciar sesión",
  };
}

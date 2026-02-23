"use server";

import type { SessionPayload } from "@/types/auth.types";
import type { LoginCredentials } from "@/types/user.types";
import type { UserRole } from "@/types/role.types";
import { ROLES } from "@/types/role.types";
import { setSessionCookie, deleteSessionCookie, getSessionCookie } from "./session";
import { getDashboardRoute } from "@/lib/constants/routes";
import * as authService from "@/services/authService";

/**
 * Resultado de la autenticación (extendido con campos de primer login)
 */
export interface AuthResult {
  success: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
    enteId: string | null;
    cambioPasswordDefault: boolean;
    datosConfirmados: boolean;
  };
  error?: string;
}

/**
 * Autenticar usuario con el backend
 * Esta función se ejecuta en el servidor (Server Action)
 */
export async function login(credentials: LoginCredentials): Promise<AuthResult> {
  try {
    // Llamar al servicio de autenticación
    const response = await authService.login(credentials.email, credentials.password);

    const { access_token, user } = response;

    // Normalizar el rol a minúsculas
    const normalizedRole = user.rol.toLowerCase() as UserRole;

    // Crear el payload de sesión con la info del usuario
    const sessionPayload: SessionPayload = {
      userId: user.id,
      email: user.email,
      role: normalizedRole,
      name: `${user.nombre} ${user.apellido}`,
      enteId: user.ente?.id ?? null,
      cambioPasswordDefault: user.cambioPasswordDefault,
      datosConfirmados: user.ente?.datosConfirmados ?? false,
    };

    // Guardar el token del backend Y el payload en cookie del servidor
    await setSessionCookie(access_token, sessionPayload);

    return {
      success: true,
      user: {
        id: user.id,
        name: `${user.nombre} ${user.apellido}`,
        email: user.email,
        role: normalizedRole,
        enteId: user.ente?.id ?? null,
        cambioPasswordDefault: user.cambioPasswordDefault,
        datosConfirmados: user.ente?.datosConfirmados ?? false,
      },
    };
  } catch (error: any) {
    console.error("Error en login:", error);
    return {
      success: false,
      error: error.message || "Error al iniciar sesión",
    };
  }
}

/**
 * Cerrar sesión del usuario
 */
export async function logout(): Promise<void> {
  await deleteSessionCookie();
}

/**
 * Obtener usuario actual desde la sesión
 */
export async function getCurrentUser(): Promise<SessionPayload | null> {
  return getSessionCookie();
}

/**
 * Verificar si el usuario está autenticado
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSessionCookie();
  return session !== null;
}

/**
 * Obtener la ruta de redirección según el rol del usuario
 */
export async function getRedirectRoute(): Promise<string | null> {
  const session = await getSessionCookie();

  if (!session) {
    return null;
  }

  return getDashboardRoute(session.role);
}

/**
 * Server Action para el formulario de login.
 * Autentica al usuario y determina la URL de redirección según el rol y estado del primer login.
 */
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
      if (!cambioPasswordDefault) {
        return {
          success: true,
          redirectUrl: "/admin_ente/cambiar-contrasena",
        };
      }

      if (!datosConfirmados) {
        return {
          success: true,
          redirectUrl: "/admin_ente/completar-ente",
        };
      }
    }

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

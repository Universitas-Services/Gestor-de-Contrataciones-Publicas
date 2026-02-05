import type { AuthResult, SessionPayload } from "@/types/auth.types";
import type { LoginCredentials } from "@/types/user.types";
import { setSessionCookie, deleteSessionCookie, getSessionCookie } from "./session";
import { getDashboardRoute } from "@/lib/constants/routes";
import * as authService from "@/services/authService";

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
    const normalizedRole = user.rol.toLowerCase() as any;

    // Crear el payload de sesión con la info del usuario
    const sessionPayload: SessionPayload = {
      userId: user.id,
      email: user.email,
      role: normalizedRole,
      name: `${user.nombre} ${user.apellido}`,
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

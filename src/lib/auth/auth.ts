import type { AuthResult, SessionPayload } from "@/types/auth.types";
import type { LoginCredentials } from "@/types/user.types";
import { validateCredentials } from "./mock-users";
import { setSessionCookie, deleteSessionCookie, getSessionCookie } from "./session";
import { getDashboardRoute } from "@/lib/constants/routes";

/**
 * Autenticar usuario con credenciales
 * En producción, esto llamará al backend
 */
export async function login(credentials: LoginCredentials): Promise<AuthResult> {
  try {
    // Validar credenciales con mock data
    // TODO: Reemplazar con llamada al backend cuando esté disponible
    const user = validateCredentials(credentials.email, credentials.password);

    if (!user) {
      return {
        success: false,
        error: "Credenciales inválidas",
      };
    }

    // Crear payload de sesión
    const sessionPayload: SessionPayload = {
      userId: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
    };

    // Guardar sesión en cookie
    await setSessionCookie(sessionPayload);

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    };
  } catch (error) {
    console.error("Error en login:", error);
    return {
      success: false,
      error: "Error al iniciar sesión",
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

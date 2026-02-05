import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";
import type { SessionPayload } from "@/types/auth.types";
import { SESSION_CONSTANTS } from "@/types/auth.types";

/**
 * Estructura del JWT que viene del backend
 */
interface BackendJWT {
  sub: string; // userId
  email: string;
  rol: string; // role en español
  enteId: string | null;
  iat?: number;
  exp?: number;
}

/**
 * Verificar y decodificar un token JWT del backend
 */
export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    // Decodificar el token del backend
    const decoded = jwtDecode<BackendJWT>(token);

    // DEBUG: Ver estructura del token del backend
    console.log("🔍 Token decodificado del backend:", JSON.stringify(decoded, null, 2));

    // Verificar si el token ha expirado
    if (decoded.exp) {
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        console.log("❌ Token expirado");
        return null;
      }
    }

    // Mapear campos del backend a nuestro SessionPayload
    const session: SessionPayload = {
      userId: decoded.sub, // sub → userId
      email: decoded.email,
      role: decoded.rol.toLowerCase() as any, // rol → role (normalizado a minúsculas)
      name: decoded.email.split("@")[0], // Temporal: extraer nombre del email
      iat: decoded.iat,
      exp: decoded.exp,
    };

    console.log("✅ Token válido, role:", session.role);
    return session;
  } catch (error) {
    console.error("❌ Error verificando sesión:", error);
    return null;
  }
}

/**
 * Guardar token del backend Y datos del usuario en cookies del servidor
 * Guardamos el token y también la info del usuario para no tener que decodificar cada vez
 */
export async function setSessionCookie(token: string, userPayload: SessionPayload): Promise<void> {
  const cookieStore = await cookies();

  // Guardar el token JWT del backend
  cookieStore.set(SESSION_CONSTANTS.COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_CONSTANTS.MAX_AGE,
    path: "/",
  });

  // Guardar también los datos del usuario en una cookie separada
  cookieStore.set(`${SESSION_CONSTANTS.COOKIE_NAME}_payload`, JSON.stringify(userPayload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_CONSTANTS.MAX_AGE,
    path: "/",
  });
}

/**
 * Obtener sesión desde cookies
 * Prioriza leer el payload guardado, si no existe, decodifica el JWT
 */
export async function getSessionCookie(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();

  // Primero intentar leer el payload guardado
  const payloadCookie = cookieStore.get(`${SESSION_CONSTANTS.COOKIE_NAME}_payload`);
  if (payloadCookie?.value) {
    try {
      return JSON.parse(payloadCookie.value) as SessionPayload;
    } catch (error) {
      console.error("Error parseando payload de sesión:", error);
    }
  }

  // Si no hay payload, intentar decodificar el JWT
  const sessionCookie = cookieStore.get(SESSION_CONSTANTS.COOKIE_NAME);
  if (!sessionCookie?.value) {
    return null;
  }

  return verifySession(sessionCookie.value);
}

/**
 * Eliminar sesión (logout)
 */
export async function deleteSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_CONSTANTS.COOKIE_NAME);
  cookieStore.delete(`${SESSION_CONSTANTS.COOKIE_NAME}_payload`);
}

/**
 * Actualizar tiempo de expiración de la sesión con un nuevo token
 */
export async function refreshSession(newToken: string): Promise<void> {
  await setSessionCookie(newToken);
}

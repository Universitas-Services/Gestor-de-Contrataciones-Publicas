import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { SessionPayload } from "@/types/auth.types";
import { SESSION_CONSTANTS } from "@/types/auth.types";

/**
 * Obtener la clave secreta como Uint8Array
 */
function getSecretKey(): Uint8Array {
  const secret = SESSION_CONSTANTS.SECRET_KEY;
  return new TextEncoder().encode(secret);
}

/**
 * Crear un token JWT con el payload de sesión
 */
export async function createSession(payload: SessionPayload): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_CONSTANTS.MAX_AGE}s`)
    .sign(getSecretKey());

  return token;
}

/**
 * Verificar y decodificar un token JWT
 */
export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as SessionPayload;
  } catch (error) {
    console.error("Error verificando sesión:", error);
    return null;
  }
}

/**
 * Guardar sesión en cookies
 */
export async function setSessionCookie(payload: SessionPayload): Promise<void> {
  const token = await createSession(payload);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_CONSTANTS.COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_CONSTANTS.MAX_AGE,
    path: "/",
  });
}

/**
 * Obtener sesión desde cookies
 */
export async function getSessionCookie(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
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
}

/**
 * Actualizar tiempo de expiración de la sesión
 */
export async function refreshSession(): Promise<void> {
  const session = await getSessionCookie();

  if (session) {
    await setSessionCookie(session);
  }
}

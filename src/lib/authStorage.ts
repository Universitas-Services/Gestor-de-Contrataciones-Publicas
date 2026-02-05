/**
 * Manejo de almacenamiento del token de autenticación en cookies del cliente
 * Utiliza js-cookie para gestionar cookies de forma segura
 */

const TOKEN_KEY = "access_token";

/**
 * Guardar token en cookie
 */
export function setToken(token: string): void {
  // Guardar en cookie con duración de 4 horas
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${60 * 60 * 4}; SameSite=Lax`;
}

/**
 * Obtener token de cookie
 */
export function getToken(): string | null {
  const cookies = document.cookie.split("; ");
  const tokenCookie = cookies.find((cookie) => cookie.startsWith(`${TOKEN_KEY}=`));

  if (!tokenCookie) {
    return null;
  }

  return tokenCookie.split("=")[1];
}

/**
 * Eliminar token de cookie (logout)
 */
export function removeToken(): void {
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
}

/**
 * Verificar si el usuario está autenticado (tiene token)
 */
export function isAuthenticated(): boolean {
  return getToken() !== null;
}

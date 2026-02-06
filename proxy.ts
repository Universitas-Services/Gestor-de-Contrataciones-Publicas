import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "@/lib/auth/session";
import { SESSION_CONSTANTS } from "@/types/auth.types";
import { isPublicRoute, isRouteAllowedForRole } from "@/lib/constants/routes";

/**
 * Proxy de Next.js 16 - Guardian del servidor
 * Protege todas las rutas y valida permisos por rol
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir rutas públicas
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Obtener token de la cookie
  const sessionCookie = request.cookies.get(SESSION_CONSTANTS.COOKIE_NAME);

  if (!sessionCookie?.value) {
    // No hay sesión, redirigir a login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Verificar y validar el token
  const session = await verifySession(sessionCookie.value);

  if (!session) {
    // Token inválido o expirado, redirigir a login
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(SESSION_CONSTANTS.COOKIE_NAME);
    return response;
  }

  // Verificar si la ruta está permitida para el rol del usuario
  if (!isRouteAllowedForRole(pathname, session.role)) {
    // Usuario intentando acceder a ruta de otro rol
    // Redirigir a su dashboard correspondiente
    const dashboardRoute = getDashboardRoute(session.role);
    return NextResponse.redirect(new URL(dashboardRoute, request.url));
  }

  // Todo OK, permitir acceso
  return NextResponse.next();
}

/**
 * Helper para obtener ruta de dashboard
 */
function getDashboardRoute(role: string): string {
  return `/${role}/dashboard`;
}

/**
 * Configuración del matcher
 * Define qué rutas serán procesadas por este proxy
 */
export const config = {
  matcher: [
    /*
     * Coincidir con todas las rutas excepto:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (favicon)
     * - archivos públicos (images, etc)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

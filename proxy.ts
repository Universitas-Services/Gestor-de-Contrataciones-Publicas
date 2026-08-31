import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getPostAuthRedirect, resolveProtectedRouteRedirect } from "@/lib/auth/onboardingGuard";
import { getSessionFromRequest } from "@/lib/auth/session";
import { SESSION_CONSTANTS } from "@/types/auth.types";
import {
  getDashboardRoute,
  isAuthEntryRoute,
  isPublicRoute,
  isRouteAllowedForRole,
} from "@/lib/constants/routes";

/**
 * Proxy de Next.js 16 - Guardian del servidor
 * Protege todas las rutas y valida permisos por rol
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Login y home: si ya hay sesión activa, redirigir al destino del usuario
  if (isAuthEntryRoute(pathname)) {
    const session = await getSessionFromRequest(request);
    if (session) {
      return NextResponse.redirect(new URL(getPostAuthRedirect(session), request.url));
    }
    return NextResponse.next();
  }

  // Permitir otras rutas públicas
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Obtener token de la cookie
  const sessionCookie = request.cookies.get(SESSION_CONSTANTS.COOKIE_NAME);

  if (!sessionCookie?.value) {
    // No hay sesión, redirigir a login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Verificar sesión (token + payload con flags de onboarding)
  const session = await getSessionFromRequest(request);

  if (!session) {
    // Token inválido o expirado, redirigir a login
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(SESSION_CONSTANTS.COOKIE_NAME);
    response.cookies.delete(`${SESSION_CONSTANTS.COOKIE_NAME}_payload`);
    return response;
  }

  const onboardingRedirect = resolveProtectedRouteRedirect(session, pathname);
  if (onboardingRedirect) {
    return NextResponse.redirect(new URL(onboardingRedirect, request.url));
  }

  // Verificar si la ruta está permitida para el rol del usuario
  if (!isRouteAllowedForRole(pathname, session.role)) {
    // Usuario intentando acceder a ruta de otro rol
    // Redirigir a su dashboard correspondiente
    const dashboardRoute = getDashboardRoute(session.role);
    return NextResponse.redirect(new URL(dashboardRoute, request.url));
  }

  // Todo OK, permitir acceso
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
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

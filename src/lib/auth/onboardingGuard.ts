import { getDashboardRoute } from "@/lib/constants/routes";
import type { SessionPayload } from "@/types/auth.types";
import { ROLES, type UserRole } from "@/types/role.types";

export const ADMIN_ENTE_ONBOARDING_ROUTES = {
  cambiarContrasena: "/admin_ente/cambiar-contrasena",
  completarEnte: "/admin_ente/completar-ente",
} as const;

export const SUPERVISOR_ONBOARDING_ROUTES = {
  cambiarContrasena: "/supervisor/cambiar-contrasena",
} as const;

function normalizePath(pathname: string): string {
  return pathname.split("?")[0];
}

export function needsPasswordChange(session: SessionPayload): boolean {
  return Boolean(session.passwordPerdido) || session.cambioPasswordDefault === false;
}

export function needsCompletarEnte(session: SessionPayload): boolean {
  return session.role === ROLES.ENTE && session.datosConfirmados === false;
}

export function isAdminEnteOnboardingRoute(pathname: string): boolean {
  const path = normalizePath(pathname);
  return (
    path === ADMIN_ENTE_ONBOARDING_ROUTES.cambiarContrasena ||
    path === ADMIN_ENTE_ONBOARDING_ROUTES.completarEnte
  );
}

export function isSupervisorOnboardingRoute(pathname: string): boolean {
  return normalizePath(pathname) === SUPERVISOR_ONBOARDING_ROUTES.cambiarContrasena;
}

export function getAdminEnteOnboardingRedirect(session: SessionPayload): string | null {
  if (session.role !== ROLES.ENTE) {
    return null;
  }

  if (needsPasswordChange(session)) {
    const next = session.passwordPerdido ? "?next=/admin_ente/dashboard" : "";
    return `${ADMIN_ENTE_ONBOARDING_ROUTES.cambiarContrasena}${next}`;
  }

  if (needsCompletarEnte(session)) {
    return ADMIN_ENTE_ONBOARDING_ROUTES.completarEnte;
  }

  return null;
}

export function getSupervisorOnboardingRedirect(session: SessionPayload): string | null {
  if (session.role !== ROLES.SUPERVISOR) {
    return null;
  }

  if (needsPasswordChange(session)) {
    return SUPERVISOR_ONBOARDING_ROUTES.cambiarContrasena;
  }

  return null;
}

export function getOnboardingRedirect(session: SessionPayload): string | null {
  return getAdminEnteOnboardingRedirect(session) ?? getSupervisorOnboardingRedirect(session);
}

/**
 * Destino de un usuario ya autenticado: onboarding pendiente o su dashboard.
 */
export function getPostAuthRedirect(session: SessionPayload): string {
  return getOnboardingRedirect(session) ?? getDashboardRoute(session.role);
}

export function resolveProtectedRouteRedirect(
  session: SessionPayload,
  pathname: string
): string | null {
  const path = normalizePath(pathname);
  const onboardingRedirect = getOnboardingRedirect(session);

  if (onboardingRedirect) {
    const allowedPath = normalizePath(onboardingRedirect);

    if (path === allowedPath) {
      return null;
    }

    return onboardingRedirect;
  }

  if (session.role === ROLES.ENTE && isAdminEnteOnboardingRoute(path)) {
    return "/admin_ente/dashboard";
  }

  if (session.role === ROLES.SUPERVISOR && isSupervisorOnboardingRoute(path)) {
    return "/supervisor/dashboard";
  }

  return null;
}

export function hasCompletedOnboarding(session: SessionPayload, role: UserRole): boolean {
  if (session.role !== role) {
    return true;
  }

  return getOnboardingRedirect(session) === null;
}

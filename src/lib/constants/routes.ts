import { ROLES, type UserRole } from "@/types/role.types";

/**
 * Rutas base por rol
 */
export const ROLE_BASE_ROUTES = {
  [ROLES.ENTE]: "/admin_ente",
  [ROLES.SUPERVISOR]: "/supervisor",
  [ROLES.VISUALIZADOR]: "/visualizador",
  [ROLES.EJECUTOR]: "/ejecutor",
} as const;

/**
 * Rutas de dashboard por rol
 */
export const DASHBOARD_ROUTES = {
  [ROLES.ENTE]: "/admin_ente/dashboard",
  [ROLES.SUPERVISOR]: "/supervisor/dashboard",
  [ROLES.VISUALIZADOR]: "/visualizador/dashboard",
  [ROLES.EJECUTOR]: "/ejecutor/dashboard",
} as const;

/**
 * Rutas adicionales por rol
 */
export const ROLE_ROUTES = {
  [ROLES.ENTE]: {
    dashboard: "/admin_ente/dashboard",
    licitaciones: "/admin_ente/licitaciones",
    propuestas: "/admin_ente/propuestas",
    adjudicaciones: "/admin_ente/adjudicaciones",
    fiscalizacion: "/admin_ente/fiscalizacion",
    maximaAutoridad: "/admin_ente/configuracion/maxima-autoridad",
    unidadUsuaria: "/admin_ente/configuracion/unidad-usuaria",
    unidadContratante: "/admin_ente/configuracion/unidad-contratante",
    comisionContrataciones: "/admin_ente/configuracion/comision-contrataciones",
    configuracion: "/admin_ente/configuracion",
    calendarioEnte: "/admin_ente/calendario-ente",
    /** @deprecated Use calendarioEnte */
    diasNoLaborables: "/admin_ente/calendario-ente",
    cambiarContrasena: "/admin_ente/cambiar-contrasena",
    completarEnte: "/admin_ente/completar-ente",
    consultorIA: "/consultor-ia",
    conocenos: "/conocenos",
    repositorioLegal: "/repositorio-legal",
    registroProveedores: "/registro-proveedores",
    perfilEnte: "/gestion-datos/perfil",
    estructuraOrganizativa: "/gestion-datos/estructura-organizativa",
    usuarios: "/admin_ente/gestion-datos/usuarios",
    elaboracionExpediente: "/elaboracion-expediente",
    gestionExpedientes: "/gestion-expedientes",
    complianceExpediente: "/compliance-expediente",
  },
  [ROLES.SUPERVISOR]: {
    dashboard: "/supervisor/dashboard",
    auditorias: "/supervisor/auditorias",
    validaciones: "/supervisor/validaciones",
    observaciones: "/supervisor/observaciones",
    procesos: "/supervisor/procesos",
    registroProveedores: "/registro-proveedores",
  },
  [ROLES.VISUALIZADOR]: {
    dashboard: "/visualizador/dashboard",
    perfilEnte: "/gestion-datos/perfil",
    estructuraOrganizativa: "/gestion-datos/estructura-organizativa",
    registroProveedores: "/registro-proveedores",
    elaboracionExpediente: "/elaboracion-expediente",
    gestionExpedientes: "/gestion-expedientes",
    complianceExpediente: "/compliance-expediente",
    completarEnte: "/admin_ente/completar-ente",
    configuracion: "/admin_ente/configuracion",
    consultorIA: "/consultor-ia",
    conocenos: "/conocenos",
    repositorioLegal: "/repositorio-legal",
  },
  [ROLES.EJECUTOR]: {
    dashboard: "/ejecutor/dashboard",
    perfilEnte: "/gestion-datos/perfil",
    estructuraOrganizativa: "/gestion-datos/estructura-organizativa",
    registroProveedores: "/registro-proveedores",
    elaboracionExpediente: "/elaboracion-expediente",
    gestionExpedientes: "/gestion-expedientes",
    complianceExpediente: "/compliance-expediente",
    completarEnte: "/admin_ente/completar-ente",
    configuracion: "/admin_ente/configuracion",
    consultorIA: "/consultor-ia",
    conocenos: "/conocenos",
    repositorioLegal: "/repositorio-legal",
  },
} as const;

/**
 * Rutas públicas (no requieren autenticación)
 */
export const PUBLIC_ROUTES = ["/login", "/"] as const;

/**
 * Rutas de entrada a autenticación. Con sesión activa no deben ser accesibles.
 */
export const AUTH_ENTRY_ROUTES = ["/login", "/"] as const;

/**
 * Obtener la ruta de dashboard según el rol
 */
export function getDashboardRoute(role: UserRole): string {
  return DASHBOARD_ROUTES[role];
}

/**
 * Obtener todas las rutas válidas para un rol
 */
export function getRoleRoutes(role: UserRole): string[] {
  return Object.values(ROLE_ROUTES[role]);
}

/**
 * Verificar si una ruta pertenece a un rol específico
 */
export function isRouteAllowedForRole(path: string, role: UserRole): boolean {
  const normalizedPath = path.split("?")[0]; // Remover query params
  if (normalizedPath.startsWith(ROLE_BASE_ROUTES[role])) {
    return true;
  }
  const roleRoutes = getRoleRoutes(role);
  return roleRoutes.some((route) => normalizedPath.startsWith(route));
}

function matchesExactOrPrefix(path: string, routes: readonly string[]): boolean {
  const normalizedPath = path.split("?")[0];
  return routes.some((route) => {
    if (route === "/") {
      return normalizedPath === "/";
    }
    return normalizedPath === route || normalizedPath.startsWith(`${route}/`);
  });
}

/**
 * Verificar si una ruta es pública
 */
export function isPublicRoute(path: string): boolean {
  return matchesExactOrPrefix(path, PUBLIC_ROUTES);
}

/**
 * Verificar si la ruta es login o home (entrada de autenticación)
 */
export function isAuthEntryRoute(path: string): boolean {
  return matchesExactOrPrefix(path, AUTH_ENTRY_ROUTES);
}

import { ROLES, type UserRole } from "@/types/role.types";

/**
 * Rutas base por rol
 */
export const ROLE_BASE_ROUTES = {
  [ROLES.UNIVERSITAS]: "/universitas",
  [ROLES.ENTE]: "/ente",
  [ROLES.SUPERVISOR]: "/supervisor",
  [ROLES.VISUALIZADOR]: "/visualizador",
  [ROLES.EJECUTOR]: "/ejecutor",
} as const;

/**
 * Rutas de dashboard por rol
 */
export const DASHBOARD_ROUTES = {
  [ROLES.UNIVERSITAS]: "/universitas/dashboard",
  [ROLES.ENTE]: "/ente/dashboard",
  [ROLES.SUPERVISOR]: "/supervisor/dashboard",
  [ROLES.VISUALIZADOR]: "/visualizador/dashboard",
  [ROLES.EJECUTOR]: "/ejecutor/dashboard",
} as const;

/**
 * Rutas adicionales por rol
 */
export const ROLE_ROUTES = {
  [ROLES.UNIVERSITAS]: {
    dashboard: "/universitas/dashboard",
    contratos: "/universitas/contratos",
    proveedores: "/universitas/proveedores",
    reportes: "/universitas/reportes",
    analytics: "/universitas/analytics",
  },
  [ROLES.ENTE]: {
    dashboard: "/ente/dashboard",
    licitaciones: "/ente/licitaciones",
    propuestas: "/ente/propuestas",
    adjudicaciones: "/ente/adjudicaciones",
    fiscalizacion: "/ente/fiscalizacion",
  },
  [ROLES.SUPERVISOR]: {
    dashboard: "/supervisor/dashboard",
    auditorias: "/supervisor/auditorias",
    validaciones: "/supervisor/validaciones",
    observaciones: "/supervisor/observaciones",
    procesos: "/supervisor/procesos",
  },
  [ROLES.VISUALIZADOR]: {
    dashboard: "/visualizador/dashboard",
    consultas: "/visualizador/consultas",
    reportes: "/visualizador/reportes",
    transparencia: "/visualizador/transparencia",
  },
  [ROLES.EJECUTOR]: {
    dashboard: "/ejecutor/dashboard",
    tareas: "/ejecutor/tareas",
    documentos: "/ejecutor/documentos",
    procesos: "/ejecutor/procesos",
    notificaciones: "/ejecutor/notificaciones",
  },
} as const;

/**
 * Rutas públicas (no requieren autenticación)
 */
export const PUBLIC_ROUTES = ["/login", "/"] as const;

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
  const roleRoutes = getRoleRoutes(role);
  return roleRoutes.some((route) => normalizedPath.startsWith(route));
}

/**
 * Verificar si una ruta es pública
 */
export function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.some((route) => path === route || path.startsWith(route));
}

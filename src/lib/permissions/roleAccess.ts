import { ROLES, type UserRole } from "@/types/role.types";

const ENTE_MODULE_ROLES: UserRole[] = [ROLES.ENTE, ROLES.EJECUTOR, ROLES.VISUALIZADOR];
const MUTATION_ROLES: UserRole[] = [ROLES.ENTE, ROLES.EJECUTOR];
const ADMIN_ENTE_SHARED_PREFIXES = ["/admin_ente/configuracion", "/admin_ente/completar-ente"];

export function canAccessEnteModules(role: UserRole): boolean {
  return ENTE_MODULE_ROLES.includes(role);
}

export function canManageUsers(role: UserRole): boolean {
  return role === ROLES.ENTE;
}

export function canMutateEnte(role: UserRole): boolean {
  return MUTATION_ROLES.includes(role);
}

export function canMutateDirectorio(role: UserRole): boolean {
  return MUTATION_ROLES.includes(role);
}

export function canMutateProveedores(role: UserRole): boolean {
  return MUTATION_ROLES.includes(role);
}

export function canMutateExpedientes(role: UserRole): boolean {
  return MUTATION_ROLES.includes(role);
}

export function isReadOnlyRole(role: UserRole): boolean {
  return role === ROLES.VISUALIZADOR;
}

export function canAccessAdminEnteRoute(pathname: string, role: UserRole): boolean {
  if (role === ROLES.ENTE) {
    return true;
  }

  if (!canAccessEnteModules(role)) {
    return false;
  }

  return ADMIN_ENTE_SHARED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

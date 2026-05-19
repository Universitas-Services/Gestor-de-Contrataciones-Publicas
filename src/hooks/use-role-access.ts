"use client";

import { useMemo } from "react";
import {
  canManageUsers,
  canMutateDirectorio,
  canMutateEnte,
  canMutateExpedientes,
  canMutateProveedores,
  isReadOnlyRole,
} from "@/lib/permissions/roleAccess";
import { isValidRole, type UserRole } from "@/types/role.types";

export function useRoleAccess() {
  const role = useMemo<UserRole | null>(() => {
    if (typeof document === "undefined") return null;
    const domRole = document.querySelector("[data-role]")?.getAttribute("data-role");
    return domRole && isValidRole(domRole) ? domRole : null;
  }, []);

  return {
    role,
    readOnly: role ? isReadOnlyRole(role) : false,
    canManageUsers: role ? canManageUsers(role) : false,
    canMutateEnte: role ? canMutateEnte(role) : false,
    canMutateDirectorio: role ? canMutateDirectorio(role) : false,
    canMutateProveedores: role ? canMutateProveedores(role) : false,
    canMutateExpedientes: role ? canMutateExpedientes(role) : false,
  };
}

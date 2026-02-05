/**
 * Definición de roles del sistema
 * Cada rol tiene permisos y vistas diferentes
 */

export const ROLES = {
  UNIVERSITAS: "universitas",
  ENTE: "ente",
  SUPERVISOR: "supervisor",
  VISUALIZADOR: "visualizador",
  EJECUTOR: "ejecutor",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

/**
 * Configuración de colores por rol
 * Los colores están definidos en globals.css usando OKLCH
 * Se referencian como CSS variables de Tailwind
 */
export const ROLE_COLORS = {
  [ROLES.UNIVERSITAS]: {
    cssVar: "role-universitas", // Referencia a --role-universitas en globals.css
    name: "Universitas",
    description: "Máxima Autoridad",
  },
  [ROLES.ENTE]: {
    cssVar: "role-ente", // Referencia a --role-ente en globals.css
    name: "Ente",
    description: "Entidad Contratante",
  },
  [ROLES.SUPERVISOR]: {
    cssVar: "role-supervisor", // Referencia a --role-supervisor en globals.css
    name: "Supervisor",
    description: "Supervisor de Procesos",
  },
  [ROLES.VISUALIZADOR]: {
    cssVar: "role-visualizador", // Referencia a --role-visualizador en globals.css
    name: "Visualizador",
    description: "Consulta de Información",
  },
  [ROLES.EJECUTOR]: {
    cssVar: "role-ejecutor", // Referencia a --role-ejecutor en globals.css
    name: "Ejecutor",
    description: "Ejecutor de Tareas",
  },
} as const;

/**
 * Helper para validar si un string es un rol válido
 */
export function isValidRole(role: string): role is UserRole {
  return Object.values(ROLES).includes(role as UserRole);
}

/**
 * Obtener configuración de color por rol
 */
export function getRoleConfig(role: UserRole) {
  return ROLE_COLORS[role];
}

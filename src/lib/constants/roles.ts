import { ROLES, type UserRole } from "@/types/role.types";

/**
 * Permisos por rol
 * Define qué acciones puede realizar cada rol
 */
export const ROLE_PERMISSIONS = {
  [ROLES.UNIVERSITAS]: {
    canApproveContracts: true,
    canViewAllData: true,
    canGenerateReports: true,
    canManageUsers: true,
    canAccessExecutiveDashboard: true,
  },
  [ROLES.ENTE]: {
    canCreateTenders: true,
    canEvaluateProposals: true,
    canAwardContracts: true,
    canManageBudget: true,
    canPublishProcesses: true,
  },
  [ROLES.SUPERVISOR]: {
    canMonitorProcesses: true,
    canValidateStages: true,
    canCreateObservations: true,
    canAuditCompliance: true,
    canApproveStages: true,
  },
  [ROLES.VISUALIZADOR]: {
    canViewData: true,
    canExportReports: true,
    canAccessPublicInfo: true,
  },
  [ROLES.EJECUTOR]: {
    canExecuteTasks: true,
    canUploadDocuments: true,
    canUpdateStatus: true,
    canViewAssignedProcesses: true,
  },
} as const;

/**
 * Verificar si un rol tiene un permiso específico
 */
export function hasPermission(
  role: UserRole,
  permission: keyof (typeof ROLE_PERMISSIONS)[UserRole]
): boolean {
  return ROLE_PERMISSIONS[role][permission] === true;
}

/**
 * Descripción de cada rol
 */
export const ROLE_DESCRIPTIONS = {
  [ROLES.UNIVERSITAS]:
    "Máxima autoridad con acceso completo a reportes ejecutivos y aprobación de contratos",
  [ROLES.ENTE]: "Gestiona licitaciones, evalúa propuestas y adjudica contratos",
  [ROLES.SUPERVISOR]: "Monitorea procesos, valida etapas y audita cumplimiento normativo",
  [ROLES.VISUALIZADOR]: "Consulta información pública y genera reportes de transparencia",
  [ROLES.EJECUTOR]: "Ejecuta tareas operativas, carga documentos y actualiza estados",
} as const;

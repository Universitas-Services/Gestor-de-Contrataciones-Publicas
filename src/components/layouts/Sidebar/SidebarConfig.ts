import type { UserRole } from "@/types/role.types";
import { ROLE_ROUTES } from "@/lib/constants/routes";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  TrendingUp,
  Gavel,
  FileCheck,
  Award,
  Shield,
  CheckCircle,
  Eye,
  ClipboardList,
  ListTodo,
  FileUp,
  FolderOpen,
  Bell,
  Search,
  Download,
  Globe,
} from "lucide-react";

export interface SidebarItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface SidebarConfig {
  items: SidebarItem[];
}

/**
 * Configuraciones de sidebar por rol
 */
export const SIDEBAR_CONFIGS: Record<UserRole, SidebarConfig> = {
  universitas: {
    items: [
      {
        label: "Dashboard",
        href: ROLE_ROUTES.universitas.dashboard,
        icon: LayoutDashboard,
      },
      {
        label: "Contratos",
        href: ROLE_ROUTES.universitas.contratos,
        icon: FileText,
      },
      {
        label: "Proveedores",
        href: ROLE_ROUTES.universitas.proveedores,
        icon: Users,
      },
      {
        label: "Reportes",
        href: ROLE_ROUTES.universitas.reportes,
        icon: BarChart3,
      },
      {
        label: "Analytics",
        href: ROLE_ROUTES.universitas.analytics,
        icon: TrendingUp,
      },
    ],
  },
  ente: {
    items: [
      {
        label: "Dashboard",
        href: ROLE_ROUTES.ente.dashboard,
        icon: LayoutDashboard,
      },
      {
        label: "Licitaciones",
        href: ROLE_ROUTES.ente.licitaciones,
        icon: Gavel,
      },
      {
        label: "Propuestas",
        href: ROLE_ROUTES.ente.propuestas,
        icon: FileCheck,
      },
      {
        label: "Adjudicaciones",
        href: ROLE_ROUTES.ente.adjudicaciones,
        icon: Award,
      },
      {
        label: "Fiscalización",
        href: ROLE_ROUTES.ente.fiscalizacion,
        icon: Shield,
      },
    ],
  },
  supervisor: {
    items: [
      {
        label: "Dashboard",
        href: ROLE_ROUTES.supervisor.dashboard,
        icon: LayoutDashboard,
      },
      {
        label: "Auditorías",
        href: ROLE_ROUTES.supervisor.auditorias,
        icon: CheckCircle,
      },
      {
        label: "Validaciones",
        href: ROLE_ROUTES.supervisor.validaciones,
        icon: Eye,
      },
      {
        label: "Observaciones",
        href: ROLE_ROUTES.supervisor.observaciones,
        icon: ClipboardList,
      },
      {
        label: "Procesos",
        href: ROLE_ROUTES.supervisor.procesos,
        icon: FolderOpen,
      },
    ],
  },
  visualizador: {
    items: [
      {
        label: "Dashboard",
        href: ROLE_ROUTES.visualizador.dashboard,
        icon: LayoutDashboard,
      },
      {
        label: "Consultas",
        href: ROLE_ROUTES.visualizador.consultas,
        icon: Search,
      },
      {
        label: "Reportes",
        href: ROLE_ROUTES.visualizador.reportes,
        icon: Download,
      },
      {
        label: "Transparencia",
        href: ROLE_ROUTES.visualizador.transparencia,
        icon: Globe,
      },
    ],
  },
  ejecutor: {
    items: [
      {
        label: "Dashboard",
        href: ROLE_ROUTES.ejecutor.dashboard,
        icon: LayoutDashboard,
      },
      {
        label: "Tareas",
        href: ROLE_ROUTES.ejecutor.tareas,
        icon: ListTodo,
      },
      {
        label: "Documentos",
        href: ROLE_ROUTES.ejecutor.documentos,
        icon: FileUp,
      },
      {
        label: "Procesos",
        href: ROLE_ROUTES.ejecutor.procesos,
        icon: FolderOpen,
      },
      {
        label: "Notificaciones",
        href: ROLE_ROUTES.ejecutor.notificaciones,
        icon: Bell,
      },
    ],
  },
};

/**
 * Obtener configuración de sidebar por rol
 */
export function getSidebarConfig(role: UserRole): SidebarConfig {
  return SIDEBAR_CONFIGS[role];
}

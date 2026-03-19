import type { UserRole } from "@/types/role.types";
import { ROLE_ROUTES } from "@/lib/constants/routes";
import type { LucideIcon } from "lucide-react";
import {
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
  Newspaper,
  Globe,
} from "lucide-react";

import { IconType } from "react-icons";
import { LiaRobotSolid } from "react-icons/lia";
import { IoEarthOutline } from "react-icons/io5";
import { AiOutlineBook } from "react-icons/ai";
import { HiMiniHome } from "react-icons/hi2";

export interface SidebarItem {
  label: string;
  href: string;
  icon: LucideIcon | IconType;
  submenu?: Omit<SidebarItem, "icon" | "submenu">[];
}

export interface SidebarConfig {
  items: SidebarItem[];
}

/**
 * Configuraciones de sidebar por rol
 */
export const SIDEBAR_CONFIGS: Record<UserRole, SidebarConfig> = {
  admin_ente: {
    items: [
      {
        label: "Inicio",
        href: ROLE_ROUTES.admin_ente.dashboard,
        icon: HiMiniHome,
      },
      {
        label: "Gestión de datos",
        href: "#",
        icon: Newspaper,
        submenu: [
          {
            label: "Perfil del Ente",
            href: "/gestion-datos/perfil",
          },
          {
            label: "Estructura organizativa",
            href: "/gestion-datos/estructura-organizativa",
          },
        ],
      },
      {
        label: "Registro de proveedores",
        href: "/registro-proveedores",
        icon: Newspaper,
      },
      {
        label: "Licitaciones",
        href: ROLE_ROUTES.admin_ente.licitaciones,
        icon: Gavel,
      },
      {
        label: "Propuestas",
        href: ROLE_ROUTES.admin_ente.propuestas,
        icon: FileCheck,
      },
      {
        label: "Adjudicaciones",
        href: ROLE_ROUTES.admin_ente.adjudicaciones,
        icon: Award,
      },
      {
        label: "Fiscalización",
        href: ROLE_ROUTES.admin_ente.fiscalizacion,
        icon: Shield,
      },
    ],
  },
  supervisor: {
    items: [
      {
        label: "Inicio",
        href: ROLE_ROUTES.supervisor.dashboard,
        icon: HiMiniHome,
      },
      {
        label: "Registro de proveedores",
        href: "/registro-proveedores",
        icon: Newspaper,
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
        label: "Inicio",
        href: ROLE_ROUTES.visualizador.dashboard,
        icon: HiMiniHome,
      },
      {
        label: "Registro de proveedores",
        href: "/registro-proveedores",
        icon: Newspaper,
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
        label: "Inicio",
        href: ROLE_ROUTES.ejecutor.dashboard,
        icon: HiMiniHome,
      },
      {
        label: "Registro de proveedores",
        href: "/registro-proveedores",
        icon: Newspaper,
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

/**
 * Items globales visibles para todos los roles
 */
export const GLOBAL_SIDEBAR_ITEMS: SidebarItem[] = [
  {
    label: "Consultor IA",
    href: "/consultor-ia",
    icon: LiaRobotSolid,
  },
  {
    label: "Conocenos",
    href: "/conocenos",
    icon: IoEarthOutline,
  },
  {
    label: "Repositorio legal",
    href: "/repositorio-legal",
    icon: AiOutlineBook,
  },
];

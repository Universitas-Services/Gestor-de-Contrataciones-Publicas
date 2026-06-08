import type { UserRole } from "@/types/role.types";
import { ROLE_ROUTES } from "@/lib/constants/routes";
import type { LucideIcon } from "lucide-react";
import {
  CheckCircle,
  Eye,
  ClipboardList,
  FolderOpen,
  Newspaper,
  Settings,
  SquarePen,
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

const ENTE_FUNCTIONAL_ITEMS: SidebarItem[] = [
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
    label: "Elaboración de Expediente de selección de Contratista",
    href: "/elaboracion-expediente",
    icon: SquarePen,
  },
];

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
            label: "Gestión de usuarios",
            href: ROLE_ROUTES.admin_ente.usuarios,
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
        label: "Elaboración de Expediente de selección de Contratista",
        href: "/elaboracion-expediente",
        icon: SquarePen,
      },
      {
        label: "Configuración",
        href: "#",
        icon: Settings,
        submenu: [
          {
            label: "Días no laborables",
            href: ROLE_ROUTES.admin_ente.diasNoLaborables,
          },
        ],
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
      ...ENTE_FUNCTIONAL_ITEMS,
    ],
  },
  ejecutor: {
    items: [
      {
        label: "Inicio",
        href: ROLE_ROUTES.ejecutor.dashboard,
        icon: HiMiniHome,
      },
      ...ENTE_FUNCTIONAL_ITEMS,
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

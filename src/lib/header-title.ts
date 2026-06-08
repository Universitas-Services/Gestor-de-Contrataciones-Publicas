import { ROLE_ROUTES } from "@/lib/constants/routes";
import type { UserRole } from "@/types/role.types";

type HeaderTitleMatch = "exact" | "prefix";

export interface HeaderTitleRule {
  type: HeaderTitleMatch;
  path: string;
  title: string;
  role?: UserRole;
}

const HEADER_TITLE_RULES: HeaderTitleRule[] = [
  { type: "exact", path: ROLE_ROUTES.admin_ente.dashboard, title: "Inicio", role: "admin_ente" },
  { type: "exact", path: ROLE_ROUTES.supervisor.dashboard, title: "Inicio", role: "supervisor" },
  {
    type: "exact",
    path: ROLE_ROUTES.visualizador.dashboard,
    title: "Inicio",
    role: "visualizador",
  },
  { type: "exact", path: ROLE_ROUTES.ejecutor.dashboard, title: "Inicio", role: "ejecutor" },
  { type: "exact", path: "/gestion-datos/perfil", title: "Perfil del Ente" },
  {
    type: "exact",
    path: "/gestion-datos/estructura-organizativa",
    title: "Estructura organizativa",
  },
  {
    type: "exact",
    path: ROLE_ROUTES.admin_ente.usuarios,
    title: "Gestion de usuarios",
    role: "admin_ente",
  },
  {
    type: "exact",
    path: `${ROLE_ROUTES.admin_ente.usuarios}/nuevo`,
    title: "Crear usuario",
    role: "admin_ente",
  },
  { type: "exact", path: "/registro-proveedores", title: "Registro de proveedores" },
  { type: "exact", path: "/registro-proveedores/listado", title: "Listado de proveedores" },
  { type: "exact", path: "/registro-proveedores/nuevo", title: "Nuevo proveedor" },
  { type: "exact", path: "/elaboracion-expediente", title: "Elaboracion de expediente" },
  { type: "exact", path: "/elaboracion-expediente/nuevo", title: "Nuevo expediente" },
  {
    type: "exact",
    path: "/admin_ente/configuracion/maxima-autoridad",
    title: "Maxima autoridad",
    role: "admin_ente",
  },
  {
    type: "exact",
    path: "/admin_ente/configuracion/unidad-usuaria",
    title: "Unidad usuaria",
    role: "admin_ente",
  },
  {
    type: "exact",
    path: "/admin_ente/configuracion/unidad-contratante",
    title: "Unidad contratante",
    role: "admin_ente",
  },
  {
    type: "exact",
    path: "/admin_ente/configuracion/comision-contrataciones",
    title: "Comision de contrataciones",
    role: "admin_ente",
  },
  {
    type: "exact",
    path: ROLE_ROUTES.admin_ente.configuracion,
    title: "Configuracion",
    role: "admin_ente",
  },
  {
    type: "exact",
    path: ROLE_ROUTES.admin_ente.diasNoLaborables,
    title: "Dias no laborables",
    role: "admin_ente",
  },
  { type: "exact", path: "/consultor-ia", title: "Consultor IA" },
  { type: "exact", path: "/conocenos", title: "Conocenos" },
  { type: "exact", path: "/repositorio-legal", title: "Repositorio legal" },
  { type: "exact", path: "/supervisor/auditorias", title: "Auditorias", role: "supervisor" },
  {
    type: "exact",
    path: "/supervisor/validaciones",
    title: "Validaciones",
    role: "supervisor",
  },
  {
    type: "exact",
    path: "/supervisor/observaciones",
    title: "Observaciones",
    role: "supervisor",
  },
  { type: "exact", path: "/supervisor/procesos", title: "Procesos", role: "supervisor" },
  {
    type: "exact",
    path: "/visualizador/consultas",
    title: "Consultas",
    role: "visualizador",
  },
  { type: "exact", path: "/visualizador/reportes", title: "Reportes", role: "visualizador" },
  {
    type: "exact",
    path: "/visualizador/transparencia",
    title: "Transparencia",
    role: "visualizador",
  },
  { type: "exact", path: "/ejecutor/tareas", title: "Tareas", role: "ejecutor" },
  { type: "exact", path: "/ejecutor/documentos", title: "Documentos", role: "ejecutor" },
  {
    type: "exact",
    path: "/ejecutor/notificaciones",
    title: "Notificaciones",
    role: "ejecutor",
  },
  { type: "exact", path: "/ejecutor/procesos", title: "Procesos", role: "ejecutor" },
  {
    type: "prefix",
    path: `${ROLE_ROUTES.admin_ente.usuarios}/`,
    title: "Editar usuario",
    role: "admin_ente",
  },
  {
    type: "prefix",
    path: "/registro-proveedores/editar/",
    title: "Editar proveedor",
  },
  { type: "prefix", path: "/registro-proveedores/", title: "Informacion general" },
  { type: "prefix", path: "/supervisor/entes/", title: "Detalle del ente", role: "supervisor" },
];

const KNOWN_ROUTE_LABELS: Record<string, string> = {
  "/consultor-ia": "Consultor IA",
  "/conocenos": "Conocenos",
  "/repositorio-legal": "Repositorio legal",
  "/gestion-datos": "Gestion de datos",
  "/registro-proveedores": "Registro de proveedores",
  "/elaboracion-expediente": "Elaboracion de expediente",
  "/supervisor": "Supervisor",
  "/visualizador": "Visualizador",
  "/ejecutor": "Ejecutor",
  "/admin_ente": "Admin Ente",
};

function normalizePathname(pathname: string): string {
  const cleanPath = pathname.split("?")[0] ?? pathname;
  if (!cleanPath || cleanPath === "/") {
    return "/";
  }

  return cleanPath.replace(/\/+$/, "") || "/";
}

function appliesToRole(rule: HeaderTitleRule, role: UserRole) {
  return !rule.role || rule.role === role;
}

function formatSegment(segment: string) {
  const decoded = decodeURIComponent(segment);
  const compact = decoded.replace(/[-_]+/g, " ").trim();

  if (!compact) {
    return "Inicio";
  }

  return compact.replace(/\b\w/g, (char) => char.toUpperCase());
}

function resolveFromKnownLabels(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);

  for (let index = segments.length; index > 0; index -= 1) {
    const candidate = `/${segments.slice(0, index).join("/")}`;
    const label = KNOWN_ROUTE_LABELS[candidate];

    if (label) {
      return label;
    }
  }

  return null;
}

function resolveExpedienteTitle(pathname: string) {
  if (!pathname.startsWith("/elaboracion-expediente/")) {
    return null;
  }

  if (pathname.includes("/evaluacion/")) {
    return "Evaluacion del expediente";
  }

  if (pathname.endsWith("/informe")) {
    return "Informe del expediente";
  }

  if (pathname.endsWith("/editar")) {
    return "Editar expediente";
  }

  return "Elaboracion de expediente";
}

export function resolveHeaderTitle(pathname: string, role: UserRole): string {
  const normalizedPathname = normalizePathname(pathname);

  const exactMatch = HEADER_TITLE_RULES.find(
    (rule) =>
      rule.type === "exact" &&
      appliesToRole(rule, role) &&
      normalizePathname(rule.path) === normalizedPathname
  );

  if (exactMatch) {
    return exactMatch.title;
  }

  const expedienteTitle = resolveExpedienteTitle(normalizedPathname);

  if (expedienteTitle) {
    return expedienteTitle;
  }

  const prefixMatch = HEADER_TITLE_RULES.filter(
    (rule) =>
      rule.type === "prefix" &&
      appliesToRole(rule, role) &&
      normalizedPathname.startsWith(rule.path)
  ).sort((left, right) => right.path.length - left.path.length)[0];

  if (prefixMatch) {
    return prefixMatch.title;
  }

  const knownLabel = resolveFromKnownLabels(normalizedPathname);

  if (knownLabel) {
    return knownLabel;
  }

  const segments = normalizedPathname.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1];

  if (!lastSegment) {
    return "Inicio";
  }

  return formatSegment(lastSegment);
}

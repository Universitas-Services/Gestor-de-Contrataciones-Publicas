"use client";

import { Fragment, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useNavigationGuard } from "@/components/shared/NavigationGuardContext";

/** Subrutas bajo /{modulo}/[id] que muestran una tercera miga */
const EXPEDIENTE_ID_SUB_ROUTES = new Set(["contrato", "informe", "fase-1", "editar"]);
const EXPEDIENTE_ROOT_SEGMENTS = new Set(["elaboracion-expediente", "gestion-expedientes"]);

const EXPEDIENTE_SUB_ROUTE_LABELS: Record<string, string> = {
  contrato: "Elaboración del contrato",
  informe: "Informe de recomendación",
  "fase-1": "Fase preparatoria",
  editar: "Editar expediente",
};

/** Prefijos de rol: no son páginas; el inicio real es su dashboard */
const ROLE_ROOT_DASHBOARDS: Record<string, string> = {
  admin_ente: "/admin_ente/dashboard",
  supervisor: "/supervisor/dashboard",
  visualizador: "/visualizador/dashboard",
  ejecutor: "/ejecutor/dashboard",
};

const ROUTE_SEGMENT_LABELS: Record<string, string> = {
  "elaboracion-expediente": "Elaboración de expediente",
  "gestion-expedientes": "Panel expediente",
  "compliance-expediente": "Compliance de Expediente de selección de Contratista",
  admin_ente: "Admin Ente",
  supervisor: "Supervisor",
  visualizador: "Visualizador",
  ejecutor: "Ejecutor",
  dashboard: "Dashboard",
  "gestion-datos": "Gestión de datos",
  configuracion: "Configuración",
  "calendario-ente": "Calendario del ente",
};

function trimExpedienteSegments(segments: string[]): string[] {
  if (!EXPEDIENTE_ROOT_SEGMENTS.has(segments[0] ?? "") || segments.length <= 2) {
    return segments;
  }

  const subRoute = segments[2];
  if (EXPEDIENTE_ID_SUB_ROUTES.has(subRoute)) {
    return segments.slice(0, 3);
  }

  return segments.slice(0, 2);
}

/**
 * En dashboards de rol (p. ej. /admin_ente/dashboard) el segmento de rol
 * es redundante con Home y además /admin_ente no existe como página.
 */
function normalizeRoleDashboardSegments(segments: string[]): string[] {
  const [roleRoot, second] = segments;

  if (roleRoot && ROLE_ROOT_DASHBOARDS[roleRoot] && second === "dashboard") {
    return ["dashboard"];
  }

  return segments;
}

function formatSegment(segment: string, index: number, segments: string[]): string {
  if (ROUTE_SEGMENT_LABELS[segment]) {
    return ROUTE_SEGMENT_LABELS[segment];
  }

  if (EXPEDIENTE_SUB_ROUTE_LABELS[segment]) {
    return EXPEDIENTE_SUB_ROUTE_LABELS[segment];
  }

  if (segment === "nuevo" && index > 0 && segments[index - 1] === "gestion-expedientes") {
    return "Nuevo Expediente";
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(segment) || (segment.length > 20 && /^[0-9a-f-]+$/i.test(segment))) {
    if (index > 0 && segments[index - 1] === "usuarios") {
      return "Editar usuario";
    }
    if (index > 0 && segments[index - 1] === "elaboracion-expediente") {
      return "Detalle de expediente";
    }
    if (index > 0 && segments[index - 1] === "gestion-expedientes") {
      return "Detalle de expediente";
    }
    if (index > 0 && segments[index - 1] === "compliance-expediente") {
      return "Sesión de compliance";
    }
    return "Perfil del proveedor";
  }

  return segment
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function resolveSegmentHref(segments: string[], index: number): string {
  const segment = segments[index];
  const roleDashboard = ROLE_ROOT_DASHBOARDS[segment];

  // Prefijo de rol → dashboard del rol (evita 404 en /admin_ente, etc.)
  if (roleDashboard && index === 0) {
    return roleDashboard;
  }

  let href = "/" + segments.slice(0, index + 1).join("/");

  const root = segments[0];
  const expedienteId = segments[1];
  const subRoute = segments[2];

  if (root === "elaboracion-expediente" && subRoute === "contrato" && index === 1 && expedienteId) {
    href = `/elaboracion-expediente/${expedienteId}?tab=fase-4`;
  }

  // Desde el formulario de fase preparatoria, "Detalle de expediente" abre el tab Fase 1
  if (
    EXPEDIENTE_ROOT_SEGMENTS.has(root ?? "") &&
    subRoute === "fase-1" &&
    index === 1 &&
    expedienteId
  ) {
    href = `/${root}/${expedienteId}?tab=fase-1`;
  }

  return href;
}

/**
 * Componente de Breadcrumbs que genera automáticamente la navegación desde la URL.
 */
export function Breadcrumbs() {
  const pathname = usePathname();
  const router = useRouter();
  const navigationGuard = useNavigationGuard();

  let segments = pathname.split("/").filter((segment) => segment !== "");
  segments = trimExpedienteSegments(segments);
  segments = normalizeRoleDashboardSegments(segments);

  if (segments.length === 0) {
    return null;
  }

  const breadcrumbs = segments.map((segment, index) => {
    const isLast = index === segments.length - 1;

    return {
      href: resolveSegmentHref(segments, index),
      label: formatSegment(segment, index, segments),
      isLast,
    };
  });

  const handleNavigate = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!navigationGuard?.guard?.enabled) return;

    event.preventDefault();
    navigationGuard.requestNavigation(href, () => {
      router.push(href);
    });
  };

  return (
    <>
      <Breadcrumb className="mb-6 -mt-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/" onClick={(event) => handleNavigate(event, "/")}>
                <Home className="h-4 w-4" />
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          {breadcrumbs.map((breadcrumb) => (
            <Fragment key={`${breadcrumb.href}-${breadcrumb.label}`}>
              <BreadcrumbItem>
                {breadcrumb.isLast ? (
                  <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link
                      href={breadcrumb.href}
                      onClick={(event) => handleNavigate(event, breadcrumb.href)}
                    >
                      {breadcrumb.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!breadcrumb.isLast && <BreadcrumbSeparator />}
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      {navigationGuard ? (
        <AlertDialog
          open={navigationGuard.isConfirmOpen}
          onOpenChange={(open) => {
            if (!open) navigationGuard.cancelPendingNavigation();
          }}
        >
          <AlertDialogContent className="bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle>{navigationGuard.confirmTitle}</AlertDialogTitle>
              <AlertDialogDescription>{navigationGuard.confirmMessage}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={navigationGuard.confirmPendingNavigation}>
                Sí, salir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </>
  );
}

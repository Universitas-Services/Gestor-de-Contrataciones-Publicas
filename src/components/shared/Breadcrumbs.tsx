"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Fragment } from "react";

/** Subrutas bajo /elaboracion-expediente/[id] que muestran una tercera miga */
const EXPEDIENTE_ID_SUB_ROUTES = new Set(["contrato", "informe", "fase-1", "editar"]);

const EXPEDIENTE_SUB_ROUTE_LABELS: Record<string, string> = {
  contrato: "Elaboración del contrato",
  informe: "Informe de recomendación",
  "fase-1": "Fase preparatoria",
  editar: "Editar expediente",
};

const ROUTE_SEGMENT_LABELS: Record<string, string> = {
  "elaboracion-expediente": "Elaboración de expediente",
};

function trimExpedienteSegments(segments: string[]): string[] {
  if (segments[0] !== "elaboracion-expediente" || segments.length <= 2) {
    return segments;
  }

  const subRoute = segments[2];
  if (EXPEDIENTE_ID_SUB_ROUTES.has(subRoute)) {
    return segments.slice(0, 3);
  }

  return segments.slice(0, 2);
}

/**
 * Componente de Breadcrumbs que genera automáticamente la navegación desde la URL
 * Utiliza los componentes de shadcn/ui para mejor accesibilidad y estilo
 *
 * Ejemplo: /ente/dashboard → Inicio > Ente > Dashboard
 */
export function Breadcrumbs() {
  const pathname = usePathname();

  // Dividir el pathname en segmentos
  let segments = pathname.split("/").filter((segment) => segment !== "");

  segments = trimExpedienteSegments(segments);

  // Si estamos en la raíz, no mostrar breadcrumbs
  if (segments.length === 0) {
    return null;
  }

  // Función para formatear nombres de ruta
  const formatSegment = (segment: string, index: number, segments: string[]): string => {
    if (ROUTE_SEGMENT_LABELS[segment]) {
      return ROUTE_SEGMENT_LABELS[segment];
    }

    if (EXPEDIENTE_SUB_ROUTE_LABELS[segment]) {
      return EXPEDIENTE_SUB_ROUTE_LABELS[segment];
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(segment) || (segment.length > 20 && /^[0-9a-f-]+$/i.test(segment))) {
      if (index > 0 && segments[index - 1] === "usuarios") {
        return "Editar usuario";
      }
      if (index > 0 && segments[index - 1] === "elaboracion-expediente") {
        return "Detalle de expediente";
      }
      return "Perfil del proveedor";
    }

    return segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Construir breadcrumbs
  const breadcrumbs = segments.map((segment, index) => {
    let href = "/" + segments.slice(0, index + 1).join("/");
    const label = formatSegment(segment, index, segments);
    const isLast = index === segments.length - 1;

    const expedienteId = segments[1];
    const subRoute = segments[2];
    if (
      segments[0] === "elaboracion-expediente" &&
      subRoute === "contrato" &&
      index === 1 &&
      expedienteId
    ) {
      href = `/elaboracion-expediente/${expedienteId}?tab=fase-4`;
    }

    return {
      href,
      label,
      isLast,
    };
  });

  return (
    <Breadcrumb className="mb-6 -mt-4">
      <BreadcrumbList>
        {/* Inicio */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">
              <Home className="h-4 w-4" />
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {/* Separador */}
        <BreadcrumbSeparator />

        {/* Segmentos de la ruta */}
        {breadcrumbs.map((breadcrumb) => (
          <Fragment key={breadcrumb.href}>
            <BreadcrumbItem>
              {breadcrumb.isLast ? (
                <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={breadcrumb.href}>{breadcrumb.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {!breadcrumb.isLast && <BreadcrumbSeparator />}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

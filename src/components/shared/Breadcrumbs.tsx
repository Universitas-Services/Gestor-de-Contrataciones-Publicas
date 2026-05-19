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

  // Evitar migajas largas y rotas en flujos profundos de elaboración de expediente
  if (segments[0] === "elaboracion-expediente" && segments.length > 2) {
    segments = segments.slice(0, 2);
  }

  // Si estamos en la raíz, no mostrar breadcrumbs
  if (segments.length === 0) {
    return null;
  }

  // Función para formatear nombres de ruta
  const formatSegment = (segment: string, index: number, segments: string[]): string => {
    // Si el segmento es un UUID o un ID largo de proveedor, determinar según el contexto
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(segment) || (segment.length > 20 && /^[0-9a-f-]+$/i.test(segment))) {
      // Si el segmento anterior es 'usuarios', mostrar 'Editar usuario'
      if (index > 0 && segments[index - 1] === "usuarios") {
        return "Editar usuario";
      }
      // Verificamos el segmento anterior para determinar el contexto
      if (index > 0 && segments[index - 1] === "elaboracion-expediente") {
        return "Detalle de Expediente";
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
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label = formatSegment(segment, index, segments);
    const isLast = index === segments.length - 1;

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

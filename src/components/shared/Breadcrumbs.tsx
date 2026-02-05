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
 * Ejemplo: /universitas/dashboard → Inicio > Universitas > Dashboard
 */
export function Breadcrumbs() {
  const pathname = usePathname();

  // Dividir el pathname en segmentos
  const segments = pathname.split("/").filter((segment) => segment !== "");

  // Si estamos en la raíz, no mostrar breadcrumbs
  if (segments.length === 0) {
    return null;
  }

  // Función para formatear nombres de ruta
  const formatSegment = (segment: string): string => {
    return segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Construir breadcrumbs
  const breadcrumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label = formatSegment(segment);
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
        {breadcrumbs.map((breadcrumb, index) => (
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

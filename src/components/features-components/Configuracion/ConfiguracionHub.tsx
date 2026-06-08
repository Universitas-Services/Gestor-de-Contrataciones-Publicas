"use client";

import Link from "next/link";
import { CalendarDays, Settings2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROLE_ROUTES } from "@/lib/constants/routes";

const CONFIG_ITEMS = [
  {
    title: "Días no laborables",
    description:
      "Registre feriados y días inhábiles del ente. Se aplican en el cronograma de expedientes igual que un fin de semana.",
    href: ROLE_ROUTES.admin_ente.diasNoLaborables,
    icon: CalendarDays,
    available: true,
  },
  {
    title: "Próximamente",
    description: "Nuevas opciones de configuración general estarán disponibles aquí.",
    href: "#",
    icon: Settings2,
    available: false,
  },
] as const;

export function ConfiguracionHub() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-heading-dark">Configuración</h2>
        <p className="text-sm text-text-muted-dark mt-1">
          Administre parámetros generales del ente para los procesos de contratación.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {CONFIG_ITEMS.map((item) => {
          const Icon = item.icon;
          const content = (
            <Card
              className={`h-full border-border-light transition-shadow ${
                item.available ? "hover:shadow-md cursor-pointer" : "opacity-60 cursor-not-allowed"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted p-2">
                    <Icon className="h-5 w-5 text-navy" />
                  </div>
                  <CardTitle className="text-lg text-heading-dark">{item.title}</CardTitle>
                </div>
                <CardDescription className="text-text-muted-dark">
                  {item.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {item.available ? (
                  <span className="text-sm font-semibold text-navy">Abrir configuración →</span>
                ) : (
                  <span className="text-sm text-muted-foreground">En desarrollo</span>
                )}
              </CardContent>
            </Card>
          );

          if (!item.available) {
            return <div key={item.title}>{content}</div>;
          }

          return (
            <Link key={item.title} href={item.href}>
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

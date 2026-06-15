"use client";

import { Settings2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const CONFIG_ITEMS = [
  {
    title: "Próximamente",
    description: "Nuevas opciones de configuración general estarán disponibles aquí.",
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
          return (
            <Card
              key={item.title}
              className="h-full border-border-light opacity-60 cursor-not-allowed"
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
                <span className="text-sm text-muted-foreground">En desarrollo</span>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

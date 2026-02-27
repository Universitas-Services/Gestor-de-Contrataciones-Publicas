import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Building2, Users, Briefcase, UsersRound, ChevronRight } from "lucide-react";
import { ROLE_ROUTES } from "@/lib/constants/routes";

const configuracionCards = [
  {
    title: "Máxima Autoridad",
    description:
      "Registra la Máxima Autoridad del Ente, incluyendo sus datos de designación y atribuciones para suscribir contratos.",
    icon: Building2,
    href: ROLE_ROUTES.admin_ente.maximaAutoridad,
  },
  {
    title: "Unidad Usuaria",
    description:
      "Registra la Unidad Usuaria del Ente, especificando el nombre de la unidad y los datos del responsable.",
    icon: Users,
    href: ROLE_ROUTES.admin_ente.unidadUsuaria,
  },
  {
    title: "Unidad Contratante",
    description:
      "Registra la Unidad Contratante del Ente, estableciendo la comisión responsable del proceso de contratación.",
    icon: Briefcase,
    href: ROLE_ROUTES.admin_ente.unidadContratante,
  },
  {
    title: "Comisión de Contrataciones",
    description:
      "Crea una comisión y opcionalmente registra sus miembros iniciales para el proceso de contratación.",
    icon: UsersRound,
    href: ROLE_ROUTES.admin_ente.comisionContrataciones,
  },
];

export default function ConfiguracionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Configuración</h2>
        <p className="text-muted-foreground">
          Gestión de datos institucionales del Ente Contratante
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {configuracionCards.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="group">
              <Card className="h-full cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/50 group-hover:bg-accent/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1" />
                  </div>
                  <CardTitle className="mt-2">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-xs font-medium text-primary">Registrar →</span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

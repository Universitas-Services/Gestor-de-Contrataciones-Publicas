import { StatCard } from "@/components/dashboards/shared/StatCard";
import { ChartCard } from "@/components/dashboards/shared/ChartCard";
import { Gavel, FileCheck, Clock, Award } from "lucide-react";

export function EnteDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Ente</h2>
        <p className="text-muted-foreground">Gestión de Licitaciones y Contrataciones</p>
      </div>

      {/* KPIs de Ente */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Licitaciones Activas"
          value="23"
          icon={Gavel}
          description="en proceso"
          variant="primary"
        />
        <StatCard
          title="Propuestas Recibidas"
          value="87"
          icon={FileCheck}
          trend={{ value: 23.4, isPositive: true }}
          description="últimos 30 días"
        />
        <StatCard
          title="Pendientes de Evaluación"
          value="15"
          icon={Clock}
          description="requieren atención"
        />
        <StatCard
          title="Adjudicaciones del Mes"
          value="8"
          icon={Award}
          trend={{ value: 14.3, isPositive: true }}
          description="vs. mes anterior"
        />
      </div>

      {/* Licitaciones en Proceso */}
      <ChartCard title="Licitaciones en Proceso" description="Estado actual de procesos">
        <div className="space-y-3">
          {[
            {
              code: "LIC-2024-015",
              name: "Servicios de limpieza",
              phase: "Evaluación",
              proposals: 12,
            },
            { code: "LIC-2024-016", name: "Equipamiento médico", phase: "Recepción", proposals: 8 },
            {
              code: "LIC-2024-017",
              name: "Consultoría legal",
              phase: "Adjudicación",
              proposals: 5,
            },
            {
              code: "LIC-2024-018",
              name: "Mantenimiento vehicular",
              phase: "Publicada",
              proposals: 0,
            },
          ].map((licitacion) => (
            <div
              key={licitacion.code}
              className="flex items-center justify-between border-b pb-3 last:border-0"
            >
              <div>
                <p className="font-medium">{licitacion.code}</p>
                <p className="text-sm text-muted-foreground">{licitacion.name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{licitacion.phase}</p>
                <p className="text-xs text-muted-foreground">{licitacion.proposals} propuestas</p>
              </div>
            </div>
          ))}
        </div>
      </ChartCard>

      {/* Timeline de Próximos Eventos */}
      <div className="grid gap-4 md:grid-cols-2">
        <ChartCard title="Próximos Eventos" description="Calendario de actividades">
          <div className="space-y-3">
            {[
              { date: "Hoy", event: "Cierre LIC-2024-015" },
              { date: "Mañana", event: "Apertura de propuestas LIC-2024-016" },
              { date: "5 Feb", event: "Publicación LIC-2024-019" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex h-6 w-16 items-center justify-center rounded bg-primary/10 text-xs font-medium">
                  {item.date}
                </div>
                <p className="text-sm">{item.event}</p>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Proveedores Activos" description="Top 5 por participación">
          <div className="space-y-3">
            {[
              { name: "Empresa ABC S.A.", proposals: 15 },
              { name: "Constructora XYZ", proposals: 12 },
              { name: "Servicios Generales Ltda.", proposals: 10 },
              { name: "Tech Solutions Inc.", proposals: 8 },
              { name: "Consultoría Profesional", proposals: 7 },
            ].map((prov) => (
              <div key={prov.name} className="flex items-center justify-between">
                <p className="text-sm">{prov.name}</p>
                <span className="text-xs text-muted-foreground">{prov.proposals} propuestas</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

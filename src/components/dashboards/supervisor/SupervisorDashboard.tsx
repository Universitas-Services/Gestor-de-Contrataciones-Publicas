import { StatCard } from "@/components/dashboards/shared/StatCard";
import { ChartCard } from "@/components/dashboards/shared/ChartCard";
import { CheckCircle, Eye, AlertCircle, FolderOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function SupervisorDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Supervisor</h2>
        <p className="text-muted-foreground">Monitoreo y Validación de Procesos</p>
      </div>

      {/* KPIs de Supervisor */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Procesos Monitoreados"
          value="45"
          icon={FolderOpen}
          description="procesos activos"
          variant="primary"
        />
        <StatCard
          title="Validaciones Pendientes"
          value="12"
          icon={Eye}
          description="requieren revisión"
        />
        <StatCard
          title="Observaciones Activas"
          value="8"
          icon={AlertCircle}
          trend={{ value: -15.2, isPositive: true }}
          description="vs. semana anterior"
        />
        <StatCard
          title="Procesos Aprobados"
          value="28"
          icon={CheckCircle}
          trend={{ value: 12.4, isPositive: true }}
          description="este mes"
        />
      </div>

      {/* Cola de Validación */}
      <ChartCard title="Cola de Validación" description="Procesos pendientes de aprobación">
        <div className="space-y-3">
          {[
            { process: "LIC-2024-015", stage: "Evaluación Técnica", priority: "high", days: 2 },
            { process: "LIC-2024-018", stage: "Evaluación Económica", priority: "medium", days: 5 },
            { process: "ADJ-2024-003", stage: "Adjudicación", priority: "high", days: 1 },
            { process: "LIC-2024-021", stage: "Términos de Referencia", priority: "low", days: 7 },
          ].map((item) => (
            <div
              key={item.process}
              className="flex items-center justify-between border-b pb-3 last:border-0"
            >
              <div className="flex items-center gap-3">
                <Badge
                  variant={
                    item.priority === "high"
                      ? "destructive"
                      : item.priority === "medium"
                        ? "default"
                        : "secondary"
                  }
                >
                  {item.priority}
                </Badge>
                <div>
                  <p className="font-medium">{item.process}</p>
                  <p className="text-sm text-muted-foreground">{item.stage}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{item.days} días</p>
                <p className="text-xs text-muted-foreground">esperando</p>
              </div>
            </div>
          ))}
        </div>
      </ChartCard>

      {/* Observaciones y Auditorías */}
      <div className="grid gap-4 md:grid-cols-2">
        <ChartCard title="Observaciones Recientes" description="Últimas revisiones realizadas">
          <div className="space-y-3">
            {[
              { id: "OBS-245", desc: "Falta documentación técnica", status: "Pendiente" },
              { id: "OBS-244", desc: "Presupuesto excede límite", status: "Resuelta" },
              { id: "OBS-243", desc: "Plazos no cumplidos", status: "En Revisión" },
            ].map((obs) => (
              <div key={obs.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{obs.id}</p>
                  <p className="text-xs text-muted-foreground">{obs.desc}</p>
                </div>
                <Badge variant={obs.status === "Resuelta" ? "outline" : "default"}>
                  {obs.status}
                </Badge>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Cumplimiento Normativo" description="Indicadores de compliance">
          <div className="space-y-4">
            {[
              { category: "Documentación", score: 92 },
              { category: "Plazos", score: 88 },
              { category: "Transparencia", score: 95 },
              { category: "Procedimientos", score: 90 },
            ].map((item) => (
              <div key={item.category}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>{item.category}</span>
                  <span className="font-medium">{item.score}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

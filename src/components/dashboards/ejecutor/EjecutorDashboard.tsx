import { StatCard } from "@/components/dashboards/shared/StatCard";
import { ChartCard } from "@/components/dashboards/shared/ChartCard";
import { ListTodo, FileUp, Clock, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function EjecutorDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Ejecutor</h2>
        <p className="text-muted-foreground">Gestión Operativa de Tareas</p>
      </div>

      {/* KPIs de Ejecutor */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tareas Asignadas"
          value="18"
          icon={ListTodo}
          description="tareas activas"
          variant="primary"
        />
        <StatCard title="Pendientes Hoy" value="5" icon={Clock} description="requieren atención" />
        <StatCard
          title="Documentos Cargados"
          value="23"
          icon={FileUp}
          trend={{ value: 28.6, isPositive: true }}
          description="este mes"
        />
        <StatCard
          title="Tareas Completadas"
          value="42"
          icon={CheckCircle2}
          trend={{ value: 16.7, isPositive: true }}
          description="últimos 30 días"
        />
      </div>

      {/* Lista de Tareas */}
      <ChartCard title="Mis Tareas" description="Actividades pendientes y en progreso">
        <div className="space-y-3">
          {[
            {
              id: "T-245",
              task: "Cargar documentación técnica LIC-2024-015",
              dueDate: "Hoy",
              priority: "high",
              status: "En Proceso",
            },
            {
              id: "T-246",
              task: "Actualizar estado de proceso ADJ-2024-003",
              dueDate: "Mañana",
              priority: "medium",
              status: "Pendiente",
            },
            {
              id: "T-247",
              task: "Revisar y aprobar documentos de proveedor",
              dueDate: "5 Feb",
              priority: "low",
              status: "Pendiente",
            },
            {
              id: "T-248",
              task: "Preparar informe de avance mensual",
              dueDate: "7 Feb",
              priority: "medium",
              status: "No Iniciado",
            },
          ].map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between border-b pb-3 last:border-0"
            >
              <div className="flex items-center gap-3 flex-1">
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
                <div className="flex-1">
                  <p className="font-medium">{item.id}</p>
                  <p className="text-sm text-muted-foreground">{item.task}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium">{item.dueDate}</p>
                  <p className="text-xs text-muted-foreground">{item.status}</p>
                </div>
                <Button size="sm" variant="outline">
                  Ver
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ChartCard>

      {/* Procesos y Documentos */}
      <div className="grid gap-4 md:grid-cols-2">
        <ChartCard title="Procesos Asignados" description="Contratos en los que participo">
          <div className="space-y-2">
            {[
              { code: "LIC-2024-015", role: "Responsable de Documentación", progress: 75 },
              { code: "ADJ-2024-003", role: "Soporte Técnico", progress: 90 },
              { code: "LIC-2024-018", role: "Coordinador", progress: 45 },
            ].map((process) => (
              <div key={process.code} className="p-3 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm">{process.code}</p>
                    <p className="text-xs text-muted-foreground">{process.role}</p>
                  </div>
                  <span className="text-xs font-medium">{process.progress}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${process.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Documentos Recientes" description="Últimas cargas realizadas">
          <div className="space-y-2">
            {[
              { name: "Especificaciones_Técnicas_v2.pdf", date: "Hace 2 horas", size: "1.2 MB" },
              { name: "Presupuesto_Actualizado.xlsx", date: "Ayer", size: "450 KB" },
              { name: "Informe_Avance_Enero.docx", date: "Hace 3 días", size: "2.1 MB" },
            ].map((doc, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 rounded hover:bg-muted/50"
              >
                <div>
                  <p className="text-sm font-medium">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {doc.date} • {doc.size}
                  </p>
                </div>
                <Button size="sm" variant="ghost">
                  <FileUp className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

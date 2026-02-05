import { StatCard } from "@/components/dashboards/shared/StatCard";
import { ChartCard } from "@/components/dashboards/shared/ChartCard";
import { FileText, Users, TrendingUp, DollarSign } from "lucide-react";

export function UniversitasDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Universitas</h2>
        <p className="text-muted-foreground">Vista Panorámica - Máxima Autoridad</p>
      </div>

      {/* KPIs Ejecutivos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Contratos Activos"
          value="127"
          icon={FileText}
          trend={{ value: 12.5, isPositive: true }}
          description="vs. mes anterior"
          variant="primary"
        />
        <StatCard
          title="Proveedores"
          value="342"
          icon={Users}
          trend={{ value: 8.3, isPositive: true }}
          description="proveedores registrados"
        />
        <StatCard
          title="Presupuesto Ejecutado"
          value="$2.4M"
          icon={DollarSign}
          trend={{ value: 15.7, isPositive: true }}
          description="de $3.2M total"
        />
        <StatCard
          title="Eficiencia de Procesos"
          value="94.2%"
          icon={TrendingUp}
          trend={{ value: 3.1, isPositive: true }}
          description="índice de eficiencia"
        />
      </div>

      {/* Gráficos y Analítica */}
      <div className="grid gap-4 md:grid-cols-2">
        <ChartCard title="Contratos por Estado" description="Distribución de contratos activos">
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <p>Gráfico de donut: En Proceso (45), Finalizados (68), Pendientes (14)</p>
          </div>
        </ChartCard>

        <ChartCard title="Ejecución Presupuestaria" description="Últimos 6 meses">
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <p>Gráfico de barras: Tendencia mensual de ejecución</p>
          </div>
        </ChartCard>
      </div>

      {/* Tabla de Contratos Recientes */}
      <ChartCard title="Contratos Recientes" description="Últimas aprobaciones">
        <div className="space-y-3">
          {[
            {
              id: "C-2024-001",
              desc: "Servicios de consultoría",
              amount: "$45,000",
              status: "Aprobado",
            },
            {
              id: "C-2024-002",
              desc: "Equipamiento tecnológico",
              amount: "$128,500",
              status: "En Proceso",
            },
            {
              id: "C-2024-003",
              desc: "Mantenimiento de infraestructura",
              amount: "$92,000",
              status: "Aprobado",
            },
          ].map((contract) => (
            <div
              key={contract.id}
              className="flex items-center justify-between border-b pb-3 last:border-0"
            >
              <div>
                <p className="font-medium">{contract.id}</p>
                <p className="text-sm text-muted-foreground">{contract.desc}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{contract.amount}</p>
                <p className="text-xs text-muted-foreground">{contract.status}</p>
              </div>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}

import { StatCard } from "@/components/dashboards/shared/StatCard";
import { ChartCard } from "@/components/dashboards/shared/ChartCard";
import { Search, Download, Globe, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export function VisualizadorDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Visualizador</h2>
        <p className="text-muted-foreground">Portal de Consulta y Transparencia</p>
      </div>

      {/* KPIs de Visualizador */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Procesos Públicos"
          value="156"
          icon={Globe}
          description="disponibles para consulta"
          variant="primary"
        />
        <StatCard title="Consultas Realizadas" value="43" icon={Search} description="este mes" />
        <StatCard
          title="Reportes Generados"
          value="18"
          icon={Download}
          description="últimos 30 días"
        />
        <StatCard
          title="Documentos Accesibles"
          value="892"
          icon={FileText}
          description="en biblioteca pública"
        />
      </div>

      {/* Portal de Búsqueda */}
      <ChartCard title="Procesos Disponibles" description="Consultas públicas recientes">
        <div className="space-y-3">
          {[
            {
              code: "LIC-2024-015",
              name: "Servicios de limpieza",
              status: "En Proceso",
              access: "Público",
            },
            {
              code: "LIC-2024-014",
              name: "Equipamiento médico",
              status: "Finalizado",
              access: "Público",
            },
            {
              code: "ADJ-2024-003",
              name: "Consultoría legal",
              status: "Adjudicado",
              access: "Público",
            },
            {
              code: "LIC-2024-013",
              name: "Mantenimiento vehicular",
              status: "Publicado",
              access: "Público",
            },
          ].map((process) => (
            <div
              key={process.code}
              className="flex items-center justify-between border-b pb-3 last:border-0"
            >
              <div>
                <p className="font-medium">{process.code}</p>
                <p className="text-sm text-muted-foreground">{process.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right mr-4">
                  <p className="text-sm font-medium">{process.status}</p>
                  <p className="text-xs text-muted-foreground">{process.access}</p>
                </div>
                <Button size="sm" variant="outline">
                  Ver Detalles
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ChartCard>

      {/* Reportes y Estadísticas Públicas */}
      <div className="grid gap-4 md:grid-cols-2">
        <ChartCard title="Reportes Disponibles" description="Documentos para descarga">
          <div className="space-y-2">
            {[
              { name: "Informe Mensual - Enero 2024", size: "2.4 MB", type: "PDF" },
              { name: "Estadísticas de Contratación Q1", size: "1.8 MB", type: "Excel" },
              { name: "Resumen de Adjudicaciones", size: "950 KB", type: "PDF" },
            ].map((report, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="text-sm font-medium">{report.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {report.type} • {report.size}
                  </p>
                </div>
                <Button size="sm" variant="ghost">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Estadísticas Públicas" description="Datos de transparencia">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Procesos Completados</span>
                <span className="font-bold">68</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div className="h-full w-[68%] rounded-full bg-green-500" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span>En Proceso</span>
                <span className="font-bold">45</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div className="h-full w-[45%] rounded-full bg-blue-500" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Publicados</span>
                <span className="font-bold">14</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div className="h-full w-[14%] rounded-full bg-yellow-500" />
              </div>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

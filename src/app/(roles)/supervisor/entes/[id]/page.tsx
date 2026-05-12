import { EnteDashboard } from "@/components/dashboards/admin_ente/EnteDashboard";
import { obtenerMetricasEnte } from "@/services/supervisorService";

export default async function SupervisorEnteDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const data = await obtenerMetricasEnte(resolvedParams.id);

  return <EnteDashboard data={data} hideManualButtons={true} />;
}

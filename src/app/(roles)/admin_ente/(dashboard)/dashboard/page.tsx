import { EnteDashboard } from "@/components/dashboards/admin_ente/EnteDashboard";
import { obtenerDashboardOperativo } from "@/services/enteService";

export default async function EnteDashboardPage() {
  const data = await obtenerDashboardOperativo();
  return <EnteDashboard data={data} />;
}

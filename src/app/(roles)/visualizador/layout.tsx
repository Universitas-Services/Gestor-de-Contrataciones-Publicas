import type { Metadata } from "next";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Header } from "@/components/shared/Header";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { getCurrentUser } from "@/lib/auth/auth";
import { enforceRoleAccess } from "@/lib/auth/roleGuard";
import { ROLES } from "@/types/role.types";

export const metadata: Metadata = {
  title: "Visualizador | Dashboard",
  description: "Panel de Control - Consulta de Información",
};

export default async function VisualizadorLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  // Defense-in-depth: Layout validates role even though proxy already does
  enforceRoleAccess(user, ROLES.VISUALIZADOR);

  // After enforceRoleAccess, user is guaranteed to be non-null and have correct role
  const authenticatedUser = user!;

  return (
    <DashboardLayout
      role={ROLES.VISUALIZADOR}
      userName={authenticatedUser.name}
      userEmail={authenticatedUser.email}
    >
      <Header
        userName={authenticatedUser.name}
        userEmail={authenticatedUser.email}
        userRole={authenticatedUser.role}
      />
      <div className="p-8">
        <Breadcrumbs />
        {children}
      </div>
    </DashboardLayout>
  );
}

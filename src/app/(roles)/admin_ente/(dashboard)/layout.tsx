import type { Metadata } from "next";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Header } from "@/components/shared/Header";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { getCurrentUser } from "@/lib/auth/auth";
import { ROLES } from "@/types/role.types";

export const metadata: Metadata = {
  title: "Admin Ente | Dashboard",
  description: "Panel de Control - Entidad Contratante",
};

/**
 * Layout del dashboard de admin_ente: contiene Sidebar, Header, Breadcrumbs.
 */
export default async function EnteDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  // user is guaranteed non-null by parent layout's enforceRoleAccess
  const authenticatedUser = user!;

  return (
    <DashboardLayout
      role={ROLES.ENTE}
      userName={authenticatedUser.name}
      userEmail={authenticatedUser.email}
      notificationCount={3}
    >
      <Header
        userName={authenticatedUser.name}
        userEmail={authenticatedUser.email}
        userRole={authenticatedUser.role}
        notificationCount={3}
      />
      <div className="p-8">
        <Breadcrumbs />
        {children}
      </div>
    </DashboardLayout>
  );
}

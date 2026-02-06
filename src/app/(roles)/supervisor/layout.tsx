import type { Metadata } from "next";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Header } from "@/components/shared/Header";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { getCurrentUser } from "@/lib/auth/auth";
import { enforceRoleAccess } from "@/lib/auth/roleGuard";
import { ROLES } from "@/types/role.types";

export const metadata: Metadata = {
  title: "Supervisor | Dashboard",
  description: "Panel de Control - Supervisor de Procesos",
};

export default async function SupervisorLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  // Defense-in-depth: Layout validates role even though proxy already does
  enforceRoleAccess(user, ROLES.SUPERVISOR);

  // After enforceRoleAccess, user is guaranteed to be non-null and have correct role
  const authenticatedUser = user!;

  return (
    <DashboardLayout
      role={ROLES.SUPERVISOR}
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

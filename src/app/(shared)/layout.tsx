import type { Metadata } from "next";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Header } from "@/components/shared/Header";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { getCurrentUser } from "@/lib/auth/auth";

export const metadata: Metadata = {
  title: "Gestión de Datos | Sistema Integrado",
  description: "Panel de Datos Compartido",
};

/**
 * Layout global para páginas compartidas entre diferentes roles.
 * Determina su jerarquía extrayendo dinámicamente el userRole de la sesión actual.
 */
export default async function SharedDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const authenticatedUser = user!;

  return (
    <DashboardLayout
      role={authenticatedUser.role}
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

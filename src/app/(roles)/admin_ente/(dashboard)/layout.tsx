import type { Metadata } from "next";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Header } from "@/components/shared/Header";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { getCurrentUser } from "@/lib/auth/auth";
import { getOnboardingRedirect } from "@/lib/auth/onboardingGuard";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Admin Ente | Dashboard",
  description: "Panel de Control - Entidad Contratante",
};

/**
 * Layout del dashboard de admin_ente: contiene Sidebar, Header, Breadcrumbs.
 */
export default async function EnteDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const onboardingRedirect = getOnboardingRedirect(user);
  if (onboardingRedirect) {
    redirect(onboardingRedirect);
  }

  const authenticatedUser = user;

  return (
    <DashboardLayout
      role={authenticatedUser.role}
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

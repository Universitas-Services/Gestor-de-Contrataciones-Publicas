import type { Metadata } from "next";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Header } from "@/components/shared/Header";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { getCurrentUser } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { ROLES } from "@/types/role.types";

export const metadata: Metadata = {
  title: "Ejecutor | Dashboard",
  description: "Panel de Control - Ejecutor de Tareas",
};

export default async function EjecutorLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user || user.role !== ROLES.EJECUTOR) {
    redirect("/login");
  }

  return (
    <DashboardLayout
      role={ROLES.EJECUTOR}
      userName={user.name}
      userEmail={user.email}
      notificationCount={3}
    >
      <Header
        userName={user.name}
        userEmail={user.email}
        userRole={user.role}
        notificationCount={3}
      />
      <div className="p-8">
        <Breadcrumbs />
        {children}
      </div>
    </DashboardLayout>
  );
}

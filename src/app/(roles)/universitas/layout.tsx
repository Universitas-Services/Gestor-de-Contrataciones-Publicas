import type { Metadata } from "next";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Header } from "@/components/shared/Header";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { getCurrentUser } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { ROLES } from "@/types/role.types";

export const metadata: Metadata = {
  title: "Universitas | Dashboard",
  description: "Panel de Control - Máxima Autoridad",
};

export default async function UniversitasLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user || user.role !== ROLES.UNIVERSITAS) {
    redirect("/login");
  }

  return (
    <DashboardLayout
      role={ROLES.UNIVERSITAS}
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

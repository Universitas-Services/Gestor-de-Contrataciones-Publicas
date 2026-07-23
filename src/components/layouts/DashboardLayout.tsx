"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./Sidebar/AppSidebar";
import { HeaderTitleProvider } from "@/components/shared/HeaderTitleContext";
import type { UserRole } from "@/types/role.types";

interface DashboardLayoutProps {
  role: UserRole;
  userName: string;
  userEmail: string;
  children: React.ReactNode;
}

export function DashboardLayout({ role, userName, userEmail, children }: DashboardLayoutProps) {
  return (
    <div data-role={role}>
      <SidebarProvider>
        <AppSidebar role={role} />
        <SidebarInset>
          <HeaderTitleProvider>{children}</HeaderTitleProvider>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

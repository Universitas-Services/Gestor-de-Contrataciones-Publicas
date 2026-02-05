"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./Sidebar/AppSidebar";
import type { UserRole } from "@/types/role.types";

interface DashboardLayoutProps {
  role: UserRole;
  userName: string;
  userEmail: string;
  notificationCount?: number;
  children: React.ReactNode;
}

export function DashboardLayout({
  role,
  userName,
  userEmail,
  notificationCount = 0,
  children,
}: DashboardLayoutProps) {
  return (
    <div data-role={role}>
      <SidebarProvider>
        <AppSidebar role={role} />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </div>
  );
}

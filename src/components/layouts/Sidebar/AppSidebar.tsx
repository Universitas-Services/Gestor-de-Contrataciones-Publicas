"use client";

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import { SidebarNavigation } from "./SidebarNavigation";
import { getRoleConfig } from "@/types/role.types";
import type { UserRole } from "@/types/role.types";

interface AppSidebarProps {
  role: UserRole;
}

export function AppSidebar({ role }: AppSidebarProps) {
  const roleConfig = getRoleConfig(role);

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-4">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg text-primary-foreground font-bold text-sm"
            style={{
              background: `linear-gradient(to bottom right, oklch(var(--${roleConfig.cssVar})), oklch(var(--${roleConfig.cssVar}) / 0.5))`,
            }}
          >
            {roleConfig.name.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{roleConfig.name}</span>
            <span className="text-xs text-muted-foreground">{roleConfig.description}</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarNavigation role={role} />
      </SidebarContent>

      <SidebarFooter>
        <div className="px-2 py-2 text-xs text-muted-foreground">
          Sistema de Contrataciones v1.0
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

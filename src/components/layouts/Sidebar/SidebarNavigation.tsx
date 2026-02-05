"use client";

import { usePathname } from "next/navigation";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { getSidebarConfig } from "./SidebarConfig";
import { getRoleConfig } from "@/types/role.types";
import type { UserRole } from "@/types/role.types";

interface SidebarNavigationProps {
  role: UserRole;
}

export function SidebarNavigation({ role }: SidebarNavigationProps) {
  const pathname = usePathname();
  const config = getSidebarConfig(role);
  const roleConfig = getRoleConfig(role);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navegación</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {config.items.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={isActive}>
                  <a
                    href={item.href}
                    className="flex items-center gap-3"
                    style={
                      isActive
                        ? {
                            color: `oklch(var(--${roleConfig.cssVar}))`,
                          }
                        : undefined
                    }
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

"use client";

import { SidebarItem } from "./SidebarItem";
import { getSidebarConfig } from "./SidebarConfig";
import type { UserRole } from "@/types/role.types";
import { getRoleConfig } from "@/types/role.types";

interface SidebarProps {
  role: UserRole;
}

export function Sidebar({ role }: SidebarProps) {
  const config = getSidebarConfig(role);
  const roleConfig = getRoleConfig(role);

  return (
    <aside className="fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] w-64 border-r bg-background">
      <nav className="flex h-full flex-col gap-2 p-4">
        {config.items.map((item) => (
          <SidebarItem key={item.href} item={item} roleColor={roleConfig.cssVar} />
        ))}
      </nav>
    </aside>
  );
}

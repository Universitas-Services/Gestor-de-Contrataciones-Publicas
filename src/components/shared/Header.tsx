"use client";

import { UserAvatar } from "./UserAvatar";
import { NotificationBell } from "./NotificationBell";
import { LogoutButton } from "./LogoutButton";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getRoleConfig } from "@/types/role.types";
import type { UserRole } from "@/types/role.types";

interface HeaderProps {
  userName: string;
  userEmail: string;
  userAvatar?: string;
  userRole: UserRole;
  notificationCount?: number;
}

export function Header({
  userName,
  userEmail,
  userAvatar,
  userRole,
  notificationCount = 0,
}: HeaderProps) {
  const roleConfig = getRoleConfig(userRole);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-6">
        {/* Trigger para mobile */}
        <SidebarTrigger className="cursor-pointer" />

        {/* Logo y título del rol */}
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm"
            style={{
              background: `linear-gradient(135deg, var(--${roleConfig.cssVar}), color-mix(in oklch, var(--${roleConfig.cssVar}), transparent 30%))`,
            }}
          >
            {roleConfig.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-lg font-semibold">{roleConfig.name}</h1>
            <p className="text-xs text-muted-foreground">{roleConfig.description}</p>
          </div>
        </div>

        {/* Spacer para empujar las acciones a la derecha */}
        <div className="flex-1" />

        {/* Acciones del usuario */}
        <div className="flex items-center gap-2">
          <NotificationBell count={notificationCount} />

          <div className="ml-2 flex items-center gap-3 border-l pl-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground">{userEmail}</p>
            </div>
            <UserAvatar name={userName} email={userEmail} avatar={userAvatar} role={userRole} />
          </div>

          <LogoutButton />
        </div>
      </div>
    </header>
  );
}

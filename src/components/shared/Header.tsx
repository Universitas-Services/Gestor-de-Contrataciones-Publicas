"use client";

import Image from "next/image";
import { NotificationBell } from "./NotificationBell";
import { UserAvatar } from "./UserAvatar";
import { HeaderTitle } from "./HeaderTitle";
import { LogoutButton } from "./LogoutButton";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
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
  const { state } = useSidebar();
  const roleConfig = getRoleConfig(userRole);
  const isSidebarCollapsed = state === "collapsed";

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-16 items-center gap-3 px-4 md:grid md:grid-cols-[5.5rem_minmax(0,1fr)_22rem] md:items-center md:gap-4 md:px-6">
        <SidebarTrigger className="cursor-pointer md:hidden" />

        <div className="hidden h-16 w-[5.5rem] items-center justify-start md:flex">
          {isSidebarCollapsed ? (
            <Image
              src="/img_app/icono_sin_relleno.png"
              alt="Icono del Sistema Integrado"
              width={36}
              height={36}
              priority
              className="ml-0.5 h-18 w-18 object-contain"
            />
          ) : null}
        </div>

        <HeaderTitle userRole={userRole} />

        <div className="ml-auto flex min-w-0 items-center gap-2 md:ml-0 md:w-[22rem] md:justify-end md:justify-self-end">
          <NotificationBell count={notificationCount} />

          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label="Abrir menu de usuario"
                className="ml-2 flex min-w-0 cursor-pointer items-center gap-3 rounded-md border-l py-1 pr-2 pl-4 text-left outline-none transition-colors hover:bg-sidebar/10 data-[state=open]:bg-sidebar/10 focus-visible:ring-2 focus-visible:ring-ring/50 sm:w-66 md:w-64"
              >
                <div className="hidden min-w-0 flex-1 text-right sm:block">
                  <p className="truncate text-sm font-medium">{userName}</p>
                  <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
                </div>
                <UserAvatar name={userName} email={userEmail} avatar={userAvatar} role={userRole} />
              </button>
            </PopoverTrigger>

            <PopoverContent
              align="end"
              className="w-[18rem] overflow-hidden rounded-xl border-0 bg-popover/98 p-0 shadow-[0_14px_36px_rgba(15,23,42,0.14)] backdrop-blur"
              sideOffset={8}
            >
              <div
                className="relative overflow-hidden px-3.5 pb-3.5 pt-4"
                style={{
                  background: `linear-gradient(145deg, color-mix(in oklch, var(--${roleConfig.cssVar}) 16%, white) 0%, color-mix(in oklch, var(--${roleConfig.cssVar}) 8%, white) 38%, white 100%)`,
                }}
              >
                <div
                  className="absolute inset-x-0 top-0 h-1"
                  style={{ backgroundColor: `var(--${roleConfig.cssVar})` }}
                />
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="rounded-xl border p-1 shadow-sm"
                    style={{
                      backgroundColor: `color-mix(in oklch, var(--${roleConfig.cssVar}) 10%, white)`,
                      borderColor: `color-mix(in oklch, var(--${roleConfig.cssVar}) 16%, white)`,
                    }}
                  >
                    <UserAvatar
                      name={userName}
                      email={userEmail}
                      avatar={userAvatar}
                      role={userRole}
                      size="lg"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold leading-tight text-color-titulos">
                      {userName}
                    </p>
                    <p className="truncate text-[13px] text-muted-foreground">{userEmail}</p>
                  </div>
                </div>
              </div>

              <Separator className="bg-border/70" />

              <div className="px-3.5 py-2">
                <div
                  className="mt-2 flex items-center justify-between rounded-lg border px-2.5 py-2.5 shadow-sm"
                  style={{
                    backgroundColor: `color-mix(in oklch, var(--${roleConfig.cssVar}) 8%, white)`,
                    borderColor: `color-mix(in oklch, var(--${roleConfig.cssVar}) 16%, white)`,
                  }}
                >
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-muted-foreground">
                      Permisos de sesion
                    </p>
                    <p className="mt-0.5 truncate text-[13px] font-semibold leading-tight text-color-titulos">
                      Rol actual
                    </p>
                  </div>
                  <Badge
                    className="ml-2.5 border-0 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm"
                    style={{ backgroundColor: `var(--${roleConfig.cssVar})` }}
                  >
                    {roleConfig.name}
                  </Badge>
                </div>
              </div>

              <Separator className="bg-border/70" />

              <div className="p-2.5">
                <LogoutButton
                  showTooltip={false}
                  variant="destructive"
                  className="h-9 w-full rounded-lg text-sm font-semibold shadow-sm"
                >
                  Cerrar sesion
                </LogoutButton>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
}

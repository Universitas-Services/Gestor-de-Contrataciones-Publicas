"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { getSidebarConfig, GLOBAL_SIDEBAR_ITEMS, type SidebarItem } from "./SidebarConfig";
import { getRoleConfig } from "@/types/role.types";
import type { UserRole } from "@/types/role.types";
import { SupervisorEntesList } from "./SupervisorEntesList";

interface SidebarNavigationProps {
  role: UserRole;
}

function NavItem({ item, roleCssVar }: { item: SidebarItem; roleCssVar: string }) {
  const pathname = usePathname();
  const isSubMenuActive = item.submenu?.some((sub) => pathname === sub.href);
  const isActive = pathname === item.href || isSubMenuActive;
  const [isOpen, setIsOpen] = useState(isSubMenuActive || false);
  const Icon = item.icon;

  if (item.submenu) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          isActive={isActive}
          tooltip={item.label}
          onClick={() => setIsOpen(!isOpen)}
          style={isActive ? { color: `oklch(var(--${roleCssVar}))` } : undefined}
        >
          <Icon className="h-5 w-5" />
          <span>{item.label}</span>
          <ChevronDown
            className={`ml-auto h-4 w-4 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </SidebarMenuButton>

        {isOpen && (
          <SidebarMenuSub>
            {item.submenu.map((sub) => {
              const isSubActive = pathname === sub.href;
              return (
                <SidebarMenuSubItem key={sub.href}>
                  <SidebarMenuSubButton asChild isActive={isSubActive}>
                    <Link
                      href={sub.href}
                      style={isSubActive ? { color: `oklch(var(--${roleCssVar}))` } : undefined}
                    >
                      <span>{sub.label}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        )}
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
        <Link
          href={item.href}
          className="flex items-center gap-3"
          style={isActive ? { color: `oklch(var(--${roleCssVar}))` } : undefined}
        >
          <Icon className="h-5 w-5" />
          <span>{item.label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function SidebarNavigation({ role }: SidebarNavigationProps) {
  const config = getSidebarConfig(role);
  const roleConfig = getRoleConfig(role);

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Menú Principal</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {config.items.map((item) => (
              <NavItem key={item.href} item={item} roleCssVar={roleConfig.cssVar} />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {role === "supervisor" && <SupervisorEntesList />}

      <SidebarGroup>
        <SidebarGroupLabel>Otros Servicios</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {GLOBAL_SIDEBAR_ITEMS.map((item) => (
              <NavItem key={item.label} item={item} roleCssVar={roleConfig.cssVar} />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}

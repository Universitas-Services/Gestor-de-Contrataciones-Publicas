"use client";

import Image from "next/image";
import { Menu } from "lucide-react";
import { Sidebar, SidebarContent, SidebarHeader, useSidebar } from "@/components/ui/sidebar";
import { SidebarNavigation } from "./SidebarNavigation";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/types/role.types";

interface AppSidebarProps {
  role: UserRole;
}

export function AppSidebar({ role }: AppSidebarProps) {
  const { toggleSidebar } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 cursor-pointer text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Image
            src="/img_app/SI_relleno.png"
            alt="Sistema Integrado"
            width={160}
            height={40}
            priority
            className="group-data-[collapsible=icon]:hidden"
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarNavigation role={role} />
      </SidebarContent>
    </Sidebar>
  );
}

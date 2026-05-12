"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Building2 } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { getCurrentUser } from "@/lib/auth/auth";
import { obtenerMisEntes, type EnteAsignado } from "@/services/supervisorService";
import { getRoleConfig } from "@/types/role.types";

export function SupervisorEntesList() {
  const [entes, setEntes] = useState<EnteAsignado[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const roleConfig = getRoleConfig("supervisor");

  useEffect(() => {
    async function fetchData() {
      try {
        const user = await getCurrentUser();
        if (user?.role === "supervisor") {
          const data = await obtenerMisEntes();
          setEntes(data || []);
        }
      } catch (error) {
        console.error("Error al obtener los entes del supervisor:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return null;
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Mis Entes</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {entes.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-400 italic">No hay entes asociados</div>
          ) : (
            entes.map((ente) => {
              const href = `/supervisor/entes/${ente.id}`;
              const isActive = pathname.startsWith(href);

              return (
                <SidebarMenuItem key={ente.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={ente.nombre}
                    style={isActive ? { color: `oklch(var(--${roleConfig.cssVar}))` } : undefined}
                  >
                    <Link href={href} className="flex items-center gap-3 overflow-hidden">
                      <Building2 className="h-5 w-5 shrink-0" />
                      <span className="truncate">{ente.nombre}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

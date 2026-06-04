"use client";

import { Bell, FileText, Info, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useManualRequisitos } from "@/hooks/use-manual-requisitos";
import type { UserRole } from "@/types/role.types";

interface NotificationItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  type: "success" | "warning" | "info";
}

interface NotificationBellProps {
  userRole?: UserRole;
}

/* ── Roles que pueden ver notificaciones de manual ── */
const MANUAL_NOTIFICATION_ROLES: UserRole[] = ["admin_ente", "ejecutor"];

export function NotificationBell({ userRole }: NotificationBellProps) {
  const shouldCheckManual = userRole ? MANUAL_NOTIFICATION_ROLES.includes(userRole) : false;
  const { estado, manualExiste, manualVigente, isLoading } = useManualRequisitos(shouldCheckManual);

  /* ── Construir lista de notificaciones ── */
  const notifications: NotificationItem[] = [];

  if (shouldCheckManual && !isLoading && estado) {
    // Solo mostrar notificación si puede generar Y el manual NO existe aún
    if (estado.puedeGenerarManual && manualExiste === false) {
      notifications.push({
        id: "manual-listo",
        icon: <FileText className="h-4 w-4 text-emerald-600" />,
        title: "Manual disponible para generar",
        description:
          "Todos los requisitos están completos. Ya puedes generar tu Manual de Contrataciones.",
        type: "success",
      });
    }

    // Notificación de manual desactualizado (solo si ya existe)
    if (manualExiste === true && manualVigente?.estaDesactualizado === true) {
      notifications.push({
        id: "manual-desactualizado",
        icon: <AlertTriangle className="h-4 w-4 text-amber-600" />,
        title: "Manual desactualizado",
        description:
          manualVigente.motivoDesactualizacion ??
          "Se han realizado cambios en la configuración del ente. Por favor, genere un nuevo manual.",
        type: "warning",
      });
    }
  }

  const count = notifications.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive text-[8px] font-bold text-destructive-foreground animate-in fade-in zoom-in duration-200">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-80 overflow-hidden rounded-xl border-0 bg-popover/98 p-0 shadow-[0_14px_36px_rgba(15,23,42,0.14)] backdrop-blur"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <h4 className="text-sm font-semibold text-foreground">Notificaciones</h4>
          {count > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive/10 px-1.5 text-[10px] font-bold text-destructive">
              {count}
            </span>
          )}
        </div>

        <Separator className="bg-border/50" />

        {/* Lista de notificaciones */}
        <div className="max-h-72 overflow-y-auto">
          {notifications.length > 0 ? (
            <div className="p-1.5 space-y-1">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`flex gap-3 rounded-lg p-3 transition-colors ${
                    notif.type === "success"
                      ? "bg-emerald-50/60 hover:bg-emerald-50"
                      : notif.type === "warning"
                        ? "bg-amber-50/60 hover:bg-amber-50"
                        : "bg-slate-50/60 hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      notif.type === "success"
                        ? "bg-emerald-100"
                        : notif.type === "warning"
                          ? "bg-amber-100"
                          : "bg-slate-100"
                    }`}
                  >
                    {notif.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground leading-tight">
                      {notif.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                      {notif.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-8 px-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                <Info className="h-5 w-5 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Sin notificaciones</p>
              <p className="text-xs text-muted-foreground/70">Estás al día</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

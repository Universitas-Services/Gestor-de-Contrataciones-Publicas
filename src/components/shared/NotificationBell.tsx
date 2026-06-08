"use client";

import Link from "next/link";
import { Bell, CalendarDays, FileText, Info, AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useManualRequisitos } from "@/hooks/use-manual-requisitos";
import { useCronogramaAlertas } from "@/hooks/useCronogramaAlertas";
import { ROLE_ROUTES } from "@/lib/constants/routes";
import {
  getCronogramaAlertaDescription,
  getCronogramaAlertaExpedienteHref,
  getCronogramaAlertaTitle,
} from "@/lib/utils/cronogramaAlertaUtils";
import type { UserRole } from "@/types/role.types";

interface NotificationItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  type: "success" | "warning" | "info" | "cronograma";
  href?: string;
  actionLabel?: string;
  onDismiss?: () => void;
}

interface NotificationBellProps {
  userRole?: UserRole;
}

const MANUAL_NOTIFICATION_ROLES: UserRole[] = ["admin_ente", "ejecutor"];
const CRONOGRAMA_ALERT_ROLES: UserRole[] = ["admin_ente"];

function getNotificationStyles(type: NotificationItem["type"]) {
  switch (type) {
    case "success":
      return {
        container: "bg-emerald-50/60 hover:bg-emerald-50",
        iconWrap: "bg-emerald-100",
      };
    case "warning":
      return {
        container: "bg-doc-warning-bg/80 hover:bg-doc-warning-bg",
        iconWrap: "bg-doc-warning-border/40",
      };
    case "cronograma":
      return {
        container: "bg-cronograma-alert-bg/80 hover:bg-cronograma-alert-bg",
        iconWrap: "bg-cronograma-alert-border/30",
      };
    default:
      return {
        container: "bg-slate-50/60 hover:bg-slate-50",
        iconWrap: "bg-slate-100",
      };
  }
}

export function NotificationBell({ userRole }: NotificationBellProps) {
  const shouldCheckManual = userRole ? MANUAL_NOTIFICATION_ROLES.includes(userRole) : false;
  const shouldCheckCronograma = userRole ? CRONOGRAMA_ALERT_ROLES.includes(userRole) : false;

  const {
    estado,
    manualExiste,
    manualVigente,
    isLoading: manualLoading,
  } = useManualRequisitos(shouldCheckManual);
  const {
    pendientes: cronogramaPendientes,
    isLoading: cronogramaLoading,
    resolver,
    refetch,
  } = useCronogramaAlertas(shouldCheckCronograma);

  const notifications: NotificationItem[] = [];

  if (shouldCheckManual && !manualLoading && estado) {
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

    if (manualExiste === true && manualVigente?.estaDesactualizado === true) {
      notifications.push({
        id: "manual-desactualizado",
        icon: <AlertTriangle className="h-4 w-4 text-doc-warning" />,
        title: "Manual desactualizado",
        description:
          manualVigente.motivoDesactualizacion ??
          "Se han realizado cambios en la configuración del ente. Por favor, genere un nuevo manual.",
        type: "warning",
      });
    }
  }

  cronogramaPendientes.forEach((alerta) => {
    notifications.push({
      id: `cronograma-${alerta.id}`,
      icon: <CalendarDays className="h-4 w-4 text-cronograma-alert-icon" />,
      title: getCronogramaAlertaTitle(alerta),
      description: getCronogramaAlertaDescription(alerta),
      type: "cronograma",
      href: getCronogramaAlertaExpedienteHref(alerta) ?? ROLE_ROUTES.admin_ente.diasNoLaborables,
      actionLabel: getCronogramaAlertaExpedienteHref(alerta) ? "Ver expediente" : "Ir a feriados",
      onDismiss: async () => {
        try {
          await resolver(alerta.id);
          toast.success("Alerta de cronograma descartada.");
          await refetch();
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Error al descartar alerta");
        }
      },
    });
  });

  const count = notifications.length;
  const isLoading =
    (shouldCheckManual && manualLoading) || (shouldCheckCronograma && cronogramaLoading);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notificaciones">
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
        className="w-80 overflow-hidden rounded-xl border-0 bg-popover/98 p-0 shadow-[0_14px_36px_rgba(15,23,42,0.14)] backdrop-blur sm:w-96"
        sideOffset={8}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <h4 className="text-sm font-semibold text-foreground">Notificaciones</h4>
          {count > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive/10 px-1.5 text-[10px] font-bold text-destructive">
              {count}
            </span>
          )}
        </div>

        <Separator className="bg-border/50" />

        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Cargando...</div>
          ) : notifications.length > 0 ? (
            <div className="p-1.5 space-y-1">
              {notifications.map((notif) => {
                const styles = getNotificationStyles(notif.type);
                return (
                  <div
                    key={notif.id}
                    className={`rounded-lg p-3 transition-colors ${styles.container}`}
                  >
                    <div className="flex gap-3">
                      <div
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${styles.iconWrap}`}
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
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {notif.href && (
                            <Link
                              href={notif.href}
                              className="text-xs font-semibold text-navy hover:underline"
                            >
                              {notif.actionLabel ?? "Ver detalle"}
                            </Link>
                          )}
                          {notif.onDismiss && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                              onClick={() => void notif.onDismiss?.()}
                            >
                              <X className="h-3.5 w-3.5 mr-1" />
                              Descartar
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
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

        {shouldCheckCronograma && cronogramaPendientes.length > 0 && (
          <>
            <Separator className="bg-border/50" />
            <div className="px-4 py-2">
              <Link
                href={ROLE_ROUTES.admin_ente.diasNoLaborables}
                className="text-xs font-medium text-navy hover:underline"
              >
                Gestionar días no laborables
              </Link>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

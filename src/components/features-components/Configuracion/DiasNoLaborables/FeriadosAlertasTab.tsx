"use client";

import { AlertTriangle, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CronogramaAlerta } from "@/types/cronogramaEnte.types";
import { resolverAlertaCronograma } from "@/services/cronogramaEnteService";
import {
  getCronogramaAlertaDescription,
  getCronogramaAlertaExpedienteHref,
  getCronogramaAlertaTitle,
} from "@/lib/utils/cronogramaAlertaUtils";
import { toast } from "sonner";
import Link from "next/link";
import { ROLE_ROUTES } from "@/lib/constants/routes";

interface FeriadosAlertasTabProps {
  alertas: CronogramaAlerta[];
  onResolved: () => void;
}

export function FeriadosAlertasTab({ alertas, onResolved }: FeriadosAlertasTabProps) {
  const pendientes = alertas.filter((a) => !a.resuelta);

  const handleResolve = async (id: string) => {
    try {
      await resolverAlertaCronograma(id);
      toast.success("Alerta marcada como resuelta.");
      onResolved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al resolver la alerta");
    }
  };

  if (pendientes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border-light bg-muted/20 px-6 py-16 text-center">
        <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        <div className="space-y-1">
          <p className="font-semibold text-heading-dark">Sin advertencias activas</p>
          <p className="text-sm text-text-muted-dark max-w-md">
            No hay conflictos pendientes entre feriados registrados y cronogramas de expedientes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-cronograma-alert-border bg-cronograma-alert-bg/60 overflow-hidden">
      <div className="flex items-center gap-3 border-b border-cronograma-alert-border/60 px-4 py-3 bg-cronograma-alert-bg">
        <AlertTriangle className="h-5 w-5 text-cronograma-alert-icon shrink-0" />
        <p className="font-semibold text-cronograma-alert-text">
          Advertencias activas ({pendientes.length})
        </p>
      </div>

      <ul className="divide-y divide-cronograma-alert-border/40 max-h-[min(70vh,640px)] overflow-y-auto">
        {pendientes.map((alerta) => {
          const href =
            getCronogramaAlertaExpedienteHref(alerta) ?? ROLE_ROUTES.admin_ente.calendarioEnte;
          const hasExpediente = Boolean(getCronogramaAlertaExpedienteHref(alerta));

          return (
            <li
              key={alerta.id}
              className="flex flex-col gap-3 px-4 py-4 text-sm text-cronograma-alert-text sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0 space-y-1">
                <p className="font-semibold text-heading-dark">
                  {getCronogramaAlertaTitle(alerta)}
                </p>
                <p>{getCronogramaAlertaDescription(alerta)}</p>
                <Link
                  href={href}
                  className="inline-block text-xs font-semibold text-navy hover:underline"
                >
                  {hasExpediente ? "Ver expediente" : "Ir al calendario del ente"}
                </Link>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 border-cronograma-alert-border text-cronograma-alert-text hover:bg-cronograma-alert-border/30"
                onClick={() => void handleResolve(alerta.id)}
              >
                <X className="h-4 w-4 mr-1" />
                Descartar
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

"use client";

import { DocumentUpload } from "@/components/features-components/ComplianceExpediente/DocumentUpload";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { SesionCompliance, TipoDocumento } from "@/types/compliance.types";
import { cn } from "@/lib/utils";
import { Paperclip } from "lucide-react";

interface Props {
  sesion: SesionCompliance;
  busy: boolean;
  readOnly?: boolean;
  onUpload: (tipo: TipoDocumento, file: File) => void;
}

export function AttachDocumentsControl({ sesion, busy, readOnly, onUpload }: Props) {
  const slots = sesion.checklist_slots;
  const canAttach = !readOnly && sesion.estado === "ACTIVA" && slots.length > 0;
  const pendientes = slots.filter((s) => !s.auditado).length;
  const listos = slots.filter((s) => s.auditado).length;

  if (!canAttach) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="relative h-12 w-12 shrink-0 border-border-light"
          title="Adjuntar documentos"
        >
          <Paperclip className="size-5 text-navy" />
          {pendientes > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-pendiente px-1 text-[9px] font-bold text-white">
              {pendientes}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="top"
        className="w-[340px] border-border-light bg-white p-4 shadow-md"
      >
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-heading-dark">Adjuntar documentos</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {listos} listo{listos === 1 ? "" : "s"} · {pendientes} pendiente
              {pendientes === 1 ? "" : "s"}
            </p>
          </div>

          {/* Leyenda compacta */}
          <div className="rounded-lg border border-border-light bg-slate-bg p-2.5 space-y-2">
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <span className="size-2 rounded-full bg-navy" />
                Cargado
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="size-2 rounded-full border border-border-light bg-white" />
                Falta
              </span>
            </div>
            <ul className="max-h-36 space-y-1 overflow-y-auto">
              {slots.map((s) => (
                <li
                  key={s.tipo_documento}
                  className="flex items-start gap-2 text-[11px] leading-snug"
                >
                  <span
                    className={cn(
                      "mt-1 size-2 shrink-0 rounded-full",
                      s.auditado ? "bg-navy" : "border border-border-light bg-white"
                    )}
                  />
                  <span
                    className={cn(
                      s.auditado ? "text-heading-dark font-medium" : "text-muted-foreground"
                    )}
                  >
                    {s.descripcion || s.tipo_documento}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <DocumentUpload slots={slots} disabled={busy} uploading={busy} onUpload={onUpload} />
        </div>
      </PopoverContent>
    </Popover>
  );
}

"use client";

import { IoEyeOutline } from "react-icons/io5";

import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { OBS_MAX_LEN } from "@/lib/constants/calificacionLegalEvaluacion";
import type { ChecklistSiNo, RecaudoCotejoItem } from "@/types/evaluacionOferente.types";

interface RecaudoCotejoCardProps {
  index: number;
  item: RecaudoCotejoItem;
  consignado: ChecklistSiNo | undefined;
  observacion: string;
  obsAbierta: boolean;
  error?: boolean;
  readOnly?: boolean;
  onToggle: (valor: ChecklistSiNo) => void;
  onToggleObs: () => void;
  onChangeObs: (value: string) => void;
}

export function RecaudoCotejoCard({
  index,
  item,
  consignado,
  observacion,
  obsAbierta,
  error = false,
  readOnly = false,
  onToggle,
  onToggleObs,
  onChangeObs,
}: RecaudoCotejoCardProps) {
  const hasObs = observacion.trim().length > 0;

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm transition-all",
        error ? "border-destructive" : "border-slate-200 hover:border-slate-300"
      )}
    >
      <div className="flex min-h-[72px] items-center justify-between gap-3 p-4">
        <div className="min-w-0 flex-1 pr-2">
          <p className="text-[13px] font-bold leading-snug text-color-titulos">
            <span className="mr-1">{index}.</span> {item.pregunta}
          </p>
          <p className="mt-1 text-[11px] italic text-muted-foreground">
            Sobre N° {item.sobre}
            {item.eliminatorio ? " · Documento obligatorio" : " · Opcional"}
            {item.personalizado ? " · Personalizado" : ""}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => onToggle("SI")}
            disabled={readOnly}
            className={cn(
              "h-8 rounded border px-4 text-[11px] font-bold transition-colors",
              consignado === "SI"
                ? "border-navy bg-navy text-white"
                : "border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-500",
              readOnly && "cursor-not-allowed opacity-60"
            )}
          >
            SI
          </button>
          <button
            type="button"
            onClick={() => onToggle("NO")}
            disabled={readOnly}
            className={cn(
              "h-8 rounded border px-4 text-[11px] font-bold transition-colors",
              consignado === "NO"
                ? "border-navy bg-navy text-white"
                : "border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-500",
              readOnly && "cursor-not-allowed opacity-60"
            )}
          >
            NO
          </button>
          <button
            type="button"
            onClick={onToggleObs}
            disabled={readOnly}
            className={cn(
              "flex h-8 items-center gap-1.5 rounded border px-3 text-[11px] font-bold transition-colors",
              hasObs || obsAbierta
                ? "border-[var(--obs-button)] bg-[var(--obs-bg)] text-[var(--obs-button)]"
                : "border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-500",
              readOnly && "cursor-not-allowed opacity-60"
            )}
          >
            <IoEyeOutline className="h-[14px] w-[14px]" />
            OBSERVACIÓN
          </button>
        </div>
      </div>

      {obsAbierta ? (
        <div className="animate-in slide-in-from-top-2 px-4 pb-4">
          <Textarea
            value={observacion}
            disabled={readOnly}
            maxLength={OBS_MAX_LEN}
            rows={2}
            placeholder="Escriba su observación aquí..."
            onChange={(e) => onChangeObs(e.target.value)}
            className="min-h-16 resize-none border-[var(--obs-button)] bg-[var(--obs-bg)] text-[12px] italic text-color-titulos focus-visible:ring-[var(--obs-button)]"
          />
        </div>
      ) : null}

      {error ? (
        <p className="px-4 pb-3 text-[11px] font-medium text-destructive">Debe marcar SI o NO.</p>
      ) : null}
    </div>
  );
}

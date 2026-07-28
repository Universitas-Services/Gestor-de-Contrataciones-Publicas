"use client";

import { IoEyeOutline, IoSaveOutline } from "react-icons/io5";
import { toast } from "sonner";

import type { ChecklistSiNo } from "@/types/evaluacionFase3.types";

interface ChecklistQuestionRowProps {
  id: number;
  texto: string;
  respuesta?: ChecklistSiNo;
  observacion?: string;
  obsAbierta: boolean;
  readOnly?: boolean;
  onToggle: (id: number, valor: ChecklistSiNo) => void;
  onToggleObs: (id: number) => void;
  onChangeObs: (id: number, value: string) => void;
  onSaveObs: (id: number) => void;
}

export function ChecklistQuestionRow({
  id,
  texto,
  respuesta,
  observacion = "",
  obsAbierta,
  readOnly = false,
  onToggle,
  onToggleObs,
  onChangeObs,
  onSaveObs,
}: ChecklistQuestionRowProps) {
  const hasObs = !!observacion;

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all hover:border-slate-300">
      <div className="flex min-h-[72px] items-center justify-between p-4">
        <p className="flex-1 pr-4 text-[13px] font-bold leading-snug text-color-titulos">
          <span className="mr-1">{id}.</span> {texto}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => onToggle(id, "SI")}
            disabled={readOnly}
            className={`h-8 rounded border px-4 text-[11px] font-bold transition-colors ${
              respuesta === "SI"
                ? "border-navy bg-navy text-white"
                : "border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-500"
            } ${readOnly ? "cursor-not-allowed opacity-60" : ""}`}
          >
            SI
          </button>
          <button
            type="button"
            onClick={() => onToggle(id, "NO")}
            disabled={readOnly}
            className={`h-8 rounded border px-4 text-[11px] font-bold transition-colors ${
              respuesta === "NO"
                ? "border-navy bg-navy text-white"
                : "border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-500"
            } ${readOnly ? "cursor-not-allowed opacity-60" : ""}`}
          >
            NO
          </button>
          <button
            type="button"
            onClick={() => onToggleObs(id)}
            disabled={readOnly}
            className={`flex h-8 items-center gap-1.5 rounded border px-3 text-[11px] font-bold transition-colors ${
              hasObs || obsAbierta
                ? "border-[var(--obs-button)] bg-[var(--obs-bg)] text-[var(--obs-button)]"
                : "border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-500"
            } ${readOnly ? "cursor-not-allowed opacity-60" : ""}`}
          >
            <IoEyeOutline className="h-[14px] w-[14px]" />
            OBSERVACIÓN
          </button>
        </div>
      </div>

      {obsAbierta ? (
        <div className="animate-in slide-in-from-top-2 px-4 pb-4 pt-0">
          <div className="relative">
            <input
              value={observacion}
              onChange={(e) => onChangeObs(id, e.target.value)}
              disabled={readOnly}
              placeholder="Escriba su observación aquí..."
              className="w-full rounded-md border border-[var(--obs-button)] bg-[var(--obs-bg)] py-2.5 pl-3 pr-10 text-[12px] font-medium italic text-color-titulos focus:outline-none focus:ring-1 focus:ring-[var(--obs-button)] disabled:cursor-not-allowed disabled:opacity-70"
            />
            {!readOnly ? (
              <button
                type="button"
                onClick={() => {
                  onSaveObs(id);
                  toast.success("Observación guardada localmente");
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[var(--obs-button)] transition-colors hover:opacity-75"
                title="Guardar observación"
              >
                <IoSaveOutline className="h-[18px] w-[18px]" />
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

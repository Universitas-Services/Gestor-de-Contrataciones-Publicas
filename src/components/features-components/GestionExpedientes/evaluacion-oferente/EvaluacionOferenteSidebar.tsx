"use client";

import { Check, ClipboardCheck, FolderOpen, Lock, PieChart, Scale, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
  EvaluacionModuloId,
  ResultadoFinalEvaluacion,
} from "@/types/evaluacionOferente.types";
import type { ModuloGate } from "@/components/features-components/GestionExpedientes/evaluacion-oferente/hooks/useEvaluacionOferenteGate";

const MODULO_META: Record<EvaluacionModuloId, { label: string; Icon: typeof FolderOpen }> = {
  legal: { label: "Calificación Legal", Icon: FolderOpen },
  financiera: { label: "Calificación Financiera", Icon: Scale },
  tecnica: { label: "Calificación Técnica", Icon: ClipboardCheck },
  evaluacion: { label: "Evaluación Técnica y Económica", Icon: PieChart },
  promocion: { label: "Promoción Económica", Icon: Sparkles },
};

function ResultadoBadge({ resultado }: { resultado: ResultadoFinalEvaluacion }) {
  if (resultado === "descalificado") {
    return (
      <Badge className="border-0 bg-destructive/10 text-[11px] font-bold uppercase text-destructive">
        Descalificado
      </Badge>
    );
  }
  if (resultado === "calificado") {
    return (
      <Badge className="border-0 bg-success-bg text-[11px] font-bold uppercase text-success-text">
        Calificado
      </Badge>
    );
  }
  if (resultado === "en_evaluacion") {
    return (
      <Badge className="border-0 bg-doc-warning-bg text-[11px] font-bold uppercase text-amber-dark">
        En evaluación
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="text-[11px] font-bold uppercase">
      Pendiente
    </Badge>
  );
}

interface EvaluacionOferenteSidebarProps {
  gates: ModuloGate[];
  activeModulo: EvaluacionModuloId;
  resultadoFinal: ResultadoFinalEvaluacion;
  onSelect: (id: EvaluacionModuloId) => void;
}

export function EvaluacionOferenteSidebar({
  gates,
  activeModulo,
  resultadoFinal,
  onSelect,
}: EvaluacionOferenteSidebarProps) {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-l border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-4">
        <h3 className="text-sm font-bold text-color-titulos">Menú de evaluación</h3>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Complete los módulos en orden para calificar al oferente.
        </p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {gates.map((gate) => {
          const meta = MODULO_META[gate.id];
          const Icon = meta.Icon;
          const locked = !gate.unlocked;
          const active = gate.id === activeModulo && !locked;
          const showDivider = gate.id === "evaluacion";

          return (
            <div key={gate.id}>
              {showDivider ? <div className="my-3 border-t border-slate-200" /> : null}
              <button
                type="button"
                disabled={locked}
                title={
                  locked
                    ? "Debe aprobar la calificación anterior para habilitar este módulo"
                    : meta.label
                }
                onClick={() => onSelect(gate.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm transition-colors",
                  locked && "cursor-not-allowed text-muted-foreground opacity-50",
                  !locked && !active && "text-color-subtitulos hover:bg-slate-50",
                  active && "bg-navy/5 font-bold text-navy"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="min-w-0 flex-1 font-semibold">{meta.label}</span>
                {locked ? (
                  <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                ) : gate.completedOk ? (
                  <Check className="h-4 w-4 shrink-0 text-success-text" />
                ) : null}
              </button>
            </div>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-slate-200 px-4 py-4 text-center">
        <p className="mb-2 text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
          Resultado final
        </p>
        <ResultadoBadge resultado={resultadoFinal} />
      </div>
    </aside>
  );
}

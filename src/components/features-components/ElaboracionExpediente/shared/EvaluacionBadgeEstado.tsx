interface EvaluacionBadgeEstadoProps {
  calificado: boolean | null;
  /** Variante gestión: Pendiente / En Evaluación / Evaluado (pts) / Descalificado */
  variante?: "default" | "gestion";
  listaCotejoCompletada?: boolean;
  puntuacion?: number | null;
}

export function EvaluacionBadgeEstado({
  calificado,
  variante = "default",
  listaCotejoCompletada = false,
  puntuacion = null,
}: EvaluacionBadgeEstadoProps) {
  if (variante === "gestion") {
    if (calificado === true) {
      const pts =
        puntuacion !== null && !Number.isNaN(puntuacion)
          ? ` (${Math.round(puntuacion * 100) / 100} pts)`
          : "";
      return (
        <span className="inline-flex max-w-full items-center gap-1 truncate rounded-full bg-evaluado-bg px-2 py-0.5 text-[10px] font-semibold text-success-text">
          ● Evaluado{pts}
        </span>
      );
    }
    if (calificado === false) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-rechazado-bg px-2 py-0.5 text-[10px] font-semibold text-rechazado">
          ● Descalificado
        </span>
      );
    }
    if (listaCotejoCompletada) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
          ● En Evaluación
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
        ● Pendiente
      </span>
    );
  }

  if (calificado === true) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-evaluado-bg px-2 py-0.5 text-[11px] font-semibold text-success-text">
        ● Evaluado
      </span>
    );
  }
  if (calificado === false) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rechazado-bg px-2 py-0.5 text-[11px] font-semibold text-rechazado">
        ● Descalificado
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
      ● Por evaluar
    </span>
  );
}

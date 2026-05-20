interface EvaluacionBadgeEstadoProps {
  calificado: boolean | null;
}

export function EvaluacionBadgeEstado({ calificado }: EvaluacionBadgeEstadoProps) {
  if (calificado === true) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-evaluado-bg text-success-text">
        ● Evaluado
      </span>
    );
  }
  if (calificado === false) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rechazado-bg text-rechazado">
        ● Descalificado
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-muted text-muted-foreground border border-border">
      ● Por evaluar
    </span>
  );
}

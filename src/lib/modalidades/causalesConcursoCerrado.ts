export interface CausalConcursoCerrado {
  value: string;
  label: string;
  numeral: "1" | "2" | "3" | "4";
}

/** Causales Art. 85 LCP — Concurso Cerrado (Paso 2). */
export const CAUSALES_CONCURSO_CERRADO: CausalConcursoCerrado[] = [
  {
    value: "POR_MONTO_ESTIMADO",
    numeral: "1",
    label: "Por el monto estimado de la contratación (Num. 1).",
  },
  {
    value: "EQUIPOS_ESPECIALIZADOS",
    numeral: "2",
    label: "Adquisición de equipos altamente especializados (Num. 2).",
  },
  {
    value: "SEGURIDAD_DEFENSA",
    numeral: "3",
    label: "Razones de seguridad y defensa del Estado (Num. 3).",
  },
  {
    value: "CONCURSO_ABIERTO_DESIERTO",
    numeral: "4",
    label: "Procedimiento de Concurso Abierto declarado desierto (Num. 4).",
  },
];

export function getCausalCcByValue(value: string): CausalConcursoCerrado | undefined {
  return CAUSALES_CONCURSO_CERRADO.find((c) => c.value === value);
}

export interface CausalConsultaPrecios {
  value: string;
  label: string;
}

/** Causales Art. 96 LCP — Consulta de Precios (Paso 2). */
export const CAUSALES_CONSULTA_PRECIOS: CausalConsultaPrecios[] = [
  {
    value: "LIMITES_CUANTITATIVOS_UCAU",
    label:
      "Por encontrarse dentro de los límites cuantitativos en Unidades para el Cálculo Aritmético del Umbral Máximo y Mínimo (UCAU) establecidos en la Ley.",
  },
  {
    value: "PLAN_EXCEPCIONAL_INTERES_GENERAL",
    label:
      "Por razones de interés general en el marco de un Plan Excepcional aprobado por el Ejecutivo Nacional.",
  },
];

export function getCausalCpByValue(value: string): CausalConsultaPrecios | undefined {
  return CAUSALES_CONSULTA_PRECIOS.find((c) => c.value === value);
}

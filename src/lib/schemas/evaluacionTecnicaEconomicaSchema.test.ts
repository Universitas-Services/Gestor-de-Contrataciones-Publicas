import { describe, expect, it } from "vitest";

import {
  createDefaultEvaluacionTecnicaEconomicaValues,
  createEmptyCriterioEconomica,
  createEmptyCriterioTecnica,
  createEmptyRangoEconomica,
  createEmptyRangoTecnica,
  type EvaluacionTecnicaEconomicaFormValues,
} from "@/lib/constants/evaluacionTecnicaEconomica";
import {
  canSubmitEvaluacionTecnicaEconomica,
  getEvaluacionTecnicaEconomicaIssues,
  getTotalEconomica,
  getTotalMatriz,
  getTotalTecnica,
} from "@/lib/schemas/evaluacionTecnicaEconomicaSchema";

function validMatrix(): EvaluacionTecnicaEconomicaFormValues {
  const t1 = createEmptyCriterioTecnica();
  t1.criterioEvaluacionTecnicaAuAu = "Tiempo de entrega";
  t1.puntuacionCriterioEvaluacionTecnicaAuAu = 40;
  t1.descCriterioEvaluacionTecnicaAuAu = "Plazo de entrega de la oferta.";
  t1.rangos = [
    {
      ...createEmptyRangoTecnica(),
      rangoCriterioEvaluacionTecnicaAuAu: "Entrega en 15 días",
      puntuacionRangoCriterioEvaluacionTecnicaAuAu: 40,
    },
  ];

  const e1 = createEmptyCriterioEconomica();
  e1.criterioEvaluacionEconomicaAuAu = "Precio ofertado";
  e1.puntuacionCriterioEvaluacionEconomicaAuAu = 60;
  e1.descCriterioEvaluacionEconomicaAuAu = "Peso del precio en la matriz.";
  e1.rangos = [
    {
      ...createEmptyRangoEconomica(),
      rangoCriterioEvaluacionEconomicaAuAu: "Menor precio",
      puntuacionRangoCriterioEvaluacionEconomicaAuAu: 60,
    },
  ];

  return {
    criteriosTecnicos: [t1],
    puntuacionMinimaEvaluacionTecnicaAuAu: 30,
    criteriosEconomicos: [e1],
    puntuacionMinimaEvaluacionEconomicaAuAu: 40,
  };
}

describe("Evaluación técnica y económica — bolsa compartida", () => {
  it("vacío no puede enviarse", () => {
    expect(
      canSubmitEvaluacionTecnicaEconomica(createDefaultEvaluacionTecnicaEconomicaValues())
    ).toBe(false);
  });

  it("suma exacta 100 con ambas pestañas > 0 habilita submit", () => {
    const values = validMatrix();
    expect(getTotalTecnica(values)).toBe(40);
    expect(getTotalEconomica(values)).toBe(60);
    expect(getTotalMatriz(values)).toBe(100);
    expect(canSubmitEvaluacionTecnicaEconomica(values)).toBe(true);
  });

  it("suma distinta de 100 bloquea", () => {
    const values = validMatrix();
    values.criteriosTecnicos[0].puntuacionCriterioEvaluacionTecnicaAuAu = 30;
    expect(getTotalMatriz(values)).toBe(90);
    expect(canSubmitEvaluacionTecnicaEconomica(values)).toBe(false);
    expect(
      getEvaluacionTecnicaEconomicaIssues(values).some((m) => m.includes("exactamente 100"))
    ).toBe(true);
  });

  it("100/0 (solo técnica) bloquea", () => {
    const values = validMatrix();
    values.criteriosTecnicos[0].puntuacionCriterioEvaluacionTecnicaAuAu = 99;
    values.criteriosEconomicos = [];
    expect(canSubmitEvaluacionTecnicaEconomica(values)).toBe(false);
  });

  it("0/100 (solo económica) bloquea", () => {
    const values = validMatrix();
    values.criteriosTecnicos = [];
    values.criteriosEconomicos[0].puntuacionCriterioEvaluacionEconomicaAuAu = 99;
    expect(canSubmitEvaluacionTecnicaEconomica(values)).toBe(false);
  });

  it("criterio individual con 100 puntos bloquea", () => {
    const values = validMatrix();
    values.criteriosTecnicos[0].puntuacionCriterioEvaluacionTecnicaAuAu = 100;
    values.criteriosEconomicos[0].puntuacionCriterioEvaluacionEconomicaAuAu = 0;
    expect(canSubmitEvaluacionTecnicaEconomica(values)).toBe(false);
    expect(
      getEvaluacionTecnicaEconomicaIssues(values).some((m) => m.includes("no puede ser 100"))
    ).toBe(true);
  });

  it("issues no incluyen mensajes técnicos de Zod en inglés", () => {
    const values = createDefaultEvaluacionTecnicaEconomicaValues();
    const issues = getEvaluacionTecnicaEconomicaIssues(values);
    expect(issues.some((m) => /Too small/i.test(m))).toBe(false);
    expect(
      issues.some((m) => m.includes("criterio técnico") || m.includes("criterio económico"))
    ).toBe(true);
  });

  it("rango con puntaje > padre bloquea", () => {
    const values = validMatrix();
    values.criteriosTecnicos[0].rangos[0].puntuacionRangoCriterioEvaluacionTecnicaAuAu = 50;
    expect(canSubmitEvaluacionTecnicaEconomica(values)).toBe(false);
    expect(
      getEvaluacionTecnicaEconomicaIssues(values).some((m) => m.includes("no puede superar"))
    ).toBe(true);
  });

  it("umbral técnico mayor al total técnico bloquea", () => {
    const values = validMatrix();
    values.puntuacionMinimaEvaluacionTecnicaAuAu = 50;
    expect(canSubmitEvaluacionTecnicaEconomica(values)).toBe(false);
  });
});

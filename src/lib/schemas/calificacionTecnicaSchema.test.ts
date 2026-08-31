import { describe, expect, it } from "vitest";

import {
  createEmptyCriterio,
  createEmptyRango,
  createDefaultCalificacionTecnicaValues,
  type CalificacionTecnicaFormValues,
} from "@/lib/constants/calificacionTecnica";
import {
  canSubmitCalificacionTecnica,
  getCalificacionTecnicaIssues,
  getTotalPonderacion,
} from "@/lib/schemas/calificacionTecnicaSchema";

function validMatrix(): CalificacionTecnicaFormValues {
  const c1 = createEmptyCriterio();
  c1.criterioCalificacionTecnicaAuAu = "Experiencia";
  c1.puntuacionCriterioCalificacionTecnicaAuAu = 60;
  c1.descCriterioCalificacionTecnicaAuAu = "Experiencia en obras similares.";
  c1.rangos = [
    {
      ...createEmptyRango(),
      rangoCriterioCalificacionTecnicaAuAu: ">= 10 años",
      puntuacionRangoCriterioCalificacionTecnicaAuAu: 60,
    },
    {
      ...createEmptyRango(),
      rangoCriterioCalificacionTecnicaAuAu: "5 a 9 años",
      puntuacionRangoCriterioCalificacionTecnicaAuAu: 30,
    },
  ];

  const c2 = createEmptyCriterio();
  c2.criterioCalificacionTecnicaAuAu = "Personal clave";
  c2.puntuacionCriterioCalificacionTecnicaAuAu = 40;
  c2.descCriterioCalificacionTecnicaAuAu = "Perfil académico del personal.";
  c2.rangos = [
    {
      ...createEmptyRango(),
      rangoCriterioCalificacionTecnicaAuAu: "Ingeniero + 5 años",
      puntuacionRangoCriterioCalificacionTecnicaAuAu: 40,
    },
  ];

  return {
    criterios: [c1, c2],
    puntuacionMinimaCalifTecnicaAuAu: 70,
  };
}

describe("Calificación técnica — total y submit", () => {
  it("vacío no puede enviarse", () => {
    expect(canSubmitCalificacionTecnica(createDefaultCalificacionTecnicaValues())).toBe(false);
  });

  it("suma exacta 100 con rangos válidos habilita submit", () => {
    const values = validMatrix();
    expect(getTotalPonderacion(values)).toBe(100);
    expect(canSubmitCalificacionTecnica(values)).toBe(true);
  });

  it("suma distinta de 100 bloquea", () => {
    const values = validMatrix();
    values.criterios[0].puntuacionCriterioCalificacionTecnicaAuAu = 50;
    expect(getTotalPonderacion(values)).toBe(90);
    expect(canSubmitCalificacionTecnica(values)).toBe(false);
    expect(getCalificacionTecnicaIssues(values).some((m) => m.includes("exactamente 100"))).toBe(
      true
    );
  });

  it("rango con puntaje > ponderación padre bloquea", () => {
    const values = validMatrix();
    values.criterios[1].rangos[0].puntuacionRangoCriterioCalificacionTecnicaAuAu = 50;
    expect(canSubmitCalificacionTecnica(values)).toBe(false);
    expect(getCalificacionTecnicaIssues(values).some((m) => m.includes("no puede superar"))).toBe(
      true
    );
  });

  it("umbral mayor al total bloquea", () => {
    const values = validMatrix();
    values.puntuacionMinimaCalifTecnicaAuAu = 101;
    expect(canSubmitCalificacionTecnica(values)).toBe(false);
  });

  it("criterio sin nombre bloquea aunque sume 100", () => {
    const values = validMatrix();
    values.criterios[0].criterioCalificacionTecnicaAuAu = "   ";
    expect(canSubmitCalificacionTecnica(values)).toBe(false);
  });

  it("ponderación 0 en un criterio bloquea", () => {
    const values = validMatrix();
    values.criterios[0].puntuacionCriterioCalificacionTecnicaAuAu = 0;
    values.criterios[1].puntuacionCriterioCalificacionTecnicaAuAu = 100;
    expect(canSubmitCalificacionTecnica(values)).toBe(false);
  });
});

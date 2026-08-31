import { describe, expect, it } from "vitest";

import {
  CALIFICACION_FINANCIERA_SUMA_EXCEDIDA,
  createDefaultCalificacionFinancieraValues,
  getTotalPuntajeMaximoActivos,
  SNC_DEFAULTS,
  type CalificacionFinancieraFormValues,
  type TresRangosValues,
} from "@/lib/constants/calificacionFinanciera";
import {
  canSubmitCalificacionFinanciera,
  getCalificacionFinancieraIssues,
} from "@/lib/schemas/calificacionFinancieraSchema";

function withSncPuntajes(
  block: TresRangosValues,
  snc: (typeof SNC_DEFAULTS)["solvencia"]
): TresRangosValues {
  return {
    ...block,
    puntajeMaximo: snc.puntajeMaximo,
    puntajeMedio: snc.puntajeMedio,
    puntajeMinimo: snc.puntajeMinimo,
  };
}

function withActive(
  patch: Partial<CalificacionFinancieraFormValues>
): CalificacionFinancieraFormValues {
  const base = createDefaultCalificacionFinancieraValues();
  return {
    ...base,
    ...patch,
    solvencia: patch.solvencia ?? withSncPuntajes(base.solvencia, SNC_DEFAULTS.solvencia),
    rotacion: patch.rotacion ?? withSncPuntajes(base.rotacion, SNC_DEFAULTS.rotacion),
    rendimiento: patch.rendimiento ?? withSncPuntajes(base.rendimiento, SNC_DEFAULTS.rendimiento),
    rentabilidad:
      patch.rentabilidad ?? withSncPuntajes(base.rentabilidad, SNC_DEFAULTS.rentabilidad),
    endeudamiento:
      patch.endeudamiento ?? withSncPuntajes(base.endeudamiento, SNC_DEFAULTS.endeudamiento),
    puntajeMaximoDescapitalAuAu:
      patch.puntajeMaximoDescapitalAuAu !== undefined
        ? patch.puntajeMaximoDescapitalAuAu
        : SNC_DEFAULTS.descapitalPuntaje,
  };
}

function breakAscendente(base: TresRangosValues): TresRangosValues {
  return { ...base, rangoMaximo: base.rangoMedioHasta };
}

function invertMedioAscendente(base: TresRangosValues): TresRangosValues {
  return {
    ...base,
    rangoMedioDesde: base.rangoMedioHasta + 0.01,
    rangoMedioHasta: base.rangoMedioDesde,
  };
}

function breakPuntajes(base: TresRangosValues): TresRangosValues {
  return { ...base, puntajeMinimo: (base.puntajeMaximo ?? 0) + 1 };
}

function breakInverso(base: TresRangosValues): TresRangosValues {
  return { ...base, rangoMaximo: base.rangoMedioDesde };
}

describe("Calificación financiera — defaults SNC", () => {
  it("defaults de formulario dejan puntajes vacíos y rangos SNC", () => {
    const values = createDefaultCalificacionFinancieraValues();
    expect(values.puntajeMaximoDescapitalAuAu).toBeNull();
    expect(values.solvencia.puntajeMaximo).toBeNull();
    expect(values.solvencia.rangoMaximo).toBe(SNC_DEFAULTS.solvencia.rangoMaximo);
    expect(values.rotacion.rangoMaximo).toBe(SNC_DEFAULTS.rotacion.rangoMaximo);
  });

  it("defaults SNC ascendentes cumplen máximo > hasta ≥ desde ≥ mínimo", () => {
    for (const key of ["solvencia", "rotacion", "rendimiento", "rentabilidad"] as const) {
      const v = SNC_DEFAULTS[key];
      expect(v.rangoMaximo > v.rangoMedioHasta).toBe(true);
      expect(v.rangoMedioHasta >= v.rangoMedioDesde).toBe(true);
      expect(v.rangoMedioDesde >= v.rangoMinimo).toBe(true);
      expect(v.puntajeMaximo >= v.puntajeMedio && v.puntajeMedio >= v.puntajeMinimo).toBe(true);
    }
  });

  it("default endeudamiento cumple óptimo < desde ≤ hasta ≤ deficiente", () => {
    const v = SNC_DEFAULTS.endeudamiento;
    expect(v.rangoMaximo < v.rangoMedioDesde).toBe(true);
    expect(v.rangoMedioDesde <= v.rangoMedioHasta).toBe(true);
    expect(v.rangoMedioHasta <= v.rangoMinimo).toBe(true);
  });

  it("valores sugeridos SNC coinciden con la documentación", () => {
    expect(SNC_DEFAULTS.solvencia).toMatchObject({
      rangoMaximo: 1.1,
      rangoMedioDesde: 1.0,
      rangoMedioHasta: 1.09,
      rangoMinimo: 1.0,
    });
    expect(SNC_DEFAULTS.rotacion).toMatchObject({
      rangoMaximo: 12,
      rangoMedioDesde: 6,
      rangoMedioHasta: 11.99,
      rangoMinimo: 6,
    });
    expect(SNC_DEFAULTS.rendimiento).toMatchObject({
      rangoMaximo: 0.05,
      rangoMedioDesde: 0.01,
      rangoMedioHasta: 0.0499,
      rangoMinimo: 0.01,
    });
    expect(SNC_DEFAULTS.rentabilidad).toMatchObject({
      rangoMaximo: 0.1,
      rangoMedioDesde: 0.02,
      rangoMedioHasta: 0.0999,
      rangoMinimo: 0.02,
    });
    expect(SNC_DEFAULTS.endeudamiento).toMatchObject({
      rangoMaximo: 0.7,
      rangoMedioDesde: 0.71,
      rangoMedioHasta: 1.2,
      rangoMinimo: 1.2,
    });
  });
});

describe("Calificación financiera — canSubmit / rangos", () => {
  it("neutro: botón deshabilitado (sin criterio en SÍ)", () => {
    expect(canSubmitCalificacionFinanciera(createDefaultCalificacionFinancieraValues())).toBe(
      false
    );
  });

  it("SÍ sin puntajes completados bloquea", () => {
    const values = createDefaultCalificacionFinancieraValues();
    values.criterioCalifFinanDescapitalAuAu = true;
    expect(canSubmitCalificacionFinanciera(values)).toBe(false);
  });

  it("descapitalización SÍ + puntaje válido habilita submit", () => {
    const values = withActive({
      criterioCalifFinanDescapitalAuAu: true,
      puntajeMaximoDescapitalAuAu: 20,
    });
    expect(canSubmitCalificacionFinanciera(values)).toBe(true);
  });

  it("descapitalización SÍ + puntaje fuera de 0–100 bloquea", () => {
    const values = withActive({
      criterioCalifFinanDescapitalAuAu: true,
      puntajeMaximoDescapitalAuAu: 120,
    });
    expect(canSubmitCalificacionFinanciera(values)).toBe(false);
  });

  it.each([
    ["solvencia", "criterioCalifFinanSolvenciaAuAu"],
    ["rotacion", "criterioCalifFinanRotacionAuAu"],
    ["rendimiento", "criterioCalifFinanRendimientoAuAu"],
    ["rentabilidad", "criterioCalifFinanRentabilidadAuAu"],
  ] as const)("%s SÍ con rangos SNC y puntajes completos habilita submit", (_key, toggle) => {
    const values = withActive({ [toggle]: true });
    expect(canSubmitCalificacionFinanciera(values)).toBe(true);
  });

  it("endeudamiento SÍ con rangos SNC y puntajes completos habilita submit", () => {
    const values = withActive({ criterioCalifFinanEndeudamientoAuAu: true });
    expect(canSubmitCalificacionFinanciera(values)).toBe(true);
  });

  it("ascendente: rechaza máximo ≤ hasta", () => {
    const values = withActive({
      criterioCalifFinanSolvenciaAuAu: true,
      solvencia: breakAscendente(
        withSncPuntajes(
          createDefaultCalificacionFinancieraValues().solvencia,
          SNC_DEFAULTS.solvencia
        )
      ),
    });
    expect(canSubmitCalificacionFinanciera(values)).toBe(false);
    expect(getCalificacionFinancieraIssues(values).some((m) => m.includes("rangos"))).toBe(true);
  });

  it("ascendente: rechaza desde > hasta", () => {
    const values = withActive({
      criterioCalifFinanRotacionAuAu: true,
      rotacion: invertMedioAscendente(
        withSncPuntajes(createDefaultCalificacionFinancieraValues().rotacion, SNC_DEFAULTS.rotacion)
      ),
    });
    expect(canSubmitCalificacionFinanciera(values)).toBe(false);
  });

  it("ascendente: rechaza puntajes no decrecientes", () => {
    const values = withActive({
      criterioCalifFinanRendimientoAuAu: true,
      rendimiento: breakPuntajes(
        withSncPuntajes(
          createDefaultCalificacionFinancieraValues().rendimiento,
          SNC_DEFAULTS.rendimiento
        )
      ),
    });
    expect(canSubmitCalificacionFinanciera(values)).toBe(false);
    expect(getCalificacionFinancieraIssues(values).some((m) => m.includes("puntajes"))).toBe(true);
  });

  it("inverso: rechaza óptimo ≥ desde", () => {
    const values = withActive({
      criterioCalifFinanEndeudamientoAuAu: true,
      endeudamiento: breakInverso(
        withSncPuntajes(
          createDefaultCalificacionFinancieraValues().endeudamiento,
          SNC_DEFAULTS.endeudamiento
        )
      ),
    });
    expect(canSubmitCalificacionFinanciera(values)).toBe(false);
    expect(getCalificacionFinancieraIssues(values).some((m) => m.includes("inversos"))).toBe(true);
  });

  it("inverso: rechaza hasta > deficiente", () => {
    const values = withActive({
      criterioCalifFinanEndeudamientoAuAu: true,
      endeudamiento: {
        ...withSncPuntajes(
          createDefaultCalificacionFinancieraValues().endeudamiento,
          SNC_DEFAULTS.endeudamiento
        ),
        rangoMedioHasta: 1.5,
        rangoMinimo: 1.2,
      },
    });
    expect(canSubmitCalificacionFinanciera(values)).toBe(false);
  });

  it("un criterio SÍ inválido bloquea aunque otro SÍ sea válido", () => {
    const values = withActive({
      criterioCalifFinanDescapitalAuAu: true,
      puntajeMaximoDescapitalAuAu: 15,
      criterioCalifFinanSolvenciaAuAu: true,
      solvencia: breakAscendente(
        withSncPuntajes(
          createDefaultCalificacionFinancieraValues().solvencia,
          SNC_DEFAULTS.solvencia
        )
      ),
    });
    expect(canSubmitCalificacionFinanciera(values)).toBe(false);
  });

  it("criterios en NO/neutro no exigen validación de rangos", () => {
    const values = withActive({
      criterioCalifFinanDescapitalAuAu: true,
      puntajeMaximoDescapitalAuAu: 10,
      criterioCalifFinanSolvenciaAuAu: false,
      solvencia: breakAscendente(
        withSncPuntajes(
          createDefaultCalificacionFinancieraValues().solvencia,
          SNC_DEFAULTS.solvencia
        )
      ),
      criterioCalifFinanEndeudamientoAuAu: undefined,
      endeudamiento: breakInverso(
        withSncPuntajes(
          createDefaultCalificacionFinancieraValues().endeudamiento,
          SNC_DEFAULTS.endeudamiento
        )
      ),
    });
    expect(canSubmitCalificacionFinanciera(values)).toBe(true);
  });

  it("puntuación mínima inválida bloquea aunque haya criterio OK", () => {
    const values = withActive({
      criterioCalifFinanDescapitalAuAu: true,
      puntajeMaximoDescapitalAuAu: 10,
      puntuacionMinimaCalifFinancieraAuAu: 0,
    });
    expect(canSubmitCalificacionFinanciera(values)).toBe(false);
  });

  it("suma de máximos activos > 100 bloquea submit", () => {
    const values = withActive({
      criterioCalifFinanDescapitalAuAu: true,
      puntajeMaximoDescapitalAuAu: 40,
      criterioCalifFinanSolvenciaAuAu: true,
      solvencia: {
        ...withSncPuntajes(
          createDefaultCalificacionFinancieraValues().solvencia,
          SNC_DEFAULTS.solvencia
        ),
        puntajeMaximo: 40,
      },
      criterioCalifFinanRotacionAuAu: true,
      rotacion: {
        ...withSncPuntajes(
          createDefaultCalificacionFinancieraValues().rotacion,
          SNC_DEFAULTS.rotacion
        ),
        puntajeMaximo: 30,
      },
    });
    expect(getTotalPuntajeMaximoActivos(values)).toBe(110);
    expect(canSubmitCalificacionFinanciera(values)).toBe(false);
    expect(getCalificacionFinancieraIssues(values)).toContain(
      CALIFICACION_FINANCIERA_SUMA_EXCEDIDA
    );
  });

  it("suma de máximos activos = 100 habilita submit", () => {
    const values = withActive({
      criterioCalifFinanDescapitalAuAu: true,
      puntajeMaximoDescapitalAuAu: 20,
      criterioCalifFinanSolvenciaAuAu: true,
      solvencia: {
        ...withSncPuntajes(
          createDefaultCalificacionFinancieraValues().solvencia,
          SNC_DEFAULTS.solvencia
        ),
        puntajeMaximo: 40,
        puntajeMedio: 20,
        puntajeMinimo: 0,
      },
      criterioCalifFinanRotacionAuAu: true,
      rotacion: {
        ...withSncPuntajes(
          createDefaultCalificacionFinancieraValues().rotacion,
          SNC_DEFAULTS.rotacion
        ),
        puntajeMaximo: 40,
        puntajeMedio: 20,
        puntajeMinimo: 0,
      },
    });
    expect(getTotalPuntajeMaximoActivos(values)).toBe(100);
    expect(canSubmitCalificacionFinanciera(values)).toBe(true);
  });

  it("cinco criterios a 20 c/u (=100) habilitan; seis (=120) bloquean", () => {
    const five = withActive({
      criterioCalifFinanDescapitalAuAu: true,
      criterioCalifFinanSolvenciaAuAu: true,
      criterioCalifFinanRotacionAuAu: true,
      criterioCalifFinanRendimientoAuAu: true,
      criterioCalifFinanRentabilidadAuAu: true,
    });
    expect(getTotalPuntajeMaximoActivos(five)).toBe(100);
    expect(canSubmitCalificacionFinanciera(five)).toBe(true);

    const six = withActive({
      criterioCalifFinanDescapitalAuAu: true,
      criterioCalifFinanSolvenciaAuAu: true,
      criterioCalifFinanRotacionAuAu: true,
      criterioCalifFinanRendimientoAuAu: true,
      criterioCalifFinanRentabilidadAuAu: true,
      criterioCalifFinanEndeudamientoAuAu: true,
    });
    expect(getTotalPuntajeMaximoActivos(six)).toBe(120);
    expect(canSubmitCalificacionFinanciera(six)).toBe(false);
  });
});

describe("Calificación financiera — fórmulas doc vs UI", () => {
  it("fórmula rotación del doc = máximo > hasta ≥ desde ≥ mínimo", () => {
    const v = SNC_DEFAULTS.rotacion;
    const docOk =
      v.rangoMaximo > v.rangoMedioHasta &&
      v.rangoMedioHasta >= v.rangoMedioDesde &&
      v.rangoMedioDesde >= v.rangoMinimo;
    expect(docOk).toBe(true);
  });

  it("fórmula endeudamiento del doc = óptimo < desde ≤ hasta ≤ deficiente", () => {
    const v = SNC_DEFAULTS.endeudamiento;
    const docOk =
      v.rangoMaximo < v.rangoMedioDesde &&
      v.rangoMedioDesde <= v.rangoMedioHasta &&
      v.rangoMedioHasta <= v.rangoMinimo;
    expect(docOk).toBe(true);
  });

  it("fórmula literal de Solvencia en doc (medio_1≥medio_2 y >mínimo) NO cuadra con SNC+UI", () => {
    const v = SNC_DEFAULTS.solvencia;
    const literalDoc =
      v.rangoMaximo > v.rangoMedioDesde &&
      v.rangoMedioDesde >= v.rangoMedioHasta &&
      v.rangoMedioHasta > v.rangoMinimo;
    expect(literalDoc).toBe(false);
  });
});

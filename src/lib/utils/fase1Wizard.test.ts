import { describe, expect, it } from "vitest";

import { shouldShowBudgetStepOnEntry } from "@/lib/utils/fase1Wizard";

describe("shouldShowBudgetStepOnEntry", () => {
  it("muestra el paso de presupuesto cuando el usuario entra por primera vez sin items", () => {
    expect(
      shouldShowBudgetStepOnEntry({
        isEditMode: false,
        hasPersistedItems: false,
      })
    ).toBe(true);
  });

  it("oculta el paso de presupuesto al reingresar si ya existian items guardados", () => {
    expect(
      shouldShowBudgetStepOnEntry({
        isEditMode: false,
        hasPersistedItems: true,
      })
    ).toBe(false);
  });

  it("oculta el paso de presupuesto cuando la fase 1 ya esta en modo edicion", () => {
    expect(
      shouldShowBudgetStepOnEntry({
        isEditMode: true,
        hasPersistedItems: false,
      })
    ).toBe(false);
  });
});

import { describe, expect, it } from "vitest";

import { getFase1DynamicFieldCopy } from "@/lib/constants/fase1";

describe("getFase1DynamicFieldCopy", () => {
  it("usa el copy de servicios para detallesTecnicosCalidad", () => {
    expect(getFase1DynamicFieldCopy("detallesTecnicosCalidad", "SERVICIOS")).toMatchObject({
      label: expect.stringContaining("servicios a contratar"),
    });
  });

  it("usa el copy de obras para alcanceCantidadesObra", () => {
    expect(getFase1DynamicFieldCopy("alcanceCantidadesObra", "OBRAS")).toMatchObject({
      label: expect.stringContaining("cantidades de obra"),
    });
  });
});

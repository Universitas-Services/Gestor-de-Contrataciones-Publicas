import { describe, expect, it } from "vitest";

import {
  clausulaOrdinalApiValue,
  clausulaOrdinalLabel,
  parseClausulaOrdinalOrder,
} from "@/lib/utils/clausulaOrdinales";

describe("clausulaOrdinales", () => {
  it("etiqueta UI en mayúsculas femeninas", () => {
    expect(clausulaOrdinalLabel(1)).toBe("PRIMERA");
    expect(clausulaOrdinalLabel(2)).toBe("SEGUNDA");
    expect(clausulaOrdinalLabel(3)).toBe("TERCERA");
  });

  it("API guarda ordinal femenino en minúsculas", () => {
    expect(clausulaOrdinalApiValue(1)).toBe("primera");
    expect(clausulaOrdinalApiValue(2)).toBe("segunda");
    expect(clausulaOrdinalApiValue(3)).toBe("tercera");
    expect(clausulaOrdinalApiValue(7)).toBe("septima");
    expect(clausulaOrdinalApiValue(10)).toBe("decima");
  });

  it("parsea número legacy y texto ordinal", () => {
    expect(parseClausulaOrdinalOrder(3, 1)).toBe(3);
    expect(parseClausulaOrdinalOrder("3", 1)).toBe(3);
    expect(parseClausulaOrdinalOrder("primera", 9)).toBe(1);
    expect(parseClausulaOrdinalOrder("SEGUNDA", 9)).toBe(2);
    expect(parseClausulaOrdinalOrder("décima tercera", 9)).toBe(13);
  });
});

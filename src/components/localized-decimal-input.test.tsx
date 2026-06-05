import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LocalizedDecimalInput } from "@/components/localized-decimal-input";

describe("LocalizedDecimalInput", () => {
  it("usa formato bancario escribiendo desde la derecha de la coma", () => {
    const handleValueChange = vi.fn();

    render(<LocalizedDecimalInput onValueChange={handleValueChange} />);

    const input = screen.getByRole("textbox");

    expect(input).toHaveValue("0,00");

    fireEvent.change(input, { target: { value: "0,001" } });
    expect(input).toHaveValue("0,01");

    fireEvent.change(input, { target: { value: "0,012" } });
    expect(input).toHaveValue("0,12");

    fireEvent.change(input, { target: { value: "0,123" } });
    expect(input).toHaveValue("1,23");

    fireEvent.change(input, { target: { value: "1,234" } });
    expect(input).toHaveValue("12,34");
    expect(handleValueChange).toHaveBeenLastCalledWith("12,34");
  });

  it("agrega separadores de miles automaticamente", () => {
    render(<LocalizedDecimalInput />);

    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "1234567" } });

    expect(input).toHaveValue("12.345,67");
  });

  it("soporta enteros con el mismo patron bancario para cantidades de dias", () => {
    const handleValueChange = vi.fn();

    render(
      <LocalizedDecimalInput
        fractionDigits={0}
        outputMode="raw"
        onValueChange={handleValueChange}
      />
    );

    const input = screen.getByRole("textbox");

    expect(input).toHaveValue("0");

    fireEvent.change(input, { target: { value: "3" } });
    expect(input).toHaveValue("3");

    fireEvent.change(input, { target: { value: "30" } });
    expect(input).toHaveValue("30");
    expect(handleValueChange).toHaveBeenLastCalledWith("30");
  });
});

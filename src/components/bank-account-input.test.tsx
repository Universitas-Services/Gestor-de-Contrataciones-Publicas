import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { BankAccountInput } from "@/components/bank-account-input";

describe("BankAccountInput", () => {
  it("arma la cuenta completa con guiones mientras el usuario escribe", () => {
    const handleValueChange = vi.fn();

    render(<BankAccountInput onValueChange={handleValueChange} />);

    const inputs = screen.getAllByRole("textbox");

    fireEvent.change(inputs[0], { target: { value: "0102" } });
    fireEvent.change(inputs[1], { target: { value: "0123" } });
    fireEvent.change(inputs[2], { target: { value: "45" } });
    fireEvent.change(inputs[3], { target: { value: "1234567890" } });

    expect(handleValueChange).toHaveBeenLastCalledWith("0102-0123-45-1234567890");
  });

  it("distribuye automaticamente los digitos al pegar la cuenta completa", () => {
    const handleValueChange = vi.fn();

    render(<BankAccountInput onValueChange={handleValueChange} />);

    const inputs = screen.getAllByRole("textbox");

    fireEvent.paste(inputs[0], {
      clipboardData: {
        getData: () => "0102-0123-45-1234567890",
      },
    });

    expect(inputs[0]).toHaveValue("0102");
    expect(inputs[1]).toHaveValue("0123");
    expect(inputs[2]).toHaveValue("45");
    expect(inputs[3]).toHaveValue("1234567890");
    expect(handleValueChange).toHaveBeenLastCalledWith("0102-0123-45-1234567890");
  });

  it("permite editar un segmento ya lleno sin saltar al siguiente input", () => {
    render(<BankAccountInput value="1111-1111-11-1234567890" />);

    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];

    inputs[0].focus();
    inputs[0].setSelectionRange(0, inputs[0].value.length);
    fireEvent.change(inputs[0], { target: { value: "2222" } });

    expect(inputs[0]).toHaveValue("2222");
    expect(inputs[1]).toHaveValue("1111");
    expect(inputs[2]).toHaveValue("11");
    expect(inputs[3]).toHaveValue("1234567890");
    expect(document.activeElement).toBe(inputs[0]);
  });

  it("permite navegar con Tab entre mini inputs", async () => {
    const user = userEvent.setup();

    render(<BankAccountInput value="1111-1111-11-1234567890" />);

    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];

    inputs[0].focus();
    await user.tab();
    expect(document.activeElement).toBe(inputs[1]);

    await user.tab();
    expect(document.activeElement).toBe(inputs[2]);
  });

  it("sobrescribe un digito dentro de un segmento lleno sin afectar los demas", () => {
    render(<BankAccountInput value="1111-1111-11-1234567890" />);

    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];

    inputs[0].focus();
    inputs[0].setSelectionRange(1, 1);
    fireEvent.keyDown(inputs[0], { key: "9" });

    expect(inputs[0]).toHaveValue("1911");
    expect(inputs[1]).toHaveValue("1111");
    expect(inputs[2]).toHaveValue("11");
    expect(inputs[3]).toHaveValue("1234567890");
    expect(document.activeElement).toBe(inputs[0]);
  });

  it("al borrar en un segmento no corre ni redistribuye los digitos de los otros segmentos", () => {
    const handleValueChange = vi.fn();

    render(<BankAccountInput value="1133-1313-13-111" onValueChange={handleValueChange} />);

    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];

    fireEvent.change(inputs[0], { target: { value: "113" } });

    expect(inputs[0]).toHaveValue("113");
    expect(inputs[1]).toHaveValue("1313");
    expect(inputs[2]).toHaveValue("13");
    expect(inputs[3]).toHaveValue("111");
    expect(handleValueChange).toHaveBeenLastCalledWith("113-1313-13-111");
  });
});

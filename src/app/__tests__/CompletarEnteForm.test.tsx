import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { CompletarEnteForm } from "@/components/forms/admin_ente/CompletarEnteForm";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Importamos los servicios para poder asertar sobre ellos
import { obtenerEnte, actualizarEnte, actualizarLogoEnte } from "@/services/enteService";
import { generarManual } from "@/services/manualService";
import type { EnteResponse } from "@/types/ente.types";

// --- 0. Polyfills para Radix UI Select en JSDOM ---
beforeAll(() => {
  // Polyfill para PointerEvent
  if (typeof window !== "undefined" && !window.PointerEvent) {
    class PointerEvent extends MouseEvent {
      pointerId: number;
      width: number;
      height: number;
      pressure: number;
      tangentialPressure: number;
      tiltX: number;
      tiltY: number;
      twist: number;
      pointerType: string;
      isPrimary: boolean;

      constructor(type: string, params: PointerEventInit = {}) {
        super(type, params);
        this.pointerId = params.pointerId ?? 0;
        this.width = params.width ?? 0;
        this.height = params.height ?? 0;
        this.pressure = params.pressure ?? 0;
        this.tangentialPressure = params.tangentialPressure ?? 0;
        this.tiltX = params.tiltX ?? 0;
        this.tiltY = params.tiltY ?? 0;
        this.twist = params.twist ?? 0;
        this.pointerType = params.pointerType ?? "";
        this.isPrimary = params.isPrimary ?? false;
      }
    }
    Object.defineProperty(window, "PointerEvent", {
      value: PointerEvent,
      writable: true,
      configurable: true,
    });
  }

  // Polyfill para hasPointerCapture / setPointerCapture
  if (typeof window !== "undefined" && typeof window.HTMLElement !== "undefined") {
    if (!HTMLElement.prototype.hasPointerCapture) {
      HTMLElement.prototype.hasPointerCapture = function () {
        return false;
      };
    }
    if (!HTMLElement.prototype.setPointerCapture) {
      HTMLElement.prototype.setPointerCapture = function () {};
    }
    if (!HTMLElement.prototype.releasePointerCapture) {
      HTMLElement.prototype.releasePointerCapture = function () {};
    }
    if (!HTMLElement.prototype.scrollIntoView) {
      HTMLElement.prototype.scrollIntoView = function () {};
    }
  }
});

// --- 1. Mocks de Servicios ---
vi.mock("@/services/enteService", () => ({
  obtenerEnte: vi.fn(),
  actualizarEnte: vi.fn(),
  actualizarLogoEnte: vi.fn(),
}));

vi.mock("@/services/manualService", () => ({
  generarManual: vi.fn(),
}));

// --- 2. Mock de Navegación y Toasts ---
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn().mockReturnValue("toast-id"),
    dismiss: vi.fn(),
  },
}));

describe("Flujo Primer Login: <CompletarEnteForm />", () => {
  const mockPush = vi.fn();
  const mockRefresh = vi.fn();

  // Creamos un Mock del Ente estrictamente tipado según lo que espera tu componente
  const baseEnteMock: EnteResponse = {
    id: "ente-123",
    nombre: "",
    rif: "",
    siglas: "",
    direccionFiscal: "",
    estado: "",
    municipio: "",
    ciudad: "",
    parroquia: "",
    nombreUnidadAdminFinanciera: "",
    nombreUnidadTecnologia: "",
    nombreUnidadContratante: "",
    organoAdscripcion: "",
    logoUrl: null,
    universitasId: "",
    createdAt: "",
    updatedAt: "",
    deletedAt: null,
    createdBy: null,
    updatedBy: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock del Router estrictamente tipado
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
      back: vi.fn(),
      forward: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    } as ReturnType<typeof useRouter>);

    // Mock de window.scrollTo
    window.scrollTo = vi.fn();

    // Estado inicial por defecto para las pruebas
    vi.mocked(obtenerEnte).mockResolvedValue(baseEnteMock);
  });

  it("1. Muestra el estado de carga y luego renderiza los datos iniciales (Paso 1)", async () => {
    // Simulamos que el backend devuelve un Ente parcialmente lleno, respetando el tipo EnteResponse
    const enteParcial: EnteResponse = {
      ...baseEnteMock,
      nombre: "Instituto de Prueba",
      rif: "G-12345678-9",
      siglas: "INP",
    };

    vi.mocked(obtenerEnte).mockResolvedValueOnce(enteParcial);

    render(<CompletarEnteForm enteId="ente-123" />);

    expect(screen.getByText("Cargando datos del ente...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText("Cargando datos del ente...")).not.toBeInTheDocument();
    });

    expect(screen.getByDisplayValue("Instituto de Prueba")).toBeInTheDocument();
    expect(screen.getByDisplayValue("INP")).toBeInTheDocument();

    // Verificamos que el hook completó el RIF correctamente
    // InputOTP separa el cuerpo (8 dígitos) y el verificador (1 dígito)
    expect(screen.getByDisplayValue("12345678")).toBeInTheDocument();
    expect(screen.getByDisplayValue("9")).toBeInTheDocument();
  });

  it("2. Validaciones: No permite avanzar al Paso 2 si faltan campos requeridos en el Paso 1", async () => {
    const user = userEvent.setup();
    render(<CompletarEnteForm enteId="ente-123" />);

    await waitFor(() => {
      expect(screen.queryByText("Cargando datos del ente...")).not.toBeInTheDocument();
    });

    const nextButton = screen.getByRole("button", { name: /siguiente/i });
    await user.click(nextButton);

    expect(toast.error).toHaveBeenCalledWith(
      "Por favor completa los campos requeridos marcados en rojo."
    );

    // El formulario no debe avanzar de paso
    expect(screen.getByText("Datos generales")).toBeInTheDocument();
  });

  it("3. Flujo End-to-End: Completa Paso 1, avanza al Paso 2 y envía el formulario exitosamente", async () => {
    const user = userEvent.setup();
    render(<CompletarEnteForm enteId="ente-123" />);

    await waitFor(() => {
      expect(screen.queryByText("Cargando datos del ente...")).not.toBeInTheDocument();
    });

    // --- Llenar Paso 1 ---
    await user.type(
      screen.getByLabelText(/^Indique el nombre del Órgano o Ente Contratante\.$/i),
      "Ministerio Central"
    );
    await user.type(screen.getByLabelText(/Indique el acrónimo/i), "MINCEN");
    await user.type(screen.getByLabelText(/órgano de adscripción/i), "Presidencia");

    // InputOTP: esperar y obtener usando atributos específicos
    const rifCuerpoInput = await waitFor(() => {
      const input = document.querySelector('input[maxlength="8"]') as HTMLInputElement;
      if (!input) throw new Error("No se encontró el input OTP del cuerpo (maxlength 8)");
      return input;
    });

    const rifVerificadorInput = await waitFor(() => {
      const input = document.querySelector('input[maxlength="1"]') as HTMLInputElement;
      if (!input) throw new Error("No se encontró el input OTP verificador (maxlength 1)");
      return input;
    });

    await user.click(rifCuerpoInput);
    await user.type(rifCuerpoInput, "87654321");
    await user.click(rifVerificadorInput);
    await user.type(rifVerificadorInput, "5");

    await user.click(screen.getByRole("button", { name: /siguiente/i }));

    await waitFor(() => {
      expect(screen.getByText("Ubicación y estructura")).toBeInTheDocument();
      expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
    });

    // --- Llenar Paso 2 ---
    // En Radix UI, el trigger tiene un role="combobox" pero a veces su aserción por label falla en las pruebas si no se enlaza perfectamente.
    // Usamos una query más dócil basada en el texto del label/placeholder

    // 1. Estado
    const estadoCombo = screen.getByRole("combobox", { name: /estado/i });
    await user.click(estadoCombo);
    const optionEstado = await screen.findByRole("option", { name: "Lara" });
    await user.click(optionEstado);
    // Wait for the select to close completely
    await waitFor(() =>
      expect(screen.queryByRole("option", { name: "Lara" })).not.toBeInTheDocument()
    );

    // 2. Municipio
    await user.click(screen.getByRole("combobox", { name: /municipio/i }));
    const optionMunicipio = await screen.findByRole("option", { name: "Iribarren" });
    await user.click(optionMunicipio);
    await waitFor(() =>
      expect(screen.queryByRole("option", { name: "Iribarren" })).not.toBeInTheDocument()
    );

    // 3. Ciudad
    await user.click(screen.getByRole("combobox", { name: /ciudad/i }));
    const optionCiudad = await screen.findByRole("option", { name: "Barquisimeto" });
    await user.click(optionCiudad);
    await waitFor(() =>
      expect(screen.queryByRole("option", { name: "Barquisimeto" })).not.toBeInTheDocument()
    );

    // 4. Parroquia
    await user.click(screen.getByRole("combobox", { name: /parroquia/i }));
    const optionParroquia = await screen.findByRole("option", { name: "Catedral" });
    await user.click(optionParroquia);
    await waitFor(() =>
      expect(screen.queryByRole("option", { name: "Catedral" })).not.toBeInTheDocument()
    );

    await user.type(
      screen.getByLabelText(/dirección fiscal completa/i),
      "Av. Principal, Edificio Central"
    );
    await user.type(screen.getByLabelText(/Unidad Contratante/i), "Gerencia de Compras");
    await user.type(
      screen.getByLabelText(/Gestión Administrativa y Financiera/i),
      "Gerencia de Finanzas"
    );
    await user.type(screen.getByLabelText(/Área de Sistema y Tecnología/i), "Tecnología IT");

    // --- Enviar Formulario ---
    vi.mocked(actualizarEnte).mockResolvedValueOnce({ message: "Éxito" });
    // Debe retornar un objeto ManualResponse simulado
    vi.mocked(generarManual).mockResolvedValueOnce({
      id: "manual-1",
      url: "http://example.com/manual.docx",
      fileName: "manual.docx",
      version: 1,
      generatedAt: new Date().toISOString(),
      tipoManual: "General",
      titulo: "Manual Generado",
    });

    await user.click(screen.getByRole("button", { name: /guardar/i }));

    // --- Verificaciones Finales ---
    await waitFor(() => {
      expect(actualizarEnte).toHaveBeenCalledWith(
        "ente-123",
        expect.objectContaining({
          nombre: "Ministerio Central",
          rif: "G-87654321-5",
          siglas: "MINCEN",
          organoAdscripcion: "Presidencia",
          estado: "Lara",
          municipio: "Iribarren",
          ciudad: "Barquisimeto",
          parroquia: "Catedral",
          direccionFiscal: "Av. Principal, Edificio Central",
          nombreUnidadContratante: "Gerencia de Compras",
          nombreUnidadAdminFinanciera: "Gerencia de Finanzas",
          nombreUnidadTecnologia: "Tecnología IT",
        })
      );

      expect(generarManual).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/admin_ente/dashboard");
      expect(toast.success).toHaveBeenCalledWith(
        "Datos guardados y manual generado correctamente",
        expect.anything()
      );
    });
  }, 15000);

  it("4. Sube el logo correctamente llamando a la API", async () => {
    const user = userEvent.setup();
    render(<CompletarEnteForm enteId="ente-123" />);

    await waitFor(() => {
      expect(screen.queryByText("Cargando datos del ente...")).not.toBeInTheDocument();
    });

    const file = new File(["dummy content"], "logo.png", { type: "image/png" });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    await userEvent.upload(fileInput, file);

    const uploadButton = screen.getByRole("button", { name: /enviar logo/i });
    expect(uploadButton).not.toBeDisabled();

    vi.mocked(actualizarLogoEnte).mockResolvedValueOnce({ message: "Logo subido" });

    await user.click(uploadButton);

    await waitFor(() => {
      expect(actualizarLogoEnte).toHaveBeenCalledTimes(1);
      expect(actualizarLogoEnte).toHaveBeenCalledWith("ente-123", expect.any(FormData));
      expect(toast.success).toHaveBeenCalledWith("Logo actualizado correctamente");
    });
  });
});

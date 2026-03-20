import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import LoginForm from "@/components/login-form";
import { useRouter } from "next/navigation";
import { loginAction } from "@/lib/auth/auth";

// Mock de Next.js Router
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

// Mock del Server Action
vi.mock("@/lib/auth/auth", () => ({
  loginAction: vi.fn(),
}));

describe("Flujo de Autenticación: <LoginForm />", () => {
  const mockPush = vi.fn();
  const mockRefresh = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Utilizamos ReturnType para asegurar que cumple con la interfaz de Next.js
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
      back: vi.fn(),
      forward: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    } as ReturnType<typeof useRouter>);
  });

  it("1. Renderiza los campos y el botón correctamente", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it("2. Muestra errores de validación (Zod) si el usuario envía campos vacíos o inválidos", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const submitButton = screen.getByRole("button", {
      name: /iniciar sesión/i,
    });

    await user.click(submitButton);

    expect(await screen.findByText("El correo es requerido")).toBeInTheDocument();
    expect(
      await screen.findByText("La contraseña debe tener al menos 8 caracteres")
    ).toBeInTheDocument();

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    await user.type(emailInput, "correo-invalido");
    await user.click(submitButton);

    expect(await screen.findByText("Formato de correo electrónico inválido")).toBeInTheDocument();

    expect(loginAction).not.toHaveBeenCalled();
  });

  it("3. Muestra un error si las credenciales son incorrectas (Rechazo del backend)", async () => {
    const user = userEvent.setup();

    vi.mocked(loginAction).mockResolvedValueOnce({
      success: false,
      error: "Credenciales inválidas o usuario inactivo",
    });

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/correo electrónico/i), "test@universitas.com");
    await user.type(screen.getByLabelText(/contraseña/i), "password123");
    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    expect(loginAction).toHaveBeenCalledWith({
      email: "test@universitas.com",
      password: "password123",
    });

    expect(
      await screen.findByText("Credenciales inválidas o usuario inactivo")
    ).toBeInTheDocument();

    expect(mockPush).not.toHaveBeenCalled();
  });

  const casosDeUsoRoles = [
    {
      rol: "Administrador de Ente",
      email: "admin@ente.gob.ve",
      rutaEsperada: "/admin_ente/dashboard",
    },
    {
      rol: "Ejecutor",
      email: "ejecutor@ente.gob.ve",
      rutaEsperada: "/ejecutor/dashboard",
    },
    {
      rol: "Supervisor",
      email: "supervisor@ente.gob.ve",
      rutaEsperada: "/supervisor/dashboard",
    },
    {
      rol: "Visualizador",
      email: "visualizador@ente.gob.ve",
      rutaEsperada: "/visualizador/dashboard",
    },
  ];

  it.each(casosDeUsoRoles)(
    "4. Flujo exitoso: Redirige al usuario $rol a la ruta $rutaEsperada",
    async ({ email, rutaEsperada }) => {
      const user = userEvent.setup();

      // Mockeamos la respuesta simulando que el backend identificó el rol y mandó la URL correcta
      vi.mocked(loginAction).mockResolvedValueOnce({
        success: true,
        redirectUrl: rutaEsperada,
      });

      render(<LoginForm />);

      // Interacción
      await user.type(screen.getByLabelText(/correo electrónico/i), email);
      await user.type(screen.getByLabelText(/contraseña/i), "Segura1234!");
      await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));

      // Verificación de la redirección exacta para ese rol
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(rutaEsperada);
        expect(mockRefresh).toHaveBeenCalled();
      });
    }
  );

  it("5. Verifica el estado de carga (isLoading) deshabilitando inputs", async () => {
    const user = userEvent.setup();

    vi.mocked(loginAction).mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ success: true, redirectUrl: "/" }), 100)
        )
    );

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole("button", {
      name: /iniciar sesión/i,
    });

    await user.type(emailInput, "test@test.com");
    await user.type(passwordInput, "12345678");

    // Click sin usar await para atrapar el estado "en el medio" de la petición
    user.click(submitButton);

    await waitFor(() => {
      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent("Iniciando sesión...");
    });
  });
});

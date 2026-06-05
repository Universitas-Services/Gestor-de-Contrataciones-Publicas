import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { UserDetailManagementCard } from "@/app/(roles)/admin_ente/(dashboard)/gestion-datos/usuarios/[id]/UserDetailManagementCard";

const {
  pushMock,
  toastSuccessMock,
  toastErrorMock,
  toastLoadingMock,
  obtenerUsuarioOperativoMock,
  obtenerMiEnteIdMock,
  actualizarUsuarioEnteMock,
  eliminarUsuarioEnteMock,
  cambiarContrasenaDeUsuarioMock,
} = vi.hoisted(() => ({
  pushMock: vi.fn(),
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn(),
  toastLoadingMock: vi.fn(() => "toast-id"),
  obtenerUsuarioOperativoMock: vi.fn(),
  obtenerMiEnteIdMock: vi.fn(),
  actualizarUsuarioEnteMock: vi.fn(),
  eliminarUsuarioEnteMock: vi.fn(),
  cambiarContrasenaDeUsuarioMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: toastSuccessMock,
    error: toastErrorMock,
    loading: toastLoadingMock,
  },
}));

vi.mock("@/services/enteService", () => ({
  obtenerUsuarioOperativo: (...args: unknown[]) => obtenerUsuarioOperativoMock(...args),
  obtenerMiEnteId: (...args: unknown[]) => obtenerMiEnteIdMock(...args),
  actualizarUsuarioEnte: (...args: unknown[]) => actualizarUsuarioEnteMock(...args),
  eliminarUsuarioEnte: (...args: unknown[]) => eliminarUsuarioEnteMock(...args),
}));

vi.mock("@/services/authService", () => ({
  cambiarContrasenaDeUsuario: (...args: unknown[]) => cambiarContrasenaDeUsuarioMock(...args),
}));

describe("UserDetailManagementCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    obtenerUsuarioOperativoMock.mockResolvedValue({
      id: "user-123",
      nombre: "Pedro",
      apellido: "Perez",
      email: "pedro@ente.gob.ve",
      rol: "EJECUTOR",
      activo: true,
      createdAt: "2026-01-01T00:00:00.000Z",
    });

    obtenerMiEnteIdMock.mockResolvedValue("ente-1");
    actualizarUsuarioEnteMock.mockResolvedValue({});
    eliminarUsuarioEnteMock.mockResolvedValue({ message: "ok" });
    cambiarContrasenaDeUsuarioMock.mockResolvedValue({ message: "ok" });
  });

  it("abre en Ver/Editar usuario con los tabs visibles y campos bloqueados", async () => {
    render(
      <UserDetailManagementCard
        userId="user-123"
        adminName="Roberto Rojas"
        adminEmail="admin@miranda.gob.ve"
      />
    );

    expect(await screen.findByRole("tab", { name: "Ver/Editar usuario" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Cambiar contrasena" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Eliminar cuenta" })).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Editar usuario" })).toBeInTheDocument();
    expect(screen.getByDisplayValue("Pedro")).toBeDisabled();
    expect(screen.getByDisplayValue("Perez")).toBeDisabled();
    expect(screen.getByDisplayValue("pedro@ente.gob.ve")).toBeDisabled();
  });

  it("permite editar el perfil y guardar cambios", async () => {
    const user = userEvent.setup();

    render(
      <UserDetailManagementCard
        userId="user-123"
        adminName="Roberto Rojas"
        adminEmail="admin@miranda.gob.ve"
      />
    );

    await screen.findByDisplayValue("Pedro");
    await user.click(screen.getByRole("button", { name: "Editar usuario" }));

    const nombreInput = screen.getByDisplayValue("Pedro");
    await user.clear(nombreInput);
    await user.type(nombreInput, "Juan");

    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));

    await waitFor(() => {
      expect(actualizarUsuarioEnteMock).toHaveBeenCalledWith("ente-1", "user-123", {
        nombre: "Juan",
        apellido: "Perez",
        email: "pedro@ente.gob.ve",
        rol: "EJECUTOR",
      });
    });
  });

  it("envia el nuevo endpoint para cambiar la contrasena del usuario y limpia los campos", async () => {
    const user = userEvent.setup();

    render(
      <UserDetailManagementCard
        userId="user-123"
        adminName="Roberto Rojas"
        adminEmail="admin@miranda.gob.ve"
      />
    );

    await screen.findByRole("tab", { name: "Cambiar contrasena" });
    await user.click(screen.getByRole("tab", { name: "Cambiar contrasena" }));

    const currentPasswordInput = screen.getByLabelText(
      "Contrasena actual de Roberto Rojas"
    ) as HTMLInputElement;
    const newPasswordInput = screen.getByLabelText(
      "Nueva contrasena para Pedro Perez"
    ) as HTMLInputElement;

    await user.type(currentPasswordInput, "AdminActual123!");
    await user.type(newPasswordInput, "NuevaClave123!");
    await user.click(screen.getByRole("button", { name: "Actualizar contrasena" }));

    await waitFor(() => {
      expect(cambiarContrasenaDeUsuarioMock).toHaveBeenCalledWith({
        targetUserId: "user-123",
        currentPassword: "AdminActual123!",
        newPassword: "NuevaClave123!",
      });
    });

    await waitFor(() => {
      expect(currentPasswordInput.value).toBe("");
      expect(newPasswordInput.value).toBe("");
    });
  });

  it("muestra la vista de eliminar cuenta y abre el dialogo de confirmacion", async () => {
    const user = userEvent.setup();

    render(
      <UserDetailManagementCard
        userId="user-123"
        adminName="Roberto Rojas"
        adminEmail="admin@miranda.gob.ve"
      />
    );

    await screen.findByRole("tab", { name: "Eliminar cuenta" });
    await user.click(screen.getByRole("tab", { name: "Eliminar cuenta" }));
    await user.click(screen.getAllByRole("button", { name: "Eliminar cuenta" })[0]);

    expect(await screen.findByText("Estas seguro de eliminar la cuenta?")).toBeInTheDocument();
  });
});

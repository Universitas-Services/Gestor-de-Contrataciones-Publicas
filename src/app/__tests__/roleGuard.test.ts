import { describe, it, expect, vi, beforeEach } from "vitest";
import { enforceRoleAccess } from "@/lib/auth/roleGuard";
import { redirect } from "next/navigation";
import { ROLES, type UserRole } from "@/types/role.types";
import type { SessionPayload } from "@/types/auth.types";

// Mockeamos 'next/navigation' para interceptar la redirección
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

describe("Guardia de Rutas: enforceRoleAccess", () => {
  beforeEach(() => {
    // Limpiamos los mocks antes de cada prueba
    vi.clearAllMocks();
  });

  it("1. Si no hay sesión de usuario, debe redirigir a /login", () => {
    // Ejecutamos la función con usuario null
    enforceRoleAccess(null, ROLES.ENTE);

    // Verificamos que se llamó a redirect con /login
    expect(redirect).toHaveBeenCalledTimes(1);
    expect(redirect).toHaveBeenCalledWith("/login");
  });

  it("2. Si el usuario tiene el rol correcto, NO debe redirigir (Acceso Concedido)", () => {
    const mockUser: SessionPayload = {
      id: "123",
      email: "admin@ente.gob.ve",
      role: ROLES.ENTE,
      enteId: "Ente 1",
      userId: "123",
      name: "Juan Perez",
    };

    // El layout exige ROLES.ENTE, y el usuario es ROLES.ENTE
    enforceRoleAccess(mockUser, ROLES.ENTE);

    // Verificamos que NO hubo ninguna redirección
    expect(redirect).not.toHaveBeenCalled();
  });

  // Pruebas parametrizadas: Intrusos intentando acceder a zonas prohibidas
  const casosIntrusos = [
    {
      usuarioRol: ROLES.EJECUTOR, // Un ejecutor
      rolRequerido: ROLES.ENTE, // Intenta entrar a layout de Admin Ente
      redireccionEsperada: "/ejecutor/dashboard", // Debe ser devuelto a su dashboard
    },
    {
      usuarioRol: ROLES.VISUALIZADOR, // Un visualizador
      rolRequerido: ROLES.SUPERVISOR, // Intenta entrar a layout de Supervisor
      redireccionEsperada: "/visualizador/dashboard", // Debe ser devuelto a su dashboard
    },
    {
      usuarioRol: ROLES.SUPERVISOR, // Un supervisor
      rolRequerido: ROLES.ENTE, // Intenta entrar a layout de Admin Ente
      redireccionEsperada: "/supervisor/dashboard", // Debe ser devuelto a su dashboard
    },
    {
      usuarioRol: ROLES.ENTE, // Un Admin Ente
      rolRequerido: ROLES.EJECUTOR, // Intenta entrar a layout de Ejecutor
      redireccionEsperada: "/admin_ente/dashboard", // Debe ser devuelto a su dashboard
    },
  ];

  it.each(casosIntrusos)(
    "3. Si un $usuarioRol intenta acceder a una vista de $rolRequerido, debe ser redirigido a $redireccionEsperada",
    ({ usuarioRol, rolRequerido, redireccionEsperada }) => {
      const mockIntruso: SessionPayload = {
        id: "999",
        email: `intruso@${usuarioRol}.com`,
        role: usuarioRol as UserRole,
        name: "Intruso",
        enteId: "Ente 1",
        userId: "999",
      };

      // Ejecutamos la barrera
      enforceRoleAccess(mockIntruso, rolRequerido as UserRole);

      // Verificamos que fue interceptado y devuelto a su propia casa
      expect(redirect).toHaveBeenCalledTimes(1);
      expect(redirect).toHaveBeenCalledWith(redireccionEsperada);
    }
  );
});

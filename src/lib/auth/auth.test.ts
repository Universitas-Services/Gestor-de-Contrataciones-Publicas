import { beforeEach, describe, expect, it, vi } from "vitest";
import { loginAction } from "@/lib/auth/auth";
import type { LoginResponse } from "@/types/auth.types";

vi.mock("@/services/authService", () => ({
  login: vi.fn(),
}));

vi.mock("@/lib/auth/session", () => ({
  setSessionCookie: vi.fn(),
  deleteSessionCookie: vi.fn(),
  getSessionCookie: vi.fn(),
}));

import * as authService from "@/services/authService";

const buildLoginResponse = (overrides?: Partial<LoginResponse["user"]>): LoginResponse => ({
  access_token: "fake-token",
  user: {
    id: "user-1",
    nombre: "Admin",
    apellido: "Ente",
    email: "admin@ente.gob.ve",
    rol: "ADMIN_ENTE",
    cambioPasswordDefault: true,
    passwordPerdido: false,
    ente: {
      id: "ente-1",
      nombre: "Ente Demo",
      datosConfirmados: true,
    },
    ...overrides,
  },
});

describe("loginAction - flujo Admin Ente", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirige a cambiar contraseña con next dashboard cuando passwordPerdido=true", async () => {
    vi.mocked(authService.login).mockResolvedValueOnce(
      buildLoginResponse({
        passwordPerdido: true,
        cambioPasswordDefault: true,
        ente: {
          id: "ente-1",
          nombre: "Ente Demo",
          datosConfirmados: true,
        },
      })
    );

    const result = await loginAction({
      email: "admin@ente.gob.ve",
      password: "Temporal123!",
    });

    expect(result.success).toBe(true);
    expect(result.redirectUrl).toBe("/admin_ente/cambiar-contrasena?next=/admin_ente/dashboard");
  });

  it("mantiene flujo previo cuando passwordPerdido=false y password default no cambiada", async () => {
    vi.mocked(authService.login).mockResolvedValueOnce(
      buildLoginResponse({
        passwordPerdido: false,
        cambioPasswordDefault: false,
      })
    );

    const result = await loginAction({
      email: "admin@ente.gob.ve",
      password: "Temporal123!",
    });

    expect(result.success).toBe(true);
    expect(result.redirectUrl).toBe("/admin_ente/cambiar-contrasena");
  });

  it("mantiene flujo previo a completar ente cuando datosConfirmados=false", async () => {
    vi.mocked(authService.login).mockResolvedValueOnce(
      buildLoginResponse({
        passwordPerdido: false,
        cambioPasswordDefault: true,
        ente: {
          id: "ente-1",
          nombre: "Ente Demo",
          datosConfirmados: false,
        },
      })
    );

    const result = await loginAction({
      email: "admin@ente.gob.ve",
      password: "Temporal123!",
    });

    expect(result.success).toBe(true);
    expect(result.redirectUrl).toBe("/admin_ente/completar-ente");
  });
});

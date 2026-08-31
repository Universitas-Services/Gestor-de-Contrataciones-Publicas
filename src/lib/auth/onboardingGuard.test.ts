import { describe, expect, it } from "vitest";
import {
  getAdminEnteOnboardingRedirect,
  getOnboardingRedirect,
  getPostAuthRedirect,
  resolveProtectedRouteRedirect,
} from "@/lib/auth/onboardingGuard";
import type { SessionPayload } from "@/types/auth.types";
import { ROLES } from "@/types/role.types";

const baseSession = (overrides?: Partial<SessionPayload>): SessionPayload => ({
  userId: "user-1",
  email: "admin@ente.gob.ve",
  role: ROLES.ENTE,
  name: "Admin Ente",
  enteId: "ente-1",
  cambioPasswordDefault: true,
  passwordPerdido: false,
  datosConfirmados: true,
  ...overrides,
});

describe("onboardingGuard", () => {
  it("redirige a cambiar contraseña cuando passwordPerdido=true", () => {
    const redirect = getAdminEnteOnboardingRedirect(
      baseSession({ passwordPerdido: true, datosConfirmados: true })
    );

    expect(redirect).toBe("/admin_ente/cambiar-contrasena?next=/admin_ente/dashboard");
  });

  it("redirige a completar ente cuando faltan datos confirmados", () => {
    const redirect = getAdminEnteOnboardingRedirect(baseSession({ datosConfirmados: false }));

    expect(redirect).toBe("/admin_ente/completar-ente");
  });

  it("bloquea dashboard mientras falta cambiar contraseña", () => {
    const redirect = resolveProtectedRouteRedirect(
      baseSession({ cambioPasswordDefault: false }),
      "/admin_ente/dashboard"
    );

    expect(redirect).toBe("/admin_ente/cambiar-contrasena");
  });

  it("bloquea dashboard mientras falta completar ente", () => {
    const redirect = resolveProtectedRouteRedirect(
      baseSession({ datosConfirmados: false }),
      "/admin_ente/dashboard"
    );

    expect(redirect).toBe("/admin_ente/completar-ente");
  });

  it("permite la ruta de onboarding correspondiente", () => {
    const redirect = resolveProtectedRouteRedirect(
      baseSession({ cambioPasswordDefault: false }),
      "/admin_ente/cambiar-contrasena"
    );

    expect(redirect).toBeNull();
  });

  it("redirige fuera de onboarding cuando ya está completo", () => {
    const redirect = resolveProtectedRouteRedirect(baseSession(), "/admin_ente/cambiar-contrasena");

    expect(redirect).toBe("/admin_ente/dashboard");
  });

  it("prioriza cambio de contraseña sobre completar ente", () => {
    const redirect = getOnboardingRedirect(
      baseSession({ cambioPasswordDefault: false, datosConfirmados: false })
    );

    expect(redirect).toBe("/admin_ente/cambiar-contrasena");
  });

  it("envía a dashboard cuando el onboarding ya está completo", () => {
    expect(getPostAuthRedirect(baseSession())).toBe("/admin_ente/dashboard");
  });

  it("prioriza onboarding pendiente sobre el dashboard", () => {
    expect(getPostAuthRedirect(baseSession({ datosConfirmados: false }))).toBe(
      "/admin_ente/completar-ente"
    );
  });
});

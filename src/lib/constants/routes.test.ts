import { describe, expect, it } from "vitest";
import { isAuthEntryRoute, isPublicRoute, isRouteAllowedForRole } from "@/lib/constants/routes";
import { ROLES } from "@/types/role.types";

describe("isPublicRoute", () => {
  it("reconoce login y home como públicas", () => {
    expect(isPublicRoute("/login")).toBe(true);
    expect(isPublicRoute("/")).toBe(true);
  });

  it("no trata rutas autenticadas como públicas por el prefijo /", () => {
    expect(isPublicRoute("/admin_ente/dashboard")).toBe(false);
    expect(isPublicRoute("/gestion-expedientes")).toBe(false);
  });
});

describe("isAuthEntryRoute", () => {
  it("reconoce login y home como entrada de autenticación", () => {
    expect(isAuthEntryRoute("/login")).toBe(true);
    expect(isAuthEntryRoute("/")).toBe(true);
  });
});

describe("isRouteAllowedForRole", () => {
  it("permite subrutas del rol aunque no estén listadas de forma explícita", () => {
    expect(isRouteAllowedForRole("/visualizador/reportes", ROLES.VISUALIZADOR)).toBe(true);
    expect(isRouteAllowedForRole("/ejecutor/tareas", ROLES.EJECUTOR)).toBe(true);
  });

  it("bloquea rutas de otro rol", () => {
    expect(isRouteAllowedForRole("/admin_ente/dashboard", ROLES.SUPERVISOR)).toBe(false);
  });
});

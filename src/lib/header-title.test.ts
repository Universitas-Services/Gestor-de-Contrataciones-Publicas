import { describe, expect, it } from "vitest";
import { resolveHeaderTitle } from "@/lib/header-title";

describe("resolveHeaderTitle", () => {
  it("resuelve rutas exactas del dashboard", () => {
    expect(resolveHeaderTitle("/visualizador/dashboard", "visualizador")).toBe("Inicio");
  });

  it("resuelve excepciones exactas de gestion de usuarios", () => {
    expect(resolveHeaderTitle("/admin_ente/gestion-datos/usuarios/nuevo", "admin_ente")).toBe(
      "Crear usuario"
    );
  });

  it("resuelve prefijos dinamicos para editar usuario", () => {
    expect(
      resolveHeaderTitle(
        "/admin_ente/gestion-datos/usuarios/6f38d071-8d1b-4e41-8a89-acde1d22e1c4",
        "admin_ente"
      )
    ).toBe("Editar usuario");
  });

  it("resuelve detalle de proveedor con prefijo general", () => {
    expect(resolveHeaderTitle("/registro-proveedores/abc123", "visualizador")).toBe(
      "Informacion general"
    );
  });

  it("resuelve flujos internos de evaluacion de expediente", () => {
    expect(
      resolveHeaderTitle(
        "/elaboracion-expediente/2b4289c0/evaluacion/oferente-9/sobre-1",
        "ejecutor"
      )
    ).toBe("Evaluacion del expediente");
  });

  it("resuelve detalle de gestion-expedientes sin mostrar el id", () => {
    expect(
      resolveHeaderTitle("/gestion-expedientes/120b0153-0abc-4def-8abc-1234567890ab", "ejecutor")
    ).toBe("Detalle del expediente");
  });

  it("resuelve editar ficha en gestion-expedientes", () => {
    expect(
      resolveHeaderTitle(
        "/gestion-expedientes/120b0153-0abc-4def-8abc-1234567890ab/editar",
        "ejecutor"
      )
    ).toBe("Editar expediente");
  });

  it("resuelve detalle de elaboracion-expediente sin mostrar el id", () => {
    expect(
      resolveHeaderTitle("/elaboracion-expediente/120b0153-0abc-4def-8abc-1234567890ab", "ejecutor")
    ).toBe("Detalle del expediente");
  });

  it("cae al ultimo segmento formateado cuando no existe una regla", () => {
    expect(resolveHeaderTitle("/ruta-interna/no-mapeada", "ejecutor")).toBe("No Mapeada");
  });
});

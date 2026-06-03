"use client";

import type { ImgHTMLAttributes } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Header } from "@/components/shared/Header";
import { SidebarProvider } from "@/components/ui/sidebar";

const mockUsePathname = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

vi.mock("next/image", () => ({
  default: (props: ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) => {
    const { alt, priority, ...imgProps } = props;
    void priority;
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={alt} {...imgProps} />;
  },
}));

vi.mock("@/app/actions", () => ({
  logoutAction: vi.fn(),
}));

function renderHeader({
  pathname = "/visualizador/dashboard",
  open = true,
  role = "visualizador",
}: {
  pathname?: string;
  open?: boolean;
  role?: "admin_ente" | "supervisor" | "visualizador" | "ejecutor";
} = {}) {
  mockUsePathname.mockReturnValue(pathname);

  return render(
    <SidebarProvider open={open} onOpenChange={() => {}}>
      <Header
        userName="Pedro Jose Rodriguez Hernandez"
        userEmail="visualizadorprueba@dominio-muy-largo-ejemplo.com"
        userRole={role}
      />
    </SidebarProvider>
  );
}

describe("Header", () => {
  beforeEach(() => {
    mockUsePathname.mockReset();
    mockUsePathname.mockReturnValue("/visualizador/dashboard");
  });

  it("muestra el icono contextual solo cuando el sidebar esta colapsado", () => {
    const { rerender } = renderHeader({ open: false });

    expect(screen.getByAltText("Icono del Sistema Integrado")).toBeInTheDocument();

    rerender(
      <SidebarProvider open={true} onOpenChange={() => {}}>
        <Header
          userName="Pedro Jose Rodriguez Hernandez"
          userEmail="visualizadorprueba@dominio-muy-largo-ejemplo.com"
          userRole="visualizador"
        />
      </SidebarProvider>
    );

    expect(screen.queryByAltText("Icono del Sistema Integrado")).not.toBeInTheDocument();
  });

  it("resuelve el titulo central segun la ruta actual", () => {
    renderHeader({
      pathname: "/admin_ente/gestion-datos/usuarios",
      role: "admin_ente",
    });

    expect(screen.getByText("Gestion de usuarios")).toBeInTheDocument();
  });

  it("abre el popover del usuario con el rol y la accion de cerrar sesion", async () => {
    const user = userEvent.setup();
    renderHeader();

    await user.click(screen.getByRole("button", { name: "Abrir menu de usuario" }));

    expect(screen.getByText("Rol actual")).toBeInTheDocument();
    expect(screen.getByText("Visualizador")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cerrar sesion/i })).toHaveAttribute(
      "data-variant",
      "destructive"
    );
  });
});

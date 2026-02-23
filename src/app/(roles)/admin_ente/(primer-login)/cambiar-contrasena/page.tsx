import type { Metadata } from "next";
import { ChangePasswordForm } from "@/components/forms/admin_ente/ChangePasswordForm";

export const metadata: Metadata = {
  title: "Cambiar Contraseña | Admin Ente",
  description: "Cambia tu contraseña temporal para continuar",
};

export default function CambiarContrasenaPage() {
  return <ChangePasswordForm />;
}

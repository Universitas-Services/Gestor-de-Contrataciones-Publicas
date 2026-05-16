import type { Metadata } from "next";
import Image from "next/image";
import { ChangePasswordForm } from "@/components/forms/admin_ente/ChangePasswordForm";

export const metadata: Metadata = {
  title: "Cambiar Contraseña | Supervisor",
  description: "Cambia tu contraseña temporal para continuar",
};

export default function SupervisorCambiarContrasenaPage() {
  return (
    <div className="flex min-h-screen">
      {/* Panel izquierdo - Logo y color gris oscuro */}
      <div className="hidden lg:flex w-1/2 bg-login-gris items-center justify-center p-12">
        <Image
          src="/img_app/SI_relleno.png"
          alt="Sistema Integrado de Selección de Contratista"
          width={400}
          height={400}
          className="object-contain"
          priority
        />
      </div>

      {/* Panel derecho - Fondo Celeste */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-df-bg p-4 sm:p-6">
        <div className="w-full max-w-md">
          <ChangePasswordForm onSuccessRedirect="/supervisor/dashboard" />
        </div>
      </div>
    </div>
  );
}

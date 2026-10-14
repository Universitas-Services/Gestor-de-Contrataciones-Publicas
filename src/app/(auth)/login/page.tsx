import LoginForm from "@/components/login-form";
import Image from "next/image";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/auth";
import { getPostAuthRedirect } from "@/lib/auth/onboardingGuard";

export const metadata: Metadata = {
  title: "Iniciar Sesión",
  description: "Sistema de Contrataciones Públicas",
};

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect(getPostAuthRedirect(user));
  }

  return (
    <div className="flex min-h-screen">
      {/* Panel izquierdo - Logo y color */}
      <div className="hidden md:flex w-1/2 bg-izq-login items-center justify-center">
        <Image
          src="/img_app/SI_relleno.png"
          alt="Sistema Integrado de Selección de Contratista"
          width={500}
          height={500}
          priority
        />
      </div>

      {/* Panel derecho - Formulario */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-background p-4">
        <LoginForm />
      </div>
      {/* Floating Badge - Opción C */}
      <div className="fixed bottom-6 right-6 z-10 hidden sm:block">
        <p className="text-xs font-medium tracking-wide text-color-subtitulos/70">
          Desarrollado por <span className="font-bold">Universitas</span> © 2026
        </p>
      </div>
    </div>
  );
}

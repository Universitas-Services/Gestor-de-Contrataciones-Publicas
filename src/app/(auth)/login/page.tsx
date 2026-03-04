import LoginForm from "@/components/login-form";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar Sesión",
  description: "Sistema de Contrataciones Públicas",
};

export default function LoginPage() {
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
    </div>
  );
}

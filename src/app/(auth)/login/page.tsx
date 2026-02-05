import LoginForm from "./login-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar Sesión",
  description: "Sistema de Contrataciones Públicas",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background to-muted p-4">
      <LoginForm />
    </div>
  );
}

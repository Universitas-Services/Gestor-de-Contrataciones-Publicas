import type { Metadata } from "next";
import Image from "next/image";
import { ChangePasswordForm } from "@/components/forms/admin_ente/ChangePasswordForm";
import { getCurrentUser } from "@/lib/auth/auth";
import {
  ADMIN_ENTE_ONBOARDING_ROUTES,
  getAdminEnteOnboardingRedirect,
  needsPasswordChange,
} from "@/lib/auth/onboardingGuard";
import { getDashboardRoute } from "@/lib/constants/routes";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Cambiar Contraseña | Admin Ente",
  description: "Cambia tu contraseña temporal para continuar",
};

interface CambiarContrasenaPageProps {
  searchParams?:
    | {
        next?: string;
      }
    | Promise<{
        next?: string;
      }>;
}

export default async function CambiarContrasenaPage({ searchParams }: CambiarContrasenaPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  if (!needsPasswordChange(user)) {
    redirect(getAdminEnteOnboardingRedirect(user) ?? getDashboardRoute(user.role));
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const nextRedirect = resolvedSearchParams?.next;
  const successRedirect =
    typeof nextRedirect === "string" && nextRedirect.startsWith("/")
      ? nextRedirect
      : ADMIN_ENTE_ONBOARDING_ROUTES.completarEnte;

  return (
    <div className="flex min-h-screen">
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

      <div className="flex w-full lg:w-1/2 items-center justify-center bg-df-bg p-4 sm:p-6">
        <div className="w-full max-w-md">
          <ChangePasswordForm onSuccessRedirect={successRedirect} />
        </div>
      </div>
    </div>
  );
}

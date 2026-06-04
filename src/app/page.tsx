import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/auth";
import { getOnboardingRedirect } from "@/lib/auth/onboardingGuard";
import { getDashboardRoute } from "@/lib/constants/routes";

export default async function HomePage() {
  // Verificar si el usuario tiene sesión activa
  const user = await getCurrentUser();

  if (user) {
    const onboardingRedirect = getOnboardingRedirect(user);
    if (onboardingRedirect) {
      redirect(onboardingRedirect);
    }

    redirect(getDashboardRoute(user.role));
  }

  // Si no hay sesión, redirigir a login
  redirect("/login");
}

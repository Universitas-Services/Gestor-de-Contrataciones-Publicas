import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/auth";
import { getPostAuthRedirect } from "@/lib/auth/onboardingGuard";

export default async function HomePage() {
  // Verificar si el usuario tiene sesión activa
  const user = await getCurrentUser();

  if (user) {
    redirect(getPostAuthRedirect(user));
  }

  // Si no hay sesión, redirigir a login
  redirect("/login");
}

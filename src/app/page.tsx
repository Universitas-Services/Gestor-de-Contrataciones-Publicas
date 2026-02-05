import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/auth";
import { getDashboardRoute } from "@/lib/constants/routes";

export default async function HomePage() {
  // Verificar si el usuario tiene sesión activa
  const user = await getCurrentUser();

  if (user) {
    // Redirigir al dashboard del rol correspondiente
    const dashboardRoute = getDashboardRoute(user.role);
    redirect(dashboardRoute);
  }

  // Si no hay sesión, redirigir a login
  redirect("/login");
}

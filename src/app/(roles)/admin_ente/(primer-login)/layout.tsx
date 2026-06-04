import { getCurrentUser } from "@/lib/auth/auth";
import { enforceRoleAccess } from "@/lib/auth/roleGuard";
import { canAccessAdminEnteRoute } from "@/lib/permissions/roleAccess";
import { ROLES } from "@/types/role.types";
import { headers } from "next/headers";
import { OnboardingBackGuard } from "@/components/auth/OnboardingBackGuard";

export default async function PrimerLoginLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const pathname = (await headers()).get("x-pathname") ?? "";

  if (user && canAccessAdminEnteRoute(pathname, user.role)) {
    return <>{children}</>;
  }

  // Validación de seguridad: usuario autenticado con rol admin_ente
  enforceRoleAccess(user, ROLES.ENTE);

  return (
    <>
      <OnboardingBackGuard />
      {children}
    </>
  );
}

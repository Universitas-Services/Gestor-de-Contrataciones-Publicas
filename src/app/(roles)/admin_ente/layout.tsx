import { getCurrentUser } from "@/lib/auth/auth";
import { enforceRoleAccess } from "@/lib/auth/roleGuard";
import { canAccessAdminEnteRoute } from "@/lib/permissions/roleAccess";
import { ROLES } from "@/types/role.types";
import { headers } from "next/headers";

/**
 * Layout raíz de admin_ente: solo protección de rol.
 */
export default async function EnteLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const pathname = (await headers()).get("x-pathname") ?? "";

  if (user && canAccessAdminEnteRoute(pathname, user.role)) {
    return <>{children}</>;
  }

  // Defense-in-depth: Layout validates role even though proxy already does
  enforceRoleAccess(user, ROLES.ENTE);

  return <>{children}</>;
}

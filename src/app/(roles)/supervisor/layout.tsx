import { getCurrentUser } from "@/lib/auth/auth";
import { enforceRoleAccess } from "@/lib/auth/roleGuard";
import { ROLES } from "@/types/role.types";

/**
 * Layout raíz de supervisor: solo protección de rol.
 */
export default async function SupervisorRootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  // Defense-in-depth: Layout validates role even though proxy already does
  enforceRoleAccess(user, ROLES.SUPERVISOR);

  return <>{children}</>;
}

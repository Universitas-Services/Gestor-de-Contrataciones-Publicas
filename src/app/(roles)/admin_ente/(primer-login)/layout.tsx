import { getCurrentUser } from "@/lib/auth/auth";
import { enforceRoleAccess } from "@/lib/auth/roleGuard";
import { ROLES } from "@/types/role.types";

export default async function PrimerLoginLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  // Validación de seguridad: usuario autenticado con rol admin_ente
  enforceRoleAccess(user, ROLES.ENTE);

  return <>{children}</>;
}

import { getCurrentUser } from "@/lib/auth/auth";
import { enforceRoleAccess } from "@/lib/auth/roleGuard";
import { ROLES } from "@/types/role.types";

export default async function PrimerLoginLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  // Validación de seguridad: usuario autenticado con rol admin_ente
  enforceRoleAccess(user, ROLES.ENTE);

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background to-muted p-4">
      <div className="w-full max-w-3xl space-y-6">
        {/* Header minimalista */}
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Sistema de Contrataciones Públicas</h1>
          <p className="text-sm text-muted-foreground">Configuración inicial de tu cuenta</p>
        </div>

        {children}
      </div>
    </div>
  );
}

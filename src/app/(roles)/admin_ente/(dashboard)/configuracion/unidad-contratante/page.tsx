import { getCurrentUser } from "@/lib/auth/auth";
import { isReadOnlyRole } from "@/lib/permissions/roleAccess";
import { UnidadContratanteForm } from "@/components/forms/admin_ente/UnidadContratanteForm";

export default async function UnidadContratantePage() {
  const user = await getCurrentUser();
  const readOnly = user ? isReadOnlyRole(user.role) : false;

  return (
    <div className="w-full">
      <UnidadContratanteForm readOnly={readOnly} />
    </div>
  );
}

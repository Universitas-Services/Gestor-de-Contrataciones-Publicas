import { getCurrentUser } from "@/lib/auth/auth";
import { isReadOnlyRole } from "@/lib/permissions/roleAccess";
import { UnidadUsuariaForm } from "@/components/forms/admin_ente/UnidadUsuariaForm";

export default async function UnidadUsuariaPage() {
  const user = await getCurrentUser();
  const readOnly = user ? isReadOnlyRole(user.role) : false;

  return (
    <div className="w-full">
      <UnidadUsuariaForm readOnly={readOnly} />
    </div>
  );
}

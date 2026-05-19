import { getCurrentUser } from "@/lib/auth/auth";
import { isReadOnlyRole } from "@/lib/permissions/roleAccess";
import { MaximaAutoridadForm } from "@/components/forms/admin_ente/MaximaAutoridadForm";

export default async function MaximaAutoridadPage() {
  const user = await getCurrentUser();
  const readOnly = user ? isReadOnlyRole(user.role) : false;

  return (
    <div className="w-full">
      <MaximaAutoridadForm readOnly={readOnly} />
    </div>
  );
}

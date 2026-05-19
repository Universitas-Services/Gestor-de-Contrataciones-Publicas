import { getCurrentUser } from "@/lib/auth/auth";
import { isReadOnlyRole } from "@/lib/permissions/roleAccess";
import { ComisionContratacionesForm } from "@/components/forms/admin_ente/ComisionContratacionesForm";

export default async function ComisionContratacionesPage() {
  const user = await getCurrentUser();
  const readOnly = user ? isReadOnlyRole(user.role) : false;

  return (
    <div className="w-full">
      <ComisionContratacionesForm readOnly={readOnly} />
    </div>
  );
}

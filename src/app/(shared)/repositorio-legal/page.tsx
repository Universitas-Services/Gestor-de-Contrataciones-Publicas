import { redirect } from "next/navigation";

import { RepositorioLegalPanel } from "@/components/features-components/RepositorioLegal/RepositorioLegalPanel";
import { getCurrentUser } from "@/lib/auth/auth";
import { canMutateEnte, isReadOnlyRole } from "@/lib/permissions/roleAccess";

export default async function RepositorioLegalPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const readOnly = isReadOnlyRole(user.role) || !canMutateEnte(user.role);

  return (
    <div className="w-full">
      <RepositorioLegalPanel enteId={user.enteId ?? undefined} readOnly={readOnly} />
    </div>
  );
}

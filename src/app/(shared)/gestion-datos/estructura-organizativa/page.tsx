import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/auth";
import { ListadoUsuarios } from "@/components/features-components/EstructuraOrganizativa/ListadoUsuarios";
import { canAccessEnteModules, isReadOnlyRole } from "@/lib/permissions/roleAccess";

export default async function EstructuraOrganizativaPage() {
  const user = await getCurrentUser();

  if (!user || !canAccessEnteModules(user.role) || !user.enteId) {
    redirect("/login");
  }

  return (
    <div className="min-h-[calc(100vh-64px)] rounded-xl bg-df-bg p-6 md:p-10">
      <div className="mx-auto max-w-full">
        <ListadoUsuarios readOnly={isReadOnlyRole(user.role)} />
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/auth";
import { CrearExpedienteWizard } from "@/components/features-components/ElaboracionExpediente/CrearExpedienteWizard";
import { isReadOnlyRole } from "@/lib/permissions/roleAccess";

export default async function NuevoExpedientePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="w-full max-w-full mx-auto flex flex-col items-center p-0">
      <CrearExpedienteWizard readOnly={isReadOnlyRole(user.role)} />
    </div>
  );
}

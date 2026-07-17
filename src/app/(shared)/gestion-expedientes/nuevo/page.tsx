import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/auth";
import { isReadOnlyRole } from "@/lib/permissions/roleAccess";
import { CrearExpedienteWizard } from "@/components/features-components/GestionExpedientes/CrearExpedienteWizard";

export default async function GestionExpedientesNuevoPage() {
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

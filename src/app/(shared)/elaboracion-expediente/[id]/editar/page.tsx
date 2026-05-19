import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/auth";
import { isReadOnlyRole } from "@/lib/permissions/roleAccess";
import { obtenerExpediente } from "@/services/expedienteService";
import { CrearExpedienteWizard } from "@/components/features-components/ElaboracionExpediente/CrearExpedienteWizard";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditarExpedientePage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;

  let expediente;
  try {
    expediente = await obtenerExpediente(id);
  } catch {
    notFound();
  }

  return (
    <div className="w-full max-w-full mx-auto flex flex-col items-center p-0">
      <CrearExpedienteWizard
        expedienteId={id}
        datosIniciales={expediente}
        modoEdicion
        readOnly={isReadOnlyRole(user.role)}
      />
    </div>
  );
}

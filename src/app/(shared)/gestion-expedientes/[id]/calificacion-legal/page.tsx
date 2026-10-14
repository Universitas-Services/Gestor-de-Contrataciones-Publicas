import { notFound, redirect } from "next/navigation";

import { CalificacionLegalForm } from "@/components/features-components/GestionExpedientes/fase1/calificacion-legal/CalificacionLegalForm";
import { getCurrentUser } from "@/lib/auth/auth";
import { isConcursoAbiertoActoUnico } from "@/lib/modalidades/modalidadDisplay";
import { isReadOnlyRole } from "@/lib/permissions/roleAccess";
import { obtenerExpediente } from "@/services/expedienteService";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function GestionCalificacionLegalPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;

  let expediente;

  try {
    expediente = await obtenerExpediente(id);
  } catch {
    notFound();
  }

  if (!isConcursoAbiertoActoUnico(expediente.modalidad?.modalidadSeleccion)) {
    redirect(`/gestion-expedientes/${id}?tab=fase-1`);
  }

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-full flex-col items-start overflow-x-hidden p-0">
      <CalificacionLegalForm
        expedienteId={id}
        readOnly={isReadOnlyRole(user.role)}
        basePath="/gestion-expedientes"
      />
    </div>
  );
}

import { notFound, redirect } from "next/navigation";

import { LlamadoPublicoForm } from "@/components/features-components/GestionExpedientes/fase1/llamado/LlamadoPublicoForm";
import { getCurrentUser } from "@/lib/auth/auth";
import { isConcursoAbiertoActoUnico } from "@/lib/modalidades/modalidadDisplay";
import { isReadOnlyRole } from "@/lib/permissions/roleAccess";
import { obtenerEnte } from "@/services/enteService";
import { obtenerExpediente } from "@/services/expedienteService";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function GestionLlamadoPublicoPage({ params }: Props) {
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

  let direccionEnteDefault = "";

  if (user.enteId) {
    try {
      const ente = await obtenerEnte(user.enteId);
      direccionEnteDefault = ente.direccionFiscal ?? "";
    } catch {
      direccionEnteDefault = "";
    }
  }

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-full flex-col items-start overflow-x-hidden p-0">
      <LlamadoPublicoForm
        expedienteId={id}
        enteId={user.enteId}
        direccionEnteDefault={direccionEnteDefault}
        readOnly={isReadOnlyRole(user.role)}
        basePath="/gestion-expedientes"
      />
    </div>
  );
}

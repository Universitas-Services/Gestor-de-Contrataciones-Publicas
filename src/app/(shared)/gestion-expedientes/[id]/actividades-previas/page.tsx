import { notFound, redirect } from "next/navigation";

import { ActividadesPreviasForm } from "@/components/features-components/GestionExpedientes/fase1/actividades-previas/ActividadesPreviasForm";
import { getCurrentUser } from "@/lib/auth/auth";
import { isConcursoAbiertoActoUnico } from "@/lib/modalidades/modalidadDisplay";
import { isReadOnlyRole } from "@/lib/permissions/roleAccess";
import type { TipoContratacionBackend } from "@/lib/schemas/expedienteSchema";
import { obtenerEnte } from "@/services/enteService";
import { obtenerExpediente } from "@/services/expedienteService";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function GestionActividadesPreviasPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;

  let tipoContratacion: TipoContratacionBackend = "BIENES";
  let expediente;

  try {
    expediente = await obtenerExpediente(id);
  } catch {
    notFound();
  }

  if (!isConcursoAbiertoActoUnico(expediente.modalidad?.modalidadSeleccion)) {
    redirect(`/gestion-expedientes/${id}?tab=fase-1`);
  }

  if (
    expediente.modalidad?.tipoContratacion === "BIENES" ||
    expediente.modalidad?.tipoContratacion === "SERVICIOS" ||
    expediente.modalidad?.tipoContratacion === "OBRAS"
  ) {
    tipoContratacion = expediente.modalidad.tipoContratacion;
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
      <ActividadesPreviasForm
        expedienteId={id}
        tipoContratacion={tipoContratacion}
        direccionEnteDefault={direccionEnteDefault}
        readOnly={isReadOnlyRole(user.role)}
        basePath="/gestion-expedientes"
      />
    </div>
  );
}

import { notFound, redirect } from "next/navigation";

import { ContratoForm } from "@/components/features-components/ElaboracionExpediente/contrato/ContratoForm";
import { getCurrentUser } from "@/lib/auth/auth";
import { isReadOnlyRole } from "@/lib/permissions/roleAccess";
import { obtenerExpediente } from "@/services/expedienteService";
import type { TipoContratacionBackend } from "@/lib/schemas/expedienteSchema";
import { TIPOS_CONTRATACION_BACKEND } from "@/lib/schemas/expedienteSchema";

interface Props {
  params: Promise<{ id: string }>;
}

function resolveTipo(raw: string | undefined): TipoContratacionBackend {
  if (raw && TIPOS_CONTRATACION_BACKEND.includes(raw as TipoContratacionBackend)) {
    return raw as TipoContratacionBackend;
  }
  return "BIENES";
}

export default async function ContratoPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;

  let expediente;
  try {
    expediente = await obtenerExpediente(id);
  } catch {
    notFound();
  }

  const tipoContratacion = resolveTipo(expediente.modalidad?.tipoContratacion);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 lg:p-12">
      <ContratoForm
        expedienteId={id}
        tipoContratacion={tipoContratacion}
        readOnly={isReadOnlyRole(user.role)}
      />
    </div>
  );
}

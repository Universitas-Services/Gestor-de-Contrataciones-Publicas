import { notFound, redirect } from "next/navigation";

import { Fase1Form } from "@/components/features-components/ElaboracionExpediente/fase-1/Fase1Form";
import { getCurrentUser } from "@/lib/auth/auth";
import { obtenerEnte } from "@/services/enteService";
import { obtenerExpediente } from "@/services/expedienteService";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Fase1Page({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;

  try {
    await obtenerExpediente(id);
  } catch {
    notFound();
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
      <Fase1Form expedienteId={id} direccionEnteDefault={direccionEnteDefault} />
    </div>
  );
}

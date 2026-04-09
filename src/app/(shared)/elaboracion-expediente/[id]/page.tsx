import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/auth";
import { obtenerExpediente } from "@/services/expedienteService";
import { ExpedienteDetalle } from "@/components/features-components/ElaboracionExpediente/ExpedienteDetalle";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ExpedienteDetallePage({ params }: Props) {
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
    <div className="w-full min-w-0 max-w-full mx-auto flex flex-col items-start p-0 overflow-x-hidden">
      <ExpedienteDetalle data={expediente} />
    </div>
  );
}

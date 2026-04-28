import { redirect, notFound } from "next/navigation";
import { Suspense } from "react";
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
      <Suspense
        fallback={
          <div className="flex h-64 w-full items-center justify-center">
            <div className="w-8 h-8 border-4 border-navy border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <ExpedienteDetalle data={expediente} />
      </Suspense>
    </div>
  );
}

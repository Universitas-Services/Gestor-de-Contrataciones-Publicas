import { redirect, notFound } from "next/navigation";

import { Fase1Form } from "@/components/features-components/ElaboracionExpediente/fase-1/Fase1Form";
import { getCurrentUser } from "@/lib/auth/auth";
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

  return (
    <div className="w-full min-w-0 max-w-full mx-auto flex flex-col items-start p-0 overflow-x-hidden">
      <Fase1Form />
    </div>
  );
}

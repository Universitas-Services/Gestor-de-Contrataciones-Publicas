import { notFound, redirect } from "next/navigation";

import { Fase1Form } from "@/components/features-components/ElaboracionExpediente/fase-1/Fase1Form";
import { getCurrentUser } from "@/lib/auth/auth";
import { obtenerEnte } from "@/services/enteService";
import { obtenerExpediente } from "@/services/expedienteService";
import { listarPresupuestoItems, obtenerFasePreparatoria } from "@/services/fase1Service";

interface Props {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ fase1Id?: string | string[] }>;
}

export default async function Fase1Page({ params, searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const resolvedSearchParams = searchParams
    ? await searchParams
    : ({ fase1Id: undefined } as { fase1Id?: string | string[] });

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

  const [initialFasePreparatoria, presupuestoItemsResponse] = await Promise.all([
    obtenerFasePreparatoria(id),
    listarPresupuestoItems(id, { page: 1, limit: 1 }),
  ]);

  const queryFase1Id =
    typeof resolvedSearchParams.fase1Id === "string" ? resolvedSearchParams.fase1Id : undefined;

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-full flex-col items-start overflow-x-hidden p-0">
      <Fase1Form
        expedienteId={id}
        direccionEnteDefault={direccionEnteDefault}
        initialFasePreparatoria={initialFasePreparatoria}
        hasPersistedItems={presupuestoItemsResponse.meta.total > 0}
        isEditMode={initialFasePreparatoria !== null}
        initialFase1IdFromQuery={queryFase1Id}
      />
    </div>
  );
}

import { ExpedienteDetalle } from "@/components/features-components/ElaboracionExpediente/ExpedienteDetalle";
import { redirect, notFound } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth/auth";
import { isReadOnlyRole } from "@/lib/permissions/roleAccess";
import { obtenerExpediente } from "@/services/expedienteService";
import type { Fase1TabValue } from "@/types/fase1.types";

interface Props {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ tab?: string | string[] }>;
}

const VALID_TABS: Fase1TabValue[] = ["fase-0", "fase-1", "fase-2", "fase-3", "fase-4"];

function resolveInitialTab(tab: string | string[] | undefined): Fase1TabValue {
  if (typeof tab !== "string") return "fase-0";
  return VALID_TABS.includes(tab as Fase1TabValue) ? (tab as Fase1TabValue) : "fase-0";
}

export default async function ExpedienteDetallePage({ params, searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const resolvedSearchParams = searchParams
    ? await searchParams
    : ({ tab: undefined } as { tab?: string | string[] });

  let expediente;
  try {
    expediente = await obtenerExpediente(id);
  } catch {
    notFound();
  }

  const initialTab = resolveInitialTab(resolvedSearchParams.tab);

  return (
    <div className="w-full min-w-0 max-w-full mx-auto flex flex-col items-start p-0 overflow-x-hidden">
      <Suspense
        fallback={
          <div className="flex h-64 w-full items-center justify-center">
            <div className="w-8 h-8 border-4 border-navy border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <ExpedienteDetalle data={expediente} readOnly={isReadOnlyRole(user.role)} />
      </Suspense>
    </div>
  );
}

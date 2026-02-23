import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { CompletarEnteForm } from "@/components/forms/admin_ente/CompletarEnteForm";

export const metadata: Metadata = {
  title: "Completar Datos del Ente | Admin Ente",
  description: "Completa la información de tu Ente para continuar",
};

export default async function CompletarEntePage() {
  const user = await getCurrentUser();

  if (!user || !user.enteId) {
    redirect("/login");
  }

  return <CompletarEnteForm enteId={user.enteId as string} />;
}

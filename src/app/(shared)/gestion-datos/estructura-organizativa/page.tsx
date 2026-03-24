import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/auth";
import { ListadoUsuarios } from "@/components/features-components/EstructuraOrganizativa/ListadoUsuarios";

export default async function EstructuraOrganizativaPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin_ente" || !user.enteId) {
    redirect("/login");
  }

  return (
    <div className="min-h-[calc(100vh-64px)] rounded-xl bg-df-bg p-6 md:p-10">
      <div className="mx-auto max-w-full">
        <ListadoUsuarios />
      </div>
    </div>
  );
}

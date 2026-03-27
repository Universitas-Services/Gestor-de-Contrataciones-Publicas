import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/auth";
import { ExpedientesPanel } from "@/components/features-components/ElaboracionExpediente/ExpedientesPanel";

export default async function ElaboracionExpedientePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="w-full max-w-full mx-auto flex flex-col items-center p-0">
      <ExpedientesPanel />
    </div>
  );
}

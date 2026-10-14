import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/auth";
import { SessionsListPanel } from "@/components/features-components/ComplianceExpediente/SessionsListPanel";
import { isReadOnlyRole } from "@/lib/permissions/roleAccess";

export default async function ComplianceExpedientePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="w-full max-w-full mx-auto flex flex-col items-center p-0">
      <SessionsListPanel readOnly={isReadOnlyRole(user.role)} />
    </div>
  );
}

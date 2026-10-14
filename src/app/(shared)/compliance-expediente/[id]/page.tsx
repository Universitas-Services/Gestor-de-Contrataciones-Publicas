import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/auth";
import { ComplianceSessionView } from "@/components/features-components/ComplianceExpediente/ComplianceSessionView";
import { isReadOnlyRole } from "@/lib/permissions/roleAccess";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ComplianceSesionPage({ params }: PageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;

  return (
    <div className="w-full max-w-full mx-auto flex flex-col items-center p-0">
      <ComplianceSessionView sesionId={id} readOnly={isReadOnlyRole(user.role)} />
    </div>
  );
}

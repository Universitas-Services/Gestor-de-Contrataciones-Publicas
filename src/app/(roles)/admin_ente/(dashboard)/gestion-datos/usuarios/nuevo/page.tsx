import { getSessionCookie } from "@/lib/auth/session";
import { CreateUserForm } from "@/components/forms/admin_ente/CreateUserForm";
import { redirect } from "next/navigation";

export default async function NuevoUsuarioPage() {
  const session = await getSessionCookie();

  if (!session || !session.enteId) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col gap-8 p-8 max-w-6xl mx-auto w-full">
      <CreateUserForm enteId={session.enteId} />
    </div>
  );
}

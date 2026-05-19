import { getSessionCookie } from "@/lib/auth/session";
import { UserManagementTable } from "@/components/features-components/GestionUsuarios/UserManagementTable";
import { redirect } from "next/navigation";

export default async function UsuariosPage() {
  const session = await getSessionCookie();

  // Redirigir si no hay sesión o si el usuario no tiene un Ente asociado
  if (!session || !session.enteId) {
    redirect("/login");
  }

  return (
    <div className="p-8">
      <UserManagementTable />
    </div>
  );
}

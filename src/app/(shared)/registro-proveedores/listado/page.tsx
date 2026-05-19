import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/auth";
import { ListadoProveedores } from "../../../../components/features-components/RegistroProveedores/ListadoProveedores";
import { isReadOnlyRole } from "@/lib/permissions/roleAccess";

export default async function ListadoProveedoresPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="w-full max-w-full mx-auto flex flex-col items-center p-0">
      <ListadoProveedores readOnly={isReadOnlyRole(user.role)} />
    </div>
  );
}

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/auth";
import { ListadoProveedores } from "../../../../components/features-components/RegistroProveedores/ListadoProveedores";

export default async function ListadoProveedoresPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="w-full max-w-full mx-auto flex flex-col items-center p-0">
      <ListadoProveedores />
    </div>
  );
}

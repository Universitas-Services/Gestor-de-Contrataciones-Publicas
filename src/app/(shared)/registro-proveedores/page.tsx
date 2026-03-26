import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/auth";
import { RegistroProveedoresDashboard } from "@/components/features-components/RegistroProveedores/RegistroProveedoresDashboard";

export default async function RegistroProveedoresPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="w-full max-w-full mx-auto flex flex-col items-center p-0">
      <RegistroProveedoresDashboard />
    </div>
  );
}

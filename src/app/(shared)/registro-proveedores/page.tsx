import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/auth";
import { RegistroProveedoresDashboard } from "@/components/features-components/RegistroProveedores/RegistroProveedoresDashboard";

export default async function RegistroProveedoresPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-[calc(100vh-80px)] rounded-xl bg-[#DFEAF1] p-4 md:p-8 flex flex-col">
      <RegistroProveedoresDashboard />
    </div>
  );
}

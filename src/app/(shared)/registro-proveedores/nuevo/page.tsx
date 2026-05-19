import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { NuevoProveedorForm } from "@/components/forms/registro_proveedores/NuevoProveedorForm";
import { getCurrentUser } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { isReadOnlyRole } from "@/lib/permissions/roleAccess";

export default async function NuevoProveedorPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="w-full max-w-full mx-auto space-y-6 animate-in fade-in duration-500 rounded-xl">
      {/* Main Container White */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 md:p-12">
        {/* Formulario que se encarga del Multi-Step */}
        <NuevoProveedorForm readOnly={isReadOnlyRole(user.role)} />
      </div>
    </div>
  );
}

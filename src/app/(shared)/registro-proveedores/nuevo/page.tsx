import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { NuevoProveedorForm } from "@/components/forms/registro_proveedores/NuevoProveedorForm";

export default function NuevoProveedorPage() {
  return (
    <div className="w-full max-w-[1280px] mx-auto space-y-6 animate-in fade-in duration-500 rounded-xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 font-medium font-inter mb-4">
        <Link href="/" className="hover:text-slate-900 transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link
          href="/registro-proveedores/listado"
          className="hover:text-slate-900 transition-colors"
        >
          Listado de proveedores
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-900 font-bold">Registro del proveedor</span>
      </div>

      {/* Main Container White */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 md:p-12">
        <div className="mb-10">
          <h1 className="text-[28px] font-extrabold text-slate-800 tracking-tight">
            Identificación y validación
          </h1>
          <p className="text-slate-500 italic mt-1 text-sm">
            Complete los datos iniciales para el registro formal del proveedor en el sistema
            centralizado
          </p>
        </div>

        {/* Formulario que se encarga del Multi-Step */}
        <NuevoProveedorForm />
      </div>
    </div>
  );
}

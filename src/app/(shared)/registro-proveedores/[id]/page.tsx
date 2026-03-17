import { ChevronRight, Download, PenLine, FileText, SwitchCamera, MapPin } from "lucide-react";
import Link from "next/link";
import { ProveedorDetalleView } from "@/components/features-components/RegistroProveedores/ProveedorDetalleView";

export default async function ProveedorPerfilPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;

  return (
    <div className="w-full max-w-[1280px] mx-auto space-y-6 animate-in fade-in duration-500 rounded-xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 font-medium font-inter mb-4">
        <Link href="/" className="hover:text-slate-900 transition-colors hover:underline">
          Dashboard
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link
          href="/registro-proveedores/listado"
          className="hover:text-slate-900 transition-colors hover:underline"
        >
          Listado de proveedores
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-900 font-bold">Perfil del proveedor</span>
      </div>

      <h1 className="text-[28px] font-extrabold text-[#111827] mb-6">Información general</h1>

      <ProveedorDetalleView id={resolvedParams.id} />
    </div>
  );
}

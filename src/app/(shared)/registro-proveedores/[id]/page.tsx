import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ProveedorDetalleView } from "@/components/features-components/RegistroProveedores/ProveedorDetalleView";

export default async function ProveedorPerfilPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;

  return (
    <div className="w-full max-w-[1280px] mx-auto animate-in fade-in duration-500 rounded-xl space-y-6">
      {/* removed double breadcrumbs */}

      <Card className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-border flex flex-col gap-6">
        <h1 className="text-[28px] font-extrabold text-color-titulos">Información general</h1>

        <ProveedorDetalleView id={resolvedParams.id} />
      </Card>
    </div>
  );
}

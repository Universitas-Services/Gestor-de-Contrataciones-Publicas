import { NuevoProveedorForm } from "@/components/forms/registro_proveedores/NuevoProveedorForm";

interface EditarProveedorPageProps {
  params: {
    id: string;
  };
}

export default async function EditarProveedorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="w-full max-w-full mx-auto space-y-6 animate-in fade-in duration-500 rounded-xl">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 md:p-12">
        <NuevoProveedorForm providerId={id} />
      </div>
    </div>
  );
}

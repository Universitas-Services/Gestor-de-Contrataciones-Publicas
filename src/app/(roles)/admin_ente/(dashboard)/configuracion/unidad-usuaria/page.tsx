import { UnidadUsuariaForm } from "@/components/forms/admin_ente/UnidadUsuariaForm";

export default function UnidadUsuariaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Unidad Usuaria</h2>
        <p className="text-muted-foreground">Registra la Unidad Usuaria del Ente Contratante</p>
      </div>
      <div className="rounded-xl border bg-card p-6 shadow-sm max-w-2xl">
        <UnidadUsuariaForm />
      </div>
    </div>
  );
}

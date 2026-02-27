import { ComisionContratacionesForm } from "@/components/forms/admin_ente/ComisionContratacionesForm";

export default function ComisionContratacionesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Comisión de Contrataciones</h2>
        <p className="text-muted-foreground">Crea una comisión y registra sus miembros iniciales</p>
      </div>
      <div className="rounded-xl border bg-card p-6 shadow-sm max-w-3xl">
        <ComisionContratacionesForm />
      </div>
    </div>
  );
}

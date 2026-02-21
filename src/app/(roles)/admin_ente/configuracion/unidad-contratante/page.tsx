import { UnidadContratanteForm } from "@/components/forms/admin_ente/UnidadContratanteForm";

export default function UnidadContratantePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Unidad Contratante</h2>
        <p className="text-muted-foreground">
          Registra la Unidad Contratante del Ente para el proceso de contratación
        </p>
      </div>
      <div className="rounded-xl border bg-card p-6 shadow-sm max-w-2xl">
        <UnidadContratanteForm />
      </div>
    </div>
  );
}

import { MaximaAutoridadForm } from "@/components/forms/admin_ente/MaximaAutoridadForm";

export default function MaximaAutoridadPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Máxima Autoridad</h2>
        <p className="text-muted-foreground">
          Registra la Máxima Autoridad del Ente para el proceso de contratación
        </p>
      </div>
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <MaximaAutoridadForm />
      </div>
    </div>
  );
}

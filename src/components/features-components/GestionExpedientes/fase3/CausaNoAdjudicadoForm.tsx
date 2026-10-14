"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const CAUSA_MAX_LEN = 4000;

interface CausaNoAdjudicadoFormProps {
  oferenteNombre: string;
  oferenteRif?: string;
  defaultValue?: string;
  readOnly?: boolean;
  saving?: boolean;
  onBack: () => void;
  onSave: (causa: string) => void;
}

export function CausaNoAdjudicadoForm({
  oferenteNombre,
  oferenteRif,
  defaultValue = "",
  readOnly = false,
  saving = false,
  onBack,
  onSave,
}: CausaNoAdjudicadoFormProps) {
  const [causa, setCausa] = useState(defaultValue);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!causa.trim()) {
      setError("Indique la causa de no adjudicación");
      return;
    }
    onSave(causa.trim());
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-10 border-border font-semibold text-color-subtitulos"
          onClick={onBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </div>

      <Card className="border border-border shadow-sm">
        <CardHeader className="border-b border-border bg-slate-50 px-6 py-4">
          <CardTitle className="text-[17px] font-bold text-color-titulos">
            Causa de no adjudicación
          </CardTitle>
          <p className="text-[12px] text-muted-foreground">
            Motivación individual que se imprime en la Notificación a no adjudicados.
          </p>
          <p className="pt-1 text-sm font-bold text-navy">
            {oferenteNombre}
            {oferenteRif ? (
              <span className="ml-2 text-xs font-medium text-muted-foreground">{oferenteRif}</span>
            ) : null}
          </p>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-lg border border-slate-200 p-5">
              <p className="text-sm font-bold text-slate-700">
                Indique la causa por la cual este oferente no resultó adjudicado.
              </p>
              <Textarea
                value={causa}
                disabled={readOnly}
                maxLength={CAUSA_MAX_LEN}
                rows={4}
                placeholder="Ej: Su oferta quedó como Segunda Opción con 90 puntos."
                onChange={(e) => {
                  setCausa(e.target.value);
                  if (error) setError(null);
                }}
                aria-invalid={Boolean(error)}
                className="mt-3 resize-none text-sm"
              />
              {error ? (
                <p className="mt-2 text-[12px] font-medium text-destructive">{error}</p>
              ) : null}
            </div>

            {!readOnly ? (
              <div className="flex justify-end border-t border-border pt-5">
                <Button
                  type="submit"
                  disabled={saving}
                  className="h-11 bg-navy px-8 font-semibold text-white hover:bg-navy-hover"
                >
                  {saving ? "Guardando..." : "Guardar causa"}
                </Button>
              </div>
            ) : null}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

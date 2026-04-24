import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Fase1Form() {
  return (
    <div className="w-full min-h-screen bg-slate-50 pb-16">
      <div className="w-full px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="space-y-2">
            <h1 className="text-[28px] font-bold leading-tight text-heading-dark font-inter">
              Fase 1: Preparatoria
            </h1>
            <p className="text-sm text-slate-500">
              Esta vista queda preparada como destino del panel. El formulario visual se maquetará
              en la siguiente iteración.
            </p>
          </div>

          <Card className="border border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-heading-dark">
                Formulario de la Fase 1
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
                <p className="text-base font-medium text-slate-600">
                  Formulario pendiente por maquetar
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  En la siguiente entrega conectaremos aquí la estructura completa del formulario de
                  preparación.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

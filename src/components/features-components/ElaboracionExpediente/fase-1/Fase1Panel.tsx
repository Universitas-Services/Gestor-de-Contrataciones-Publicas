"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Download, Eye, FileText, FileUp, RefreshCw, Settings2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PresupuestoItemsTable } from "./PresupuestoItemsTable";

interface Fase1PanelProps {
  expedienteId: string;
}

interface DocumentoProcedimiento {
  id: string;
  label: string;
}

const DOCUMENTOS_PROCEDIMIENTO: DocumentoProcedimiento[] = [
  { id: "acta-inicio", label: "Acta de Inicio" },
  { id: "pliego-condiciones", label: "Pliego de Condiciones" },
  { id: "llamado-participar", label: "Llamado a participar" },
];

function EmptyText({ children }: { children: ReactNode }) {
  return <p className="text-sm leading-6 text-slate-500">{children}</p>;
}

export function Fase1Panel({ expedienteId }: Fase1PanelProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button asChild className="bg-navy font-semibold text-white shadow-sm hover:bg-navy-hover">
          <Link href={`/elaboracion-expediente/${expedienteId}/fase-1`}>
            Iniciar fase de preparación
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.9fr)]">
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="space-y-0 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-heading-dark">
              <Settings2 className="h-5 w-5 text-navy" />
              Definición técnica y financiera
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <section className="space-y-2">
              <h3 className="text-base font-semibold text-heading-dark">
                Características técnicas
              </h3>
              <EmptyText>
                Sin información registrada para esta fase. Aquí se mostrará la definición técnica
                del procedimiento.
              </EmptyText>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-semibold text-heading-dark">Cantidades y alcance</h3>
              <EmptyText>
                Pendiente por completar. Este bloque resumirá cantidades, alcance operativo y
                unidades asociadas al expediente.
              </EmptyText>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-semibold text-heading-dark">
                Ventajas económicas/técnicas
              </h3>
              <EmptyText>
                Aún no se han incorporado observaciones. Se visualizarán aquí las justificaciones
                técnicas y financieras del procedimiento.
              </EmptyText>
            </section>

            <section className="flex flex-col gap-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-heading-dark">
                  Proyecto de Responsabilidad Social
                </h3>
                <p className="text-sm text-slate-500">
                  Estado pendiente. Se definirá cuando se configure la información del formulario.
                </p>
              </div>

              <Badge
                variant="outline"
                className="w-fit border-slate-200 bg-white px-3 py-1 text-slate-500"
              >
                Sin definir
              </Badge>
            </section>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="space-y-0 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-heading-dark">
              <FileText className="h-5 w-5 text-navy" />
              Documentos del Procedimiento
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            {DOCUMENTOS_PROCEDIMIENTO.map((documento) => (
              <div
                key={documento.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                    <FileUp className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{documento.label}</span>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    disabled
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    aria-label={`Ver ${documento.label}`}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    disabled
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    aria-label={`Descargar ${documento.label}`}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    disabled
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    aria-label={`Regenerar ${documento.label}`}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <PresupuestoItemsTable
        items={[]}
        readOnly
        showAddButton
        addButtonDisabled
        addButtonLabel="Añadir ítem"
        emptyTitle="Sin ítems cargados"
        emptyDescription="La tabla de presupuesto se habilitará cuando se complete el formulario de la Fase 1."
      />
    </div>
  );
}

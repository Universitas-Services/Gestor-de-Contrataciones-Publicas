"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { BsEye, BsArrowClockwise } from "react-icons/bs";
import { IoDownloadOutline, IoDocumentTextOutline, IoFolderOpenOutline } from "react-icons/io5";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { listarEvaluacionesFase3 } from "@/services/oferenteService";
import {
  parseEvaluacionesResponse,
  mapToParticipanteEvaluacion,
  sortByPrelacion,
  getOferenteAdjudicado,
  formatMoneyBs,
  type ParticipanteEvaluacion,
} from "@/lib/utils/evaluacionesFase3Utils";
import { NotificacionOferentesTable } from "./NotificacionOferentesTable";
import { ActaAdjudicacionSheet } from "./ActaAdjudicacionSheet";

const MOCK_DOCUMENTOS = [
  { id: "adjudicacion", label: "Adjudicación", subtitulo: "Firmado el 24/05/2024" },
  { id: "contrato", label: "Contrato", subtitulo: "Pendiente por Visado" },
] as const;

interface Fase4PanelProps {
  expedienteId: string;
  readOnly?: boolean;
  montoEstimadoBs?: string | number | null;
}

interface DatosAdjudicadoCardProps {
  adjudicado: ParticipanteEvaluacion | null;
  montoFallback?: string | number | null;
}

function DatosAdjudicadoCard({ adjudicado, montoFallback }: DatosAdjudicadoCardProps) {
  const monto =
    adjudicado?.montoOfertaBs != null
      ? formatMoneyBs(adjudicado.montoOfertaBs)
      : formatMoneyBs(montoFallback);

  return (
    <Card className="border border-border shadow-sm flex flex-col h-full">
      <CardHeader className="pb-3 pt-4 px-6 border-b border-border bg-muted m-0">
        <div className="flex items-center gap-3">
          <IoDocumentTextOutline className="w-[22px] h-[22px] text-color-titulos flex-shrink-0" />
          <CardTitle className="text-[17px] font-bold text-color-titulos leading-tight">
            Datos del oferente adjudicado
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-6 py-5 flex-1 flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-[11px] text-muted-foreground font-inter italic mb-1">
              Empresa Adjudicada
            </p>
            <p className="text-sm font-semibold text-color-titulos font-inter">
              {adjudicado?.nombreEmpresa ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-inter italic mb-1">RIF</p>
            <p className="text-sm font-semibold text-color-titulos font-mono">
              {adjudicado?.rif ?? "—"}
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-muted px-5 py-4 mt-auto">
          <p className="text-[11px] text-muted-foreground font-inter italic mb-1">
            Monto de contratación
          </p>
          <p className="text-xl font-bold text-color-titulos font-inter tabular-nums">
            Bs. {monto}
          </p>
        </div>

        {!adjudicado && (
          <p className="text-xs text-muted-foreground italic">
            No se ha registrado un oferente con primera opción de prelación.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function DocumentosProcesoCard({ readOnly }: { readOnly?: boolean }) {
  const handleMockAction = () => {
    toast.info("Esta acción estará disponible próximamente.");
  };

  return (
    <Card className="border border-border shadow-sm flex flex-col">
      <CardHeader className="pb-3 pt-4 px-6 border-b border-border bg-muted m-0">
        <div className="flex items-center gap-3">
          <IoFolderOpenOutline className="w-[22px] h-[22px] text-color-titulos flex-shrink-0" />
          <CardTitle className="text-[17px] font-bold text-color-titulos leading-tight">
            Documentos del proceso
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-6 py-4 space-y-3">
        {MOCK_DOCUMENTOS.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-4 py-3"
          >
            <div>
              <p className="text-[13px] font-bold text-color-titulos leading-tight">{doc.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 italic">{doc.subtitulo}</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                type="button"
                className="text-muted-foreground hover:text-navy transition-colors disabled:opacity-40"
                title="Previsualizar documento"
                disabled={readOnly}
                onClick={handleMockAction}
              >
                <BsEye className="w-[20px] h-[20px]" />
              </button>
              <button
                type="button"
                className="text-muted-foreground hover:text-navy transition-colors disabled:opacity-40"
                title="Descargar documento"
                disabled={readOnly}
                onClick={handleMockAction}
              >
                <IoDownloadOutline className="w-[20px] h-[20px]" />
              </button>
              <button
                type="button"
                className="text-muted-foreground hover:text-navy transition-colors disabled:opacity-40"
                title="Actualizar documento"
                disabled={readOnly}
                onClick={handleMockAction}
              >
                <BsArrowClockwise className="w-[20px] h-[20px]" />
              </button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function Fase4Panel({ expedienteId, readOnly = false, montoEstimadoBs }: Fase4PanelProps) {
  const [participantes, setParticipantes] = useState<ParticipanteEvaluacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [actaSheetOpen, setActaSheetOpen] = useState(false);

  const adjudicado = getOferenteAdjudicado(participantes);

  const loadParticipantes = async () => {
    if (!expedienteId) return;
    setLoading(true);
    try {
      const rawResponse = await listarEvaluacionesFase3(expedienteId).catch(() => null);
      const evaluacionesList = parseEvaluacionesResponse(rawResponse);
      const mapped = sortByPrelacion(evaluacionesList.map(mapToParticipanteEvaluacion));
      setParticipantes(mapped);

      if (!rawResponse) {
        toast.error("Error al cargar la lista de oferentes");
      }
    } catch {
      toast.error("Error al cargar datos de la fase 4");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParticipantes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expedienteId]);

  const handleMockCrear = () => {
    toast.info("Esta acción estará disponible próximamente.");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <DatosAdjudicadoCard adjudicado={adjudicado} montoFallback={montoEstimadoBs} />

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={readOnly}
              onClick={() => setActaSheetOpen(true)}
              className="border-navy text-navy hover:bg-muted font-semibold text-sm gap-2"
            >
              <Plus className="w-4 h-4" />
              Crear acta de adjudicación
            </Button>
            <Button
              type="button"
              disabled={readOnly}
              onClick={handleMockCrear}
              className="bg-navy hover:bg-navy-hover text-white font-semibold text-sm gap-2"
            >
              <Plus className="w-4 h-4" />
              Crear contrato
            </Button>
          </div>

          <DocumentosProcesoCard readOnly={readOnly} />
        </div>
      </div>

      <NotificacionOferentesTable
        participantes={participantes}
        loading={loading}
        readOnly={readOnly}
      />

      <ActaAdjudicacionSheet
        open={actaSheetOpen}
        onOpenChange={setActaSheetOpen}
        readOnly={readOnly}
      />
    </div>
  );
}

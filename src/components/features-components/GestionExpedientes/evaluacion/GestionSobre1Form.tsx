"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaRegBuilding } from "react-icons/fa";
import { toast } from "sonner";

import { ChecklistQuestionRow } from "@/components/features-components/GestionExpedientes/evaluacion/ChecklistQuestionRow";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRoleAccess } from "@/hooks/use-role-access";
import {
  GESTION_SOBRE1_ITEMS,
  buildSobre1Payload,
  hydrateChecklistFromApi,
} from "@/lib/constants/gestionEvaluacionCotejo";
import { evaluacionPath, expedienteTabPath } from "@/lib/utils/evaluacionRoutes";
import type { ChecklistSiNo } from "@/types/evaluacionFase3.types";
import { obtenerExpediente } from "@/services/expedienteService";
import {
  evaluarSobre1Fase3,
  listarEvaluacionesFase3,
  obtenerEvaluacionFase3,
} from "@/services/oferenteService";

const BASE_PATH = "/gestion-expedientes";
const RETURN_TAB = "fase-2";

interface GestionSobre1FormProps {
  expedienteId: string;
  evaluacionId: string;
}

function parseEvaluacionesList(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) return raw as Record<string, unknown>[];
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data as Record<string, unknown>[];
    if (Array.isArray(obj.evaluaciones)) return obj.evaluaciones as Record<string, unknown>[];
  }
  return [];
}

export function GestionSobre1Form({ expedienteId, evaluacionId }: GestionSobre1FormProps) {
  const router = useRouter();
  const { readOnly } = useRoleAccess();

  const [loading, setLoading] = useState(true);
  const [oferente, setOferente] = useState<Record<string, unknown> | null>(null);
  const [modalidad, setModalidad] = useState("EN PROCESO");
  const [respuestas, setRespuestas] = useState<Record<number, ChecklistSiNo>>({});
  const [obsAbiertas, setObsAbiertas] = useState<Record<number, boolean>>({});
  const [observaciones, setObservaciones] = useState<Record<number, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const allAnswered = Object.keys(respuestas).length >= GESTION_SOBRE1_ITEMS.length;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [exp, evaluacionesRaw, evaluacionData]: [unknown, unknown, unknown] =
          await Promise.all([
            obtenerExpediente(expedienteId),
            listarEvaluacionesFase3(expedienteId),
            obtenerEvaluacionFase3(evaluacionId).catch(() => null),
          ]);

        const list = parseEvaluacionesList(evaluacionesRaw);
        const target =
          list.find((o) => String(o.id) === String(evaluacionId)) ??
          (evaluacionData && typeof evaluacionData === "object"
            ? (evaluacionData as Record<string, unknown>)
            : null);

        if (target) setOferente(target);

        const expObj = exp as { modalidad?: { tipoContratacion?: string } } | null;
        if (expObj?.modalidad?.tipoContratacion) {
          setModalidad(expObj.modalidad.tipoContratacion);
        }

        const sobre1 =
          evaluacionData && typeof evaluacionData === "object"
            ? ((evaluacionData as Record<string, unknown>).sobre1 as
                | Record<string, unknown>
                | undefined)
            : undefined;

        const hydrated = hydrateChecklistFromApi(GESTION_SOBRE1_ITEMS, sobre1);
        setRespuestas(hydrated.respuestas);
        setObservaciones(hydrated.observaciones);
        setObsAbiertas(hydrated.obsAbiertas);
      } catch {
        toast.error("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [expedienteId, evaluacionId]);

  const handleToggle = (id: number, valor: ChecklistSiNo) => {
    if (readOnly) return;
    setRespuestas((prev) => ({ ...prev, [id]: valor }));
  };

  const toggleObs = (id: number) => {
    if (readOnly) return;
    setObsAbiertas((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const saveObs = (id: number) => {
    if (readOnly) return;
    setObsAbiertas((prev) => ({ ...prev, [id]: false }));
  };

  const handleNext = async () => {
    if (readOnly) return;
    if (!allAnswered) {
      toast.error("Debe responder todas las preguntas antes de continuar");
      return;
    }

    setIsSaving(true);
    try {
      const payload = buildSobre1Payload(respuestas, observaciones);
      await evaluarSobre1Fase3(evaluacionId, payload);
      toast.success("Sobre 1 guardado correctamente");
      router.push(evaluacionPath(BASE_PATH, expedienteId, evaluacionId, "sobre-2"));
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Error al guardar la evaluación");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-navy border-t-transparent" />
          <p className="text-sm italic text-muted-foreground">Cargando verificación...</p>
        </div>
      </div>
    );
  }

  if (!oferente) {
    return (
      <div className="p-8 text-center italic text-destructive">
        Oferente no encontrado
        <br />
        <Button
          className="mt-4"
          onClick={() => router.push(expedienteTabPath(BASE_PATH, expedienteId, RETURN_TAB))}
        >
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 lg:p-12">
      <div className="mx-auto max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="mb-6 text-[22px] font-bold text-color-titulos">
          Verificación de recaudos - Lista de cotejo
        </h1>

        <Card className="mb-8 overflow-hidden rounded-lg border-slate-200 bg-white shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-transparent bg-edificio-bg text-edificio-icon">
                <FaRegBuilding className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-[17px] font-bold text-color-titulos">
                  {String(oferente.nombreProveedorEvaluado ?? "—")}
                </h2>
                <p className="mt-0.5 text-[12px] italic text-muted-foreground">
                  RIF: {String(oferente.rifProveedorEvaluado ?? "—")}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="mb-1 inline-block rounded-full bg-[var(--evaluado-bg)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--success-text)]">
                {modalidad}
              </span>
              <p className="text-[12px] italic text-muted-foreground">
                Representante:{" "}
                <span className="font-semibold text-color-titulos">
                  {String(oferente.nombreRepLegalEvaluado ?? "—")}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="mb-2 flex items-center gap-3 py-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy text-lg font-bold text-white shadow-sm">
              A
            </div>
            <div>
              <h3 className="text-[17px] font-bold leading-tight text-navy">Contenido sobre N°1</h3>
              <p className="text-[13px] italic text-muted-foreground">
                Recaudos legales y financieros
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {GESTION_SOBRE1_ITEMS.map((q) => (
              <ChecklistQuestionRow
                key={q.id}
                id={q.id}
                texto={q.texto}
                respuesta={respuestas[q.id]}
                observacion={observaciones[q.id]}
                obsAbierta={!!obsAbiertas[q.id]}
                readOnly={readOnly}
                onToggle={handleToggle}
                onToggleObs={toggleObs}
                onChangeObs={(id, value) => setObservaciones((prev) => ({ ...prev, [id]: value }))}
                onSaveObs={saveObs}
              />
            ))}
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-slate-200 pt-6">
          <Button
            variant="outline"
            className="h-11 rounded-md border-slate-200 px-8 font-semibold text-slate-500 hover:bg-slate-50"
            onClick={() => router.push(expedienteTabPath(BASE_PATH, expedienteId, RETURN_TAB))}
          >
            Anterior
          </Button>
          {!readOnly ? (
            <Button
              className="h-11 rounded-md bg-navy px-8 font-semibold text-white hover:bg-navy-hover disabled:opacity-50"
              onClick={handleNext}
              disabled={isSaving || !allAnswered}
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Guardando...
                </span>
              ) : (
                "Siguiente"
              )}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

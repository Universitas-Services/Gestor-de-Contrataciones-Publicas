"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FaRegBuilding } from "react-icons/fa";
import { toast } from "sonner";

import {
  CumpleNoCumpleToggle,
  JustificacionCondicional,
} from "@/components/features-components/GestionExpedientes/evaluacion/CumpleNoCumpleToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRoleAccess } from "@/hooks/use-role-access";
import {
  CRITERIOS_MATRIZ_MAX,
  OPCIONES_PRELACION_DEFAULT,
  buildCalificacionEvaluacionTecnicaPayload,
  buildSobre2EvaluacionPayload,
  emptyMatrizFormState,
  getCriteriosMatrizPorTipo,
  hydrateMatrizFromApi,
  type MatrizFormState,
} from "@/lib/constants/gestionEvaluacionCalificacion";
import { evaluacionPath, expedienteTabPath } from "@/lib/utils/evaluacionRoutes";
import type { ChecklistSiNo } from "@/types/evaluacionFase3.types";
import { obtenerExpediente } from "@/services/expedienteService";
import {
  evaluarCalificacionFase3,
  evaluarSobre2EvaluacionFase3,
  listarEvaluacionesFase3,
  obtenerEvaluacionFase3,
  obtenerMetricasEvaluacionFase3,
} from "@/services/oferenteService";

const BASE_PATH = "/gestion-expedientes";
const RETURN_TAB = "fase-2";

interface GestionMatrizFormProps {
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

const ORDINALES = [
  "Primera",
  "Segunda",
  "Tercera",
  "Cuarta",
  "Quinta",
  "Sexta",
  "Séptima",
  "Octava",
  "Novena",
  "Décima",
];

function generarOpcionesPrelacion(total: number): string[] {
  const n = Math.max(total, OPCIONES_PRELACION_DEFAULT.length);
  return Array.from({ length: Math.min(n, ORDINALES.length) }, (_, i) => `${ORDINALES[i]} opción`);
}

export function GestionMatrizForm({ expedienteId, evaluacionId }: GestionMatrizFormProps) {
  const router = useRouter();
  const { readOnly } = useRoleAccess();

  const [loading, setLoading] = useState(true);
  const [oferente, setOferente] = useState<Record<string, unknown> | null>(null);
  const [tipoContratacion, setTipoContratacion] = useState("BIENES");
  const [modalidadLabel, setModalidadLabel] = useState("EN PROCESO");
  const [showVan, setShowVan] = useState(false);
  const [form, setForm] = useState<MatrizFormState>(emptyMatrizFormState);
  const [opcionesPrelacion, setOpcionesPrelacion] = useState<string[]>([
    ...OPCIONES_PRELACION_DEFAULT,
  ]);
  const [isSaving, setIsSaving] = useState(false);

  const criterios = useMemo(() => getCriteriosMatrizPorTipo(tipoContratacion), [tipoContratacion]);

  const patch = <K extends keyof MatrizFormState>(key: K, value: MatrizFormState[K]) => {
    if (readOnly) return;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setPuntaje = (index: number, raw: string) => {
    if (readOnly) return;
    const max = CRITERIOS_MATRIZ_MAX[index] ?? 15;
    let n = Number(raw);
    if (!Number.isFinite(n)) n = 0;
    if (n < 0) n = 0;
    if (n > max) n = max;
    setForm((prev) => {
      const next = [...prev.puntuaciones] as [number, number, number, number];
      next[index] = n;
      return { ...prev, puntuaciones: next };
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [exp, evaluacionesRaw, evaluacionData, metricas]: [
          unknown,
          unknown,
          unknown,
          unknown,
        ] = await Promise.all([
          obtenerExpediente(expedienteId),
          listarEvaluacionesFase3(expedienteId),
          obtenerEvaluacionFase3(evaluacionId).catch(() => null),
          obtenerMetricasEvaluacionFase3(expedienteId).catch(() => null),
        ]);

        const list = parseEvaluacionesList(evaluacionesRaw);
        const target =
          list.find((o) => String(o.id) === String(evaluacionId)) ??
          (evaluacionData && typeof evaluacionData === "object"
            ? (evaluacionData as Record<string, unknown>)
            : null);

        if (target) setOferente(target);

        const expObj = exp as {
          modalidad?: { tipoContratacion?: string; modalidadSeleccion?: string };
        } | null;
        const tipo = expObj?.modalidad?.tipoContratacion ?? "BIENES";
        setTipoContratacion(tipo);
        setModalidadLabel(tipo);

        if (evaluacionData && typeof evaluacionData === "object") {
          const data = evaluacionData as Record<string, unknown>;
          setForm(hydrateMatrizFromApi(data));

          const sobre2 =
            data.sobre2 && typeof data.sobre2 === "object"
              ? (data.sobre2 as Record<string, unknown>)
              : undefined;
          setShowVan(sobre2?.declaracionAutocalculoVan === true);
        }

        const totalOferentes =
          (metricas as { totalOferentes?: number } | null)?.totalOferentes ?? list.length;
        if (totalOferentes > 0) {
          setOpcionesPrelacion(generarOpcionesPrelacion(totalOferentes));
        }
      } catch {
        toast.error("Error al cargar la matriz de evaluación");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [expedienteId, evaluacionId]);

  const handleGuardar = async () => {
    if (readOnly) return;

    if (!form.oferenteEvaluadoTecnico) {
      toast.error("Indique si el oferente cumplió con la evaluación técnica");
      return;
    }
    if (!form.justificacionEvaluadoTecnico.trim()) {
      toast.error("Indique la justificación de la evaluación técnica");
      return;
    }
    if (!form.montoOfertaBs) {
      toast.error("Debe indicar el monto de la oferta");
      return;
    }
    if (showVan && form.porcentajeVan === "") {
      toast.error("Indique el porcentaje VAN");
      return;
    }
    if (!form.posicionPrelacion) {
      toast.error("Debe indicar el orden de prelación");
      return;
    }

    setIsSaving(true);
    try {
      await evaluarCalificacionFase3(evaluacionId, buildCalificacionEvaluacionTecnicaPayload(form));
      const payload = buildSobre2EvaluacionPayload(criterios, form, showVan);
      await evaluarSobre2EvaluacionFase3(evaluacionId, payload);
      toast.success("Evaluación guardada correctamente");
      router.push(expedienteTabPath(BASE_PATH, expedienteId, RETURN_TAB));
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
          <p className="text-sm italic text-muted-foreground">Cargando matriz de evaluación...</p>
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
        <h1 className="mb-2 text-[22px] font-bold text-color-titulos">Matriz de evaluación</h1>
        <p className="mb-4 text-[13px] italic text-muted-foreground">
          Si el oferente cumplió con los recaudos anteriores, asigne los puntajes técnicos y
          económicos según los criterios del Pliego.
        </p>

        <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-[13px] text-slate-700">
          Asigne los puntajes técnicos y económicos según los criterios del Pliego (Art. 95, 109
          LCP). Modalidad actual:{" "}
          <span className="font-bold capitalize">{modalidadLabel.toLowerCase()}</span>.
        </div>

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
                {modalidadLabel}
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

        <div className="space-y-6">
          <Card className="overflow-hidden rounded-lg border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-5 p-6 md:p-8">
              <div>
                <h3 className="text-[17px] font-bold text-color-titulos">
                  Evaluación Técnica ({modalidadLabel})
                </h3>
                <p className="mt-1 text-[11px] italic text-muted-foreground">
                  Artículos 95, 109 LCP (Criterios definidos en el Pliego).
                </p>
              </div>

              <div className="space-y-3">
                {criterios.map((nombre, index) => (
                  <div
                    key={nombre}
                    className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Criterio {index + 1}
                      </p>
                      <p className="mt-1 text-[13px] font-semibold text-color-titulos">{nombre}</p>
                    </div>
                    <div className="w-full sm:w-32">
                      <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Puntaje
                      </label>
                      <Input
                        type="number"
                        min={0}
                        max={CRITERIOS_MATRIZ_MAX[index]}
                        step="any"
                        placeholder={`Max ${CRITERIOS_MATRIZ_MAX[index]}`}
                        value={form.puntuaciones[index]}
                        disabled={readOnly}
                        onChange={(e) => setPuntaje(index, e.target.value)}
                        className="h-11 text-center font-bold tabular-nums"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-5">
                <p className="text-[13px] font-bold text-color-titulos">
                  Indique si este oferente cumplió con la evaluación técnica general.
                </p>
                <p className="mt-1 text-[11px] italic text-muted-foreground">
                  Artículos: Art. 95 LCP; 24.b NORMAS SUNAI.
                </p>
                <div className="mt-3">
                  <CumpleNoCumpleToggle
                    value={form.oferenteEvaluadoTecnico}
                    readOnly={readOnly}
                    onChange={(v: ChecklistSiNo) => patch("oferenteEvaluadoTecnico", v)}
                  />
                </div>
                <JustificacionCondicional
                  value={form.oferenteEvaluadoTecnico}
                  justificacion={form.justificacionEvaluadoTecnico}
                  readOnly={readOnly}
                  onChange={(v) => patch("justificacionEvaluadoTecnico", v)}
                  siPrompt="Indique una breve justificación del porqué cumplió con la evaluación técnica este oferente."
                  noPrompt="Indique una breve justificación del porqué No cumplió con la evaluación técnica este oferente."
                />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-lg border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-5 p-6 md:p-8">
              <h3 className="text-[17px] font-bold text-navy">Evaluación económica</h3>

              <div>
                <label className="block text-[13px] font-bold text-color-titulos">
                  Indique el monto bolívares (Bs.) de la oferta de la empresa oferente.
                </label>
                <p className="mb-2 text-[11px] italic text-muted-foreground">
                  Artículos 95, 109 LCP; 18. 4 LOPA; 25 NORMAS DE CONTROL INTERNO SUNAI
                </p>
                <MoneyInput
                  placeholder="Ej: 1.500,50"
                  value={form.montoOfertaBs}
                  disabled={readOnly}
                  onValueChange={(cleanValue) => patch("montoOfertaBs", cleanValue)}
                  className="h-11"
                />
              </div>

              {showVan ? (
                <div>
                  <label className="block text-[13px] font-bold text-color-titulos">
                    Ingrese el Porcentaje (%) de Valor Agregado Nacional (VAN) de la oferta (si
                    aplica):
                  </label>
                  <p className="mb-2 text-[11px] italic text-muted-foreground">
                    Artículos 17 LCC; 18 NORMAS DE CONTROL INTERNO SUNAI.
                  </p>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step="any"
                    placeholder="0-100"
                    value={form.porcentajeVan}
                    disabled={readOnly}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === "") {
                        patch("porcentajeVan", "");
                        return;
                      }
                      const num = Number(raw);
                      if (!Number.isFinite(num)) {
                        patch("porcentajeVan", "");
                        return;
                      }
                      if (num < 0) {
                        patch("porcentajeVan", "0");
                        return;
                      }
                      if (num > 100) {
                        patch("porcentajeVan", "100");
                        return;
                      }
                      patch("porcentajeVan", raw);
                    }}
                    className="h-11 max-w-xs"
                  />
                </div>
              ) : null}

              <div>
                <label className="block text-[13px] font-bold text-color-titulos">
                  Indique en el orden de prelación, la posición de la empresa según su evaluación.
                </label>
                <p className="mb-2 text-[11px] italic text-muted-foreground">
                  Ejemplo: Primera opción
                </p>
                <Select
                  value={form.posicionPrelacion || undefined}
                  onValueChange={readOnly ? undefined : (v) => patch("posicionPrelacion", v)}
                  disabled={readOnly}
                >
                  <SelectTrigger className="h-11 max-w-md text-[13px]">
                    <SelectValue placeholder="Seleccione la prelación..." />
                  </SelectTrigger>
                  <SelectContent>
                    {opcionesPrelacion.map((opt) => (
                      <SelectItem key={opt} value={opt} className="text-[13px]">
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-slate-200 pt-6">
          <Button
            variant="outline"
            className="h-11 rounded-md border-slate-200 px-8 font-semibold text-slate-500 hover:bg-slate-50"
            onClick={() =>
              router.push(evaluacionPath(BASE_PATH, expedienteId, evaluacionId, "calificacion"))
            }
          >
            Anterior
          </Button>
          {!readOnly ? (
            <Button
              className="h-11 rounded-md bg-navy px-8 font-semibold text-white hover:bg-navy-hover disabled:opacity-50"
              onClick={handleGuardar}
              disabled={isSaving}
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Guardando...
                </span>
              ) : (
                "Guardar evaluación"
              )}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

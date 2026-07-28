"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { FaRegBuilding } from "react-icons/fa";
import { toast } from "sonner";

import {
  CumpleNoCumpleToggle,
  JustificacionCondicional,
} from "@/components/features-components/GestionExpedientes/evaluacion/CumpleNoCumpleToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRoleAccess } from "@/hooks/use-role-access";
import {
  buildCalificacionPayload,
  emptyCalificacionFormState,
  hydrateCalificacionFromApi,
  type CalificacionFormState,
} from "@/lib/constants/gestionEvaluacionCalificacion";
import { evaluacionPath, expedienteTabPath } from "@/lib/utils/evaluacionRoutes";
import type { ChecklistSiNo } from "@/types/evaluacionFase3.types";
import { obtenerExpediente } from "@/services/expedienteService";
import {
  evaluarCalificacionFase3,
  listarEvaluacionesFase3,
  obtenerEvaluacionFase3,
} from "@/services/oferenteService";

const BASE_PATH = "/gestion-expedientes";
const RETURN_TAB = "fase-2";

interface GestionCalificacionFormProps {
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

/** Limita el valor a 0–100 (vacío permitido mientras escribe). */
function clampScore0to100(raw: string): string {
  if (raw === "") return "";
  const num = Number(raw);
  if (!Number.isFinite(num)) return "";
  if (num < 0) return "0";
  if (num > 100) return "100";
  return raw;
}

function ScoreInput({
  label,
  articulos,
  value,
  readOnly,
  onChange,
}: {
  label: string;
  articulos?: string;
  value: string;
  readOnly?: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[13px] font-bold text-color-titulos">{label}</label>
      {articulos ? <p className="text-[11px] italic text-muted-foreground">{articulos}</p> : null}
      <Input
        type="number"
        min={0}
        max={100}
        step="any"
        placeholder="0-100"
        value={value}
        disabled={readOnly}
        onChange={(e) => onChange(clampScore0to100(e.target.value))}
        className="h-11 max-w-xs"
      />
    </div>
  );
}

export function GestionCalificacionForm({
  expedienteId,
  evaluacionId,
}: GestionCalificacionFormProps) {
  const router = useRouter();
  const { readOnly } = useRoleAccess();

  const [loading, setLoading] = useState(true);
  const [oferente, setOferente] = useState<Record<string, unknown> | null>(null);
  const [modalidad, setModalidad] = useState("EN PROCESO");
  const [form, setForm] = useState<CalificacionFormState>(emptyCalificacionFormState);
  const [isSaving, setIsSaving] = useState(false);

  const patch = <K extends keyof CalificacionFormState>(
    key: K,
    value: CalificacionFormState[K]
  ) => {
    if (readOnly) return;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

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

        if (evaluacionData && typeof evaluacionData === "object") {
          setForm(hydrateCalificacionFromApi(evaluacionData as Record<string, unknown>));
        }
      } catch {
        toast.error("Error al cargar los datos de calificación");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [expedienteId, evaluacionId]);

  const validateBase = (): string | null => {
    if (!form.oferenteCalificadoLegal) return "Indique si cumplió con la calificación legal";
    if (!form.justificacionCalificadoLegal.trim())
      return "Indique la justificación de la calificación legal";
    if (form.indiceLiquidez === "") return "Indique el índice de liquidez";
    if (form.indiceSolvencia === "") return "Indique el índice de solvencia";
    if (!form.oferenteCalificadoFinanciera)
      return "Indique si cumplió con la calificación financiera";
    if (!form.justificacionCalificadaFinanciera.trim())
      return "Indique la justificación de la calificación financiera";
    if (form.actividadComercial === "") return "Indique el puntaje de actividad comercial";
    if (form.relacionSuministros === "") return "Indique el puntaje de relación de suministros";
    if (form.referenciasComercialesPuntaje === "")
      return "Indique el puntaje de referencias comerciales";
    if (!form.oferenteCalificadoTecnica) return "Indique si cumplió con la calificación técnica";
    if (!form.justificacionCalificadoTecnica.trim())
      return "Indique la justificación de la calificación técnica";
    if (!form.oferenteCalificado) return "Indique si el oferente califica para continuar";
    return null;
  };

  const handleDescalificar = async () => {
    if (readOnly) return;
    const err = validateBase();
    if (err) {
      toast.error(err);
      return;
    }
    if (form.oferenteCalificado !== "NO") {
      toast.error("Seleccione NO CALIFICA para descalificar");
      return;
    }
    if (!form.motivoDescalificacion.trim()) {
      toast.error("Indique el motivo de la descalificación");
      return;
    }
    if (!form.itemsDescalificacion.trim()) {
      toast.error("Indique el ítem del Pliego o artículo incumplido");
      return;
    }

    setIsSaving(true);
    try {
      await evaluarCalificacionFase3(evaluacionId, buildCalificacionPayload(form));
      toast.success("Descalificación guardada");
      router.push(expedienteTabPath(BASE_PATH, expedienteId, RETURN_TAB));
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Error al guardar la descalificación");
    } finally {
      setIsSaving(false);
    }
  };

  const handleIrAMatriz = async () => {
    if (readOnly) return;
    const err = validateBase();
    if (err) {
      toast.error(err);
      return;
    }
    if (form.oferenteCalificado !== "SI") {
      toast.error("Seleccione SÍ CALIFICA para continuar a la matriz");
      return;
    }

    setIsSaving(true);
    try {
      await evaluarCalificacionFase3(evaluacionId, buildCalificacionPayload(form));
      toast.success("Calificación guardada");
      router.push(evaluacionPath(BASE_PATH, expedienteId, evaluacionId, "matriz"));
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Error al guardar la calificación");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-navy border-t-transparent" />
          <p className="text-sm italic text-muted-foreground">Cargando calificación...</p>
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
        <h1 className="mb-2 text-[22px] font-bold text-color-titulos">
          Evaluación de ofertas y recomendación
        </h1>
        <p className="mb-6 text-[13px] italic text-muted-foreground">
          Verifique el cumplimiento de los recaudos legales y técnicos de cada oferente, asigne los
          puntajes correspondientes y genere el Informe de Recomendación para la adjudicación
        </p>

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

        <div className="space-y-6">
          {/* Legal */}
          <Card className="overflow-hidden rounded-lg border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-4 p-6 md:p-8">
              <h3 className="text-[17px] font-bold text-color-titulos">Calificación Legal</h3>
              <div>
                <p className="text-[13px] font-bold text-color-titulos">
                  Indique si este oferente cumplió con la calificación legal.
                </p>
                <p className="mt-1 text-[11px] italic text-muted-foreground">
                  Artículos 95 LCP; 18. 4 LOPA; 16 Normas SUNAI
                </p>
              </div>
              <CumpleNoCumpleToggle
                value={form.oferenteCalificadoLegal}
                readOnly={readOnly}
                onChange={(v: ChecklistSiNo) => patch("oferenteCalificadoLegal", v)}
              />
              <JustificacionCondicional
                value={form.oferenteCalificadoLegal}
                justificacion={form.justificacionCalificadoLegal}
                readOnly={readOnly}
                onChange={(v) => patch("justificacionCalificadoLegal", v)}
                siPrompt="Indique una breve justificación del porqué cumplió con la calificación legal este oferente."
                noPrompt="Indique una breve justificación del porqué No cumplió con la calificación legal este oferente."
              />
            </CardContent>
          </Card>

          {/* Financiera */}
          <Card className="overflow-hidden rounded-lg border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-5 p-6 md:p-8">
              <h3 className="text-[17px] font-bold text-color-titulos">Calificación financiera</h3>

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-[13px] font-bold text-color-titulos">
                    Indique el resultado numérico obtenido en el Índice de Liquidez (Activo
                    Corriente / Pasivo Corriente) para este oferente.
                  </label>
                  <p className="text-[11px] italic text-muted-foreground">
                    Artículos: Art. 95 LCP; Art. 16 NORMAS SUNAI.
                  </p>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step="any"
                    placeholder="0-100"
                    value={form.indiceLiquidez}
                    disabled={readOnly}
                    onChange={(e) => patch("indiceLiquidez", clampScore0to100(e.target.value))}
                    className="h-11 max-w-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[13px] font-bold text-color-titulos">
                    Indique el resultado numérico obtenido en el Índice de Solvencia (Pasivo Total /
                    Activo Total) para este oferente.
                  </label>
                  <p className="text-[11px] italic text-muted-foreground">
                    Artículos: Art. 95 LCP; Art. 16 NORMAS SUNAI.
                  </p>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step="any"
                    placeholder="0-100"
                    value={form.indiceSolvencia}
                    disabled={readOnly}
                    onChange={(e) => patch("indiceSolvencia", clampScore0to100(e.target.value))}
                    className="h-11 max-w-xs"
                  />
                </div>
              </div>

              <div>
                <p className="text-[13px] font-bold text-color-titulos">
                  Indique si este oferente cumplió con la calificación financiera.
                </p>
                <p className="mt-1 text-[11px] italic text-muted-foreground">
                  Artículos 95 LCP; 18. 4 LOPA; 16 Normas SUNAI
                </p>
              </div>
              <CumpleNoCumpleToggle
                value={form.oferenteCalificadoFinanciera}
                readOnly={readOnly}
                onChange={(v) => patch("oferenteCalificadoFinanciera", v)}
              />
              <JustificacionCondicional
                value={form.oferenteCalificadoFinanciera}
                justificacion={form.justificacionCalificadaFinanciera}
                readOnly={readOnly}
                onChange={(v) => patch("justificacionCalificadaFinanciera", v)}
                siPrompt="Indique una breve justificación del porqué cumplió con la calificación financiera este oferente."
                noPrompt="Indique una breve justificación del porqué No cumplió con la calificación financiera este oferente."
              />
            </CardContent>
          </Card>

          {/* Técnica */}
          <Card className="overflow-hidden rounded-lg border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-5 p-6 md:p-8">
              <h3 className="text-[17px] font-bold text-color-titulos">Calificación técnica</h3>

              <div className="space-y-5">
                <ScoreInput
                  label="Indique el puntaje asignado en el criterio de Actividad Comercial, verificando su correspondencia con el objeto y el RNC."
                  articulos="Artículos: Art. 66.12 LCP; Art. 16 NORMAS SUNAI."
                  value={form.actividadComercial}
                  readOnly={readOnly}
                  onChange={(v) => patch("actividadComercial", v)}
                />
                <ScoreInput
                  label="Indique el puntaje asignado en el criterio de Relación de Suministros, Servicios u Obras ejecutadas anteriormente."
                  articulos="Artículos: Art. 66.12 LCP; Art. 16 NORMAS SUNAI."
                  value={form.relacionSuministros}
                  readOnly={readOnly}
                  onChange={(v) => patch("relacionSuministros", v)}
                />
                <ScoreInput
                  label="Indique el puntaje asignado en el criterio de Referencias Comerciales de empresas públicas o privadas y/o evaluación de desempeño del SNC."
                  articulos="Artículos: Art. 66.13 LCP; Art. 16 NORMAS SUNAI."
                  value={form.referenciasComercialesPuntaje}
                  readOnly={readOnly}
                  onChange={(v) => patch("referenciasComercialesPuntaje", v)}
                />
              </div>

              <div>
                <p className="text-[13px] font-bold text-color-titulos">
                  Indique si este oferente cumplió con la calificación técnica.
                </p>
                <p className="mt-1 text-[11px] italic text-muted-foreground">
                  Artículos 95 LCP; 18. 4 LOPA; 16 Normas SUNAI
                </p>
              </div>
              <CumpleNoCumpleToggle
                value={form.oferenteCalificadoTecnica}
                readOnly={readOnly}
                onChange={(v) => patch("oferenteCalificadoTecnica", v)}
              />
              <JustificacionCondicional
                value={form.oferenteCalificadoTecnica}
                justificacion={form.justificacionCalificadoTecnica}
                readOnly={readOnly}
                onChange={(v) => patch("justificacionCalificadoTecnica", v)}
                siPrompt="Indique una breve justificación del porqué cumplió con la calificación técnica este oferente."
                noPrompt="Indique una breve justificación del porqué No cumplió con la calificación técnica este oferente."
              />
            </CardContent>
          </Card>

          {/* Resultado */}
          <Card className="overflow-hidden rounded-lg border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-4 p-6 md:p-8">
              <div>
                <h3 className="text-[15px] font-bold text-color-titulos">
                  RESULTADO: Indique si este oferente califica para continuar a la evaluación.
                </h3>
                <p className="mt-1 text-[11px] italic text-muted-foreground">
                  Artículos 95 LCP; 18. 4 LOPA; 16 NORMAS SUNAI. Si indica NO, el oferente queda
                  descalificado y el proceso para él termina aquí.
                </p>
              </div>

              <CumpleNoCumpleToggle
                value={form.oferenteCalificado}
                readOnly={readOnly}
                onChange={(v) => patch("oferenteCalificado", v)}
                siLabel="SÍ, CALIFICA (Ir a Matriz)"
                noLabel="NO CALIFICA (Descalificar)"
              />

              {form.oferenteCalificado === "NO" ? (
                <div className="mt-2 space-y-4 rounded-lg border border-red-200 border-t-4 border-t-red-500 bg-white p-5">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-[14px] font-bold">Motivos de Descalificación</span>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[13px] font-bold text-color-titulos">
                      Indique el motivo detallado de la descalificación
                    </label>
                    <Textarea
                      value={form.motivoDescalificacion}
                      disabled={readOnly}
                      onChange={(e) => patch("motivoDescalificacion", e.target.value)}
                      rows={4}
                      className="resize-y text-[13px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[13px] font-bold text-color-titulos">
                      Ítem del Pliego o Artículo de Ley incumplido
                    </label>
                    <Input
                      value={form.itemsDescalificacion}
                      disabled={readOnly}
                      onChange={(e) => patch("itemsDescalificacion", e.target.value)}
                      className="h-11"
                    />
                  </div>
                  {!readOnly ? (
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        disabled={isSaving}
                        onClick={handleDescalificar}
                        className="h-11 rounded-md bg-red-600 px-6 font-semibold text-white hover:bg-red-700"
                      >
                        {isSaving ? "Guardando..." : "Guardar Descalificación y Salir"}
                      </Button>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {form.oferenteCalificado === "SI" && !readOnly ? (
                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    disabled={isSaving}
                    onClick={handleIrAMatriz}
                    className="h-11 rounded-full bg-navy px-8 font-semibold text-white hover:bg-navy-hover"
                  >
                    {isSaving ? "Guardando..." : "Ir a Matriz de Evaluación →"}
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-slate-200 pt-6">
          <Button
            variant="outline"
            className="h-11 rounded-md border-slate-200 px-8 font-semibold text-slate-500 hover:bg-slate-50"
            onClick={() => router.push(expedienteTabPath(BASE_PATH, expedienteId, RETURN_TAB))}
          >
            Anterior
          </Button>
        </div>
      </div>
    </div>
  );
}

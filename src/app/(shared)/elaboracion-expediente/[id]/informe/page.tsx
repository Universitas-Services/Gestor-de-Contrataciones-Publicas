"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IoSaveOutline } from "react-icons/io5";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { crearInformeRecomendacion, obtenerInformeRecomendacion } from "@/services/oferenteService";
import { generarDocumento } from "@/services/generadorDocumentosService";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface InformeState {
  actualizacionPresupuesto: "SI" | "NO" | null;
  montoNuevoPresupuesto: string;
  justificacionActualizacionPresup: string;
  indVerificadoGarantia: "SI" | "NO" | null;
  indVerificadoCrs: "SI" | "NO" | null;
  observacionFormalidades: "SI" | "NO" | null;
  omisionFormalidades: string;
  subsanacionActo: string;
  datosActoSubsanacion: string;
  plazoEjecucionOfertaGanadora: string;
}

const initialState: InformeState = {
  actualizacionPresupuesto: null,
  montoNuevoPresupuesto: "",
  justificacionActualizacionPresup: "",
  indVerificadoGarantia: null,
  indVerificadoCrs: null,
  observacionFormalidades: null,
  omisionFormalidades: "",
  subsanacionActo: "",
  datosActoSubsanacion: "",
  plazoEjecucionOfertaGanadora: "",
};

// ─── Componente de Pregunta Reutilizable ──────────────────────────────────────

function PreguntaCard({
  pregunta,
  referencia,
  valor,
  onToggle,
  children,
}: {
  pregunta: string;
  referencia: string;
  valor: "SI" | "NO" | null;
  onToggle: (v: "SI" | "NO") => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm transition-all hover:border-slate-300">
      <div className="flex items-start justify-between p-4 min-h-[72px] gap-4">
        <div className="flex-1">
          <p className="text-[13px] font-bold text-color-titulos leading-snug">{pregunta}</p>
          <p className="text-[11px] text-muted-foreground italic mt-0.5">{referencia}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
          <button
            onClick={() => onToggle("SI")}
            className={`px-4 h-8 rounded text-[11px] font-bold border transition-colors ${
              valor === "SI"
                ? "bg-navy text-white border-navy"
                : "bg-white text-slate-400 border-slate-200 hover:border-slate-300 hover:text-slate-500"
            }`}
          >
            SI
          </button>
          <button
            onClick={() => onToggle("NO")}
            className={`px-4 h-8 rounded text-[11px] font-bold border transition-colors ${
              valor === "NO"
                ? "bg-navy text-white border-navy"
                : "bg-white text-slate-400 border-slate-200 hover:border-slate-300 hover:text-slate-500"
            }`}
          >
            NO
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}

// ─── Bloque Condicional ────────────────────────────────────────────────────────

function CampoCondicional({
  label,
  referencia,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  referencia: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="px-4 pb-3 pt-0 bg-[var(--obs-bg)] border-t border-slate-200">
      <div className="flex items-center justify-between pt-3 pb-1">
        <div>
          <p className="text-[12px] font-bold text-color-titulos">{label}</p>
          <p className="text-[11px] text-muted-foreground italic">{referencia}</p>
        </div>
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Escriba aquí..."}
        className="w-full text-[12px] border border-[var(--obs-button)] bg-white text-color-titulos font-medium rounded-md py-2.5 px-3 mt-1 focus:outline-none focus:ring-1 focus:ring-[var(--obs-button)] italic"
      />
    </div>
  );
}

// ─── Página Principal ─────────────────────────────────────────────────────────

export default function InformeRecomendacionPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = React.use(params);
  const { id } = unwrappedParams;

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<InformeState>(initialState);

  // ── Cargar datos existentes (modo edición) ──
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await obtenerInformeRecomendacion(id);
        if (data) {
          setForm({
            actualizacionPresupuesto:
              data.actualizacionPresupuesto === true
                ? "SI"
                : data.actualizacionPresupuesto === false
                  ? "NO"
                  : null,
            montoNuevoPresupuesto:
              data.montoNuevoPresupuesto != null ? String(data.montoNuevoPresupuesto) : "",
            justificacionActualizacionPresup: data.justificacionActualizacionPresup || "",
            indVerificadoGarantia:
              data.indVerificadoGarantia === true
                ? "SI"
                : data.indVerificadoGarantia === false
                  ? "NO"
                  : null,
            indVerificadoCrs:
              data.indVerificadoCrs === true ? "SI" : data.indVerificadoCrs === false ? "NO" : null,
            observacionFormalidades:
              data.observacionFormalidades === true
                ? "SI"
                : data.observacionFormalidades === false
                  ? "NO"
                  : null,
            omisionFormalidades: data.omisionFormalidades || "",
            subsanacionActo: data.subsanacionActo || "",
            datosActoSubsanacion: data.datosActoSubsanacion || "",
            plazoEjecucionOfertaGanadora:
              data.plazoEjecucionOfertaGanadora != null
                ? String(data.plazoEjecucionOfertaGanadora)
                : "",
          });
        }
      } catch {
        // Sin datos previos, formulario vacío
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // ── Helper para actualizar un campo ──
  const set = <K extends keyof InformeState>(key: K, value: InformeState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // ── Validación: todas las preguntas booleanas respondidas ──
  const todasRespondidas =
    form.actualizacionPresupuesto !== null &&
    form.indVerificadoGarantia !== null &&
    form.indVerificadoCrs !== null &&
    form.observacionFormalidades !== null &&
    form.plazoEjecucionOfertaGanadora.trim() !== "";

  const handleSaveLocal = () => {
    toast.success("Campos guardados localmente");
  };

  // ── Guardar + Generar documento ──
  const handleGuardar = async () => {
    if (!todasRespondidas) {
      toast.error("Debe responder todas las preguntas antes de guardar");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        actualizacionPresupuesto: form.actualizacionPresupuesto === "SI",
        montoNuevoPresupuesto:
          form.actualizacionPresupuesto === "SI" && form.montoNuevoPresupuesto
            ? Number(form.montoNuevoPresupuesto)
            : null,
        justificacionActualizacionPresup:
          form.actualizacionPresupuesto === "SI" ? form.justificacionActualizacionPresup : null,
        indVerificadoGarantia: form.indVerificadoGarantia === "SI",
        indVerificadoCrs: form.indVerificadoCrs === "SI",
        observacionFormalidades: form.observacionFormalidades === "SI",
        omisionFormalidades:
          form.observacionFormalidades === "SI" ? form.omisionFormalidades : null,
        subsanacionActo: form.observacionFormalidades === "SI" ? form.subsanacionActo : null,
        datosActoSubsanacion:
          form.observacionFormalidades === "SI" ? form.datosActoSubsanacion : null,
        plazoEjecucionOfertaGanadora: Number(form.plazoEjecucionOfertaGanadora),
      };

      // 1. Guardar informe
      await crearInformeRecomendacion(id, payload);

      // 2. Generar documento
      await generarDocumento("informe-recomendacion", id).catch(() => {
        toast.warning("Informe guardado, pero el documento no pudo generarse automáticamente.");
      });

      toast.success("Informe de recomendación guardado y documento generado correctamente");
      router.push(`/elaboracion-expediente/${id}?tab=fase3`);
    } catch (error: any) {
      toast.error(error.message || "Error al guardar el informe");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-navy border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground italic text-sm">Cargando formulario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 lg:p-12">
      <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-slate-200">
          <h1 className="text-[22px] font-bold text-color-titulos">
            Generación del Informe de Recomendación
          </h1>
          <p className="text-[13px] text-muted-foreground italic mt-1">
            Complete los detalles finales del análisis para emitir la recomendación de adjudicación
          </p>
        </div>

        {/* Preguntas */}
        <div className="space-y-4">
          {/* P1: Actualización de presupuesto */}
          <PreguntaCard
            pregunta="¿Se ha actualizado el presupuesto base durante la evaluación?"
            referencia="Artículos 58, 59 LCP; 91, 93, 94 RLCP; 25 NORMAS DE CONTROL INTERNO SUNAI."
            valor={form.actualizacionPresupuesto}
            onToggle={(v) => set("actualizacionPresupuesto", v)}
          >
            {form.actualizacionPresupuesto === "SI" && (
              <div className="bg-[var(--obs-bg)] border-t border-slate-200 px-4 pb-4 pt-3 space-y-3 animate-in slide-in-from-top-2">
                <div className="flex items-center justify-end">
                  <button
                    onClick={handleSaveLocal}
                    className="p-1 hover:opacity-75 transition-opacity"
                    title="Guardar campos"
                  >
                    <IoSaveOutline className="w-[18px] h-[18px] text-[var(--obs-button)]" />
                  </button>
                </div>
                <div>
                  <p className="text-[12px] font-bold text-color-titulos">
                    Indique el nuevo monto de referencia del nuevo presupuesto base
                  </p>
                  <p className="text-[11px] text-muted-foreground italic mb-1">
                    Artículos 58, 59 LCP; 91, 93, 94 RLCP; 25 NORMAS DE CONTROL INTERNO SUNAI.
                  </p>
                  <input
                    type="number"
                    value={form.montoNuevoPresupuesto}
                    onChange={(e) => set("montoNuevoPresupuesto", e.target.value)}
                    placeholder="0001-020-316"
                    className="w-full text-[12px] border border-[var(--obs-button)] bg-white text-color-titulos font-medium rounded-md py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-[var(--obs-button)] italic"
                  />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-color-titulos">
                    Indique la justificación técnica del nuevo presupuesto base.
                  </p>
                  <p className="text-[11px] text-muted-foreground italic mb-1">
                    Artículos 58, 59 LCP; 91, 93, 94 RLCP; 25 NORMAS DE CONTROL INTERNO SUNAI.
                  </p>
                  <input
                    value={form.justificacionActualizacionPresup}
                    onChange={(e) => set("justificacionActualizacionPresup", e.target.value)}
                    placeholder="Escriba la justificación..."
                    className="w-full text-[12px] border border-[var(--obs-button)] bg-white text-color-titulos font-medium rounded-md py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-[var(--obs-button)] italic"
                  />
                </div>
              </div>
            )}
          </PreguntaCard>

          {/* P2: Garantía de mantenimiento */}
          <PreguntaCard
            pregunta="Indique si se verificó que todos los oferentes calificados consignaron la Garantía de Mantenimiento de la Oferta."
            referencia="Artículos 64 LCP; 19 NORMAS DE CONTROL INTERNO SUNAI."
            valor={form.indVerificadoGarantia}
            onToggle={(v) => set("indVerificadoGarantia", v)}
          />

          {/* P3: Compromiso de Responsabilidad Social */}
          <PreguntaCard
            pregunta="Indique si se verificó que todos los oferentes calificados presentaron el Compromiso de Responsabilidad Social."
            referencia="Artículos 66.15 LCP; 5 NORMAS DE CONTROL INTERNO SUNAI."
            valor={form.indVerificadoCrs}
            onToggle={(v) => set("indVerificadoCrs", v)}
          />

          {/* P4: Formalidades / Omisiones */}
          <PreguntaCard
            pregunta="Durante el proceso, ¿Se observaron omisiones de formalidades que requieren ser subsanadas o la reposición del acto?"
            referencia="Artículo 22 NORMAS DE CONTROL INTERNO SUNAI."
            valor={form.observacionFormalidades}
            onToggle={(v) => set("observacionFormalidades", v)}
          >
            {form.observacionFormalidades === "SI" && (
              <div className="bg-[var(--obs-bg)] border-t border-slate-200 px-4 pb-4 pt-3 space-y-3 animate-in slide-in-from-top-2">
                <div className="flex items-center justify-end">
                  <button
                    onClick={handleSaveLocal}
                    className="p-1 hover:opacity-75 transition-opacity"
                    title="Guardar campos"
                  >
                    <IoSaveOutline className="w-[18px] h-[18px] text-[var(--obs-button)]" />
                  </button>
                </div>
                <CampoCondicional
                  label="Describa la omisión que se observó."
                  referencia=""
                  value={form.omisionFormalidades}
                  onChange={(v) => set("omisionFormalidades", v)}
                  placeholder="Describa la omisión..."
                />
                <CampoCondicional
                  label="Describa la decisión tomada."
                  referencia=""
                  value={form.subsanacionActo}
                  onChange={(v) => set("subsanacionActo", v)}
                  placeholder="Describa la decisión..."
                />
                <CampoCondicional
                  label="Indique los datos del acto de subsanación."
                  referencia=""
                  value={form.datosActoSubsanacion}
                  onChange={(v) => set("datosActoSubsanacion", v)}
                  placeholder="Datos del acto..."
                />
              </div>
            )}
          </PreguntaCard>

          {/* P5: Plazo de ejecución */}
          <div className="flex flex-col border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm transition-all hover:border-slate-300">
            <div className="p-4">
              <p className="text-[13px] font-bold text-color-titulos leading-snug">
                Indique el plazo de ejecución o tiempo de entrega (en días) correspondiente a la
                oferta recomendada.
              </p>
              <p className="text-[11px] text-muted-foreground italic mt-0.5 mb-4">
                Artículo 66.18 LCP; 24 (e) NORMAS DE CONTROL INTERNO SUNAI.
              </p>
              <input
                type="number"
                min={1}
                value={form.plazoEjecucionOfertaGanadora}
                onChange={(e) => set("plazoEjecucionOfertaGanadora", e.target.value)}
                placeholder="Ej: 30"
                className="w-full sm:w-[220px] text-[12px] border border-slate-200 bg-white text-color-titulos font-medium rounded-md py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-navy italic"
              />
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-200">
          <Button
            variant="outline"
            className="h-11 px-8 rounded-md font-semibold text-slate-500 border-slate-200 hover:bg-slate-50"
            onClick={() => router.push(`/elaboracion-expediente/${id}?tab=fase3`)}
          >
            Anterior
          </Button>
          <Button
            className="h-11 px-8 rounded-md font-semibold bg-navy hover:bg-navy-hover text-white disabled:opacity-50"
            onClick={handleGuardar}
            disabled={isSaving || !todasRespondidas}
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Guardando...
              </span>
            ) : (
              "Generar informe"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

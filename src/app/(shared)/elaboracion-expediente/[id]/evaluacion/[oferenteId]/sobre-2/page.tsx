"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaRegBuilding } from "react-icons/fa";
import { IoSaveOutline, IoEyeOutline } from "react-icons/io5";
import { FaCheckCircle } from "react-icons/fa";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRoleAccess } from "@/hooks/use-role-access";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  listarEvaluacionesFase3,
  evaluarSobre2Fase3,
  obtenerEvaluacionFase3,
} from "@/services/oferenteService";
import { generarListaCotejo } from "@/services/generadorDocumentosService";
import { obtenerExpediente } from "@/services/expedienteService";

interface Pregunta {
  id: number;
  texto: string;
  opcional?: boolean;
}

const PREGUNTAS: Pregunta[] = [
  { id: 1, texto: "¿Presentó oferta técnico-económica?" },
  { id: 2, texto: "¿Presentó carta de oferta?" },
  {
    id: 3,
    texto: "¿Consignó declaración jurada de contar con la capacidad financiera de contratación?",
  },
  {
    id: 4,
    texto:
      "¿Consignó declaración jurada para el cumplimiento del compromiso de responsabilidad social?",
  },
  {
    id: 5,
    texto:
      "¿Consignó garantía de mantenimiento de la oferta: declaración jurada o caución a favor del Ente contratante?",
  },
  { id: 6, texto: "¿Consignó declaración jurada de auto cálculo del V.A.N?.", opcional: true },
];

export default function Sobre2Page({
  params,
}: {
  params: Promise<{ id: string; oferenteId: string }>;
}) {
  const router = useRouter();
  const unwrappedParams = React.use(params);
  const { id, oferenteId } = unwrappedParams;
  const { readOnly } = useRoleAccess();

  const [loading, setLoading] = useState(true);
  const [oferente, setOferente] = useState<any>(null);
  const [modalidad, setModalidad] = useState("EN PROCESO");

  // Estado para respuestas: { preguntaId: "SI" | "NO" | null }
  const [respuestas, setRespuestas] = useState<Record<number, "SI" | "NO">>({});
  // Estado para observaciones abiertas: { preguntaId: boolean }
  const [obsAbiertas, setObsAbiertas] = useState<Record<number, boolean>>({});
  // Estado para texto de observaciones: { preguntaId: string }
  const [observaciones, setObservaciones] = useState<Record<number, string>>({});

  // Resultado Final
  const [resultadoFinal, setResultadoFinal] = useState<"SI" | "NO" | null>(null);
  const [motivoDescalificacion, setMotivoDescalificacion] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const allAnswered = Object.keys(respuestas).length === PREGUNTAS.length;

  // Clave única de caché por oferente
  const CACHE_KEY = `sobre2_draft_${oferenteId}`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [exp, oferentes, evaluacionData]: [any, any, any] = await Promise.all([
          obtenerExpediente(id),
          listarEvaluacionesFase3(id),
          obtenerEvaluacionFase3(oferenteId).catch(() => null),
        ]);

        let oferentesList: any[] = [];
        if (Array.isArray(oferentes)) {
          oferentesList = oferentes;
        } else if (oferentes && typeof oferentes === "object" && Array.isArray(oferentes.data)) {
          oferentesList = oferentes.data;
        } else if (
          oferentes &&
          typeof oferentes === "object" &&
          oferentes.evaluaciones &&
          Array.isArray(oferentes.evaluaciones)
        ) {
          oferentesList = oferentes.evaluaciones;
        }

        const target = oferentesList.find((o: any) => String(o.id) === String(oferenteId));
        if (target) setOferente(target);

        if (exp?.modalidad?.tipoContratacion) {
          setModalidad(exp.modalidad.tipoContratacion);
        } else {
          setModalidad("EN PROCESO");
        }

        // La respuesta tiene las 6 preguntas en evaluacionData.sobre2
        // y oferenteCalificado/motivoDescalificacion en la raíz
        const sobre2Data = evaluacionData?.sobre2;
        if (sobre2Data) {
          // El servidor tiene datos: los usamos como fuente de verdad
          const newRespuestas: Record<number, "SI" | "NO"> = {};
          const newObservaciones: Record<number, string> = {};
          const newObsAbiertas: Record<number, boolean> = {};

          const mapField = (qId: number, field: string, obsField: string) => {
            if (sobre2Data[field] !== null && sobre2Data[field] !== undefined) {
              newRespuestas[qId] = sobre2Data[field] ? "SI" : "NO";
            }
            if (sobre2Data[obsField]) {
              newObservaciones[qId] = sobre2Data[obsField];
              newObsAbiertas[qId] = true;
            }
          };

          mapField(1, "ofertaTecnicoEconomica", "obsOfertaTecnicoEconomica");
          mapField(2, "cartaOferta", "obsCartaOferta");
          mapField(3, "declaracionCapacidadFinanciera", "obsDeclaracionCapacidadFinanciera");
          mapField(4, "declaracionCompromisoRespSocial", "obsDeclaracionCompromisoRespSocial");
          mapField(5, "garantiaMantenimientoOferta", "obsGarantiaMantenimientoOferta");
          mapField(6, "declaracionAutocalculoVan", "obsDeclaracionAutocalculoVan");

          setRespuestas(newRespuestas);
          setObservaciones(newObservaciones);
          setObsAbiertas(newObsAbiertas);
        } else {
          // El servidor no tiene datos aún (no se ha guardado el sobre 2).
          // Intentar restaurar desde sessionStorage (el usuario regresó desde la matriz).
          try {
            const cached = sessionStorage.getItem(CACHE_KEY);
            if (cached) {
              const draft = JSON.parse(cached) as {
                respuestas: Record<number, "SI" | "NO">;
                observaciones: Record<number, string>;
                resultadoFinal: "SI" | "NO" | null;
                motivoDescalificacion: string;
              };
              if (draft.respuestas) setRespuestas(draft.respuestas);
              if (draft.observaciones) {
                setObservaciones(draft.observaciones);
                // Reabrir las cajas de obs que tienen texto
                const abiertas: Record<number, boolean> = {};
                Object.entries(draft.observaciones).forEach(([k, v]) => {
                  if (v) abiertas[Number(k)] = true;
                });
                setObsAbiertas(abiertas);
              }
              if (draft.resultadoFinal) setResultadoFinal(draft.resultadoFinal);
              if (draft.motivoDescalificacion)
                setMotivoDescalificacion(draft.motivoDescalificacion);
            }
          } catch {
            // sessionStorage no disponible o JSON inválido — ignorar silenciosamente
          }
        }

        // oferenteCalificado y motivoDescalificacion están en la raíz
        if (evaluacionData) {
          if (
            evaluacionData.oferenteCalificado !== null &&
            evaluacionData.oferenteCalificado !== undefined
          ) {
            setResultadoFinal(evaluacionData.oferenteCalificado ? "SI" : "NO");
          }
          if (evaluacionData.motivoDescalificacion) {
            setMotivoDescalificacion(evaluacionData.motivoDescalificacion);
          }
        }
      } catch (err) {
        toast.error("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, oferenteId]);

  // Persistir borrador en sessionStorage cada vez que el usuario cambia algo
  useEffect(() => {
    if (loading) return; // No persistir mientras se está cargando
    try {
      sessionStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ respuestas, observaciones, resultadoFinal, motivoDescalificacion })
      );
    } catch {
      // sessionStorage no disponible — ignorar
    }
  }, [respuestas, observaciones, resultadoFinal, motivoDescalificacion, loading]);

  const handleToggle = (id: number, valor: "SI" | "NO") => {
    if (readOnly) {
      return;
    }
    setRespuestas((prev) => ({ ...prev, [id]: valor }));
  };

  const toggleObs = (id: number) => {
    if (readOnly) {
      return;
    }
    setObsAbiertas((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const saveObs = (id: number) => {
    if (readOnly) {
      return;
    }
    toast.success("Observación guardada localmente");
    setObsAbiertas((prev) => ({ ...prev, [id]: false }));
  };

  const handleGuardarDescalificacion = async () => {
    if (readOnly) {
      return;
    }
    if (!motivoDescalificacion.trim()) {
      toast.error("Debe escribir un motivo de descalificación");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ofertaTecnicoEconomica: respuestas[1] === "SI",
        obsOfertaTecnicoEconomica: observaciones[1] || "",
        cartaOferta: respuestas[2] === "SI",
        obsCartaOferta: observaciones[2] || "",
        declaracionCapacidadFinanciera: respuestas[3] === "SI",
        obsDeclaracionCapacidadFinanciera: observaciones[3] || "",
        declaracionCompromisoRespSocial: respuestas[4] === "SI",
        obsDeclaracionCompromisoRespSocial: observaciones[4] || "",
        garantiaMantenimientoOferta: respuestas[5] === "SI",
        obsGarantiaMantenimientoOferta: observaciones[5] || "",
        declaracionAutocalculoVan: respuestas[6] === "SI",
        obsDeclaracionAutocalculoVan: observaciones[6] || "",

        criterio1Evaluacion: null,
        puntuacionCriterio1: null,
        criterio2Evaluacion: null,
        puntuacionCriterio2: null,
        criterio3Evaluacion: null,
        puntuacionCriterio3: null,
        criterio4Evaluacion: null,
        puntuacionCriterio4: null,
        montoOfertaBs: null,
        porcentajeVan: null,

        oferenteCalificado: false,
        motivoDescalificacion: motivoDescalificacion,
        posicionPrelacion: null,
      };

      await evaluarSobre2Fase3(oferenteId, payload);

      // Generar lista de cotejo tras descalificación
      await generarListaCotejo(id, oferenteId)
        .then(() => toast.success("Lista de cotejo generada correctamente."))
        .catch(() =>
          toast.warning("Descalificación guardada, pero la lista de cotejo no pudo generarse.")
        );

      setShowModal(true);
    } catch (error: any) {
      toast.error(error.message || "Error al descalificar oferente");
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = () => {
    if (readOnly) {
      return;
    }
    if (!allAnswered) {
      toast.error("Debe responder todas las preguntas antes de continuar");
      return;
    }

    const payloadBase = {
      ofertaTecnicoEconomica: respuestas[1] === "SI",
      obsOfertaTecnicoEconomica: observaciones[1] || "",
      cartaOferta: respuestas[2] === "SI",
      obsCartaOferta: observaciones[2] || "",
      declaracionCapacidadFinanciera: respuestas[3] === "SI",
      obsDeclaracionCapacidadFinanciera: observaciones[3] || "",
      declaracionCompromisoRespSocial: respuestas[4] === "SI",
      obsDeclaracionCompromisoRespSocial: observaciones[4] || "",
      garantiaMantenimientoOferta: respuestas[5] === "SI",
      obsGarantiaMantenimientoOferta: observaciones[5] || "",
      declaracionAutocalculoVan: respuestas[6] === "SI",
      obsDeclaracionAutocalculoVan: observaciones[6] || "",
    };

    sessionStorage.setItem(`sobre2_oferente_${oferenteId}`, JSON.stringify(payloadBase));
    router.push(`/elaboracion-expediente/${id}/evaluacion/${oferenteId}/matriz`);
  };

  const handleCerrarModal = () => {
    setShowModal(false);
    // Redirigir a la tabla de Fase 3
    router.push(`/elaboracion-expediente/${id}?tab=fase3`);
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-navy border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground italic text-sm">Cargando verificación Sobre 2...</p>
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
          onClick={() => router.push(`/elaboracion-expediente/${id}?tab=fase3`)}
        >
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 lg:p-12">
      <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-[22px] font-bold text-color-titulos mb-6">
          Verificación de recaudos - Lista de cotejo
        </h1>

        {/* Header Oferente */}
        <Card className="mb-8 border-slate-200 shadow-sm rounded-lg overflow-hidden bg-white">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-edificio-bg rounded-lg flex items-center justify-center border border-transparent text-edificio-icon">
                <FaRegBuilding className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-[17px] font-bold text-color-titulos">
                  {oferente.nombreProveedorEvaluado || "—"}
                </h2>
                <p className="text-[12px] text-muted-foreground italic mt-0.5">
                  RIF: {oferente.rifProveedorEvaluado || "—"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wider bg-[var(--evaluado-bg)] text-[var(--success-text)] mb-1 uppercase">
                {modalidad}
              </span>
              <p className="text-[12px] text-muted-foreground italic">
                Representante:{" "}
                <span className="font-semibold text-color-titulos">
                  {oferente.nombreRepLegalEvaluado || "—"}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Cotejo */}
        <div className="space-y-4">
          {/* Título de la sección B */}
          <div className="flex items-center gap-3 py-2 mb-2">
            <div className="w-10 h-10 bg-navy text-white rounded-lg flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-sm">
              B
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-navy leading-tight">Contenido sobre N°2</h3>
              <p className="text-[13px] text-muted-foreground italic">Oferta técnica y económica</p>
            </div>
          </div>

          {/* Preguntas */}
          <div className="space-y-3">
            {PREGUNTAS.map((q) => {
              const hasObs = !!observaciones[q.id];
              return (
                <div
                  key={q.id}
                  className="flex flex-col border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm transition-all hover:border-slate-300"
                >
                  <div className="flex items-center justify-between p-4 min-h-[72px]">
                    <div className="flex-1 pr-4">
                      <p className="text-[13px] font-bold text-color-titulos leading-snug">
                        <span className="mr-1">{q.id}.</span> {q.texto}
                      </p>
                      {q.opcional && (
                        <p className="text-[11px] text-muted-foreground italic mt-0.5 ml-4">
                          Pregunta opcional
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleToggle(q.id, "SI")}
                        disabled={readOnly}
                        className={`px-4 h-8 rounded text-[11px] font-bold border transition-colors ${
                          respuestas[q.id] === "SI"
                            ? "bg-navy text-white border-navy"
                            : "bg-white text-slate-400 border-slate-200 hover:border-slate-300 hover:text-slate-500"
                        } ${readOnly ? "cursor-not-allowed opacity-60" : ""}`}
                      >
                        SI
                      </button>
                      <button
                        onClick={() => handleToggle(q.id, "NO")}
                        disabled={readOnly}
                        className={`px-4 h-8 rounded text-[11px] font-bold border transition-colors ${
                          respuestas[q.id] === "NO"
                            ? "bg-navy text-white border-navy"
                            : "bg-white text-slate-400 border-slate-200 hover:border-slate-300 hover:text-slate-500"
                        } ${readOnly ? "cursor-not-allowed opacity-60" : ""}`}
                      >
                        NO
                      </button>
                      <button
                        onClick={() => toggleObs(q.id)}
                        disabled={readOnly}
                        className={`flex items-center gap-1.5 px-3 h-8 rounded text-[11px] font-bold border transition-colors ${
                          hasObs || obsAbiertas[q.id]
                            ? "bg-[var(--obs-bg)] text-[var(--obs-button)] border-[var(--obs-button)]"
                            : "bg-white text-slate-400 border-slate-200 hover:border-slate-300 hover:text-slate-500"
                        } ${readOnly ? "cursor-not-allowed opacity-60" : ""}`}
                      >
                        <IoEyeOutline className="w-[14px] h-[14px]" />
                        OBSERVACIÓN
                      </button>
                    </div>
                  </div>

                  {/* Caja de Observación Desplegada */}
                  {obsAbiertas[q.id] && (
                    <div className="px-4 pb-4 pt-0 animate-in slide-in-from-top-2">
                      <div className="relative">
                        <input
                          value={observaciones[q.id] || ""}
                          onChange={(e) =>
                            setObservaciones((prev) => ({ ...prev, [q.id]: e.target.value }))
                          }
                          disabled={readOnly}
                          placeholder="Escriba su observación aquí..."
                          className="w-full text-[12px] border border-[var(--obs-button)] bg-[var(--obs-bg)] text-color-titulos font-medium rounded-md py-2.5 pl-3 pr-10 focus:outline-none focus:ring-1 focus:ring-[var(--obs-button)] italic disabled:cursor-not-allowed disabled:opacity-70"
                        />
                        <button
                          onClick={() => saveObs(q.id)}
                          disabled={readOnly}
                          className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[var(--obs-button)] hover:opacity-75 rounded-md transition-colors ${readOnly ? "hidden" : ""}`}
                          title="Guardar observación"
                        >
                          <IoSaveOutline className="w-[18px] h-[18px]" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Resultado Final */}
          <div className="mt-8 border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
            <div className="bg-[#2D3A4B] px-4 py-2 text-white font-bold text-[12px]">
              Resultado final
            </div>
            <div className="p-6">
              <p className="text-[13px] font-bold text-navy mb-1">
                Indique si este oferente cumplio con la calificación legal, técnica y financiera,
                con base en los criterios establecidos en el pliego de condiciones
              </p>
              <p className="text-[10px] text-muted-foreground italic mb-4">
                Artículos 95 LCP; 18. 4 LOPA; 16 NORMAS DE CONTROL INTERNO SUNAI.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (readOnly) {
                      return;
                    }
                    if (!allAnswered) {
                      toast.error("Debe responder todas las preguntas arriba primero.");
                      return;
                    }
                    setResultadoFinal("SI");
                  }}
                  disabled={readOnly || !allAnswered}
                  className={`w-16 h-10 rounded text-[12px] font-bold border transition-colors ${!allAnswered ? "opacity-50 cursor-not-allowed" : ""} ${
                    resultadoFinal === "SI"
                      ? "bg-navy text-white border-navy"
                      : "bg-white text-slate-400 border-slate-200 hover:border-slate-300 hover:text-slate-500"
                  } ${readOnly ? "cursor-not-allowed opacity-60" : ""}`}
                >
                  SI
                </button>
                <button
                  onClick={() => {
                    if (readOnly) {
                      return;
                    }
                    if (!allAnswered) {
                      toast.error("Debe responder todas las preguntas arriba primero.");
                      return;
                    }
                    setResultadoFinal("NO");
                  }}
                  disabled={readOnly || !allAnswered}
                  className={`w-16 h-10 rounded text-[12px] font-bold border transition-colors ${!allAnswered ? "opacity-50 cursor-not-allowed" : ""} ${
                    resultadoFinal === "NO"
                      ? "bg-navy text-white border-navy"
                      : "bg-white text-slate-400 border-slate-200 hover:border-slate-300 hover:text-slate-500"
                  } ${readOnly ? "cursor-not-allowed opacity-60" : ""}`}
                >
                  NO
                </button>
              </div>

              {/* Motivo de Descalificación (Aparece al seleccionar NO) */}
              {resultadoFinal === "NO" && (
                <div className="mt-6 border border-slate-200 rounded-lg overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="bg-[var(--motivo-bg)] px-4 py-2 text-white font-bold text-[12px]">
                    Indique el motivo de la descalificación de la(s) empresa(s)
                  </div>
                  <div className="p-4 bg-white">
                    <p className="text-[10px] text-muted-foreground italic mb-2">
                      Artículos 95 LCP; 18. 4 LOPA; 4 NORMAS DE CONTROL INTERNO SUNAI
                    </p>
                    <div className="relative">
                      <textarea
                        value={motivoDescalificacion}
                        disabled={readOnly}
                        onChange={(e) => setMotivoDescalificacion(e.target.value)}
                        className="w-full h-24 text-[12px] border border-[var(--motivo-border)] bg-white text-color-titulos font-medium rounded-md py-2.5 pl-3 pr-10 focus:outline-none focus:ring-1 focus:ring-[var(--motivo-border)] resize-none disabled:cursor-not-allowed disabled:opacity-70"
                      />
                      <button
                        onClick={handleGuardarDescalificacion}
                        disabled={readOnly || isSaving}
                        className={`absolute right-2 top-2 p-1.5 text-[var(--motivo-icon)] hover:bg-slate-50 rounded-md transition-colors disabled:opacity-50 ${readOnly ? "hidden" : ""}`}
                        title="Guardar descalificación"
                      >
                        {isSaving ? (
                          <div className="w-[22px] h-[22px] border-2 border-[var(--motivo-icon)] border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <IoSaveOutline className="w-[22px] h-[22px]" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-200">
          <Button
            variant="outline"
            className="h-11 px-8 rounded-md font-semibold text-slate-500 border-slate-200 hover:bg-slate-50"
            onClick={() =>
              router.push(`/elaboracion-expediente/${id}/evaluacion/${oferenteId}/sobre-1`)
            }
          >
            Anterior
          </Button>

          {/* El botón Siguiente solo aparece si el resultado es SI */}
          {!readOnly && resultadoFinal === "SI" && (
            <Button
              className="h-11 px-8 rounded-md font-semibold bg-navy hover:bg-navy-hover text-white animate-in fade-in zoom-in duration-300"
              onClick={handleNext}
            >
              Siguiente
            </Button>
          )}
        </div>
      </div>

      {/* Modal de Éxito de Descalificación */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[400px] flex flex-col items-center justify-center p-8 gap-4 rounded-xl">
          <div className="w-16 h-16 rounded-full border-[3px] border-[var(--success)] flex items-center justify-center mb-2">
            <FaCheckCircle className="w-8 h-8 text-[var(--success)]" />
          </div>
          <DialogHeader className="text-center w-full space-y-2">
            <DialogTitle className="text-xl font-bold text-navy w-full text-center">
              ¡Oferente calificado con éxito!
            </DialogTitle>
            <DialogDescription className="text-sm italic text-muted-foreground w-full text-center">
              Ya su calificación ha sido registrada
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="w-full mt-4 sm:justify-center">
            <Button
              className="w-full sm:w-[200px] bg-navy hover:bg-navy-hover text-white font-bold h-11 rounded-md"
              onClick={handleCerrarModal}
            >
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

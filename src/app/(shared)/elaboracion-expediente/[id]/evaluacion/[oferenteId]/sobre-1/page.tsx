"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaRegBuilding } from "react-icons/fa";
import { IoSaveOutline, IoEyeOutline } from "react-icons/io5";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRoleAccess } from "@/hooks/use-role-access";
import { obtenerExpediente } from "@/services/expedienteService";
import {
  listarEvaluacionesFase3,
  evaluarSobre1Fase3,
  obtenerEvaluacionFase3,
} from "@/services/oferenteService";

interface Pregunta {
  id: number;
  texto: string;
}

const PREGUNTAS: Pregunta[] = [
  { id: 1, texto: "¿Consignó carta de Manifestación de Voluntad?" },
  { id: 2, texto: "¿Consignó Carta de Autorización?" },
  { id: 3, texto: "¿Consignó copia del Registro de Información Fiscal (R.I.F.) vigente?" },
  {
    id: 4,
    texto:
      "¿Consignó certificado de Inscripción en el Registro Nacional de Contratistas, con el respectivo reporte de calificación o planilla resumen?",
  },
  {
    id: 5,
    texto: "¿Consignó certificado de Solvencia Laboral o Declaración Jurada de Solvencia Laboral?",
  },
  {
    id: 6,
    texto:
      "¿Consignó la Declaración Jurada de Conocimiento de no contar dentro de su conformación y organización con personas naturales que participen como socios, miembros o administradores de alguna empresa, sociedad o agrupación que se encuentre inhabilitada?",
  },
  {
    id: 7,
    texto:
      "*¿Consignó Declaración Jurada de Conocimiento de no poseer Obligaciones Exigibles con el Contratante?",
  },
  {
    id: 8,
    texto:
      "¿Consignó Declaración Jurada de No Tener impedimentos para participar en los procedimientos previstos en el Decreto con Rango, Valor y Fuerza de Ley de Contrataciones Públicas",
  },
  { id: 9, texto: "¿Consignó Declaración Jurada de información financiera?." },
  { id: 10, texto: "¿Consignó relación de servicios prestados?" },
  { id: 11, texto: "¿Consignó referencias de empresas públicas o privadas?" },
];

export default function Sobre1Page({
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

  const [isSaving, setIsSaving] = useState(false);

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

        // La respuesta tiene los datos del sobre 1 en evaluacionData.sobre1
        const sobre1Data = evaluacionData?.sobre1;
        if (sobre1Data) {
          const newRespuestas: Record<number, "SI" | "NO"> = {};
          const newObservaciones: Record<number, string> = {};
          const newObsAbiertas: Record<number, boolean> = {};

          const mapField = (qId: number, field: string, obsField: string) => {
            if (sobre1Data[field] !== null && sobre1Data[field] !== undefined) {
              newRespuestas[qId] = sobre1Data[field] ? "SI" : "NO";
            }
            if (sobre1Data[obsField]) {
              newObservaciones[qId] = sobre1Data[obsField];
              newObsAbiertas[qId] = true;
            }
          };

          mapField(1, "cartaManifestacionVoluntad", "obsCartaManifestacionVoluntad");
          mapField(2, "cartaAutorizacion", "obsCartaAutorizacion");
          mapField(3, "copiaRifVigente", "obsCopiaRifVigente");
          mapField(4, "certificadoRnc", "obsCertificadoRnc");
          mapField(5, "solvenciaLaboral", "obsSolvenciaLaboral");
          mapField(6, "declaracionSociosNoInhabilitados", "obsDeclaracionSociosNoInhabilitados");
          mapField(7, "declaracionNoDeudas", "obsDeclaracionNoDeudas");
          mapField(8, "declaracionNoImpedimentosLcp", "obsDeclaracionNoImpedimentosLcp");
          mapField(9, "declaracionInfoFinanciera", "obsDeclaracionInfoFinanciera");
          mapField(10, "relacionServiciosPrestados", "obsRelacionServiciosPrestados");
          mapField(11, "referenciasComerciales", "obsReferenciasComerciales");

          setRespuestas(newRespuestas);
          setObservaciones(newObservaciones);
          setObsAbiertas(newObsAbiertas);
        }
      } catch (err) {
        toast.error("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, oferenteId]);

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

  const handleNext = async () => {
    if (readOnly) {
      return;
    }
    if (Object.keys(respuestas).length < PREGUNTAS.length) {
      toast.error("Debe responder todas las preguntas antes de continuar");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        cartaManifestacionVoluntad: respuestas[1] === "SI",
        obsCartaManifestacionVoluntad: observaciones[1] || "",
        cartaAutorizacion: respuestas[2] === "SI",
        obsCartaAutorizacion: observaciones[2] || "",
        copiaRifVigente: respuestas[3] === "SI",
        obsCopiaRifVigente: observaciones[3] || "",
        certificadoRnc: respuestas[4] === "SI",
        obsCertificadoRnc: observaciones[4] || "",
        solvenciaLaboral: respuestas[5] === "SI",
        obsSolvenciaLaboral: observaciones[5] || "",
        declaracionSociosNoInhabilitados: respuestas[6] === "SI",
        obsDeclaracionSociosNoInhabilitados: observaciones[6] || "",
        declaracionNoDeudas: respuestas[7] === "SI",
        obsDeclaracionNoDeudas: observaciones[7] || "",
        declaracionNoImpedimentosLcp: respuestas[8] === "SI",
        obsDeclaracionNoImpedimentosLcp: observaciones[8] || "",
        declaracionInfoFinanciera: respuestas[9] === "SI",
        obsDeclaracionInfoFinanciera: observaciones[9] || "",
        relacionServiciosPrestados: respuestas[10] === "SI",
        obsRelacionServiciosPrestados: observaciones[10] || "",
        referenciasComerciales: respuestas[11] === "SI",
        obsReferenciasComerciales: observaciones[11] || "",
      };

      await evaluarSobre1Fase3(oferenteId, payload);
      toast.success("Sobre 1 guardado correctamente");
      router.push(`/elaboracion-expediente/${id}/evaluacion/${oferenteId}/sobre-2`);
    } catch (error: any) {
      toast.error(error.message || "Error al guardar la evaluación");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-navy border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground italic text-sm">Cargando verificación...</p>
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
          {/* Título de la sección */}
          <div className="flex items-center gap-3 py-2 mb-2">
            <div className="w-10 h-10 bg-navy text-white rounded-lg flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-sm">
              A
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-navy leading-tight">Contenido sobre N°1</h3>
              <p className="text-[13px] text-muted-foreground italic">
                Recaudos legales y financieros
              </p>
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
                    <p className="text-[13px] font-bold text-color-titulos flex-1 pr-4 leading-snug">
                      <span className="mr-1">{q.id}.</span> {q.texto}
                    </p>
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
          {!readOnly && (
            <Button
              className="h-11 px-8 rounded-md font-semibold bg-navy hover:bg-navy-hover text-white disabled:opacity-50"
              onClick={handleNext}
              disabled={isSaving || Object.keys(respuestas).length < PREGUNTAS.length}
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </span>
              ) : (
                "Siguiente"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaRegBuilding } from "react-icons/fa";
import { FaCheckCircle } from "react-icons/fa";
import { LuTrash2 } from "react-icons/lu";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  obtenerMetricasEvaluacionFase3,
} from "@/services/oferenteService";
import { obtenerExpediente } from "@/services/expedienteService";
import {
  generarListaCotejo,
  previewListaCotejoEvaluacion,
  descargarListaCotejoEvaluacion,
} from "@/services/generadorDocumentosService";
import { ManualPreviewDialog } from "@/components/dashboards/admin_ente/ManualPreviewDialog";
import { useRoleAccess } from "@/hooks/use-role-access";

const OPCIONES_CRITERIOS = {
  Bienes: [
    "Tiempo de entrega a partir de la recepción de la Orden de compra.",
    "Garantía de los insumos.",
    "Características de los insumos.",
    "Disponibilidad de los insumos requeridos.",
  ],
  Servicios: [
    "Plan de trabajo y metodología propuesta.",
    "Perfil del personal Técnico clave.",
    "Disponibilidad de Equipos y Herramientas.",
    "Tiempo de respuesta ante fallas.",
  ],
  Obras: [
    "Cronograma de Ejecución y Plan de Trabajo.",
    "Experiencia de Ingeniero Residente.",
    "Maquinaria y Equipos disponibles (propios / alquilados).",
    "Memoria Descriptiva / Metodología de Ejecución.",
  ],
};

const getOpciones = (mod: string) => {
  const m = mod.toUpperCase();
  if (m === "BIENES") return OPCIONES_CRITERIOS.Bienes;
  if (m === "SERVICIOS") return OPCIONES_CRITERIOS.Servicios;
  if (m === "OBRAS") return OPCIONES_CRITERIOS.Obras;
  // Fallback if not loaded properly
  return OPCIONES_CRITERIOS.Bienes;
};

// Ordinales en español para generar dinámicamente las opciones de prelación
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
  "Undécima",
  "Duodécima",
  "Decimotercera",
  "Decimocuarta",
  "Decimoquinta",
];

const generarOpcionesPrelacion = (total: number): string[] =>
  Array.from({ length: Math.min(total, ORDINALES.length) }, (_, i) => `${ORDINALES[i]} Opción`);

interface CriterioEvaluado {
  id: string;
  nombre: string;
  puntaje: number;
}

export default function MatrizEvaluacionPage({
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

  // Matriz State
  const [criteriosEvaluados, setCriteriosEvaluados] = useState<CriterioEvaluado[]>([]);
  const [currentCriterio, setCurrentCriterio] = useState<string>("");
  const [currentPuntaje, setCurrentPuntaje] = useState<number>(0);

  const [montoEconomico, setMontoEconomico] = useState("");
  const [van, setVan] = useState("");
  const [ordenPrelacion, setOrdenPrelacion] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [opcionesPrelacion, setOpcionesPrelacion] = useState<string[]>([]);

  // Preview / Descarga de lista de cotejo
  const [listaCotejoGenerada, setListaCotejoGenerada] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [exp, oferentes, evaluacionData, statsData]: [any, any, any, any] = await Promise.all(
          [
            obtenerExpediente(id),
            listarEvaluacionesFase3(id).catch(() => []),
            obtenerEvaluacionFase3(oferenteId).catch(() => null),
            obtenerMetricasEvaluacionFase3(id).catch(() => null),
          ]
        );

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
          setModalidad("Bienes"); // default for testing
        }

        // Los criterios, monto y van están en evaluacionData.sobre2
        // posicionPrelacion está en la raíz
        const sobre2Data = evaluacionData?.sobre2;
        if (sobre2Data) {
          if (sobre2Data.montoOfertaBs !== null && sobre2Data.montoOfertaBs !== undefined) {
            setMontoEconomico(String(sobre2Data.montoOfertaBs));
          }
          if (sobre2Data.porcentajeVan !== null && sobre2Data.porcentajeVan !== undefined) {
            setVan(String(sobre2Data.porcentajeVan));
          }

          const nuevosCriterios: CriterioEvaluado[] = [];
          if (sobre2Data.criterio1Evaluacion) {
            nuevosCriterios.push({
              id: crypto.randomUUID(),
              nombre: sobre2Data.criterio1Evaluacion,
              puntaje: Number(sobre2Data.puntuacionCriterio1) || 0,
            });
          }
          if (sobre2Data.criterio2Evaluacion) {
            nuevosCriterios.push({
              id: crypto.randomUUID(),
              nombre: sobre2Data.criterio2Evaluacion,
              puntaje: Number(sobre2Data.puntuacionCriterio2) || 0,
            });
          }
          if (sobre2Data.criterio3Evaluacion) {
            nuevosCriterios.push({
              id: crypto.randomUUID(),
              nombre: sobre2Data.criterio3Evaluacion,
              puntaje: Number(sobre2Data.puntuacionCriterio3) || 0,
            });
          }
          if (sobre2Data.criterio4Evaluacion) {
            nuevosCriterios.push({
              id: crypto.randomUUID(),
              nombre: sobre2Data.criterio4Evaluacion,
              puntaje: Number(sobre2Data.puntuacionCriterio4) || 0,
            });
          }

          if (nuevosCriterios.length > 0) {
            setCriteriosEvaluados(nuevosCriterios);
          }
        }

        if (evaluacionData?.posicionPrelacion) {
          setOrdenPrelacion(evaluacionData.posicionPrelacion);
        }

        // Generar opciones de prelación dinámicas y filtrar las ya usadas
        const totalOferentes = statsData?.ofertasRecibidas || oferentesList.length || 6;
        const todasOpciones = generarOpcionesPrelacion(totalOferentes);

        // Obtener posiciones ya ocupadas por OTROS oferentes
        const prelacionesOcupadas = oferentesList
          .filter((o: any) => String(o.id) !== String(oferenteId) && o.posicionPrelacion)
          .map((o: any) => o.posicionPrelacion);

        const disponibles = todasOpciones.filter((op) => !prelacionesOcupadas.includes(op));
        setOpcionesPrelacion(disponibles);
      } catch (err) {
        toast.error("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, oferenteId]);

  const availableOptions = getOpciones(modalidad).filter(
    (opt) => !criteriosEvaluados.some((c) => c.nombre === opt)
  );

  const handleAddCriterio = () => {
    if (readOnly) {
      return;
    }
    if (!currentCriterio) {
      toast.error("Seleccione un criterio");
      return;
    }
    const newCriterio: CriterioEvaluado = {
      id: crypto.randomUUID(),
      nombre: currentCriterio,
      puntaje: currentPuntaje,
    };
    setCriteriosEvaluados([...criteriosEvaluados, newCriterio]);
    setCurrentCriterio("");
    setCurrentPuntaje(0);
  };

  const handleRemoveCriterio = (criterioId: string) => {
    if (readOnly) {
      return;
    }
    setCriteriosEvaluados(criteriosEvaluados.filter((c) => c.id !== criterioId));
  };

  const handleGuardarEvaluacion = async () => {
    if (readOnly) {
      return;
    }
    // Basic validation
    if (criteriosEvaluados.length !== 4) {
      toast.error("Debe agregar exactamente 4 criterios técnicos evaluados");
      return;
    }
    if (!montoEconomico) {
      toast.error("Debe indicar el monto de la oferta");
      return;
    }
    if (!ordenPrelacion) {
      toast.error("Debe indicar el orden de prelación");
      return;
    }

    setIsSaving(true);
    try {
      const storedData = sessionStorage.getItem(`sobre2_oferente_${oferenteId}`);
      if (!storedData) {
        toast.error("No se encontraron los datos del Sobre 2. Vuelva a la página anterior.");
        setIsSaving(false);
        return;
      }

      const sobre2Data = JSON.parse(storedData);

      const payload = {
        ...sobre2Data,
        criterio1Evaluacion: criteriosEvaluados[0]?.nombre || "",
        puntuacionCriterio1: criteriosEvaluados[0]?.puntaje || 0,
        criterio2Evaluacion: criteriosEvaluados[1]?.nombre || "",
        puntuacionCriterio2: criteriosEvaluados[1]?.puntaje || 0,
        criterio3Evaluacion: criteriosEvaluados[2]?.nombre || "",
        puntuacionCriterio3: criteriosEvaluados[2]?.puntaje || 0,
        criterio4Evaluacion: criteriosEvaluados[3]?.nombre || "",
        puntuacionCriterio4: criteriosEvaluados[3]?.puntaje || 0,

        montoOfertaBs: Number(montoEconomico),
        porcentajeVan: van ? Number(van) : 0,

        oferenteCalificado: true,
        motivoDescalificacion: "",
        posicionPrelacion: ordenPrelacion,
      };

      await evaluarSobre2Fase3(oferenteId, payload);

      // Generar lista de cotejo al guardar evaluación calificada
      await generarListaCotejo(id, oferenteId)
        .then(() => toast.success("Lista de cotejo generada correctamente."))
        .catch(() =>
          toast.warning(
            "Evaluación guardada, pero la lista de cotejo no pudo generarse automáticamente."
          )
        );
      setListaCotejoGenerada(true);

      sessionStorage.removeItem(`sobre2_oferente_${oferenteId}`);
      setShowModal(true);
    } catch (error: any) {
      toast.error(error.message || "Error al guardar la evaluación");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCerrarModal = () => {
    setShowModal(false);
    router.push(`/elaboracion-expediente/${id}?tab=fase3`);
  };

  const handlePreviewCotejo = async () => {
    setIsPreviewing(true);
    setPreviewOpen(true);
    try {
      const result = await previewListaCotejoEvaluacion(oferenteId);
      setPreviewUrl(result.urlArchivo);
      setPreviewTitle(result.tituloDocumento || "Lista de Cotejo");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al obtener la previsualización";
      toast.error(message);
      setPreviewOpen(false);
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleDownloadCotejo = async () => {
    setIsDownloading(true);
    try {
      const { data, fileName } = await descargarListaCotejoEvaluacion(oferenteId);
      const blob = new Blob([new Uint8Array(data)], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Lista de cotejo descargada exitosamente");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al descargar la lista de cotejo");
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-navy border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground italic text-sm">Cargando matriz de evaluación...</p>
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
        <h1 className="text-[22px] font-bold text-color-titulos mb-6">Matriz de evaluación</h1>

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

        {/* Evaluaciones Blocks */}
        <div className="space-y-6">
          {/* BLOQUE A: Evaluación Técnica */}
          <Card className="border-slate-200 shadow-sm rounded-lg overflow-hidden bg-white">
            <CardContent className="p-8">
              <h3 className="text-[17px] font-bold text-navy mb-6">Evaluación Técnica</h3>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end mb-8">
                <div className="md:col-span-6">
                  <label className="block text-[13px] font-bold text-color-titulos mb-2">
                    Criterio de selección
                  </label>
                  <Select
                    value={currentCriterio}
                    onValueChange={readOnly ? undefined : setCurrentCriterio}
                    disabled={readOnly}
                  >
                    <SelectTrigger className="w-full h-11 text-[13px]">
                      <SelectValue placeholder="Seleccione criterios..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableOptions.map((opt) => (
                        <SelectItem key={opt} value={opt} className="text-[13px]">
                          {opt}
                        </SelectItem>
                      ))}
                      {availableOptions.length === 0 && (
                        <div className="p-2 text-[12px] text-slate-400 italic">
                          Todos los criterios han sido agregados
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-4">
                  <label className="block text-[13px] font-bold text-color-titulos mb-2">
                    Puntaje (0-100)
                  </label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={currentPuntaje}
                      disabled={readOnly}
                      onChange={(e) => {
                        let val = Number(e.target.value);
                        if (val < 0) val = 0;
                        if (val > 100) val = 100;
                        setCurrentPuntaje(val);
                      }}
                      className="w-20 h-11 text-center font-bold tabular-nums"
                    />
                    <div className="flex-1">
                      {/* Standard HTML range input styled with Tailwind */}
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={currentPuntaje}
                        disabled={readOnly}
                        onChange={(e) => setCurrentPuntaje(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-navy disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>
                  </div>
                </div>

                {!readOnly && (
                  <div className="md:col-span-2">
                    <Button
                      className="w-full h-11 bg-navy hover:bg-navy-hover text-white font-semibold rounded-md"
                      onClick={handleAddCriterio}
                    >
                      Guardar
                    </Button>
                  </div>
                )}
              </div>

              {/* Lista de criterios evaluados */}
              {criteriosEvaluados.length > 0 && (
                <div className="mt-8 border-t border-slate-100 pt-6">
                  <div className="flex items-center justify-between px-2 mb-4">
                    <span className="text-[14px] font-bold text-color-titulos">Criterio</span>
                    <span className="text-[14px] font-bold text-color-titulos mr-12">
                      Puntuación
                    </span>
                  </div>

                  <div className="space-y-2">
                    {criteriosEvaluados.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between border-b border-slate-100 py-3 px-2"
                      >
                        <span className="text-[13px] font-semibold text-color-titulos w-1/2">
                          {item.nombre}
                        </span>

                        <div className="flex items-center justify-end w-1/2 gap-4">
                          <div className="w-32 bg-slate-200 h-[6px] rounded-full overflow-hidden">
                            <div
                              className="bg-[var(--success)] h-full rounded-full transition-all duration-300"
                              style={{ width: `${item.puntaje}%` }}
                            />
                          </div>
                          <span className="text-[14px] font-bold text-color-titulos tabular-nums w-8 text-right">
                            {item.puntaje}
                          </span>
                          {!readOnly && (
                            <button
                              onClick={() => handleRemoveCriterio(item.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                              title="Eliminar criterio"
                            >
                              <LuTrash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* BLOQUE B: Evaluación económica */}
          <Card className="border-slate-200 shadow-sm rounded-lg overflow-hidden bg-white">
            <CardContent className="p-8">
              <h3 className="text-[17px] font-bold text-navy mb-4">Evaluación económica</h3>
              <div className="mb-2">
                <label className="block text-[13px] font-bold text-color-titulos">
                  Indique el monto Bs de la oferta de la empresa oferente
                </label>
                <p className="text-[11px] text-muted-foreground italic mb-2">
                  Artículos 95, 109 LCP; 18. 4 LOPA; 25 NORMAS DE CONTROL INTERNO SUNAI
                </p>
                <Input
                  type="text"
                  placeholder="Ej: 1500.50"
                  value={montoEconomico}
                  disabled={readOnly}
                  onChange={(e) => setMontoEconomico(e.target.value)}
                  className="h-11"
                />
              </div>
            </CardContent>
          </Card>

          {/* BLOQUE C: VAN */}
          <Card className="border-slate-200 shadow-sm rounded-lg overflow-hidden bg-white">
            <CardContent className="p-8">
              <h3 className="text-[17px] font-bold text-navy mb-4">VAN</h3>
              <div className="mb-2">
                <label className="block text-[13px] font-bold text-color-titulos">
                  Ingrese el Porcentaje (%) de Valor Agregado Nacional (VAN) de la oferta (si
                  aplica)
                </label>
                <p className="text-[11px] text-muted-foreground italic mb-2">
                  Artículos 17 LCC; 18 NORMAS DE CONTROL INTERNO SUNAI.
                </p>
                <Input
                  type="number"
                  placeholder="Ej: 20"
                  value={van}
                  disabled={readOnly}
                  onChange={(e) => setVan(e.target.value)}
                  className="h-11"
                />
              </div>
            </CardContent>
          </Card>

          {/* BLOQUE D: Orden de prelación */}
          <Card className="border-none shadow-sm rounded-lg overflow-hidden bg-navy text-white">
            <CardContent className="p-8">
              <h3 className="text-[17px] font-bold mb-4">Orden de prelación</h3>
              <div className="mb-2">
                <label className="block text-[13px] font-bold mb-1">
                  Indique en el orden de prelación, la posición de la empresa según su evaluación
                </label>
                <p className="text-[11px] text-white/70 italic mb-4">Ejemplo: Primera opción</p>

                <Select
                  value={ordenPrelacion}
                  onValueChange={readOnly ? undefined : setOrdenPrelacion}
                  disabled={readOnly}
                >
                  <SelectTrigger className="w-full sm:w-[300px] h-11 text-[13px] bg-white text-navy font-bold">
                    <SelectValue placeholder="Seleccione opciones..." />
                  </SelectTrigger>
                  <SelectContent>
                    {opcionesPrelacion.map((opcion) => (
                      <SelectItem key={opcion} value={opcion}>
                        {opcion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-200">
          <Button
            variant="outline"
            className="h-11 px-8 rounded-md font-semibold text-slate-500 border-slate-200 hover:bg-slate-50"
            onClick={() =>
              router.push(`/elaboracion-expediente/${id}/evaluacion/${oferenteId}/sobre-2`)
            }
          >
            Anterior
          </Button>

          <Button
            hidden={readOnly}
            className="h-11 px-8 rounded-md font-semibold bg-navy hover:bg-navy-hover text-white disabled:opacity-50"
            onClick={handleGuardarEvaluacion}
            disabled={isSaving}
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Guardando...
              </span>
            ) : (
              "Guardar evaluación"
            )}
          </Button>

          {/* Botones preview/descarga (disponibles tras guardar) */}
          {listaCotejoGenerada && (
            <div className="flex items-center gap-2">
              <button
                onClick={handlePreviewCotejo}
                disabled={isPreviewing}
                className="inline-flex items-center gap-1.5 px-3 h-11 rounded-md border border-slate-200 text-slate-600 hover:text-navy hover:border-navy transition-colors text-[12px] font-semibold disabled:opacity-50"
                title="Previsualizar lista de cotejo"
              >
                {isPreviewing ? (
                  <div className="w-4 h-4 border-2 border-navy border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
                Previsualizar
              </button>
              <button
                onClick={handleDownloadCotejo}
                disabled={isDownloading}
                className="inline-flex items-center gap-1.5 px-3 h-11 rounded-md border border-slate-200 text-slate-600 hover:text-navy hover:border-navy transition-colors text-[12px] font-semibold disabled:opacity-50"
                title="Descargar lista de cotejo"
              >
                {isDownloading ? (
                  <div className="w-4 h-4 border-2 border-navy border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                )}
                Descargar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Éxito de Evaluación */}
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

      {/* Dialog de Previsualización de Lista de Cotejo */}
      <ManualPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        urlArchivo={previewUrl}
        tituloManual={previewTitle}
        isLoading={isPreviewing}
      />
    </div>
  );
}

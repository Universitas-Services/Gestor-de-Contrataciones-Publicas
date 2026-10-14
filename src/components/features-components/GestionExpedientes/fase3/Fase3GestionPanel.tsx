"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { AdjudicacionParcialForm } from "./AdjudicacionParcialForm";
import { AdjudicacionTotalForm } from "./AdjudicacionTotalForm";
import { CaracterAdjudicacionCard } from "./CaracterAdjudicacionCard";
import { CausaNoAdjudicadoForm } from "./CausaNoAdjudicadoForm";
import { DocumentosLegalesFase3 } from "./DocumentosLegalesFase3";
import { InformeRecomendacionForm } from "./InformeRecomendacionForm";
import { LockedModuleOverlay } from "./LockedModuleOverlay";
import { OferentesAdjudicacionTable } from "./OferentesAdjudicacionTable";
import { useFase3GestionState } from "./useFase3GestionState";
import { ManualPreviewDialog } from "@/components/dashboards/admin_ente/ManualPreviewDialog";
import { listarEvaluacionesFase3 } from "@/services/oferenteService";
import {
  descargarDocumento,
  descargarNotificacionEvaluacion,
  generarDocumento,
  generarNotificacionesFase4,
  previewDocumento,
  previewNotificacionEvaluacion,
  type PreviewResponse,
} from "@/services/generadorDocumentosService";
import {
  mapToParticipanteEvaluacion,
  parseEvaluacionesResponse,
  sortByPrelacion,
  type ParticipanteEvaluacion,
} from "@/lib/utils/evaluacionesFase3Utils";

interface Fase3GestionPanelProps {
  expedienteId: string;
  readOnly?: boolean;
  /** tipo_objeto_contratacion del expediente (Bienes / Obras / Servicios). */
  tipoObjetoContratacion?: string | null;
}

type Fase3View =
  | "hub"
  | "adjudicacion-total"
  | "adjudicacion-parcial"
  | "causa-no-adjudicado"
  | "informe-recomendacion";

export function Fase3GestionPanel({
  expedienteId,
  readOnly = false,
  tipoObjetoContratacion = null,
}: Fase3GestionPanelProps) {
  const [participantes, setParticipantes] = useState<ParticipanteEvaluacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<Fase3View>("hub");
  const [activeOferente, setActiveOferente] = useState<ParticipanteEvaluacion | null>(null);
  const [savingCausa, setSavingCausa] = useState(false);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const fetchParticipantes = useCallback(async () => {
    try {
      const raw = await listarEvaluacionesFase3(expedienteId);
      const mapped = sortByPrelacion(
        parseEvaluacionesResponse(raw).map(mapToParticipanteEvaluacion)
      );
      setParticipantes(mapped);
    } catch {
      /* silent refresh errors */
    }
  }, [expedienteId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const raw = await listarEvaluacionesFase3(expedienteId);
        const mapped = sortByPrelacion(
          parseEvaluacionesResponse(raw).map(mapToParticipanteEvaluacion)
        );
        if (!cancelled) setParticipantes(mapped);
      } catch {
        if (!cancelled) setParticipantes([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [expedienteId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const inset = document.querySelector('[data-slot="sidebar-inset"]') as HTMLElement | null;
    if (inset) inset.scrollTop = 0;
  }, [view]);

  const flow = useFase3GestionState(expedienteId, participantes);

  const activeDictamen = useMemo(
    () => (activeOferente ? flow.state.dictamenes[activeOferente.id] : undefined),
    [activeOferente, flow.state.dictamenes]
  );

  const openPreview = useCallback(
    async (title: string, fetchFn: () => Promise<PreviewResponse>) => {
      setPreviewTitle(title);
      setPreviewUrl(null);
      setPreviewLoading(true);
      setPreviewOpen(true);
      try {
        const res = await fetchFn();
        setPreviewUrl(res.urlArchivo);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Error al cargar la vista previa.");
        setPreviewOpen(false);
      } finally {
        setPreviewLoading(false);
      }
    },
    []
  );

  const triggerDownload = useCallback(
    async (fetchFn: () => Promise<{ data: Uint8Array; fileName: string }>) => {
      try {
        const { data, fileName } = await fetchFn();
        const blob = new Blob([data as BlobPart], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Error al descargar el documento.");
      }
    },
    []
  );

  const handleAdjudicar = (p: ParticipanteEvaluacion) => {
    setActiveOferente(p);
    if (flow.state.caracterAdjudicacionAuAu === "PARCIAL") {
      setView("adjudicacion-parcial");
      return;
    }
    setView("adjudicacion-total");
  };

  const handleRegistrarCausa = (p: ParticipanteEvaluacion) => {
    setActiveOferente(p);
    setView("causa-no-adjudicado");
  };

  const backToHub = () => {
    setView("hub");
  };

  if (view === "causa-no-adjudicado" && activeOferente) {
    return (
      <CausaNoAdjudicadoForm
        key={activeOferente.id}
        oferenteNombre={activeOferente.nombreEmpresa}
        oferenteRif={activeOferente.rif}
        defaultValue={activeDictamen?.causaNoAdjudicado ?? ""}
        readOnly={readOnly}
        saving={savingCausa}
        onBack={backToHub}
        onSave={(causa) => {
          setSavingCausa(true);
          flow
            .saveCausaNoAdjudicado(activeOferente.id, causa)
            .then(() => {
              toast.success("Causa de no adjudicación guardada.");
              backToHub();
            })
            .catch((e: unknown) => {
              toast.error(
                e instanceof Error ? e.message : "Error al guardar la causa de no adjudicación."
              );
            })
            .finally(() => setSavingCausa(false));
        }}
      />
    );
  }

  if (view === "adjudicacion-total" && activeOferente) {
    return (
      <>
        <AdjudicacionTotalForm
          expedienteId={expedienteId}
          oferenteNombre={activeOferente.nombreEmpresa}
          oferenteRif={activeOferente.rif}
          defaultValues={activeDictamen?.total}
          readOnly={readOnly}
          manoObraRequerida={flow.manoObraRequerida}
          onBack={backToHub}
          onSave={(values) => {
            flow
              .saveDictamenTotal(activeOferente.id, values)
              .then(() => {
                toast.success("Adjudicación total guardada.");
                backToHub();
              })
              .catch((e: unknown) => {
                toast.error(e instanceof Error ? e.message : "Error al guardar la adjudicación.");
              });
          }}
        />
        <ManualPreviewDialog
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          urlArchivo={previewUrl}
          tituloManual={previewTitle}
          isLoading={previewLoading}
        />
      </>
    );
  }

  if (view === "adjudicacion-parcial" && activeOferente) {
    return (
      <>
        <AdjudicacionParcialForm
          expedienteId={expedienteId}
          oferenteNombre={activeOferente.nombreEmpresa}
          oferenteRif={activeOferente.rif}
          representanteLegal={activeOferente.representanteLegal}
          tipoObjetoContratacion={tipoObjetoContratacion}
          defaultValues={activeDictamen?.parcial}
          readOnly={readOnly}
          manoObraRequerida={flow.manoObraRequerida}
          onBack={backToHub}
          onSave={(values) => {
            const adjudicado = values.oferenteAdjudicadoProcedimientoAuAu === true;
            flow
              .saveDictamenParcial(activeOferente.id, values)
              .then(() => {
                toast.success(
                  adjudicado
                    ? "Adjudicación parcial guardada."
                    : "Dictamen de no adjudicación guardado."
                );
                fetchParticipantes();
                backToHub();
              })
              .catch((e: unknown) => {
                toast.error(e instanceof Error ? e.message : "Error al guardar el dictamen.");
              });
          }}
        />
        <ManualPreviewDialog
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          urlArchivo={previewUrl}
          tituloManual={previewTitle}
          isLoading={previewLoading}
        />
      </>
    );
  }

  if (view === "informe-recomendacion") {
    return (
      <InformeRecomendacionForm
        defaultValues={{
          existeItemsSinOfertasAuAu: flow.state.informe.existeItemsSinOfertasAuAu,
          itemsSinOfertasAuAu: flow.state.informe.itemsSinOfertasAuAu,
          motivoItemsSinOfertasAuAu: flow.state.informe.motivoItemsSinOfertasAuAu,
          actualizacionPresupuestoAuAu: flow.state.informe.actualizacionPresupuestoAuAu,
          montoNuevoPresupuestoAuAu: flow.state.informe.montoNuevoPresupuestoAuAu,
          justificacionActualizacionPresupuestoAuAu:
            flow.state.informe.justificacionActualizacionPresupuestoAuAu,
          observacionFormalidadesAuAu: flow.state.informe.observacionFormalidadesAuAu,
          omisionFormalidadesAuAu: flow.state.informe.omisionFormalidadesAuAu,
          subsanacionActoAuAu: flow.state.informe.subsanacionActoAuAu,
          datosActoSubsanacionAuAu: flow.state.informe.datosActoSubsanacionAuAu,
        }}
        readOnly={readOnly}
        onBack={backToHub}
        onSave={(values) => {
          flow
            .saveInforme(values)
            .then((aviso) => {
              if (aviso) toast.warning(aviso);
              else toast.success("Informe de Recomendación generado exitosamente.");
              backToHub();
            })
            .catch((e: unknown) => {
              toast.error(e instanceof Error ? e.message : "Error al guardar el informe.");
            });
        }}
      />
    );
  }

  return (
    <>
      <div className="space-y-6">
        <CaracterAdjudicacionCard
          value={flow.state.caracterAdjudicacionAuAu}
          canChange={flow.canChangeCaracter}
          readOnly={readOnly}
          onChange={(value) => {
            flow
              .setCaracter(value)
              .then(() => {
                toast.success(
                  value === "TOTAL"
                    ? "Carácter Total configurado."
                    : "Carácter Parcial configurado."
                );
              })
              .catch((e: unknown) => {
                toast.error(
                  e instanceof Error
                    ? e.message
                    : "No puede cambiar el carácter: ya hay adjudicaciones o dictámenes guardados."
                );
              });
            return true;
          }}
        />

        <LockedModuleOverlay
          locked={!flow.state.caracterAdjudicacionAuAu}
          message="Seleccione el carácter de adjudicación en el Paso 1."
        >
          <OferentesAdjudicacionTable
            participantes={participantes}
            loading={loading}
            dictamenes={flow.state.dictamenes}
            canAdjudicar={flow.canAdjudicar}
            requiereCausa={flow.requiereCausa}
            notificacionesUnlocked={flow.notificacionesUnlocked}
            notificacionesGeneradas={flow.notificacionesGeneradas}
            readOnly={readOnly}
            onAdjudicar={handleAdjudicar}
            onRegistrarCausa={handleRegistrarCausa}
            onNotificar={() => {
              generarNotificacionesFase4(expedienteId)
                .then(() => flow.refetch())
                .then(() => {
                  toast.success(
                    `Notificaciones generadas para todos los oferentes del procedimiento.`
                  );
                })
                .catch((e: unknown) => {
                  toast.error(
                    e instanceof Error ? e.message : "Error al generar las notificaciones."
                  );
                });
            }}
            onPreviewNotificacion={(p) => {
              openPreview(`Notificación — ${p.nombreEmpresa}`, () =>
                previewNotificacionEvaluacion(p.id)
              );
            }}
            onDownloadNotificacion={(p) => {
              triggerDownload(() => descargarNotificacionEvaluacion(p.id));
            }}
          />
        </LockedModuleOverlay>

        <LockedModuleOverlay
          locked={!flow.state.caracterAdjudicacionAuAu || !flow.docsUnlocked}
          message={
            !flow.state.caracterAdjudicacionAuAu
              ? "Seleccione el carácter de adjudicación en el Paso 1."
              : "Complete y guarde la(s) adjudicación(es) requeridas en el Paso 2."
          }
        >
          <DocumentosLegalesFase3
            docsUnlocked={flow.docsUnlocked}
            informePersistido={flow.informePersistido}
            informeGenerado={flow.state.informe.generado}
            actaUnlocked={flow.actaUnlocked}
            documentoAdjudicacionGenerado={flow.state.documentoAdjudicacionGenerado}
            readOnly={readOnly}
            onOpenInforme={() => setView("informe-recomendacion")}
            onGenerateInforme={() => {
              flow
                .generarInforme()
                .then(() => toast.success("Informe de Recomendación generado exitosamente."))
                .catch((e: unknown) => {
                  toast.error(e instanceof Error ? e.message : "Error al generar el informe.");
                });
            }}
            onPreviewInforme={() => {
              openPreview("Informe de Recomendación", () =>
                previewDocumento("informe-recomendacion", expedienteId)
              );
            }}
            onDownloadInforme={() => {
              triggerDownload(() => descargarDocumento("informe-recomendacion", expedienteId));
            }}
            onRegenerateInforme={() => setView("informe-recomendacion")}
            onGenerateActa={() => {
              generarDocumento("acta-adjudicacion", expedienteId)
                .then(() => flow.refetch())
                .then(() => toast.success("Documento de adjudicación generado."))
                .catch((e: unknown) => {
                  toast.error(e instanceof Error ? e.message : "Error al generar el documento.");
                });
            }}
            onPreviewActa={() => {
              openPreview("Documento de Adjudicación", () =>
                previewDocumento("acta-adjudicacion", expedienteId)
              );
            }}
            onDownloadActa={() => {
              triggerDownload(() => descargarDocumento("acta-adjudicacion", expedienteId));
            }}
            onRegenerateActa={() => {
              generarDocumento("acta-adjudicacion", expedienteId)
                .then(() => flow.refetch())
                .then(() => toast.success("Documento de adjudicación regenerado."))
                .catch((e: unknown) => {
                  toast.error(e instanceof Error ? e.message : "Error al regenerar el documento.");
                });
            }}
          />
        </LockedModuleOverlay>
      </div>

      <ManualPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        urlArchivo={previewUrl}
        tituloManual={previewTitle}
        isLoading={previewLoading}
      />
    </>
  );
}

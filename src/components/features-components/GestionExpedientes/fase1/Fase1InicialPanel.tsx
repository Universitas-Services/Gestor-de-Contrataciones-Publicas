"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import {
  actividadesPreviasPath,
  aspectosGeneralesPath,
  calificacionFinancieraPath,
  calificacionLegalPath,
  calificacionTecnicaPath,
  evaluacionTecnicaEconomicaPath,
  especificacionesTecnicasPath,
  llamadoPublicoPath,
  modeloContratoPath,
  resolveFase1SubTabParam,
} from "@/lib/utils/fase1InicialRoutes";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FASE1_INICIAL_MICROMODULES,
  getMicromodulesForSubTab,
} from "./constants/fase1Inicial.constants";
import { DocumentosProcedimientoPanel } from "./DocumentosProcedimientoPanel";
import { EspecificacionesTecnicasDocumentoCard } from "./EspecificacionesTecnicasDocumentoCard";
import { Fase1SubTabs } from "./Fase1SubTabs";
import { useFase1InicialState } from "./hooks/useFase1InicialState";
import { MicromoduleCard } from "./MicromoduleCard";
import { MicromodulePlaceholderSheet } from "./MicromodulePlaceholderSheet";
import { PresupuestoBaseSection } from "./PresupuestoBaseSection";
import type {
  Fase1InicialSubTab,
  MicromoduleConfig,
  MicromoduleId,
} from "./types/fase1Inicial.types";

export interface Fase1InicialPanelProps {
  expedienteId: string;
  readOnly?: boolean;
  basePath?: string;
}

export function Fase1InicialPanel({
  expedienteId,
  readOnly = false,
  basePath = "/gestion-expedientes",
}: Fase1InicialPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fase1SubParam = searchParams.get("fase1Sub");
  const queryString = searchParams.toString();
  const [activeSubTab, setActiveSubTab] = useState<Fase1InicialSubTab>(() =>
    resolveFase1SubTabParam(fase1SubParam)
  );
  const [activeMicromodule, setActiveMicromodule] = useState<MicromoduleConfig | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [presupuestoModalOpen, setPresupuestoModalOpen] = useState(false);

  useEffect(() => {
    setActiveSubTab(resolveFase1SubTabParam(fase1SubParam));
  }, [fase1SubParam]);

  const handleSubTabChange = useCallback(
    (value: Fase1InicialSubTab) => {
      const current = resolveFase1SubTabParam(fase1SubParam);
      const params = new URLSearchParams(queryString);
      params.set("tab", "fase-1");
      if (value === "preparatoria") {
        params.delete("fase1Sub");
      } else {
        params.set("fase1Sub", value);
      }
      const nextQuery = params.toString();
      if (value === current && value === activeSubTab && nextQuery === queryString) {
        return;
      }
      setActiveSubTab(value);
      if (nextQuery === queryString) return;
      router.replace(`${basePath}/${expedienteId}?${nextQuery}`, { scroll: false });
    },
    [activeSubTab, basePath, expedienteId, fase1SubParam, queryString, router]
  );

  const {
    state,
    hydrated,
    loading,
    refreshProgreso,
    generateDocument,
    regenerateDocument,
    getUnlockTooltip,
  } = useFase1InicialState(expedienteId);

  const preparatoriaModules = useMemo(() => getMicromodulesForSubTab("preparatoria"), []);
  const configuracionModules = useMemo(() => getMicromodulesForSubTab("configuracion-pliego"), []);

  const handlePresupuestoItemsChange = useCallback(() => {
    void refreshProgreso();
  }, [refreshProgreso]);

  const handleMicromoduleAction = (config: MicromoduleConfig) => {
    const status = state.micromodules[config.id];
    if (status === "locked") return;

    if (config.id === "actividades-previas") {
      router.push(actividadesPreviasPath(basePath, expedienteId));
      return;
    }

    if (config.id === "especificaciones-tecnicas") {
      router.push(especificacionesTecnicasPath(basePath, expedienteId));
      return;
    }

    if (config.id === "llamado") {
      router.push(llamadoPublicoPath(basePath, expedienteId));
      return;
    }

    if (config.id === "aspectos-generales-pliego") {
      router.push(aspectosGeneralesPath(basePath, expedienteId));
      return;
    }

    if (config.id === "modelo-contrato") {
      router.push(modeloContratoPath(basePath, expedienteId));
      return;
    }

    if (config.id === "calificacion-legal") {
      router.push(calificacionLegalPath(basePath, expedienteId));
      return;
    }

    if (config.id === "calificacion-financiera") {
      router.push(calificacionFinancieraPath(basePath, expedienteId));
      return;
    }

    if (config.id === "calificacion-tecnica") {
      router.push(calificacionTecnicaPath(basePath, expedienteId));
      return;
    }

    if (config.id === "evaluacion-tecnica-economica") {
      router.push(evaluacionTecnicaEconomicaPath(basePath, expedienteId));
      return;
    }

    if (readOnly) return;

    if (config.id === "presupuesto-base") {
      setPresupuestoModalOpen(true);
      return;
    }

    if (!config.hasPlaceholderForm) return;

    setActiveMicromodule(config);
    setSheetOpen(true);
  };

  const handleSaveMicromodule = () => {
    if (!activeMicromodule || readOnly) return;
    toast.success(`${activeMicromodule.title} guardado correctamente.`);
  };

  const renderMicromoduleGrid = (
    modules: MicromoduleConfig[],
    layout: "preparatoria" | "configuracion" = "preparatoria"
  ) => (
    <div
      className={
        layout === "configuracion"
          ? "grid auto-rows-fr grid-cols-1 gap-5 sm:grid-cols-2"
          : "grid auto-rows-fr grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
      }
    >
      {modules.map((config) => (
        <MicromoduleCard
          key={config.id}
          config={config}
          status={state.micromodules[config.id]}
          readOnly={
            readOnly &&
            config.id !== "actividades-previas" &&
            config.id !== "especificaciones-tecnicas"
          }
          onAction={() => handleMicromoduleAction(config)}
        />
      ))}
    </div>
  );

  if (!hydrated || loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-11 w-full max-w-3xl" />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
          <Skeleton className="h-[480px] w-full" />
          <Skeleton className="h-[420px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Fase1SubTabs value={activeSubTab} onChange={handleSubTabChange} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(280px,32%)]">
        <div className="min-w-0">
          {activeSubTab === "preparatoria"
            ? renderMicromoduleGrid(preparatoriaModules, "preparatoria")
            : renderMicromoduleGrid(configuracionModules, "configuracion")}
        </div>

        <div className="sticky top-24 w-full min-w-0 space-y-4 self-start">
          <DocumentosProcedimientoPanel
            expedienteId={expedienteId}
            documents={state.documents}
            micromodules={state.micromodules}
            readOnly={readOnly}
            onGenerate={generateDocument}
            onRegenerate={regenerateDocument}
            getUnlockTooltip={getUnlockTooltip}
          />
          <EspecificacionesTecnicasDocumentoCard
            expedienteId={expedienteId}
            micromoduleStatus={state.micromodules["especificaciones-tecnicas"]}
          />
        </div>
      </div>

      {activeSubTab === "preparatoria" ? (
        <PresupuestoBaseSection
          expedienteId={expedienteId}
          readOnly={readOnly}
          micromoduleStatus={state.micromodules["presupuesto-base"]}
          onItemsChange={handlePresupuestoItemsChange}
          createModalOpen={presupuestoModalOpen}
          onCreateModalOpenChange={setPresupuestoModalOpen}
        />
      ) : null}

      <MicromodulePlaceholderSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        config={activeMicromodule}
        readOnly={readOnly}
        isCompleted={
          activeMicromodule ? state.micromodules[activeMicromodule.id] === "completed" : false
        }
        onSave={handleSaveMicromodule}
      />
    </div>
  );
}

export { FASE1_INICIAL_MICROMODULES };
export type { MicromoduleId };

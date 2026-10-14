"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { CalificacionFinancieraPanel } from "@/components/features-components/GestionExpedientes/evaluacion-oferente/calificacion-financiera/CalificacionFinancieraPanel";
import { CalificacionLegalPanel } from "@/components/features-components/GestionExpedientes/evaluacion-oferente/calificacion-legal/CalificacionLegalPanel";
import { CalificacionTecnicaPanel } from "@/components/features-components/GestionExpedientes/evaluacion-oferente/calificacion-tecnica/CalificacionTecnicaPanel";
import { EvaluacionPuntajePanel } from "@/components/features-components/GestionExpedientes/evaluacion-oferente/evaluacion-puntaje/EvaluacionPuntajePanel";
import { PromocionEconomicaPanel } from "@/components/features-components/GestionExpedientes/evaluacion-oferente/promocion-economica/PromocionEconomicaPanel";
import { EvaluacionOferenteBanner } from "@/components/features-components/GestionExpedientes/evaluacion-oferente/EvaluacionOferenteBanner";
import { EvaluacionOferenteSidebar } from "@/components/features-components/GestionExpedientes/evaluacion-oferente/EvaluacionOferenteSidebar";
import { resolveModuloGates } from "@/components/features-components/GestionExpedientes/evaluacion-oferente/hooks/useEvaluacionOferenteGate";
import { expedienteTabPath } from "@/lib/utils/evaluacionRoutes";
import {
  evaluacionFormToHubPatch,
  financieraFormToHubPatch,
  legalFormToHubPatch,
  mapHubToPageModel,
  promocionFormToHubPatch,
  tecnicaFormToHubPatch,
} from "@/lib/utils/evaluacionHubMapper";
import { formatHubErrorMessage } from "@/lib/utils/evaluacionHubError";
import { obtenerHubEvaluacion, patchHubModulo } from "@/services/evaluacionHubService";
import type {
  CalificacionFinancieraEvaluacionValues,
  CalificacionLegalEvaluacionValues,
  CalificacionTecnicaEvaluacionValues,
  EvaluacionModuloId,
  EvaluacionOferenteBannerData,
  EvaluacionOferentePersistedState,
  EvaluacionPuntajeEvaluacionValues,
  HubPageModel,
  PlantillaEvaluacion,
  PlantillaFinanciera,
  PlantillaPromocion,
  PlantillaTecnica,
  PromocionEconomicaEvaluacionValues,
  RecaudoCotejoItem,
} from "@/types/evaluacionOferente.types";

const BASE_PATH = "/gestion-expedientes";

interface EvaluacionOferentePageProps {
  expedienteId: string;
  evaluacionId: string;
}

export function EvaluacionOferentePage({
  expedienteId,
  evaluacionId,
}: EvaluacionOferentePageProps) {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<EvaluacionOferenteBannerData>({
    nombreProveedor: "—",
    rif: "—",
    montoOfertaBs: null,
  });
  const [plantillaLegal, setPlantillaLegal] = useState<RecaudoCotejoItem[]>([]);
  const [plantillaFinanciera, setPlantillaFinanciera] = useState<PlantillaFinanciera | null>(null);
  const [plantillaTecnica, setPlantillaTecnica] = useState<PlantillaTecnica | null>(null);
  const [plantillaEvaluacion, setPlantillaEvaluacion] = useState<PlantillaEvaluacion | null>(null);
  const [plantillaPromocion, setPlantillaPromocion] = useState<PlantillaPromocion | null>(null);
  const [notaBase, setNotaBase] = useState<number | null>(null);
  const [state, setState] = useState<EvaluacionOferentePersistedState | null>(null);

  const applyHub = (model: HubPageModel) => {
    setBanner(model.banner);
    setPlantillaLegal(model.plantillaLegal);
    setPlantillaFinanciera(model.plantillaFinanciera);
    setPlantillaTecnica(model.plantillaTecnica);
    setPlantillaEvaluacion(model.plantillaEvaluacion);
    setPlantillaPromocion(model.plantillaPromocion);
    setNotaBase(model.notaBase);
    setState(model.state);
  };

  useEffect(() => {
    let cancelled = false;
    setHydrated(false);

    void (async () => {
      try {
        const hub = await obtenerHubEvaluacion(evaluacionId);
        if (cancelled) return;
        applyHub(mapHubToPageModel(hub));
        setHydrated(true);
      } catch (error) {
        if (cancelled) return;
        toast.error(formatHubErrorMessage(error, "No se pudo cargar la evaluación"));
        router.push(expedienteTabPath(BASE_PATH, expedienteId, "fase-2"));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [evaluacionId, expedienteId, router]);

  const activeModulo = state?.activeModulo;
  useEffect(() => {
    if (!activeModulo) return;
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    const inset = document.querySelector<HTMLElement>('[data-slot="sidebar-inset"]');
    inset?.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeModulo]);

  const activaPromocion = plantillaPromocion !== null;
  const gates = state ? resolveModuloGates(state, activaPromocion) : [];
  const backToTabla = () => {
    router.push(expedienteTabPath(BASE_PATH, expedienteId, "fase-2"));
  };

  const handleSelectModulo = (id: EvaluacionModuloId) => {
    if (!state) return;
    const gate = gates.find((g) => g.id === id);
    if (!gate?.unlocked) return;
    setState({ ...state, activeModulo: id });
  };

  const handleDraftLegal = async (legalForm: CalificacionLegalEvaluacionValues) => {
    setSaving(true);
    try {
      const hub = await patchHubModulo(evaluacionId, "legal", {
        action: "draft",
        form: legalFormToHubPatch(legalForm),
      });
      applyHub(mapHubToPageModel(hub));
      toast.success("Borrador de calificación legal guardado.");
      backToTabla();
    } catch (error) {
      toast.error(formatHubErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmLegal = async (legalForm: CalificacionLegalEvaluacionValues) => {
    setSaving(true);
    try {
      const hub = await patchHubModulo(evaluacionId, "legal", {
        action: "confirm",
        form: legalFormToHubPatch(legalForm),
      });
      const model = mapHubToPageModel(hub);
      applyHub(model);

      if (model.state.oferenteCalificadoLegal === false) {
        toast.error("El oferente fue descalificado en la calificación legal.");
        router.push(expedienteTabPath(BASE_PATH, expedienteId, "fase-2"));
        return;
      }

      toast.success("Calificación legal guardada. Calificación financiera desbloqueada.");
    } catch (error) {
      toast.error(formatHubErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDraftFinanciera = async (financieraForm: CalificacionFinancieraEvaluacionValues) => {
    setSaving(true);
    try {
      const hub = await patchHubModulo(evaluacionId, "financiera", {
        action: "draft",
        form: financieraFormToHubPatch(financieraForm),
      });
      applyHub(mapHubToPageModel(hub));
      toast.success("Borrador de calificación financiera guardado.");
      backToTabla();
    } catch (error) {
      toast.error(formatHubErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmFinanciera = async (
    financieraForm: CalificacionFinancieraEvaluacionValues
  ) => {
    setSaving(true);
    try {
      const hub = await patchHubModulo(evaluacionId, "financiera", {
        action: "confirm",
        form: financieraFormToHubPatch(financieraForm),
      });
      const model = mapHubToPageModel(hub);
      applyHub(model);

      if (model.state.oferenteCalificadoFinanciera === false) {
        toast.error("El oferente fue descalificado en la calificación financiera.");
        router.push(expedienteTabPath(BASE_PATH, expedienteId, "fase-2"));
        return;
      }

      toast.success("Calificación financiera guardada. Calificación técnica desbloqueada.");
    } catch (error) {
      toast.error(formatHubErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDraftTecnica = async (tecnicaForm: CalificacionTecnicaEvaluacionValues) => {
    setSaving(true);
    try {
      const hub = await patchHubModulo(evaluacionId, "tecnica", {
        action: "draft",
        form: tecnicaFormToHubPatch(tecnicaForm),
      });
      applyHub(mapHubToPageModel(hub));
      toast.success("Borrador de calificación técnica guardado.");
      backToTabla();
    } catch (error) {
      toast.error(formatHubErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmTecnica = async (tecnicaForm: CalificacionTecnicaEvaluacionValues) => {
    setSaving(true);
    try {
      const hub = await patchHubModulo(evaluacionId, "tecnica", {
        action: "confirm",
        form: tecnicaFormToHubPatch(tecnicaForm),
      });
      const model = mapHubToPageModel(hub);
      applyHub(model);

      if (model.state.oferenteCalificadoTecnica === false) {
        toast.error("El oferente fue descalificado en la calificación técnica.");
        router.push(expedienteTabPath(BASE_PATH, expedienteId, "fase-2"));
        return;
      }

      toast.success("Calificación técnica guardada. Evaluación y puntaje desbloqueados.");
    } catch (error) {
      toast.error(formatHubErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDraftEvaluacion = async (evaluacionForm: EvaluacionPuntajeEvaluacionValues) => {
    setSaving(true);
    try {
      const hub = await patchHubModulo(evaluacionId, "evaluacion", {
        action: "draft",
        form: evaluacionFormToHubPatch(evaluacionForm),
      });
      applyHub(mapHubToPageModel(hub));
      toast.success("Borrador de evaluación y puntaje guardado.");
      backToTabla();
    } catch (error) {
      toast.error(formatHubErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmEvaluacion = async (evaluacionForm: EvaluacionPuntajeEvaluacionValues) => {
    setSaving(true);
    try {
      const hub = await patchHubModulo(evaluacionId, "evaluacion", {
        action: "confirm",
        form: evaluacionFormToHubPatch(evaluacionForm),
      });
      const model = mapHubToPageModel(hub);
      applyHub(model);

      if (model.state.resultadoFinal === "descalificado") {
        toast.error("El oferente fue descalificado en la evaluación técnica y económica.");
        backToTabla();
        return;
      }

      // Si hay promoción económica pendiente, se queda en el flujo; si no, el flujo terminó.
      if (model.state.unlocked.promocion && !model.state.promocionSubmitted) {
        toast.success("Evaluación guardada. Promoción económica desbloqueada.");
        return;
      }

      toast.success("Evaluación técnica y económica guardada. Oferente calificado.");
      backToTabla();
    } catch (error) {
      toast.error(formatHubErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDraftPromocion = async (promocionForm: PromocionEconomicaEvaluacionValues) => {
    setSaving(true);
    try {
      const hub = await patchHubModulo(evaluacionId, "promocion", {
        action: "draft",
        form: promocionFormToHubPatch(promocionForm),
      });
      applyHub(mapHubToPageModel(hub));
      toast.success("Borrador de promoción económica guardado.");
      backToTabla();
    } catch (error) {
      toast.error(formatHubErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmPromocion = async (promocionForm: PromocionEconomicaEvaluacionValues) => {
    setSaving(true);
    try {
      const hub = await patchHubModulo(evaluacionId, "promocion", {
        action: "confirm",
        form: promocionFormToHubPatch(promocionForm),
      });
      applyHub(mapHubToPageModel(hub));
      toast.success("Medidas de promoción guardadas. Oferente calificado.");
      backToTabla();
    } catch (error) {
      toast.error(formatHubErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const renderModulo = () => {
    if (!hydrated || !state || !plantillaFinanciera || !plantillaTecnica || !plantillaEvaluacion) {
      return (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          Cargando evaluación...
        </div>
      );
    }

    if (state.activeModulo === "legal") {
      return (
        <CalificacionLegalPanel
          key={`${evaluacionId}-legal-${state.legalSubmitted}`}
          items={plantillaLegal}
          defaultValues={state.legalForm}
          readOnly={state.legalSubmitted}
          saving={saving}
          onDraft={(values) => void handleDraftLegal(values)}
          onConfirm={(values) => void handleConfirmLegal(values)}
        />
      );
    }

    if (state.activeModulo === "financiera") {
      return (
        <CalificacionFinancieraPanel
          key={`${evaluacionId}-fin-${state.financieraSubmitted}`}
          plantilla={plantillaFinanciera}
          defaultValues={state.financieraForm}
          readOnly={state.financieraSubmitted}
          saving={saving}
          onDraft={(values) => void handleDraftFinanciera(values)}
          onConfirm={(values) => void handleConfirmFinanciera(values)}
        />
      );
    }

    if (state.activeModulo === "tecnica") {
      return (
        <CalificacionTecnicaPanel
          key={`${evaluacionId}-tec-${state.tecnicaSubmitted}`}
          plantilla={plantillaTecnica}
          defaultValues={state.tecnicaForm}
          readOnly={state.tecnicaSubmitted}
          saving={saving}
          onDraft={(values) => void handleDraftTecnica(values)}
          onConfirm={(values) => void handleConfirmTecnica(values)}
        />
      );
    }

    if (state.activeModulo === "evaluacion") {
      return (
        <EvaluacionPuntajePanel
          key={`${evaluacionId}-eval-${state.evaluacionSubmitted}`}
          plantilla={plantillaEvaluacion}
          defaultValues={state.evaluacionForm}
          readOnly={state.evaluacionSubmitted}
          saving={saving}
          onDraft={(values) => void handleDraftEvaluacion(values)}
          onConfirm={(values) => void handleConfirmEvaluacion(values)}
        />
      );
    }

    if (state.activeModulo === "promocion" && plantillaPromocion) {
      return (
        <PromocionEconomicaPanel
          key={`${evaluacionId}-promo-${state.promocionSubmitted}`}
          plantilla={plantillaPromocion}
          notaBase={notaBase ?? 0}
          defaultValues={state.promocionForm}
          readOnly={state.promocionSubmitted}
          saving={saving}
          onDraft={(values) => void handleDraftPromocion(values)}
          onConfirm={(values) => void handleConfirmPromocion(values)}
        />
      );
    }

    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Módulo no disponible.
      </div>
    );
  };

  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <EvaluacionOferenteBanner banner={banner} onBack={backToTabla} />

      <div className="flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">{renderModulo()}</div>

        {state ? (
          <EvaluacionOferenteSidebar
            gates={gates}
            activeModulo={state.activeModulo}
            resultadoFinal={state.resultadoFinal}
            onSelect={handleSelectModulo}
          />
        ) : null}
      </div>
    </div>
  );
}

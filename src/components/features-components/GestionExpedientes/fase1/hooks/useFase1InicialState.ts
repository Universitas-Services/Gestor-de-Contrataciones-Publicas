"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { createInitialFase1InicialState } from "../constants/fase1Inicial.constants";
import type { DocumentoMaestroId, Fase1InicialState } from "../types/fase1Inicial.types";
import { getDocumentUnlockTooltip, getPliegoMissingRequirements } from "../utils/fase1UnlockLogic";
import { obtenerProgresoFasePreparatoria } from "@/services/fase1MicromodulosService";
import { generarDocumentoFase1Maestro } from "@/services/generadorDocumentosService";
import { mapProgresoToFase1State } from "@/lib/utils/fase1MicromodulosMapper";

export function useFase1InicialState(expedienteId: string) {
  const [state, setState] = useState<Fase1InicialState>(() => createInitialFase1InicialState());
  const [hydrated, setHydrated] = useState(false);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const loading = loadedFor !== expedienteId;
  const [pliegoReady, setPliegoReady] = useState(false);
  const [pliegoMissingFromApi, setPliegoMissingFromApi] = useState<string[]>([]);

  const refreshProgreso = useCallback(async () => {
    try {
      const progreso = await obtenerProgresoFasePreparatoria(expedienteId);
      setState(mapProgresoToFase1State(progreso));
      setPliegoReady(progreso.pliegoReady);
      setPliegoMissingFromApi(progreso.pliegoMissing ?? []);
    } catch {
      setState(createInitialFase1InicialState());
      setPliegoReady(false);
      setPliegoMissingFromApi([]);
    }
  }, [expedienteId]);

  useEffect(() => {
    let cancelled = false;

    void obtenerProgresoFasePreparatoria(expedienteId)
      .then((progreso) => {
        if (cancelled) return;
        setState(mapProgresoToFase1State(progreso));
        setPliegoReady(progreso.pliegoReady);
        setPliegoMissingFromApi(progreso.pliegoMissing ?? []);
        setHydrated(true);
      })
      .catch(() => {
        if (cancelled) return;
        setState(createInitialFase1InicialState());
        setPliegoReady(false);
        setPliegoMissingFromApi([]);
        setHydrated(true);
      })
      .finally(() => {
        if (!cancelled) setLoadedFor(expedienteId);
      });

    return () => {
      cancelled = true;
    };
  }, [expedienteId]);

  const pliegoMissingRequirements = useMemo(() => {
    if (pliegoMissingFromApi.length > 0) return pliegoMissingFromApi;
    return getPliegoMissingRequirements(state.micromodules);
  }, [pliegoMissingFromApi, state.micromodules]);

  const generateDocument = useCallback(
    async (id: DocumentoMaestroId) => {
      await generarDocumentoFase1Maestro(id, expedienteId);
      await refreshProgreso();
    },
    [expedienteId, refreshProgreso]
  );

  /** Regenerar = mismo POST de generar (reemplaza archivo en backend). */
  const regenerateDocument = useCallback(
    async (id: DocumentoMaestroId) => {
      await generarDocumentoFase1Maestro(id, expedienteId);
      await refreshProgreso();
    },
    [expedienteId, refreshProgreso]
  );

  const getUnlockTooltip = useCallback(
    (documentId: DocumentoMaestroId) => {
      if (documentId === "pliego" && pliegoMissingRequirements.length > 0) {
        if (pliegoMissingRequirements.length <= 3) {
          return `Pendiente: ${pliegoMissingRequirements.join(", ")}.`;
        }
        return `Complete los ${pliegoMissingRequirements.length} requisitos pendientes para habilitar el Pliego.`;
      }
      return getDocumentUnlockTooltip(documentId, state.documents, state.micromodules);
    },
    [pliegoMissingRequirements, state.documents, state.micromodules]
  );

  return {
    state,
    hydrated,
    loading,
    pliegoEnabled: pliegoReady,
    pliegoMissingRequirements,
    refreshProgreso,
    generateDocument,
    regenerateDocument,
    getUnlockTooltip,
  };
}

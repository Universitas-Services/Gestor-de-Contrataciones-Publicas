"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { createInitialFase1InicialState, getStorageKey } from "../constants/fase1Inicial.constants";
import type {
  DocumentoMaestroId,
  Fase1InicialState,
  MicromoduleId,
} from "../types/fase1Inicial.types";
import {
  applyFase1DocumentRules,
  canEnablePliego,
  getDocumentUnlockTooltip,
  getPliegoMissingRequirements,
  unlockMicromodulesAfterActividadesPrevias,
} from "../utils/fase1UnlockLogic";

function isValidState(value: unknown): value is Fase1InicialState {
  if (!value || typeof value !== "object") return false;
  const state = value as Fase1InicialState;
  return Boolean(state.micromodules && state.documents);
}

function loadState(expedienteId: string): Fase1InicialState {
  if (typeof window === "undefined") {
    return createInitialFase1InicialState();
  }

  try {
    const raw = window.localStorage.getItem(getStorageKey(expedienteId));
    if (!raw) return createInitialFase1InicialState();
    const parsed: unknown = JSON.parse(raw);
    if (!isValidState(parsed)) return createInitialFase1InicialState();
    return applyFase1DocumentRules(parsed);
  } catch {
    return createInitialFase1InicialState();
  }
}

function persistState(expedienteId: string, state: Fase1InicialState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getStorageKey(expedienteId), JSON.stringify(state));
}

export function useFase1InicialState(expedienteId: string) {
  const [state, setState] = useState<Fase1InicialState>(() => createInitialFase1InicialState());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setState(loadState(expedienteId));
      setHydrated(true);
    });
  }, [expedienteId]);

  useEffect(() => {
    if (!hydrated) return;
    persistState(expedienteId, state);
  }, [expedienteId, hydrated, state]);

  const updateState = useCallback((updater: (prev: Fase1InicialState) => Fase1InicialState) => {
    setState((prev) => applyFase1DocumentRules(updater(prev)));
  }, []);

  /**
   * Marca un micromódulo como COMPLETADO.
   * Actividades Previas: genera el documento maestro de inmediato y desbloquea el resto.
   */
  const completeMicromodule = useCallback(
    (id: MicromoduleId) => {
      updateState((prev) => {
        const micromodules = { ...prev.micromodules, [id]: "completed" as const };
        let documents = { ...prev.documents };

        if (id === "actividades-previas") {
          const unlocked = unlockMicromodulesAfterActividadesPrevias(micromodules);
          documents = { ...documents, "actividades-previas": "generated" };
          return { ...prev, micromodules: unlocked, documents };
        }

        return { ...prev, micromodules };
      });
    },
    [updateState]
  );

  /** Guarda parcial (BORRADOR) sin habilitar Pliego. */
  const saveMicromoduleDraft = useCallback(
    (id: MicromoduleId) => {
      updateState((prev) => {
        const current = prev.micromodules[id];
        if (current === "locked" || current === "completed") return prev;
        return {
          ...prev,
          micromodules: { ...prev.micromodules, [id]: "draft" },
        };
      });
    },
    [updateState]
  );

  /**
   * Presupuesto base: completed solo si hay ≥1 ítem.
   * Si se vacía la tabla, vuelve a available (y el Pliego se bloquea de nuevo).
   */
  const syncPresupuestoCompletion = useCallback(
    (hasItems: boolean) => {
      updateState((prev) => {
        const current = prev.micromodules["presupuesto-base"];
        if (current === "locked") return prev;

        const nextStatus = hasItems ? ("completed" as const) : ("available" as const);
        if (current === nextStatus) return prev;

        return {
          ...prev,
          micromodules: {
            ...prev.micromodules,
            "presupuesto-base": nextStatus,
          },
        };
      });
    },
    [updateState]
  );

  const generateDocument = useCallback(
    (id: DocumentoMaestroId) => {
      updateState((prev) => {
        if (prev.documents[id] !== "ready") return prev;
        return {
          ...prev,
          documents: { ...prev.documents, [id]: "generated" },
        };
      });
    },
    [updateState]
  );

  const regenerateDocument = useCallback(
    (id: DocumentoMaestroId) => {
      updateState((prev) => {
        if (prev.documents[id] !== "generated") return prev;
        return prev;
      });
    },
    [updateState]
  );

  const pliegoEnabled = useMemo(() => canEnablePliego(state.micromodules), [state.micromodules]);

  const pliegoMissingRequirements = useMemo(
    () => getPliegoMissingRequirements(state.micromodules),
    [state.micromodules]
  );

  const getUnlockTooltip = useCallback(
    (documentId: DocumentoMaestroId) =>
      getDocumentUnlockTooltip(documentId, state.documents, state.micromodules),
    [state.documents, state.micromodules]
  );

  return {
    state,
    hydrated,
    pliegoEnabled,
    pliegoMissingRequirements,
    completeMicromodule,
    saveMicromoduleDraft,
    syncPresupuestoCompletion,
    generateDocument,
    regenerateDocument,
    getUnlockTooltip,
  };
}

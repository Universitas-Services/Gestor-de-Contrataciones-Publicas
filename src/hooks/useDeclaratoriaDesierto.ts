"use client";

import { useCallback, useEffect, useState } from "react";

import {
  DECLARATORIA_DESIERTO_STORAGE_PREFIX,
  fromCausalDeclaratoriaDesiertoApi,
  isEstatusProcesoDesierto,
  type CausalDeclaratoriaDesierto,
} from "@/lib/constants/fase2Desierto";

export interface DeclaratoriaDesiertoState {
  declaratoria_desierto_au_au: boolean;
  causal_declaratoria_desierto_au_au: CausalDeclaratoriaDesierto | "";
  justificacion_declaratoria_desierto_au_au: string;
  informeGenerado: boolean;
}

export interface DeclaratoriaDesiertoServerSeed {
  causalDeclaratoriaDesierto?: string | null;
  justificacionDeclaratoriaDesierto?: string | null;
  estatusProceso?: string | null;
}

const EMPTY_STATE: DeclaratoriaDesiertoState = {
  declaratoria_desierto_au_au: false,
  causal_declaratoria_desierto_au_au: "",
  justificacion_declaratoria_desierto_au_au: "",
  informeGenerado: false,
};

function storageKey(expedienteId: string) {
  return `${DECLARATORIA_DESIERTO_STORAGE_PREFIX}${expedienteId}`;
}

/** Limpia restos del mock anterior en localStorage (ya no se usa). */
function clearLegacyLocalStorage(expedienteId: string) {
  try {
    window.localStorage.removeItem(storageKey(expedienteId));
  } catch {
    // ignore
  }
}

function readFromStorage(expedienteId: string): DeclaratoriaDesiertoState {
  if (typeof window === "undefined" || !expedienteId) return EMPTY_STATE;

  clearLegacyLocalStorage(expedienteId);

  try {
    const raw = window.sessionStorage.getItem(storageKey(expedienteId));
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw) as Partial<DeclaratoriaDesiertoState>;
    return {
      declaratoria_desierto_au_au: Boolean(parsed.declaratoria_desierto_au_au),
      causal_declaratoria_desierto_au_au: parsed.causal_declaratoria_desierto_au_au || "",
      justificacion_declaratoria_desierto_au_au:
        parsed.justificacion_declaratoria_desierto_au_au || "",
      informeGenerado: Boolean(parsed.informeGenerado),
    };
  } catch {
    return EMPTY_STATE;
  }
}

function writeToStorage(expedienteId: string, state: DeclaratoriaDesiertoState) {
  if (typeof window === "undefined" || !expedienteId) return;
  window.sessionStorage.setItem(storageKey(expedienteId), JSON.stringify(state));
  window.dispatchEvent(
    new CustomEvent("declaratoria-desierto-changed", { detail: { expedienteId } })
  );
}

function stateFromServerSeed(
  seed: DeclaratoriaDesiertoServerSeed
): DeclaratoriaDesiertoState | null {
  const hasCausal = Boolean(seed.causalDeclaratoriaDesierto?.trim());
  const byStatus = isEstatusProcesoDesierto(seed.estatusProceso);
  if (!hasCausal && !byStatus) return null;

  const causal = fromCausalDeclaratoriaDesiertoApi(seed.causalDeclaratoriaDesierto);
  return {
    declaratoria_desierto_au_au: true,
    causal_declaratoria_desierto_au_au: causal,
    justificacion_declaratoria_desierto_au_au: seed.justificacionDeclaratoriaDesierto?.trim() || "",
    informeGenerado: true,
  };
}

export function isExpedienteDeclaradoDesierto(expedienteId: string): boolean {
  return readFromStorage(expedienteId).declaratoria_desierto_au_au === true;
}

export function useDeclaratoriaDesierto(
  expedienteId: string,
  serverSeed?: DeclaratoriaDesiertoServerSeed | null
) {
  const [state, setState] = useState<DeclaratoriaDesiertoState>(EMPTY_STATE);
  const [hydrated, setHydrated] = useState(false);

  const seedCausal = serverSeed?.causalDeclaratoriaDesierto ?? null;
  const seedJustificacion = serverSeed?.justificacionDeclaratoriaDesierto ?? null;
  const seedEstatus = serverSeed?.estatusProceso ?? null;

  const reload = useCallback(() => {
    const fromServer = stateFromServerSeed({
      causalDeclaratoriaDesierto: seedCausal,
      justificacionDeclaratoriaDesierto: seedJustificacion,
      estatusProceso: seedEstatus,
    });
    if (fromServer) {
      writeToStorage(expedienteId, fromServer);
      setState(fromServer);
    } else {
      setState(readFromStorage(expedienteId));
    }
    setHydrated(true);
  }, [expedienteId, seedCausal, seedJustificacion, seedEstatus]);

  useEffect(() => {
    let cancelled = false;
    // Diferir setState fuera del cuerpo síncrono del effect (react-hooks/set-state-in-effect).
    queueMicrotask(() => {
      if (!cancelled) reload();
    });

    const onCustom = (event: Event) => {
      const detail = (event as CustomEvent<{ expedienteId: string }>).detail;
      if (detail?.expedienteId === expedienteId) {
        setState(readFromStorage(expedienteId));
      }
    };

    window.addEventListener("declaratoria-desierto-changed", onCustom);
    return () => {
      cancelled = true;
      window.removeEventListener("declaratoria-desierto-changed", onCustom);
    };
  }, [expedienteId, reload]);

  const saveDeclaratoria = useCallback(
    (payload: {
      causal_declaratoria_desierto_au_au: CausalDeclaratoriaDesierto;
      justificacion_declaratoria_desierto_au_au: string;
    }) => {
      const next: DeclaratoriaDesiertoState = {
        declaratoria_desierto_au_au: true,
        causal_declaratoria_desierto_au_au: payload.causal_declaratoria_desierto_au_au,
        justificacion_declaratoria_desierto_au_au:
          payload.justificacion_declaratoria_desierto_au_au,
        informeGenerado: true,
      };
      writeToStorage(expedienteId, next);
      setState(next);
      return next;
    },
    [expedienteId]
  );

  return {
    state,
    hydrated,
    isDesierto: state.declaratoria_desierto_au_au === true,
    hasInformeDesierto: state.informeGenerado === true,
    saveDeclaratoria,
    reload,
  };
}

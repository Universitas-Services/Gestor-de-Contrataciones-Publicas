"use client";

import { useCallback, useEffect, useState } from "react";
import { consultarDiasNoLaborablesRango } from "@/services/cronogramaEnteService";
import {
  buildFeriadoDescriptionsFromRango,
  buildNonWorkingDaysFromRango,
} from "@/lib/utils/diasNoLaborablesUtils";

interface UseDiasNoLaborablesResult {
  nonWorkingDays: Set<string>;
  feriadoDescriptions: Map<string, string>;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useDiasNoLaborables(
  desde: string | null,
  hasta: string | null
): UseDiasNoLaborablesResult {
  const [nonWorkingDays, setNonWorkingDays] = useState<Set<string>>(new Set());
  const [feriadoDescriptions, setFeriadoDescriptions] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!desde || !hasta) {
      setNonWorkingDays(new Set());
      setFeriadoDescriptions(new Map());
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await consultarDiasNoLaborablesRango({ desde, hasta });
      setNonWorkingDays(buildNonWorkingDaysFromRango(response));
      setFeriadoDescriptions(buildFeriadoDescriptionsFromRango(response));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar días no laborables");
      setNonWorkingDays(new Set());
      setFeriadoDescriptions(new Map());
    } finally {
      setLoading(false);
    }
  }, [desde, hasta]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    nonWorkingDays,
    feriadoDescriptions,
    loading,
    error,
    refresh,
  };
}

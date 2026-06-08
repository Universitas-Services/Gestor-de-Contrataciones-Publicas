"use client";

import { useCallback, useEffect, useState } from "react";
import {
  obtenerAlertasCronograma,
  resolverAlertaCronograma,
} from "@/services/cronogramaEnteService";
import type { CronogramaAlerta } from "@/types/cronogramaEnte.types";

interface UseCronogramaAlertasReturn {
  alertas: CronogramaAlerta[];
  pendientes: CronogramaAlerta[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  resolver: (id: string) => Promise<void>;
}

export function useCronogramaAlertas(enabled: boolean = true): UseCronogramaAlertasReturn {
  const [alertas, setAlertas] = useState<CronogramaAlerta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!enabled) {
      setAlertas([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await obtenerAlertasCronograma();
      setAlertas(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar alertas");
      setAlertas([]);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  const resolver = useCallback(async (id: string) => {
    await resolverAlertaCronograma(id);
    setAlertas((prev) =>
      prev.map((alerta) => (alerta.id === id ? { ...alerta, resuelta: true } : alerta))
    );
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const pendientes = alertas.filter((alerta) => !alerta.resuelta);

  return {
    alertas,
    pendientes,
    isLoading,
    error,
    refetch,
    resolver,
  };
}

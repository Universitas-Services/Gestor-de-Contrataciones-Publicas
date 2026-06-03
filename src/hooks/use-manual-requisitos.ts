"use client";

import { useState, useEffect, useCallback } from "react";
import {
  consultarEstadoRequisitos,
  verificarExistenciaManual,
  consultarEstadoManualVigente,
  type EstadoRequisitosResponse,
  type EstadoManualVigente,
} from "@/services/manualService";

interface UseManualRequisitosReturn {
  estado: EstadoRequisitosResponse | null;
  manualExiste: boolean | null;
  manualVigente: EstadoManualVigente | null;
  isLoading: boolean;
  refetch: () => void;
}

/**
 * Hook que consulta el estado de requisitos para generar el manual,
 * verifica si ya existe un manual generado, y consulta si el manual
 * vigente está desactualizado.
 * Solo se ejecuta si `enabled` es true (para restringir por rol).
 */
export function useManualRequisitos(enabled: boolean = true): UseManualRequisitosReturn {
  const [estado, setEstado] = useState<EstadoRequisitosResponse | null>(null);
  const [manualExiste, setManualExiste] = useState<boolean | null>(null);
  const [manualVigente, setManualVigente] = useState<EstadoManualVigente | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [estadoRes, existeRes, vigenteRes] = await Promise.allSettled([
        consultarEstadoRequisitos(),
        verificarExistenciaManual(),
        consultarEstadoManualVigente(),
      ]);

      if (estadoRes.status === "fulfilled") {
        setEstado(estadoRes.value);
      }
      if (existeRes.status === "fulfilled") {
        setManualExiste(existeRes.value);
      }
      if (vigenteRes.status === "fulfilled") {
        setManualVigente(vigenteRes.value);
      }
    } catch {
      // Silenciar errores — no bloquear la UI por fallos en la consulta
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!enabled) return;

    const handleManualChange = () => {
      fetchData();
    };

    window.addEventListener("manual-modificado", handleManualChange);
    return () => {
      window.removeEventListener("manual-modificado", handleManualChange);
    };
  }, [enabled, fetchData]);

  return { estado, manualExiste, manualVigente, isLoading, refetch: fetchData };
}

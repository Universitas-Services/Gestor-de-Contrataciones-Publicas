"use server";

import { getServerToken } from "@/lib/auth/session";
import type { DashboardOperativoResponse } from "@/types/dashboard-operativo.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface EnteAsignado {
  id: string;
  nombre: string;
  rif: string;
  siglas: string;
  logoUrl?: string;
  estado?: string;
  municipio?: string;
  _count?: {
    expedientes: number;
    usuarios: number;
  };
  asignadoEn: string;
}

export const obtenerMisEntes = async (): Promise<EnteAsignado[]> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/supervisores/mis-entes`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.warn(`Error en API (${response.status}):`, errorData);

    // Retornar arreglo vacío si falla la petición
    return [];
  }

  return response.json() as Promise<EnteAsignado[]>;
};

export const obtenerMetricasEnte = async (enteId: string): Promise<DashboardOperativoResponse> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/supervisores/mis-entes/${enteId}/metrics`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.warn(`Error en API (${response.status}):`, errorData);

    // Retornar métricas vacías si falla la petición
    return {
      usuarios: { total: 0, ejecutores: 0, visualizadores: 0, administradores: 0 },
      expedientesEnProceso: { total: 0, bienes: 0, obras: 0, servicios: 0 },
      expedientesTerminados: { total: 0, bienes: 0, obras: 0, servicios: 0 },
      proveedores: { total: 0 },
      compliance: { total: 0 },
    };
  }

  return response.json() as Promise<DashboardOperativoResponse>;
};

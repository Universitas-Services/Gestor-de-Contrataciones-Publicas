"use server";

import { getServerToken } from "@/lib/auth/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface EnteAsignado {
  id: string;
  nombre: string;
  siglas: string;
  rif: string;
  asignadoEn: string;
}

export interface SupervisorResponse {
  id: string;
  nombre: string;
  email: string;
  activo: boolean;
  rol: string;
  entesAsignados: EnteAsignado[];
}

export const obtenerSupervisor = async (id: string): Promise<SupervisorResponse> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/supervisores/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.warn(`Error en API (${response.status}):`, errorData);

    // Retornar estructura por defecto vacía si falla la petición
    return {
      id: id,
      nombre: "Supervisor",
      email: "",
      activo: true,
      rol: "SUPERVISOR",
      entesAsignados: [],
    };
  }

  return response.json() as Promise<SupervisorResponse>;
};

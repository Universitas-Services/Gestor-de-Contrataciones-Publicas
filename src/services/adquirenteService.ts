"use server";

import { getServerToken } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface RegistrarAdquirentePayload {
  expedienteId: string;
  fechaAdquisicion: string;
  nombreProveedorAdquiriente: string;
  direccionFiscalProveedorAdquirente: string;
  telefonoProveedorAdquirente: string;
  correoProveedorAdquirente: string;
  datosPagoPliego: string;
}

/**
 * POST /adquiriente-pliego
 * Registra un nuevo adquirente para un expediente.
 */
export const registrarAdquirente = async (payload: RegistrarAdquirentePayload): Promise<any> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/adquiriente-pliego`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      ((errorData as Record<string, unknown>)?.message as string) ??
        "Error al registrar el adquirente"
    );
  }

  revalidatePath("/elaboracion-expediente");
  return response.json();
};

"use server";

import { getServerToken } from "@/lib/auth/session";

/**
 * Servicio para el módulo de Proveedores
 * "use server" → corre en el servidor, lee la cookie HttpOnly con el JWT
 * Los Client Components (formularios) lo llaman via RPC transparente de Next.js
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * POST /proveedores
 * Registra un nuevo proveedor con sus datos y documentos PDF adjuntos.
 * Los archivos se envían como multipart/form-data.
 * IMPORTANTE: No se debe setear Content-Type manualmente;
 * fetch genera automáticamente el boundary correcto para multipart/form-data.
 */
export const registrarProveedor = async (formData: FormData): Promise<{ message: string }> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/proveedores`, {
    method: "POST",
    headers: {
      // NO setear Content-Type aquí — fetch genera el boundary correcto para multipart/form-data
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    if (response.status === 401) {
      throw new Error("No autorizado. Por favor inicie sesión nuevamente.");
    }

    if (response.status === 409) {
      throw new Error(errorData?.message ?? "Ya existe un proveedor con ese RIF o correo.");
    }

    throw new Error(errorData?.message ?? "Error al registrar el proveedor");
  }

  return response.json();
};

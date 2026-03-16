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
/**
 * GET /proveedores
 * Obtiene el listado paginado de proveedores asociados al Ente.
 */
export const getProveedores = async (params: {
  page?: number;
  limit?: number;
  estatusValidacion?: string;
  rif?: string;
  nombre?: string;
}) => {
  const token = await getServerToken();
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.estatusValidacion && params.estatusValidacion !== "TODOS") {
    queryParams.append("estatusValidacion", params.estatusValidacion);
  }
  if (params.rif) queryParams.append("rif", params.rif);
  if (params.nombre) queryParams.append("nombre", params.nombre);

  const response = await fetch(`${API_URL}/proveedores?${queryParams.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.message ?? "Error al obtener el listado de proveedores");
  }

  return response.json();
};

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

/**
 * Cambia el estatus de validación de un proveedor.
 * PATCH /proveedores/{id}/estatus
 */
export async function cambiarEstatusProveedor(id: string, estatus: string) {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/proveedores/${id}/estatus`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ estatusValidacion: estatus }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Error API cambiardEstatusProveedor:", errorData);
    throw new Error(errorData?.message ?? "Error al cambiar el estatus del proveedor");
  }

  return response.json();
}

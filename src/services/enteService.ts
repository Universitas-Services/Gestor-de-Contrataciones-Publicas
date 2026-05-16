"use server";

import { getServerToken, getSessionCookie } from "@/lib/auth/session";
import type { EnteResponse, EnteUpdatePayload } from "@/types/ente.types";
import type { DashboardOperativoResponse } from "@/types/dashboard-operativo.types";
import type {
  CreateUserPayload,
  CreateUserResponse,
  User,
  UserListResponse,
} from "@/types/user-management.types";

/**
 * Servicio para el módulo de Entes
 * "use server" → corre en el servidor, lee la cookie HttpOnly con el JWT
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * GET /entes/{id}
 * Obtiene detalles de un Ente específico.
 */
export const obtenerEnte = async (id: string): Promise<EnteResponse> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/entes/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    if (response.status === 404) {
      throw new Error("Ente no encontrado");
    }

    throw new Error(errorData?.message ?? "Error al obtener datos del Ente");
  }

  return response.json() as Promise<EnteResponse>;
};

/**
 * PATCH /entes/{id}
 * Actualiza los datos de un Ente. ADMIN_ENTE solo puede actualizar su propio Ente.
 */
export const actualizarEnte = async (
  id: string,
  payload: EnteUpdatePayload
): Promise<{ message: string }> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/entes/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    if (response.status === 403) {
      throw new Error("No autorizado para actualizar este Ente");
    }

    throw new Error(errorData?.message ?? "Error al actualizar el Ente");
  }

  return { message: "Ente actualizado" };
};

/**
 * PUT /entes/{id}/logo
 * Sube y actualiza el logo de un Ente. Soporta PNG, JPG, WEBP (Max 2MB).
 * El archivo se envía como FormData con la clave "file".
 */
export const actualizarLogoEnte = async (
  id: string,
  formData: FormData
): Promise<{ message: string }> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/entes/${id}/logo`, {
    method: "PUT",
    headers: {
      // NO setear Content-Type manualmente; fetch genera el boundary correcto para multipart/form-data
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.message ?? "Error al actualizar el logo del Ente");
  }

  const text = await response.text();
  return { message: text || "Logo actualizado correctamente" };
};

/**
 * POST /entes/{id}/usuarios
 * Crea un nuevo usuario asociado a un Ente específico.
 */
export const crearUsuarioEnte = async (
  enteId: string,
  payload: CreateUserPayload
): Promise<CreateUserResponse> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/entes/${enteId}/usuarios`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    if (response.status === 403) {
      throw new Error("No autorizado para realizar esta acción");
    }

    if (response.status === 409) {
      throw new Error("El usuario ya existe con este correo electrónico");
    }

    throw new Error(errorData?.message ?? "Error al crear el usuario");
  }

  return response.json() as Promise<CreateUserResponse>;
};

/**
 * GET /entes/gestion/mis-usuarios
 * Obtiene el listado paginado de usuarios operativos de un Ente (ADMIN_ENTE).
 * No requiere ID del ente, se obtiene del token.
 */
export const listarUsuariosEnte = async (params: {
  page?: number;
  limit?: number;
  rol?: string;
  busqueda?: string;
}): Promise<UserListResponse> => {
  const token = await getServerToken();
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.rol) queryParams.append("rol", params.rol);
  if (params.busqueda) queryParams.append("busqueda", params.busqueda);

  const response = await fetch(`${API_URL}/entes/gestion/mis-usuarios?${queryParams.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.message ?? "Error al obtener el listado de usuarios");
  }

  return response.json() as Promise<UserListResponse>;
};

/**
 * GET /entes/gestion/mis-usuarios/{usuarioId}
 * Obtiene la información detallada de un usuario operativo específico.
 */
export const obtenerUsuarioOperativo = async (usuarioId: string): Promise<User> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/entes/gestion/mis-usuarios/${usuarioId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.message ?? "Error al obtener detalles del usuario");
  }

  return response.json() as Promise<User>;
};

/**
 * PATCH /entes/gestion/mis-usuarios/{usuarioId}
 * Actualiza los datos de un usuario operativo.
 */
export const actualizarUsuarioOperativo = async (
  usuarioId: string,
  payload: Partial<CreateUserPayload>
): Promise<User> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/entes/gestion/mis-usuarios/${usuarioId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.message ?? "Error al actualizar el usuario");
  }

  return response.json() as Promise<User>;
};

/**
 * GET /session -> EnteId
 * Obtiene el ID del Ente del usuario actualmente autenticado desde la sesión.
 */
export const obtenerMiEnteId = async (): Promise<string | null> => {
  const session = await getSessionCookie();
  return session?.enteId ?? null;
};

/**
 * PATCH /entes/{id}/usuarios/{usuarioId}
 * Actualiza la información de un usuario asociado a un Ente específico.
 * Endpoint solicitado: /entes/{id}/usuarios/{usuarioId}
 */
export const actualizarUsuarioEnte = async (
  enteId: string,
  usuarioId: string,
  payload: Partial<CreateUserPayload>
): Promise<User> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/entes/${enteId}/usuarios/${usuarioId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.message ?? "Error al actualizar el usuario del Ente");
  }

  return response.json() as Promise<User>;
};

/**
 * DELETE /entes/{id}/usuarios/{usuarioId}
 * Realiza un borrado lógico (desactivación) de un usuario perteneciente al Ente.
 * Endpoint solicitado: /entes/{id}/usuarios/{usuarioId}
 */
export const eliminarUsuarioEnte = async (
  enteId: string,
  usuarioId: string
): Promise<{ message: string }> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/entes/${enteId}/usuarios/${usuarioId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.message ?? "Error al eliminar el usuario");
  }

  return { message: "Usuario eliminado correctamente" };
};

/**
 * GET /entes/dashboard/operativo
 * Obtiene los datos del dashboard operativo del Ente autenticado.
 */
export const obtenerDashboardOperativo = async (): Promise<DashboardOperativoResponse> => {
  const token = await getServerToken();

  const response = await fetch(`${API_URL}/entes/dashboard/operativo`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.message ?? "Error al obtener el dashboard operativo");
  }

  return response.json() as Promise<DashboardOperativoResponse>;
};

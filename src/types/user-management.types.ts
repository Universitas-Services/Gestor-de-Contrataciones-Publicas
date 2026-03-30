import type { UserRole } from "./role.types";

/**
 * Representa un usuario individual en el listado
 */
export interface User {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: UserRole;
  activo: boolean;
  createdAt: string;
}

/**
 * Metadatos de paginación devueltos por el backend
 */
export type PaginationMetadata = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

/**
 * Respuesta paginada del listado de usuarios
 */
export interface UserListResponse {
  metadata: PaginationMetadata;
  data: User[];
}

/**
 * Payload para la creación de un nuevo usuario asociado a un Ente
 */
export interface CreateUserPayload {
  nombre: string;
  apellido: string;
  email: string;
  password?: string;
  rol: "EJECUTOR" | "VISUALIZADOR" | string;
}

/**
 * Respuesta del servidor tras crear un usuario
 */
export type CreateUserResponse = User;

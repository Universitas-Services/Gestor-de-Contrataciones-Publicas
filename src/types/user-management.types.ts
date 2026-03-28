import type { UserRole } from "./role.types";

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
export interface CreateUserResponse {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: UserRole;
  createdAt: string;
}

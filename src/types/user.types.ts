import type { UserRole } from "./role.types";

/**
 * Interfaz de usuario del sistema
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt?: Date;
  lastLogin?: Date;
}

/**
 * Datos de usuario sin información sensible
 * Se usa para pasar al cliente
 */
export interface UserPublic {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

/**
 * Credenciales de login
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Usuario completo con password (solo para mock data)
 */
export interface UserWithPassword extends User {
  password: string;
}

/**
 * Helper para convertir User a UserPublic
 */
export function toPublicUser(user: User): UserPublic {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
  };
}

import type { UserRole } from "./role.types";

/**
 * Payload del JWT que se almacena en la cookie
 */
export interface SessionPayload {
  userId: string;
  role: UserRole;
  name: string;
  email: string;
  iat?: number; // issued at
  exp?: number; // expiration
  [key: string]: unknown; // Index signature for JWT compatibility
}

/**
 * Resultado de la autenticación
 */
export interface AuthResult {
  success: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
  };
  error?: string;
}

/**
 * Opciones de configuración de sesión
 */
export interface SessionConfig {
  maxAge: number; // en segundos
  cookieName: string;
  secure: boolean;
  httpOnly: boolean;
  sameSite: "lax" | "strict" | "none";
}

/**
 * Constantes de sesión
 */
export const SESSION_CONSTANTS = {
  COOKIE_NAME: "session",
  MAX_AGE: 60 * 60 * 4, // 4 horas
  SECRET_KEY: process.env.JWT_SECRET || "demo-secret-key-change-in-production",
} as const;

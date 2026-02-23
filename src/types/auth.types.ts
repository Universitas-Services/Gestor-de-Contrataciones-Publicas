import type { UserRole } from "./role.types";

/**
 * Payload del JWT que se almacena en la cookie
 */
export interface SessionPayload {
  userId: string;
  role: UserRole;
  name: string;
  email: string;
  enteId: string | null;
  cambioPasswordDefault?: boolean;
  datosConfirmados?: boolean;
  iat?: number;
  exp?: number;
  [key: string]: unknown; // Index signature for JWT compatibility
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
} as const;

/**
 * Respuesta del backend al hacer login
 */
export interface LoginResponseEnte {
  id: string;
  nombre: string;
  datosConfirmados: boolean;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    rol: string;
    cambioPasswordDefault: boolean;
    ente: LoginResponseEnte | null;
  };
}

/**
 * Estructura del token decodificado (JWT)
 */
export interface DecodedToken {
  userId: string;
  role: string;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

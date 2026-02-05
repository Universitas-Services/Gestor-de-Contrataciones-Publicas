import { axiosPublic } from "@/lib/axios";
import { isAxiosError } from "axios";

/**
 * Servicio de autenticación con el backend
 * Usa axiosPublic para endpoints públicos (no requieren token)
 */

// --- Tipos ---

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    rol: string;
    ente: string | null;
  };
}

// --- Endpoints de Autenticación ---

/**
 * Login: Autenticar usuario con el backend
 * Endpoint público - no requiere token
 */
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await axiosPublic.post<LoginResponse>("/auth/login", {
      email,
      password,
    });

    return response.data;
  } catch (error: unknown) {
    // Manejo mejorado de errores con isAxiosError
    if (isAxiosError(error) && error.response?.data?.message) {
      throw new Error(error.response.data.message || "Credenciales inválidas o usuario inactivo");
    }

    if (isAxiosError(error) && error.code === "ECONNABORTED") {
      throw new Error("Tiempo de espera agotado al conectar con el servidor");
    }

    if (isAxiosError(error)) {
      throw new Error(error.message || "Error de conexión con el servidor");
    }

    throw new Error("No se pudo conectar con el servidor");
  }
};

/**
 * Aquí puedes agregar más endpoints como:
 * - logout()
 * - refreshToken()
 * - forgotPassword()
 * - resetPassword()
 * - registerUser()
 * etc.
 */

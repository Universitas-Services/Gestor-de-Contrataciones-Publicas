import axios from "axios";
import { getToken, removeToken } from "./authStorage";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Cliente Axios PÚBLICO - Para endpoints sin autenticación
 * (login, register, forgot-password, etc.)
 */
export const axiosPublic = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

/**
 * Cliente Axios PRIVADO - Para endpoints que requieren autenticación
 * Este cliente agrega automáticamente el token en las peticiones
 */
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

/**
 * Interceptor de Request: Agregar token automáticamente a todas las peticiones
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor de Response: Manejar errores de autenticación (401)
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si recibimos un 401, el token es inválido o expiró
    if (error.response?.status === 401) {
      removeToken();
      // Redirigir a login solo si no estamos ya en la página de login
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

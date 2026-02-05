import { create } from "zustand";
import type { UserRole } from "@/types/role.types";

/**
 * Estado de autenticación
 */
interface AuthState {
  user: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    rol: UserRole;
    ente: string | null;
  } | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

/**
 * Acciones del store
 */
interface AuthActions {
  setUser: (user: AuthState["user"]) => void;
  setToken: (token: string) => void;
  setAuth: (user: AuthState["user"], token: string) => void;
  clearAuth: () => void;
  setLoading: (isLoading: boolean) => void;
}

/**
 * Store de autenticación usando Zustand
 */
export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  // Estado inicial
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,

  // Acciones
  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  setToken: (token) =>
    set({
      token,
    }),

  setAuth: (user, token) =>
    set({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    }),

  clearAuth: () =>
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    }),

  setLoading: (isLoading) =>
    set({
      isLoading,
    }),
}));

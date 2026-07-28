"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface NavigationGuardConfig {
  enabled: boolean;
  title?: string;
  message?: string;
}

interface NavigationGuardContextValue {
  guard: NavigationGuardConfig | null;
  setGuard: (guard: NavigationGuardConfig | null) => void;
  requestNavigation: (href: string, navigate: () => void) => boolean;
  pendingHref: string | null;
  confirmPendingNavigation: () => void;
  cancelPendingNavigation: () => void;
  isConfirmOpen: boolean;
  confirmTitle: string;
  confirmMessage: string;
}

const DEFAULT_TITLE = "¿Salir del formulario?";
const DEFAULT_MESSAGE =
  "Si sale ahora se perderá la información cargada hasta este momento. ¿Está seguro de que desea continuar?";

const NavigationGuardContext = createContext<NavigationGuardContextValue | null>(null);

export function NavigationGuardProvider({ children }: { children: ReactNode }) {
  const [guard, setGuardState] = useState<NavigationGuardConfig | null>(null);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [pendingNavigate, setPendingNavigate] = useState<(() => void) | null>(null);

  const setGuard = useCallback((next: NavigationGuardConfig | null) => {
    setGuardState(next);
    if (!next?.enabled) {
      setPendingHref(null);
      setPendingNavigate(null);
    }
  }, []);

  const requestNavigation = useCallback(
    (href: string, navigate: () => void) => {
      if (!guard?.enabled) {
        navigate();
        return false;
      }
      setPendingHref(href);
      setPendingNavigate(() => navigate);
      return true;
    },
    [guard?.enabled]
  );

  const confirmPendingNavigation = useCallback(() => {
    const navigate = pendingNavigate;
    setPendingHref(null);
    setPendingNavigate(null);
    setGuardState(null);
    navigate?.();
  }, [pendingNavigate]);

  const cancelPendingNavigation = useCallback(() => {
    setPendingHref(null);
    setPendingNavigate(null);
  }, []);

  const value = useMemo<NavigationGuardContextValue>(
    () => ({
      guard,
      setGuard,
      requestNavigation,
      pendingHref,
      confirmPendingNavigation,
      cancelPendingNavigation,
      isConfirmOpen: pendingHref !== null,
      confirmTitle: guard?.title ?? DEFAULT_TITLE,
      confirmMessage: guard?.message ?? DEFAULT_MESSAGE,
    }),
    [
      cancelPendingNavigation,
      confirmPendingNavigation,
      guard,
      pendingHref,
      requestNavigation,
      setGuard,
    ]
  );

  return (
    <NavigationGuardContext.Provider value={value}>{children}</NavigationGuardContext.Provider>
  );
}

export function useNavigationGuard() {
  return useContext(NavigationGuardContext);
}

/** Registra un guard mientras el componente esté montado. */
export function useRegisterNavigationGuard(
  enabled: boolean,
  options?: { title?: string; message?: string }
) {
  const ctx = useNavigationGuard();
  const setGuard = ctx?.setGuard;
  const title = options?.title;
  const message = options?.message;

  useEffect(() => {
    if (!setGuard) return;

    if (!enabled) {
      setGuard(null);
      return;
    }

    setGuard({
      enabled: true,
      title,
      message,
    });

    return () => {
      setGuard(null);
    };
  }, [setGuard, enabled, title, message]);
}

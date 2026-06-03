"use client";

import { useEffect } from "react";
import { logoutAction } from "@/app/actions";

/**
 * En pantallas de onboarding, el botón "atrás" del navegador
 * debe cerrar sesión y volver al login.
 */
export function OnboardingBackGuard() {
  useEffect(() => {
    window.history.pushState({ onboardingGuard: true }, "", window.location.href);

    const handlePopState = () => {
      void logoutAction();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return null;
}

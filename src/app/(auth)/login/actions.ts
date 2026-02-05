"use server";

import { login } from "@/lib/auth/auth";
import { getDashboardRoute } from "@/lib/constants/routes";
import type { LoginCredentials } from "@/types/user.types";

interface LoginActionResult {
  success: boolean;
  error?: string;
  redirectUrl?: string;
}

export async function loginAction(credentials: LoginCredentials): Promise<LoginActionResult> {
  const result = await login(credentials);

  if (result.success && result.user) {
    return {
      success: true,
      redirectUrl: getDashboardRoute(result.user.role),
    };
  }

  return {
    success: false,
    error: result.error || "Error al iniciar sesión",
  };
}

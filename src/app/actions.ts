"use server";

import { deleteSessionCookie } from "@/lib/auth/session";
import { redirect } from "next/navigation";

/**
 * Server Action para cerrar sesión
 * Esta función se ejecuta en el servidor y puede ser llamada desde Client Components
 */
export async function logoutAction() {
  // Eliminar cookie de sesión
  await deleteSessionCookie();

  // Redirigir a login
  redirect("/login");
}

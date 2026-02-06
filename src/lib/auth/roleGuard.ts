import { getDashboardRoute } from "@/lib/constants/routes";
import { redirect } from "next/navigation";
import type { SessionPayload } from "@/types/auth.types";
import type { UserRole } from "@/types/role.types";

/**
 * Enforce role-based access in layouts
 * Implements defense-in-depth strategy:
 * - Primary: Middleware (proxy.ts) validates on every request
 * - Secondary: This function validates in Server Components
 *
 * @param user - Current user session or null
 * @param allowedRole - The specific role allowed for this layout
 */
export function enforceRoleAccess(user: SessionPayload | null, allowedRole: UserRole): void {
  // First barrier: No authentication
  if (!user) {
    redirect("/login");
  }

  // Second barrier: Wrong role
  if (user.role !== allowedRole) {
    // Log in development to help debugging
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `[Layout Guard] User with role "${user.role}" attempted to access "${allowedRole}" layout. Redirecting to correct dashboard.`
      );
    }

    // Redirect to user's correct dashboard
    const correctDashboard = getDashboardRoute(user.role);
    redirect(correctDashboard);
  }

  // Access granted - user has correct role
}

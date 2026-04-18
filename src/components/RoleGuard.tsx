import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { ReactNode } from "react";

interface RoleGuardProps {
  roles: Array<"admin" | "manager" | "cashier">;
  children: ReactNode;
  /** Where to send unauthorized users. Defaults to /sales (cashier-safe). */
  redirectTo?: string;
}

/**
 * Client-side route guard. Backend always re-checks role on each API call —
 * this just hides UI from users who shouldn't see it.
 */
export function RoleGuard({ roles, children, redirectTo }: RoleGuardProps) {
  const { user, hasRole } = useAuth();
  if (!user) return null;
  if (!hasRole(...roles)) {
    const fallback = redirectTo || (user.role === "cashier" ? "/sales" : "/dashboard");
    return <Navigate to={fallback} replace />;
  }
  return <>{children}</>;
}

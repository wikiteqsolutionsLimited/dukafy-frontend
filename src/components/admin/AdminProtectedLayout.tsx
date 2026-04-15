import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export function AdminProtectedLayout() {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/dukafy-admin/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

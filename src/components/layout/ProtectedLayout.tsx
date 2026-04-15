import { Navigate, useLocation } from "react-router-dom";
import { DashboardLayout } from "./DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useShop } from "@/hooks/useShop";
import { useQuery } from "@tanstack/react-query";
import { subscriptionsApi } from "@/lib/api";

export function ProtectedLayout() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isSetupComplete, isLoading: shopLoading } = useShop();
  const location = useLocation();

  const { data: subData, isLoading: subLoading } = useQuery({
    queryKey: ["subscription-status"],
    queryFn: async () => {
      const res = await subscriptionsApi.getMy();
      return res.data;
    },
    enabled: isAuthenticated,
    refetchInterval: 60000,
  });

  if (authLoading || shopLoading || subLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Force shop setup before anything else (except billing and settings)
  const isSetupPage = location.pathname === "/shop-setup";
  const isBillingPage = location.pathname === "/billing";
  const isSettingsPage = location.pathname === "/settings";
  const isProfilePage = location.pathname === "/profile";
  const isSupportPage = location.pathname === "/support";

  if (!isSetupComplete && !isSetupPage && !isBillingPage && !isSettingsPage && !isProfilePage) {
    return <Navigate to="/shop-setup" replace />;
  }

  // Redirect expired users to billing (but allow accessing billing, settings, profile)
  const isExpired = subData && !subData.is_active;
  if (isExpired && !isBillingPage && !isSettingsPage && !isProfilePage) {
    return <Navigate to="/billing" replace />;
  }

  return <DashboardLayout subscriptionData={subData} />;
}

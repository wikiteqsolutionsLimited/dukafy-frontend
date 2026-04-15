import { Outlet } from "react-router-dom";
import { TopNavbar } from "./TopNavbar";
import { NetworkStatus } from "./NetworkStatus";
import { SetupBanner } from "./SetupBanner";
import { TrialBanner } from "./TrialBanner";

interface DashboardLayoutProps {
  subscriptionData?: any;
}

export function DashboardLayout({ subscriptionData }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <NetworkStatus />
      {subscriptionData && <TrialBanner subscription={subscriptionData} />}
      <SetupBanner />
      <TopNavbar />
      <main className="flex-1 p-3 sm:p-4 lg:p-6">
        <Outlet />
      </main>
    </div>
  );
}

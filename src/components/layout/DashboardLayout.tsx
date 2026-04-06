import { Outlet } from "react-router-dom";
import { TopNavbar } from "./TopNavbar";
import { NetworkStatus } from "./NetworkStatus";
import { SetupBanner } from "./SetupBanner";

export function DashboardLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <NetworkStatus />
      <SetupBanner />
      <TopNavbar />
      <main className="flex-1 p-4 lg:p-6">
        <Outlet />
      </main>
    </div>
  );
}

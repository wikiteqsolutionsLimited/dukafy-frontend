import { useQuery } from "@tanstack/react-query";
import { ShoppingCart, DollarSign, AlertTriangle, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { PageHeader } from "@/components/shared/PageHeader";
import { dashboardApi } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";

const DashboardPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: () => dashboardApi.getSummary(),
    refetchInterval: 60_000,
  });

  const summary = data?.data;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Dashboard" description="Welcome back — here's today's overview" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Sales Today"
          value={isLoading ? "..." : `${summary?.today?.transaction_count || 0}`}
          change={`${formatCurrency(summary?.today?.total_sales || 0)} revenue`}
          changeType="positive"
          icon={ShoppingCart}
        />
        <StatCard
          title="Month Revenue"
          value={isLoading ? "..." : formatCurrency(summary?.month_revenue || 0)}
          change="Current month"
          changeType="positive"
          icon={DollarSign}
        />
        <StatCard
          title="Low Stock Items"
          value={isLoading ? "..." : `${summary?.low_stock_count || 0}`}
          change="Items need restock"
          changeType={summary?.low_stock_count > 0 ? "negative" : "neutral"}
          icon={AlertTriangle}
        />
        <StatCard
          title="Top Product"
          value={isLoading ? "..." : (summary?.today?.top_product || "N/A")}
          change="Best seller today"
          changeType="neutral"
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3"><SalesChart /></div>
        <div className="lg:col-span-2"><RecentTransactions /></div>
      </div>
    </div>
  );
};

export default DashboardPage;

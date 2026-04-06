import { useQuery } from "@tanstack/react-query";
import { salesApi } from "@/lib/api";
import { formatCurrencyShort } from "@/lib/currency";
import { CardSection } from "@/components/shared/CardSection";
import { Loader2 } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

export function SalesChart() {
  const { data, isLoading } = useQuery({
    queryKey: ["sales-chart"],
    queryFn: async () => {
      const res = await salesApi.getReports({});
      return (res.data?.monthly || []).map((m: any) => ({
        month: m.month,
        sales: parseFloat(m.revenue),
      }));
    },
    refetchInterval: 60000,
  });

  const chartData = data || [];

  return (
    <CardSection title="Sales Overview" description="Monthly revenue performance">
      <div className="h-[280px] w-full">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No sales data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(168, 60%, 40%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(168, 60%, 40%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(215, 12%, 50%)" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(215, 12%, 50%)" }} tickFormatter={(v) => formatCurrencyShort(v)} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(0, 0%, 100%)", border: "1px solid hsl(214, 20%, 90%)", borderRadius: "8px", fontSize: "13px" }} formatter={(value: number) => [formatCurrencyShort(value), "Revenue"]} />
              <Area type="monotone" dataKey="sales" stroke="hsl(168, 60%, 40%)" strokeWidth={2} fill="url(#salesGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </CardSection>
  );
}

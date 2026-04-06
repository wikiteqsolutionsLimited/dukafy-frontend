import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon, ShoppingCart, DollarSign, TrendingUp, Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, formatCurrencyShort } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { DataTable, Column } from "@/components/shared/DataTable";
import { Badge, SecondaryButton } from "@/components/shared/ActionButtons";
import { CardSection } from "@/components/shared/CardSection";
import { salesApi } from "@/lib/api";

const PIE_COLORS = ["hsl(168, 60%, 40%)", "hsl(200, 60%, 50%)", "hsl(35, 80%, 55%)", "hsl(280, 50%, 55%)", "hsl(340, 55%, 55%)"];

const ReportsPage = () => {
  const [from, setFrom] = useState<Date | undefined>(new Date(new Date().getFullYear(), 0, 1));
  const [to, setTo] = useState<Date | undefined>(new Date());

  const { data, isLoading } = useQuery({
    queryKey: ["reports", from?.toISOString(), to?.toISOString()],
    queryFn: async () => {
      const params: any = {};
      if (from) params.from = format(from, "yyyy-MM-dd");
      if (to) params.to = format(to, "yyyy-MM-dd'T'23:59:59");
      const res = await salesApi.getReports(params);
      return res.data;
    },
  });

  const stats = data?.stats || { total_sales: 0, total_revenue: 0, total_profit: 0 };
  const monthly = (data?.monthly || []).map((m: any) => ({
    month: m.month,
    revenue: parseFloat(m.revenue),
    cost: parseFloat(m.cost),
  }));
  const categories = (data?.categories || []).map((c: any) => ({
    name: c.name,
    value: parseInt(c.value),
  }));
  const recent = data?.recent || [];

  const txColumns: Column<any>[] = [
    { key: "id", header: "ID", render: (tx) => <span className="font-mono text-xs text-muted-foreground">TXN-{String(tx.id).padStart(4, "0")}</span> },
    { key: "created_at", header: "Date", render: (tx) => <span className="text-muted-foreground">{format(new Date(tx.created_at), "MMM d, yyyy")}</span> },
    { key: "customer_name", header: "Customer", render: (tx) => <span className="font-medium text-card-foreground">{tx.customer_name || "Walk-in"}</span> },
    { key: "item_count", header: "Items", render: (tx) => <span className="text-muted-foreground">{tx.item_count}</span> },
    { key: "total", header: "Total", render: (tx) => <span className="font-semibold text-card-foreground">{formatCurrency(tx.total)}</span> },
    { key: "payment_method", header: "Payment", render: (tx) => <Badge>{tx.payment_method}</Badge> },
  ];

  if (isLoading) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-3 text-sm text-muted-foreground">Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Reports" description="Sales analytics and performance">
        <SecondaryButton icon={Download}>Export</SecondaryButton>
      </PageHeader>

      <div className="flex flex-wrap items-center gap-3">
        <DatePicker label="From" date={from} onChange={setFrom} />
        <span className="text-sm text-muted-foreground">to</span>
        <DatePicker label="To" date={to} onChange={setTo} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={ShoppingCart} title="Total Sales" value={parseInt(stats.total_sales).toLocaleString()} change="All time" changeType="positive" />
        <StatCard icon={DollarSign} title="Total Revenue" value={formatCurrency(stats.total_revenue)} change="All filtered" changeType="positive" />
        <StatCard icon={TrendingUp} title="Profit" value={formatCurrency(stats.total_profit)} change="Revenue - Tax" changeType="positive" />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <CardSection title="Revenue vs Cost" description="Monthly breakdown" className="lg:col-span-3">
          <div className="h-[260px]">
            {monthly.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(215, 12%, 50%)" }} />
                   <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(215, 12%, 50%)" }} tickFormatter={(v) => formatCurrencyShort(v)} />
                   <Tooltip contentStyle={{ backgroundColor: "hsl(0,0%,100%)", border: "1px solid hsl(214,20%,90%)", borderRadius: 8, fontSize: 13 }} formatter={(v: number) => [formatCurrency(v), ""]} />
                  <Bar dataKey="revenue" fill="hsl(168, 60%, 40%)" radius={[4, 4, 0, 0]} name="Revenue" />
                  <Bar dataKey="cost" fill="hsl(168, 40%, 75%)" radius={[4, 4, 0, 0]} name="Tax" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No data for selected period</div>
            )}
          </div>
        </CardSection>

        <CardSection title="Sales by Category" description="Product category distribution" className="lg:col-span-2">
          <div className="h-[200px]">
            {categories.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categories} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {categories.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "hsl(0,0%,100%)", border: "1px solid hsl(214,20%,90%)", borderRadius: 8, fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No category data</div>
            )}
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
            {categories.map((c: any, i: number) => (
              <div key={c.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                {c.name}
              </div>
            ))}
          </div>
        </CardSection>
      </div>

      <DataTable columns={txColumns} data={recent} keyExtractor={(tx) => tx.id} title="Recent Transactions" description="Latest sales activity" />
    </div>
  );
};

export default ReportsPage;

function DatePicker({ label, date, onChange }: { label: string; date?: Date; onChange: (d?: Date) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("h-9 w-[170px] justify-start text-left text-sm font-normal", !date && "text-muted-foreground")}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "MMM d, yyyy") : label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={date} onSelect={onChange} initialFocus className={cn("p-3 pointer-events-auto")} />
      </PopoverContent>
    </Popover>
  );
}

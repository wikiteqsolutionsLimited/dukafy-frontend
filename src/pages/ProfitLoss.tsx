import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import { CalendarIcon, DollarSign, TrendingUp, TrendingDown, Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, formatCurrencyShort } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { DataTable, Column } from "@/components/shared/DataTable";
import { SecondaryButton } from "@/components/shared/ActionButtons";
import { CardSection } from "@/components/shared/CardSection";
import { salesApi, expensesApi } from "@/lib/api";

const ProfitLossPage = () => {
  const [from, setFrom] = useState<Date | undefined>(subDays(new Date(), 30));
  const [to, setTo] = useState<Date | undefined>(new Date());

  const { data: reportData, isLoading: salesLoading } = useQuery({
    queryKey: ["pl-sales-report", from?.toISOString(), to?.toISOString()],
    queryFn: async () => {
      const params: any = { limit: 200 };
      if (from) params.from = format(from, "yyyy-MM-dd");
      if (to) params.to = format(to, "yyyy-MM-dd'T'23:59:59");
      const res = await salesApi.getReports(params);
      return res.data || {};
    },
  });

  const { data: expensesData, isLoading: expLoading } = useQuery({
    queryKey: ["pl-expenses", from?.toISOString(), to?.toISOString()],
    queryFn: async () => {
      const params: any = { limit: 200 };
      if (from) params.from = format(from, "yyyy-MM-dd");
      if (to) params.to = format(to, "yyyy-MM-dd'T'23:59:59");
      const res = await expensesApi.getAll(params);
      return res.data || [];
    },
  });

  const isLoading = salesLoading || expLoading;

  // Aggregate by date
  const dailyData = useMemo(() => {
    const salesArr = reportData?.daily_profit || [];
    const expArr = expensesData || [];
    const map = new Map<string, { sales: number; expenses: number }>();

    salesArr.forEach((s: any) => {
      const d = format(new Date(s.date), "yyyy-MM-dd");
      const entry = map.get(d) || { sales: 0, expenses: 0 };
      entry.sales += parseFloat(s.gross_profit || 0);
      map.set(d, entry);
    });

    expArr.forEach((e: any) => {
      const d = e.date || format(new Date(e.created_at), "yyyy-MM-dd");
      const entry = map.get(d) || { sales: 0, expenses: 0 };
      entry.expenses += parseFloat(e.amount);
      map.set(d, entry);
    });

    return Array.from(map.entries())
      .map(([date, vals]) => ({
        date,
        dateLabel: format(new Date(date), "MMM d"),
        sales: Math.round(vals.sales),
        expenses: Math.round(vals.expenses),
        profit: Math.round(vals.sales - vals.expenses),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [reportData, expensesData]);

  const totalRevenue = parseFloat(reportData?.stats?.total_revenue || 0);
  const totalExpenses = dailyData.reduce((s, r) => s + r.expenses, 0);
  const grossProfit = parseFloat(reportData?.stats?.gross_profit || 0);
  const netProfit = grossProfit - totalExpenses;
  const margin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : "0";
  const productProfit = reportData?.product_profit || [];

  const columns: Column<typeof dailyData[0]>[] = [
    { key: "date", header: "Date", render: (row) => <span className="font-medium text-card-foreground">{row.dateLabel}</span> },
     { key: "sales", header: "Gross Profit", render: (row) => <span className="font-semibold text-card-foreground">{formatCurrency(row.sales)}</span> },
    { key: "expenses", header: "Expenses", render: (row) => <span className="text-destructive font-medium">{formatCurrency(row.expenses)}</span> },
    {
      key: "profit", header: "Profit",
      render: (row) => (
        <span className={cn("font-semibold", row.profit >= 0 ? "text-success" : "text-destructive")}>
          {row.profit >= 0 ? "+" : ""}{formatCurrency(Math.abs(row.profit))}
        </span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-3 text-sm text-muted-foreground">Loading financial data...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
       <PageHeader title="Profit & Loss" description="True margin performance from sold products and expenses">
        <SecondaryButton icon={Download}>Export</SecondaryButton>
      </PageHeader>

      <div className="flex flex-wrap items-center gap-3">
        <DatePicker label="From" date={from} onChange={setFrom} />
        <span className="text-sm text-muted-foreground">to</span>
        <DatePicker label="To" date={to} onChange={setTo} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
         <StatCard icon={DollarSign} title="Total Revenue" value={formatCurrency(totalRevenue)} change={`${dailyData.length} days`} changeType="positive" />
        <StatCard icon={TrendingDown} title="Total Expenses" value={formatCurrency(totalExpenses)} change={totalRevenue > 0 ? `${((totalExpenses / totalRevenue) * 100).toFixed(1)}% of revenue` : "—"} changeType="negative" />
         <StatCard icon={TrendingUp} title="Net Profit" value={formatCurrency(netProfit)} change={`Gross ${formatCurrency(grossProfit)} • Margin ${margin}%`} changeType={netProfit >= 0 ? "positive" : "negative"} />
      </div>

      <CardSection title="Profit Trend" description="Daily profit over selected period">
        <div className="h-[280px]">
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(168, 55%, 38%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(168, 55%, 38%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(200, 60%, 50%)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="hsl(200, 60%, 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 90%)" vertical={false} />
                <XAxis dataKey="dateLabel" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(220, 10%, 46%)" }} interval={Math.max(0, Math.floor(dailyData.length / 8))} />
                 <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(220, 10%, 46%)" }} tickFormatter={(v) => formatCurrencyShort(v)} />
                 <Tooltip contentStyle={{ backgroundColor: "hsl(0, 0%, 100%)", border: "1px solid hsl(220, 16%, 90%)", borderRadius: 8, fontSize: 13 }} formatter={(v: number, name: string) => [formatCurrency(v), name === "profit" ? "Profit" : name === "sales" ? "Sales" : "Expenses"]} />
                <Area type="monotone" dataKey="sales" stroke="hsl(200, 60%, 50%)" fill="url(#salesGrad)" strokeWidth={2} name="sales" />
                <Area type="monotone" dataKey="profit" stroke="hsl(168, 55%, 38%)" fill="url(#profitGrad)" strokeWidth={2} name="profit" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No data for selected period</div>
          )}
        </div>
        <div className="mt-3 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "hsl(200, 60%, 50%)" }} /> Sales
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "hsl(168, 55%, 38%)" }} /> Profit
          </div>
        </div>
      </CardSection>

       <DataTable columns={columns} data={dailyData} keyExtractor={(row) => row.date} title="Daily Breakdown" description="Gross profit from sold items, expenses, and net profit per day" />

       <DataTable
         columns={[
           { key: "product_name", header: "Product", render: (row: any) => <span className="font-medium text-card-foreground">{row.product_name}</span> },
           { key: "qty_sold", header: "Qty Sold", render: (row: any) => <span className="text-card-foreground">{row.qty_sold}</span> },
           { key: "revenue", header: "Revenue", render: (row: any) => <span className="text-card-foreground">{formatCurrency(Number(row.revenue || 0))}</span> },
           { key: "profit", header: "Profit", render: (row: any) => <span className={cn("font-semibold", Number(row.profit || 0) >= 0 ? "text-success" : "text-destructive")}>{formatCurrency(Number(row.profit || 0))}</span> },
         ]}
         data={productProfit}
         keyExtractor={(row: any) => row.product_id}
         title="Most Profitable Products"
         description="Products that generated the most profit in the selected period"
       />
    </div>
  );
};

export default ProfitLossPage;

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

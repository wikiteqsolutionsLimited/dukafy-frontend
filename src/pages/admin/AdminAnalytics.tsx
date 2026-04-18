import { useEffect, useState } from "react";
import { adminAnalyticsApi } from "@/lib/adminApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { TrendingUp, Users, Store, CreditCard, DollarSign, Loader2 } from "lucide-react";

const PIE_COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444"];

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState<"7d" | "30d" | "90d" | "1y">("30d");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminAnalyticsApi.get(range)
      .then((r) => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [range]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const revenue = (data?.revenue || []).map((r: any) => ({
    date: new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    revenue: Number(r.revenue),
    transactions: Number(r.transactions),
  }));
  const userGrowth = (data?.user_growth || []).map((r: any) => ({
    date: new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    users: Number(r.new_users),
  }));
  const shopGrowth = (data?.shop_growth || []).map((r: any) => ({
    date: new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    shops: Number(r.new_shops),
  }));
  const planDist = (data?.plan_distribution || []).map((p: any) => ({
    name: `${p.plan} (${p.status})`,
    value: Number(p.count),
  }));
  const mrr = data?.mrr || [];
  const totalMrr = mrr.reduce((s: number, p: any) => s + Number(p.revenue || 0), 0);
  const conv = data?.conversion || { trialing: 0, converted: 0, expired: 0 };
  const totalConv = Number(conv.trialing) + Number(conv.converted) + Number(conv.expired);
  const conversionRate = totalConv > 0 ? ((Number(conv.converted) / totalConv) * 100).toFixed(1) : "0";
  const totalRevenue = revenue.reduce((s: number, r: any) => s + r.revenue, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">System Analytics</h1>
          <p className="text-sm text-slate-400 mt-1">Revenue, user growth and subscription metrics</p>
        </div>
        <div className="flex gap-1 rounded-lg bg-slate-900 border border-slate-800 p-1">
          {(["7d", "30d", "90d", "1y"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                range === r ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs text-slate-400">Period Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">KES {totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1">last {data?.range_days} days</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs text-slate-400">MRR</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">KES {totalMrr.toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1">monthly recurring</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs text-slate-400">Conversion</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{conversionRate}%</div>
            <p className="text-xs text-slate-500 mt-1">{conv.converted} of {totalConv} subs</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs text-slate-400">Trialing</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{conv.trialing}</div>
            <p className="text-xs text-slate-500 mt-1">{conv.expired} expired</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader><CardTitle className="text-white">Revenue Trend</CardTitle></CardHeader>
        <CardContent>
          {revenue.length === 0 ? (
            <p className="text-sm text-slate-500 py-12 text-center">No revenue in this period</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenue}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#rev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><Users className="h-4 w-4" /> New Users</CardTitle></CardHeader>
          <CardContent>
            {userGrowth.length === 0 ? (
              <p className="text-sm text-slate-500 py-12 text-center">No new users</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={userGrowth}>
                  <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><Store className="h-4 w-4" /> New Shops</CardTitle></CardHeader>
          <CardContent>
            {shopGrowth.length === 0 ? (
              <p className="text-sm text-slate-500 py-12 text-center">No new shops</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={shopGrowth}>
                  <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }} />
                  <Bar dataKey="shops" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader><CardTitle className="text-white">Subscription Distribution</CardTitle></CardHeader>
          <CardContent>
            {planDist.length === 0 ? (
              <p className="text-sm text-slate-500 py-12 text-center">No subscriptions</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={planDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={(e: any) => e.name}>
                    {planDist.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader><CardTitle className="text-white">Top Shops by Revenue</CardTitle></CardHeader>
          <CardContent>
            {(data?.top_shops || []).length === 0 ? (
              <p className="text-sm text-slate-500 py-12 text-center">No revenue data</p>
            ) : (
              <div className="space-y-2">
                {data.top_shops.slice(0, 8).map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between rounded-lg bg-slate-800/50 px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{s.name}</p>
                      <p className="text-[11px] text-slate-500">{s.owner_name} · {s.sale_count} sales</p>
                    </div>
                    <span className="text-sm font-bold text-emerald-400 shrink-0">KES {Number(s.revenue || 0).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

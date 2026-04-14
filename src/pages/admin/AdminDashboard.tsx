import { useEffect, useState } from "react";
import { adminApi } from "@/lib/adminApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, Users, CreditCard, HeadphonesIcon, TrendingUp, AlertTriangle } from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.dashboard().then(r => setStats(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" /></div>;

  const cards = [
    { label: "Total Shops", value: stats?.shops?.total || 0, sub: `${stats?.shops?.active || 0} active`, icon: Store, color: "text-blue-400" },
    { label: "Total Users", value: stats?.users?.total || 0, sub: `${stats?.users?.active || 0} active`, icon: Users, color: "text-emerald-400" },
    { label: "Active Subs", value: stats?.subscriptions?.active || 0, sub: `${stats?.subscriptions?.trialing || 0} trialing`, icon: CreditCard, color: "text-purple-400" },
    { label: "Expired Subs", value: stats?.subscriptions?.expired || 0, sub: "Need attention", icon: AlertTriangle, color: "text-yellow-400" },
    { label: "Open Tickets", value: stats?.support?.open_count || 0, sub: `${stats?.support?.in_progress_count || 0} in progress`, icon: HeadphonesIcon, color: "text-orange-400" },
    { label: "30d Revenue", value: `KES ${(stats?.revenue_30d || 0).toLocaleString()}`, sub: "Last 30 days", icon: TrendingUp, color: "text-emerald-400" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map(c => (
          <Card key={c.label} className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">{c.label}</CardTitle>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{c.value}</div>
              <p className="text-xs text-slate-500 mt-1">{c.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {stats?.recent_shops?.length > 0 && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader><CardTitle className="text-white">Recent Shops</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recent_shops.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-white">{s.name}</p>
                    <p className="text-xs text-slate-400">{s.owner_name} · {s.owner_email}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${s.is_setup_complete ? "bg-emerald-600/20 text-emerald-400" : "bg-yellow-600/20 text-yellow-400"}`}>
                    {s.is_setup_complete ? "Active" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/adminApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [editSub, setEditSub] = useState<any>(null);
  const { toast } = useToast();

  const fetchSubs = () => {
    setLoading(true);
    adminApi.getSubscriptions({ page, limit: 20, status: statusFilter || undefined })
      .then(r => { setSubs(r.data); setTotal(r.pagination?.total || 0); })
      .catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchSubs(); }, [page, statusFilter]);

  const handleUpdate = async () => {
    if (!editSub) return;
    try {
      const data: any = { plan: editSub.plan, status: editSub.status };
      if (editSub.plan !== "trial") {
        const limits: any = { basic: { max_shops: 1, max_products: 200, max_users: 2 }, starter: { max_shops: 3, max_products: 1000, max_users: 5 }, pro: { max_shops: 5, max_products: -1, max_users: 15 }, enterprise: { max_shops: -1, max_products: -1, max_users: -1 } };
        Object.assign(data, limits[editSub.plan] || {});
      }
      if (editSub.status === "active" && editSub.extend_days) {
        const end = new Date(editSub.current_period_end || new Date());
        end.setDate(end.getDate() + parseInt(editSub.extend_days));
        data.current_period_end = end.toISOString();
        data.current_period_start = data.current_period_start || new Date().toISOString();
      }
      await adminApi.updateSubscription(editSub.id, data);
      toast({ title: "Subscription updated" });
      setEditSub(null);
      fetchSubs();
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "active": return "bg-emerald-600/20 text-emerald-400";
      case "trialing": return "bg-blue-600/20 text-blue-400";
      case "expired": return "bg-red-600/20 text-red-400";
      case "canceled": return "bg-slate-600/20 text-slate-400";
      default: return "bg-yellow-600/20 text-yellow-400";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Subscriptions</h1>
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v === "all" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-40 bg-slate-900 border-slate-700 text-white"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="trialing">Trialing</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="canceled">Canceled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left p-3 text-slate-400 font-medium">User</th>
                  <th className="text-left p-3 text-slate-400 font-medium">Shop</th>
                  <th className="text-left p-3 text-slate-400 font-medium">Plan</th>
                  <th className="text-left p-3 text-slate-400 font-medium">Status</th>
                  <th className="text-left p-3 text-slate-400 font-medium">Ends</th>
                  <th className="text-left p-3 text-slate-400 font-medium">Limits</th>
                  <th className="text-right p-3 text-slate-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="p-8 text-center text-slate-400">Loading...</td></tr>
                ) : subs.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-slate-400">No subscriptions found</td></tr>
                ) : subs.map(sub => (
                  <tr key={sub.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className="p-3"><p className="text-white">{sub.user_name}</p><p className="text-xs text-slate-500">{sub.user_email}</p></td>
                    <td className="p-3 text-slate-300">{sub.shop_name || "-"}</td>
                    <td className="p-3"><Badge variant="outline" className="border-slate-700 text-slate-300 capitalize">{sub.plan}</Badge></td>
                    <td className="p-3"><Badge className={statusColor(sub.status)}>{sub.status}</Badge></td>
                    <td className="p-3 text-slate-400 text-xs">
                      {sub.status === "trialing" ? (sub.trial_ends_at ? new Date(sub.trial_ends_at).toLocaleDateString() : "-")
                        : (sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : "-")}
                    </td>
                    <td className="p-3 text-xs text-slate-400">
                      {sub.max_shops === -1 ? "∞" : sub.max_shops} shops · {sub.max_products === -1 ? "∞" : sub.max_products} products · {sub.max_users === -1 ? "∞" : sub.max_users} users
                    </td>
                    <td className="p-3 text-right">
                      <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white" onClick={() => setEditSub({ ...sub, extend_days: "" })}>
                        Manage
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between p-3 border-t border-slate-800">
            <Button size="sm" variant="ghost" className="text-slate-400" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-4 w-4 mr-1" /> Prev</Button>
            <span className="text-xs text-slate-500">Page {page} · {total} total</span>
            <Button size="sm" variant="ghost" className="text-slate-400" disabled={subs.length < 20} onClick={() => setPage(p => p + 1)}>Next <ChevronRight className="h-4 w-4 ml-1" /></Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editSub} onOpenChange={() => setEditSub(null)}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <DialogHeader><DialogTitle>Manage Subscription</DialogTitle></DialogHeader>
          {editSub && (
            <div className="space-y-3">
              <p className="text-sm text-slate-400">{editSub.user_name} · {editSub.user_email}</p>
              <div>
                <Label className="text-slate-300">Plan</Label>
                <Select value={editSub.plan} onValueChange={v => setEditSub({ ...editSub, plan: v })}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300">Status</Label>
                <Select value={editSub.status} onValueChange={v => setEditSub({ ...editSub, status: v })}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trialing">Trialing</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                    <SelectItem value="past_due">Past Due</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300">Extend by (days)</Label>
                <Input type="number" value={editSub.extend_days} onChange={e => setEditSub({ ...editSub, extend_days: e.target.value })}
                  placeholder="e.g. 30" className="bg-slate-800 border-slate-700 text-white" />
              </div>
              <Button onClick={handleUpdate} className="w-full bg-emerald-600 hover:bg-emerald-700">Update Subscription</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

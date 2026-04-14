import { useEffect, useState } from "react";
import { adminApi } from "@/lib/adminApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Ban, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminShopsPage() {
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [detail, setDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [editShop, setEditShop] = useState<any>(null);
  const { toast } = useToast();

  const fetchShops = () => {
    setLoading(true);
    adminApi.getShops({ page, limit: 15, search: search || undefined })
      .then(r => { setShops(r.data); setTotal(r.pagination?.total || 0); })
      .catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchShops(); }, [page]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchShops(); };

  const viewDetail = async (id: number) => {
    setDetailLoading(true);
    try {
      const r = await adminApi.getShop(id);
      setDetail(r.data);
    } catch { toast({ title: "Error", variant: "destructive" }); }
    setDetailLoading(false);
  };

  const toggleShop = async (id: number, enable: boolean) => {
    try {
      if (enable) await adminApi.enableShop(id); else await adminApi.disableShop(id);
      toast({ title: enable ? "Shop enabled" : "Shop disabled" });
      fetchShops();
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
  };

  const handleUpdateShop = async () => {
    if (!editShop) return;
    try {
      await adminApi.updateShop(editShop.id, { name: editShop.name, phone: editShop.phone, email: editShop.email, address: editShop.address });
      toast({ title: "Shop updated" });
      setEditShop(null);
      fetchShops();
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Shops Management</h1>
        <span className="text-sm text-slate-400">{total} total shops</span>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search shops..."
            className="pl-9 bg-slate-900 border-slate-700 text-white" />
        </div>
        <Button type="submit" variant="secondary">Search</Button>
      </form>

      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left p-3 text-slate-400 font-medium">Shop</th>
                  <th className="text-left p-3 text-slate-400 font-medium">Owner</th>
                  <th className="text-left p-3 text-slate-400 font-medium">Plan</th>
                  <th className="text-left p-3 text-slate-400 font-medium">Status</th>
                  <th className="text-left p-3 text-slate-400 font-medium">Members</th>
                  <th className="text-left p-3 text-slate-400 font-medium">Products</th>
                  <th className="text-right p-3 text-slate-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="p-8 text-center text-slate-400">Loading...</td></tr>
                ) : shops.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-slate-400">No shops found</td></tr>
                ) : shops.map(shop => (
                  <tr key={shop.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className="p-3">
                      <p className="font-medium text-white">{shop.name}</p>
                      <p className="text-xs text-slate-500">ID: {shop.id}</p>
                    </td>
                    <td className="p-3">
                      <p className="text-slate-300">{shop.owner_name}</p>
                      <p className="text-xs text-slate-500">{shop.owner_email}</p>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className="border-slate-700 text-slate-300 capitalize">{shop.plan || "trial"}</Badge>
                    </td>
                    <td className="p-3">
                      <Badge className={shop.sub_status === "active" ? "bg-emerald-600/20 text-emerald-400" : shop.sub_status === "trialing" ? "bg-blue-600/20 text-blue-400" : "bg-red-600/20 text-red-400"}>
                        {shop.sub_status || "none"}
                      </Badge>
                    </td>
                    <td className="p-3 text-slate-300">{shop.member_count}</td>
                    <td className="p-3 text-slate-300">{shop.product_count}</td>
                    <td className="p-3 text-right space-x-1">
                      <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white" onClick={() => viewDetail(shop.id)}><Eye className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white" onClick={() => setEditShop(shop)}>Edit</Button>
                      <Button size="sm" variant="ghost" className="text-slate-400 hover:text-red-400"
                        onClick={() => toggleShop(shop.id, false)}><Ban className="h-4 w-4" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between p-3 border-t border-slate-800">
            <Button size="sm" variant="ghost" className="text-slate-400" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <span className="text-xs text-slate-500">Page {page}</span>
            <Button size="sm" variant="ghost" className="text-slate-400" disabled={shops.length < 15} onClick={() => setPage(p => p + 1)}>
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Shop Details</DialogTitle></DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-slate-400">Name:</span> <span className="text-white ml-2">{detail.name}</span></div>
                <div><span className="text-slate-400">Owner:</span> <span className="text-white ml-2">{detail.owner_name}</span></div>
                <div><span className="text-slate-400">Email:</span> <span className="text-white ml-2">{detail.owner_email}</span></div>
                <div><span className="text-slate-400">Phone:</span> <span className="text-white ml-2">{detail.owner_phone || "-"}</span></div>
                <div><span className="text-slate-400">Currency:</span> <span className="text-white ml-2">{detail.currency}</span></div>
                <div><span className="text-slate-400">Tax Rate:</span> <span className="text-white ml-2">{detail.tax_rate}%</span></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Card className="bg-slate-800 border-slate-700"><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-white">{detail.stats?.products}</p><p className="text-xs text-slate-400">Products</p></CardContent></Card>
                <Card className="bg-slate-800 border-slate-700"><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-white">{detail.stats?.sales}</p><p className="text-xs text-slate-400">Sales</p></CardContent></Card>
                <Card className="bg-slate-800 border-slate-700"><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-white">KES {detail.stats?.revenue?.toLocaleString()}</p><p className="text-xs text-slate-400">Revenue</p></CardContent></Card>
              </div>
              {detail.subscription && (
                <div className="p-3 rounded-lg bg-slate-800 text-sm">
                  <p className="font-medium text-white mb-2">Subscription</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="text-slate-400">Plan:</span> <span className="text-white ml-1 capitalize">{detail.subscription.plan}</span></div>
                    <div><span className="text-slate-400">Status:</span> <span className="text-white ml-1 capitalize">{detail.subscription.status}</span></div>
                    <div><span className="text-slate-400">Ends:</span> <span className="text-white ml-1">{detail.subscription.current_period_end ? new Date(detail.subscription.current_period_end).toLocaleDateString() : "-"}</span></div>
                  </div>
                </div>
              )}
              {detail.members?.length > 0 && (
                <div>
                  <p className="font-medium text-white mb-2">Members ({detail.members.length})</p>
                  <div className="space-y-2">
                    {detail.members.map((m: any) => (
                      <div key={m.id} className="flex items-center justify-between p-2 rounded bg-slate-800">
                        <div><p className="text-sm text-white">{m.name}</p><p className="text-xs text-slate-400">{m.email}</p></div>
                        <Badge variant="outline" className="border-slate-600 text-slate-300 capitalize">{m.role}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editShop} onOpenChange={() => setEditShop(null)}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <DialogHeader><DialogTitle>Edit Shop</DialogTitle></DialogHeader>
          {editShop && (
            <div className="space-y-3">
              <div><Label className="text-slate-300">Name</Label><Input value={editShop.name || ""} onChange={e => setEditShop({ ...editShop, name: e.target.value })} className="bg-slate-800 border-slate-700 text-white" /></div>
              <div><Label className="text-slate-300">Phone</Label><Input value={editShop.phone || ""} onChange={e => setEditShop({ ...editShop, phone: e.target.value })} className="bg-slate-800 border-slate-700 text-white" /></div>
              <div><Label className="text-slate-300">Email</Label><Input value={editShop.email || ""} onChange={e => setEditShop({ ...editShop, email: e.target.value })} className="bg-slate-800 border-slate-700 text-white" /></div>
              <div><Label className="text-slate-300">Address</Label><Input value={editShop.address || ""} onChange={e => setEditShop({ ...editShop, address: e.target.value })} className="bg-slate-800 border-slate-700 text-white" /></div>
              <Button onClick={handleUpdateShop} className="w-full bg-emerald-600 hover:bg-emerald-700">Save Changes</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

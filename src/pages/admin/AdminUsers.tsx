import { useEffect, useState } from "react";
import { adminApi } from "@/lib/adminApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Search, Ban, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [editUser, setEditUser] = useState<any>(null);
  const { toast } = useToast();

  const fetchUsers = () => {
    setLoading(true);
    adminApi.getUsers({ page, limit: 20, search: search || undefined })
      .then(r => { setUsers(r.data); setTotal(r.pagination?.total || 0); })
      .catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [page]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchUsers(); };

  const handleDisable = async (id: number) => {
    try {
      await adminApi.disableUser(id);
      toast({ title: "User disabled" });
      fetchUsers();
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
  };

  const handleUpdate = async () => {
    if (!editUser) return;
    try {
      await adminApi.updateUser(editUser.id, { name: editUser.name, email: editUser.email, role: editUser.role, is_active: editUser.is_active });
      toast({ title: "User updated" });
      setEditUser(null);
      fetchUsers();
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Users Management</h1>
        <span className="text-sm text-slate-400">{total} total users</span>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
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
                  <th className="text-left p-3 text-slate-400 font-medium">Name</th>
                  <th className="text-left p-3 text-slate-400 font-medium">Email</th>
                  <th className="text-left p-3 text-slate-400 font-medium">Role</th>
                  <th className="text-left p-3 text-slate-400 font-medium">Shops</th>
                  <th className="text-left p-3 text-slate-400 font-medium">Status</th>
                  <th className="text-left p-3 text-slate-400 font-medium">Last Login</th>
                  <th className="text-right p-3 text-slate-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="p-8 text-center text-slate-400">Loading...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-slate-400">No users found</td></tr>
                ) : users.map(u => (
                  <tr key={u.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className="p-3 text-white font-medium">{u.name}</td>
                    <td className="p-3 text-slate-300">{u.email}</td>
                    <td className="p-3"><Badge variant="outline" className="border-slate-700 text-slate-300 capitalize">{u.role}</Badge></td>
                    <td className="p-3 text-slate-400 text-xs max-w-[200px] truncate">{u.shops || "-"}</td>
                    <td className="p-3">
                      <Badge className={u.is_active ? "bg-emerald-600/20 text-emerald-400" : "bg-red-600/20 text-red-400"}>
                        {u.is_active ? "Active" : "Disabled"}
                      </Badge>
                    </td>
                    <td className="p-3 text-slate-400 text-xs">{u.last_login ? new Date(u.last_login).toLocaleString() : "Never"}</td>
                    <td className="p-3 text-right space-x-1">
                      <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white" onClick={() => setEditUser(u)}>Edit</Button>
                      {u.is_active && <Button size="sm" variant="ghost" className="text-slate-400 hover:text-red-400" onClick={() => handleDisable(u.id)}><Ban className="h-4 w-4" /></Button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between p-3 border-t border-slate-800">
            <Button size="sm" variant="ghost" className="text-slate-400" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-4 w-4 mr-1" /> Prev</Button>
            <span className="text-xs text-slate-500">Page {page}</span>
            <Button size="sm" variant="ghost" className="text-slate-400" disabled={users.length < 20} onClick={() => setPage(p => p + 1)}>Next <ChevronRight className="h-4 w-4 ml-1" /></Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <DialogHeader><DialogTitle>Edit User</DialogTitle></DialogHeader>
          {editUser && (
            <div className="space-y-3">
              <div><Label className="text-slate-300">Name</Label><Input value={editUser.name || ""} onChange={e => setEditUser({ ...editUser, name: e.target.value })} className="bg-slate-800 border-slate-700 text-white" /></div>
              <div><Label className="text-slate-300">Email</Label><Input value={editUser.email || ""} onChange={e => setEditUser({ ...editUser, email: e.target.value })} className="bg-slate-800 border-slate-700 text-white" /></div>
              <div>
                <Label className="text-slate-300">Role</Label>
                <Select value={editUser.role} onValueChange={v => setEditUser({ ...editUser, role: v })}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="admin">Admin</SelectItem><SelectItem value="manager">Manager</SelectItem><SelectItem value="cashier">Cashier</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-slate-300">Active</Label>
                <input type="checkbox" checked={editUser.is_active} onChange={e => setEditUser({ ...editUser, is_active: e.target.checked })} />
              </div>
              <Button onClick={handleUpdate} className="w-full bg-emerald-600 hover:bg-emerald-700">Save Changes</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

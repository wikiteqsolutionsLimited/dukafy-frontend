import { useEffect, useState } from "react";
import { adminApi } from "@/lib/adminApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editStaff, setEditStaff] = useState<any>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", role: "support" });
  const { toast } = useToast();

  const fetchStaff = () => {
    setLoading(true);
    adminApi.getStaff().then(r => setStaff(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) { toast({ title: "Fill all required fields", variant: "destructive" }); return; }
    try {
      await adminApi.createStaff(form);
      toast({ title: "Staff created" });
      setShowCreate(false);
      setForm({ name: "", email: "", password: "", phone: "", role: "support" });
      fetchStaff();
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
  };

  const handleUpdate = async () => {
    if (!editStaff) return;
    try {
      await adminApi.updateStaff(editStaff.id, { name: editStaff.name, email: editStaff.email, phone: editStaff.phone, role: editStaff.role, is_active: editStaff.is_active });
      toast({ title: "Staff updated" });
      setEditStaff(null);
      fetchStaff();
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this staff member?")) return;
    try {
      await adminApi.deleteStaff(id);
      toast({ title: "Staff deleted" });
      fetchStaff();
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
  };

  const roleColor = (r: string) => {
    switch (r) { case "superadmin": return "bg-red-600/20 text-red-400"; case "admin": return "bg-purple-600/20 text-purple-400"; case "billing": return "bg-blue-600/20 text-blue-400"; default: return "bg-slate-600/20 text-slate-400"; }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">DukaFy Staff</h1>
        <Button onClick={() => setShowCreate(true)} className="bg-emerald-600 hover:bg-emerald-700"><Plus className="h-4 w-4 mr-1" /> Add Staff</Button>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left p-3 text-slate-400 font-medium">Name</th>
                  <th className="text-left p-3 text-slate-400 font-medium">Email</th>
                  <th className="text-left p-3 text-slate-400 font-medium">Role</th>
                  <th className="text-left p-3 text-slate-400 font-medium">Status</th>
                  <th className="text-left p-3 text-slate-400 font-medium">Last Login</th>
                  <th className="text-right p-3 text-slate-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-400">Loading...</td></tr>
                ) : staff.map(s => (
                  <tr key={s.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className="p-3 text-white font-medium">{s.name}</td>
                    <td className="p-3 text-slate-300">{s.email}</td>
                    <td className="p-3"><Badge className={roleColor(s.role)}>{s.role}</Badge></td>
                    <td className="p-3"><Badge className={s.is_active ? "bg-emerald-600/20 text-emerald-400" : "bg-red-600/20 text-red-400"}>{s.is_active ? "Active" : "Disabled"}</Badge></td>
                    <td className="p-3 text-xs text-slate-400">{s.last_login ? new Date(s.last_login).toLocaleString() : "Never"}</td>
                    <td className="p-3 text-right space-x-1">
                      <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white" onClick={() => setEditStaff(s)}>Edit</Button>
                      <Button size="sm" variant="ghost" className="text-slate-400 hover:text-red-400" onClick={() => handleDelete(s.id)}><Trash2 className="h-4 w-4" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <DialogHeader><DialogTitle>Add Staff Member</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-slate-300">Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-slate-800 border-slate-700 text-white" /></div>
            <div><Label className="text-slate-300">Email *</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} type="email" className="bg-slate-800 border-slate-700 text-white" /></div>
            <div><Label className="text-slate-300">Password *</Label><Input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} type="password" className="bg-slate-800 border-slate-700 text-white" /></div>
            <div><Label className="text-slate-300">Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="bg-slate-800 border-slate-700 text-white" /></div>
            <div>
              <Label className="text-slate-300">Role</Label>
              <Select value={form.role} onValueChange={v => setForm({ ...form, role: v })}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="superadmin">Super Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreate} className="w-full bg-emerald-600 hover:bg-emerald-700">Create Staff</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editStaff} onOpenChange={() => setEditStaff(null)}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <DialogHeader><DialogTitle>Edit Staff</DialogTitle></DialogHeader>
          {editStaff && (
            <div className="space-y-3">
              <div><Label className="text-slate-300">Name</Label><Input value={editStaff.name || ""} onChange={e => setEditStaff({ ...editStaff, name: e.target.value })} className="bg-slate-800 border-slate-700 text-white" /></div>
              <div><Label className="text-slate-300">Email</Label><Input value={editStaff.email || ""} onChange={e => setEditStaff({ ...editStaff, email: e.target.value })} className="bg-slate-800 border-slate-700 text-white" /></div>
              <div><Label className="text-slate-300">Phone</Label><Input value={editStaff.phone || ""} onChange={e => setEditStaff({ ...editStaff, phone: e.target.value })} className="bg-slate-800 border-slate-700 text-white" /></div>
              <div>
                <Label className="text-slate-300">Role</Label>
                <Select value={editStaff.role} onValueChange={v => setEditStaff({ ...editStaff, role: v })}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="superadmin">Super Admin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-slate-300">Active</Label>
                <input type="checkbox" checked={editStaff.is_active} onChange={e => setEditStaff({ ...editStaff, is_active: e.target.checked })} />
              </div>
              <Button onClick={handleUpdate} className="w-full bg-emerald-600 hover:bg-emerald-700">Save Changes</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

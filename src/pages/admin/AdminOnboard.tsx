import { useState } from "react";
import { adminApi } from "@/lib/adminApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle } from "lucide-react";

export default function AdminOnboardPage() {
  const [form, setForm] = useState({ owner_name: "", owner_email: "", owner_password: "", owner_phone: "", shop_name: "", plan: "trial" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.owner_name || !form.owner_email || !form.owner_password || !form.shop_name) {
      toast({ title: "Fill all required fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await adminApi.onboardShop(form);
      setSuccess(true);
      toast({ title: "Shop onboarded successfully!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-12 text-center space-y-4">
        <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Shop Onboarded!</h2>
        <p className="text-slate-400">The shop owner has been sent a welcome email with login instructions.</p>
        <Button onClick={() => { setSuccess(false); setForm({ owner_name: "", owner_email: "", owner_password: "", owner_phone: "", shop_name: "", plan: "trial" }); }}
          className="bg-emerald-600 hover:bg-emerald-700">Onboard Another</Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-white">Onboard New Shop</h1>
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-slate-300">Owner Name *</Label><Input value={form.owner_name} onChange={e => setForm({ ...form, owner_name: e.target.value })} className="bg-slate-800 border-slate-700 text-white" /></div>
              <div><Label className="text-slate-300">Owner Phone</Label><Input value={form.owner_phone} onChange={e => setForm({ ...form, owner_phone: e.target.value })} className="bg-slate-800 border-slate-700 text-white" /></div>
            </div>
            <div><Label className="text-slate-300">Owner Email *</Label><Input value={form.owner_email} onChange={e => setForm({ ...form, owner_email: e.target.value })} type="email" className="bg-slate-800 border-slate-700 text-white" /></div>
            <div><Label className="text-slate-300">Temporary Password *</Label><Input value={form.owner_password} onChange={e => setForm({ ...form, owner_password: e.target.value })} type="password" className="bg-slate-800 border-slate-700 text-white" /></div>
            <div><Label className="text-slate-300">Shop Name *</Label><Input value={form.shop_name} onChange={e => setForm({ ...form, shop_name: e.target.value })} className="bg-slate-800 border-slate-700 text-white" /></div>
            <div>
              <Label className="text-slate-300">Subscription Plan</Label>
              <Select value={form.plan} onValueChange={v => setForm({ ...form, plan: v })}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="trial">Trial (30 days)</SelectItem>
                  <SelectItem value="basic">Basic - KES 500/mo</SelectItem>
                  <SelectItem value="starter">Starter - KES 1,000/mo</SelectItem>
                  <SelectItem value="pro">Pro - KES 2,000/mo</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700">
              {loading ? "Creating..." : "Onboard Shop"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

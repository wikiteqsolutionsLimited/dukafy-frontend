import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dukafy-admin");
    } catch (err: any) {
      toast({ title: "Login Failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-full max-w-sm mx-auto p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center font-bold text-white text-2xl mx-auto mb-4">D</div>
          <h1 className="text-2xl font-bold text-white">DukaFy Admin</h1>
          <p className="text-slate-400 text-sm mt-1">System Administration Portal</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-slate-300">Email</Label>
            <Input value={email} onChange={e => setEmail(e.target.value)} type="email" required
              className="bg-slate-900 border-slate-700 text-white" placeholder="admin@dukafy.com" />
          </div>
          <div>
            <Label className="text-slate-300">Password</Label>
            <Input value={password} onChange={e => setPassword(e.target.value)} type="password" required
              className="bg-slate-900 border-slate-700 text-white" />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700">
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}

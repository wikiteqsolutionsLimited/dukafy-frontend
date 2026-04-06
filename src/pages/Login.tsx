import { useState } from "react";
import { Store, Eye, EyeOff, BarChart3, Package, TrendingUp, ShieldCheck } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useShop } from "@/hooks/useShop";
import { shopsApi } from "@/lib/api";

const features = [
  { icon: BarChart3, text: "Real-time sales analytics" },
  { icon: Package, text: "Smart inventory management" },
  { icon: TrendingUp, text: "Profit & loss tracking" },
  { icon: ShieldCheck, text: "Multi-store support" },
];

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { refresh } = useShop();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      await refresh();
      toast.success("Welcome back!");
      const shopsRes = await shopsApi.getMyShops();
      const shops = shopsRes.data || [];
      if (shops.length === 0) {
        navigate("/shop-setup");
        return;
      }
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen animate-fade-in">
      {/* ── Left: Branding ── */}
      <div className="relative hidden lg:flex lg:w-[55%] flex-col justify-between overflow-hidden px-12 py-10">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/85 via-primary/75 to-primary/65" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }} />

        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <Store className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">DukaFlo</span>
        </div>

        <div className="relative -mt-8">
          <h1 className="text-4xl font-bold leading-tight text-white xl:text-5xl">
            Manage Your Shop
            <br />
            <span className="text-white/80">Smarter</span>
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-white/70">
            Track sales, manage inventory, and grow your business with ease — all from one powerful dashboard.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {features.map((f) => (
              <div key={f.text} className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                <f.icon className="h-5 w-5 shrink-0 text-white/80" />
                <span className="text-sm font-medium text-white/90">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-white/40">
          © 2026 DukaFlo. All rights reserved.
        </p>
      </div>

      {/* ── Right: Login form ── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-10">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 flex flex-col items-center gap-3 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg">
              <Store className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">DukaFlo</span>
          </div>

          <div className="rounded-2xl border bg-card p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-card-foreground">Welcome back</h2>
              <p className="mt-1 text-sm text-muted-foreground">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@shop.com" autoComplete="email"
                  className="h-11 w-full rounded-lg border bg-background px-3.5 text-sm text-foreground shadow-sm placeholder:text-muted-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary/30 focus:shadow-md" />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Password</label>
                  <Link to="/forgot-password" className="text-xs font-medium text-primary transition-colors hover:text-primary/80">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" autoComplete="current-password"
                    className="h-11 w-full rounded-lg border bg-background px-3.5 pr-10 text-sm text-foreground shadow-sm placeholder:text-muted-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary/30 focus:shadow-md" />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors duration-200 hover:text-foreground">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="flex h-11 w-full items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md active:scale-[0.98] disabled:opacity-60">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                    Signing in…
                  </span>
                ) : "Sign In"}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-primary transition-colors hover:text-primary/80">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

import { useState } from "react";
import { Store, Eye, EyeOff, BarChart3, Package, TrendingUp, ShieldCheck, ArrowRight, Phone } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { authApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

const features = [
  { icon: BarChart3, text: "Real-time sales analytics" },
  { icon: Package, text: "Smart inventory management" },
  { icon: TrendingUp, text: "Profit & loss tracking" },
  { icon: ShieldCheck, text: "Multi-store support" },
];

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!/^(07|01|\+254)\d{8,9}$/.test(phone.replace(/\s/g, ""))) {
      toast.error("Enter a valid Kenyan phone number");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.register({ name, email, password, phone, role: "admin" });
      if (res.success && res.data?.token) {
        localStorage.setItem("shop_token", res.data.token);
        localStorage.setItem("shop_user", JSON.stringify(res.data.user));
        localStorage.setItem("shop_authenticated", "true");
        toast.success("Account created! Let's set up your shop 🎉");
        window.location.href = "/shop-setup";
      } else {
        toast.error(res.message || "Registration failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Registration failed. Please try again.");
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
            Start Your
            <br />
            <span className="text-white/80">Business Journey</span>
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-white/70">
            Create your account and set up your shop in minutes. No credit card required — start with a 30-day free trial.
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

      {/* ── Right: Register form ── */}
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
              <h2 className="text-xl font-bold text-card-foreground">Create your account</h2>
              <p className="mt-1 text-sm text-muted-foreground">Start your 30-day free trial today</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Full Name *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe" autoComplete="name"
                  className="h-11 w-full rounded-lg border bg-background px-3.5 text-sm text-foreground shadow-sm placeholder:text-muted-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary/30 focus:shadow-md" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Email *</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" autoComplete="email"
                  className="h-11 w-full rounded-lg border bg-background px-3.5 text-sm text-foreground shadow-sm placeholder:text-muted-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary/30 focus:shadow-md" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="07XXXXXXXX" autoComplete="tel"
                    className="h-11 w-full rounded-lg border bg-background pl-10 pr-3.5 text-sm text-foreground shadow-sm placeholder:text-muted-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary/30 focus:shadow-md" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Password *</label>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters" autoComplete="new-password"
                    className="h-11 w-full rounded-lg border bg-background px-3.5 pr-10 text-sm text-foreground shadow-sm placeholder:text-muted-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary/30 focus:shadow-md" />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors duration-200 hover:text-foreground">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Confirm Password *</label>
                <input type={showPw ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password" autoComplete="new-password"
                  className="h-11 w-full rounded-lg border bg-background px-3.5 text-sm text-foreground shadow-sm placeholder:text-muted-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary/30 focus:shadow-md" />
              </div>

              <button type="submit" disabled={loading}
                className="flex h-11 w-full items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md active:scale-[0.98] disabled:opacity-60">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                    Creating account…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Create Account <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </button>
            </form>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              By signing up, you agree to our{" "}
              <Link to="/terms" className="text-primary hover:underline">Terms</Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
            </p>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary transition-colors hover:text-primary/80">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

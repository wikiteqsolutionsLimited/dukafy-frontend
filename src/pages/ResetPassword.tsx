import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Store, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/lib/api";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tokenFromUrl = searchParams.get("token") || "";

  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) { toast.error("Reset token is required"); return; }
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (password !== confirm) { toast.error("Passwords do not match"); return; }

    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
      toast.success("Password reset successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 animate-fade-in">
      <div className="w-full max-w-[420px]">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg">
            <Store className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">DukaFy</span>
        </div>

        <div className="rounded-2xl border bg-card p-8 shadow-sm">
          {!done ? (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-card-foreground">Reset Password</h2>
                <p className="mt-1 text-sm text-muted-foreground">Enter your new password below</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {!tokenFromUrl && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Reset Token</label>
                    <input type="text" value={token} onChange={(e) => setToken(e.target.value)}
                      placeholder="Paste your reset token"
                      className="h-11 w-full rounded-lg border bg-background px-3.5 text-sm text-foreground shadow-sm placeholder:text-muted-foreground transition-all focus:outline-none focus:ring-2 focus:ring-ring/30" />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••" autoComplete="new-password"
                      className="h-11 w-full rounded-lg border bg-background pl-10 pr-10 text-sm text-foreground shadow-sm placeholder:text-muted-foreground transition-all focus:outline-none focus:ring-2 focus:ring-ring/30" />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Confirm Password</label>
                  <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••" autoComplete="new-password"
                    className="h-11 w-full rounded-lg border bg-background px-3.5 text-sm text-foreground shadow-sm placeholder:text-muted-foreground transition-all focus:outline-none focus:ring-2 focus:ring-ring/30" />
                </div>

                <button type="submit" disabled={loading}
                  className="flex h-11 w-full items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:opacity-60">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                      Resetting...
                    </span>
                  ) : "Reset Password"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
              <h2 className="text-xl font-bold text-card-foreground">Password Reset!</h2>
              <p className="text-sm text-muted-foreground">Your password has been updated. You can now sign in with your new password.</p>
              <button onClick={() => navigate("/login")}
                className="h-11 w-full rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90">
                Go to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

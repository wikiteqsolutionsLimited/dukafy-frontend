import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Store } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/lib/api";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetToken, setResetToken] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { toast.error("Please enter your email"); return; }
    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email);
      setSent(true);
      if (res.data?.resetToken) {
        setResetToken(res.data.resetToken);
      }
      toast.success("Reset instructions sent!");
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset email");
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
          <span className="text-xl font-bold tracking-tight text-foreground">DukaFlo</span>
        </div>

        <div className="rounded-2xl border bg-card p-8 shadow-sm">
          {!sent ? (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-card-foreground">Forgot Password</h2>
                <p className="mt-1 text-sm text-muted-foreground">Enter your email and we'll send you a reset link</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com" autoComplete="email"
                      className="h-11 w-full rounded-lg border bg-background pl-10 pr-4 text-sm text-foreground shadow-sm placeholder:text-muted-foreground transition-all focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary/30" />
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="flex h-11 w-full items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:opacity-60">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                      Sending...
                    </span>
                  ) : "Send Reset Link"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <Mail className="h-8 w-8 text-success" />
              </div>
              <h2 className="text-xl font-bold text-card-foreground">Check Your Email</h2>
              <p className="text-sm text-muted-foreground">
                If an account exists for {email}, you will receive password reset instructions.
              </p>
              {resetToken && (
                <div className="rounded-lg border bg-muted/30 p-4 text-left">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Dev Mode — Reset Token:</p>
                  <p className="font-mono text-xs text-card-foreground break-all">{resetToken}</p>
                  <Link to={`/reset-password?token=${resetToken}`}
                    className="mt-2 inline-block text-xs font-semibold text-primary hover:text-primary/80">
                    → Reset password now
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

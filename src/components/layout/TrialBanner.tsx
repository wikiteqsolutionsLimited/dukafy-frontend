import { useNavigate } from "react-router-dom";
import { AlertTriangle, Clock, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrialBannerProps {
  subscription: {
    is_active: boolean;
    status: string;
    days_remaining: number;
    plan: string;
    trial_ends_at?: string;
    current_period_end?: string;
  };
}

export function TrialBanner({ subscription }: TrialBannerProps) {
  const navigate = useNavigate();

  if (!subscription) return null;

  const { status, days_remaining, plan } = subscription;

  // Don't show for active paid plans with > 14 days
  if (status === "active" && plan !== "trial" && days_remaining > 14) return null;
  // Don't show for trialing with > 7 days remaining
  if (status === "trialing" && days_remaining > 7) return null;
  // Don't show for expired (they get redirected to billing)
  if (status === "expired") return null;

  const isUrgent = days_remaining <= 3;
  const isTrial = status === "trialing";

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 px-4 py-2.5 text-sm",
        isUrgent
          ? "bg-destructive/10 text-destructive border-b border-destructive/20"
          : "bg-warning/10 text-warning-foreground border-b border-warning/20"
      )}
    >
      <div className="flex items-center gap-2">
        {isUrgent ? (
          <AlertTriangle className="h-4 w-4 shrink-0" />
        ) : (
          <Clock className="h-4 w-4 shrink-0" />
        )}
        <span className="font-medium">
          {isTrial
            ? `Free trial ends in ${days_remaining} day${days_remaining !== 1 ? "s" : ""}`
            : `Subscription renews in ${days_remaining} day${days_remaining !== 1 ? "s" : ""}`}
        </span>
        {isTrial && (
          <span className="hidden sm:inline text-xs opacity-75">
            — Upgrade now to keep all your data and access
          </span>
        )}
      </div>
      <button
        onClick={() => navigate("/billing")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap",
          isUrgent
            ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        )}
      >
        <CreditCard className="h-3.5 w-3.5" />
        {isTrial ? "Upgrade Now" : "Renew"}
      </button>
    </div>
  );
}

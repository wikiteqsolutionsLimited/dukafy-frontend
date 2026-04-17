import { useNavigate } from "react-router-dom";
import { AlertTriangle, Clock, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrialBannerProps {
  subscription: {
    is_active: boolean;
    status: string;
    days_remaining: number;
    plan: string;
    is_owner?: boolean;
    trial_ends_at?: string;
    current_period_end?: string;
  };
}

export function TrialBanner({ subscription }: TrialBannerProps) {
  const navigate = useNavigate();

  if (!subscription) return null;

  const { status, days_remaining, plan, is_owner } = subscription;
  const isTrial = status === "trialing" || plan === "trial";

  // Trial: ALWAYS show
  // Paid active: only show within 5 days of renewal
  // Expired: handled by ProtectedLayout redirect (don't render here)
  if (status === "expired") return null;
  if (!isTrial && days_remaining > 5) return null;

  const isUrgent = days_remaining <= 3;

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm",
        isUrgent
          ? "bg-destructive/10 text-destructive border-b border-destructive/20"
          : "bg-warning/10 text-warning-foreground border-b border-warning/20"
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        {isUrgent ? (
          <AlertTriangle className="h-4 w-4 shrink-0" />
        ) : (
          <Clock className="h-4 w-4 shrink-0" />
        )}
        <span className="font-medium truncate">
          {isTrial
            ? days_remaining <= 0
              ? "Free trial has ended"
              : `Free trial ends in ${days_remaining} day${days_remaining !== 1 ? "s" : ""}`
            : `Subscription renews in ${days_remaining} day${days_remaining !== 1 ? "s" : ""}`}
        </span>
        {isTrial && (
          <span className="hidden md:inline text-xs opacity-75 truncate">
            — Upgrade now to keep all your data
          </span>
        )}
      </div>
      {is_owner !== false && (
        <button
          onClick={() => navigate("/billing")}
          className={cn(
            "inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap shrink-0",
            isUrgent
              ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          <CreditCard className="h-3.5 w-3.5" />
          {isTrial ? "Upgrade Now" : "Renew"}
        </button>
      )}
    </div>
  );
}

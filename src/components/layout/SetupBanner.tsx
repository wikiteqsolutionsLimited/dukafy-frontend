import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, X } from "lucide-react";
import { useState } from "react";
import { useShop } from "@/hooks/useShop";
import { useAuth } from "@/hooks/useAuth";

export function SetupBanner() {
  const { activeShop, isLoading } = useShop();
  const { hasRole, isAuthenticated } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  if (isLoading || activeShop || dismissed || !isAuthenticated || !hasRole("admin")) return null;

  return (
    <div className="border-b bg-warning/10 px-4 py-2.5">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
          <p className="text-xs font-medium text-foreground sm:text-sm">
            Create your first shop to start using DukaFlo.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/shop-setup"
            className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-sm transition-all hover:shadow-md"
          >
            Create Shop <ArrowRight className="h-3 w-3" />
          </Link>
          <button onClick={() => setDismissed(true)} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

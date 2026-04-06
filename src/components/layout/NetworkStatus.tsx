import { useState, useEffect } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function NetworkStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  const [showRestored, setShowRestored] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const goOnline = () => {
      setOnline(true);
      if (wasOffline) {
        setShowRestored(true);
        setTimeout(() => setShowRestored(false), 3000);
      }
    };
    const goOffline = () => {
      setOnline(false);
      setWasOffline(true);
    };
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, [wasOffline]);

  if (online && !showRestored) return null;

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-[60] flex items-center justify-center gap-2 py-1.5 text-xs font-semibold transition-all duration-300 animate-in slide-in-from-top fade-in",
        online
          ? "bg-success text-white"
          : "bg-destructive text-destructive-foreground"
      )}
    >
      {online ? (
        <>
          <Wifi className="h-3.5 w-3.5" />
          Back online
        </>
      ) : (
        <>
          <WifiOff className="h-3.5 w-3.5" />
          You're offline — some features may be unavailable
        </>
      )}
    </div>
  );
}

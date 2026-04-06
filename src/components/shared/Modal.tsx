import { useEffect, useCallback } from "react";
import { X, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

/* ── Size variants ── */
const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
} as const;

/* ── Base Modal ── */
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: LucideIcon;
  size?: keyof typeof sizeClasses;
  /** @deprecated Use `size` instead */
  maxWidth?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Prevent closing on overlay click */
  persistent?: boolean;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  icon: Icon,
  size = "lg",
  maxWidth,
  children,
  footer,
  persistent = false,
}: ModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && !persistent) onClose();
    },
    [onClose, persistent]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.body.style.overflow = "";
      };
    }
  }, [open, handleEscape]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={persistent ? undefined : onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "relative z-10 w-full rounded-xl border bg-card shadow-xl",
          "animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200",
          maxWidth || sizeClasses[size]
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
                <Icon className="h-5 w-5 text-accent-foreground" />
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold text-card-foreground">{title}</h2>
              {description && (
                <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Confirm Modal ── */
interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "success" | "default";
  loading?: boolean;
}

const variantConfig = {
  danger: {
    icon: AlertTriangle,
    iconBg: "bg-destructive/10",
    iconColor: "text-destructive",
    btnClass: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  },
  success: {
    icon: CheckCircle2,
    iconBg: "bg-success/10",
    iconColor: "text-success",
    btnClass: "bg-primary text-primary-foreground hover:bg-primary/90",
  },
  default: {
    icon: AlertTriangle,
    iconBg: "bg-accent",
    iconColor: "text-accent-foreground",
    btnClass: "bg-primary text-primary-foreground hover:bg-primary/90",
  },
};

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  loading = false,
}: ConfirmModalProps) {
  const cfg = variantConfig[variant];
  const Icon = cfg.icon;

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.body.style.overflow = "";
      };
    }
  }, [open, handleEscape]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-sm animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200 rounded-xl border bg-card shadow-xl">
        <div className="flex flex-col items-center px-6 pt-8 pb-2 text-center">
          <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl", cfg.iconBg)}>
            <Icon className={cn("h-7 w-7", cfg.iconColor)} />
          </div>
          <h3 className="mt-4 text-base font-semibold text-card-foreground">{title}</h3>
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
        <div className="flex gap-3 px-6 py-5">
          <button
            onClick={onClose}
            disabled={loading}
            className="h-10 flex-1 rounded-lg border text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              "h-10 flex-1 rounded-lg text-sm font-semibold shadow-sm transition-colors disabled:opacity-50",
              cfg.btnClass
            )}
          >
            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

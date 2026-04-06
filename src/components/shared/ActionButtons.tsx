import { LucideIcon, Pencil, Trash2, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/* ── Icon Action Button ── */
interface ActionButtonProps {
  icon: LucideIcon;
  onClick?: () => void;
  variant?: "default" | "danger";
  label?: string;
  className?: string;
}

export function ActionButton({ icon: Icon, onClick, variant = "default", label, className }: ActionButtonProps) {
  const btn = (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 active:scale-90",
        variant === "danger"
          ? "hover:bg-destructive/10 hover:text-destructive"
          : "hover:bg-accent hover:text-accent-foreground hover:shadow-sm",
        className
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );

  if (!label) return btn;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{btn}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export function EditButton({ onClick }: { onClick?: () => void }) {
  return <ActionButton icon={Pencil} onClick={onClick} label="Edit" />;
}

export function DeleteButton({ onClick }: { onClick?: () => void }) {
  return <ActionButton icon={Trash2} onClick={onClick} variant="danger" label="Delete" />;
}

export function ViewButton({ onClick }: { onClick?: () => void }) {
  return <ActionButton icon={Eye} onClick={onClick} label="View" />;
}

/* ── Row Actions wrapper ── */
export function RowActions({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center justify-end gap-1">{children}</div>
    </TooltipProvider>
  );
}

/* ── Primary Action Button ── */
interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: LucideIcon;
  children: React.ReactNode;
}

export function PrimaryButton({ icon: Icon, children, className, ...props }: PrimaryButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md active:scale-[0.97]",
        className
      )}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}

/* ── Secondary/Outline Button ── */
export function SecondaryButton({ icon: Icon, children, className, ...props }: PrimaryButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-lg border bg-card px-5 text-sm font-medium text-muted-foreground shadow-sm transition-all duration-200 hover:bg-muted hover:text-foreground hover:shadow-md active:scale-[0.97]",
        className
      )}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}

/* ── Danger Button ── */
export function DangerButton({ icon: Icon, children, className, ...props }: PrimaryButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-lg bg-destructive px-5 text-sm font-medium text-destructive-foreground shadow-sm transition-all duration-200 hover:bg-destructive/90 hover:shadow-md active:scale-[0.97]",
        className
      )}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}

/* ── Filter Select ── */
interface FilterSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

export function FilterSelect({ className, children, ...props }: FilterSelectProps) {
  return (
    <select
      className={cn(
        "h-10 rounded-lg border bg-card px-3 text-sm text-foreground shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-ring/30 focus:shadow-md",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

/* ── StatusBadge ── */
interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "muted";
}

const badgeVariants: Record<string, string> = {
  default: "bg-accent text-accent-foreground",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning-foreground",
  danger: "bg-destructive/10 text-destructive",
  muted: "bg-muted text-muted-foreground",
};

export function Badge({ children, variant = "default" }: BadgeProps) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", badgeVariants[variant])}>
      {children}
    </span>
  );
}
